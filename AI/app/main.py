from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
import redis
import sys
import os
import httpx  # For asynchronous HTTP requests
import asyncpg  # For asynchronous PostgreSQL interaction
from datetime import datetime, date, timedelta
from dateutil import parser as date_parser
from typing import Optional, Literal
import logging
import json  # Import the built-in JSON module







app = FastAPI()



sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.profile import getUserProfile, faiss_search

#https://574b-34-106-204-149.ngrok-free.app/get


# --- Configuration ---
# Replace with your actual external API URLs
#PRIORITY_API_URL = "https://574b-34-106-204-149.ngrok-free.app/get"

#PRIORITY_API_URL = "https://60d7-34-106-204-149.ngrok-free.app/get"
#NER_API_URL = "https://d205-34-125-204-76.ngrok-free.app/extract-deadline"

#PRIORITY_API_URL = 'https://b41a-34-132-55-91.ngrok-free.app/get'
#PRIORITY_API_URL = "https://4a43-34-132-55-91.ngrok-free.app/get"

PRIORITY_API_URL = 'https://21f5-34-86-143-33.ngrok-free.app/get'

NER_API_URL = 'https://a1c2-34-16-186-105.ngrok-free.app/extract-deadline'

#NER_API_URL = "https://26cc-34-125-194-165.ngrok-free.app/extract-deadline"
#NER_API_URL = "https://3219-34-125-194-165.ngrok-free.app/extract-deadline"

#NER_API_URL = 'https://50a7-34-125-204-76.ngrok-free.app/extract-deadline'
# Replace with your actual PostgreSQL database credentials and connection details
DB_HOST = "127.0.0.1"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASSWORD = "242619"
DB_NAME = "prms"




MAX_PENALTY = 0.7  # Maximum penalty to subtract
PENALTY_PER_DAY = 0.1 # Penalty applied for each day of difference

PROFESSOR_BOOST = 0.05


# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)






# Document Retrieval Request Model
class RetrievalRequest(BaseModel):
    user_id: str
    page: int = 1
    page_size: int = 10

@app.get("/retrieve-docs/{user_id}")
def retrieve_documents(user_id: str, page: int = Query(1, ge=1), page_size: int = Query(10, le=100)):
    

    user_profile = getUserProfile(user_id)
    if not user_profile.shape[0]:
             raise HTTPException(status_code=404, detail="User not found")

    #We don't need offset in faiss
    #offset = (page - 1) * page_size
    
    document_ids = faiss_search(query_embedding=user_profile, user_id=user_id, top_k=10,)
    
    
    if document_ids is None or not document_ids:
        
        return JSONResponse(content=[], status_code=200)

        #raise HTTPException(status_code=404, detail="No documents found")
    
    return JSONResponse(content=document_ids, status_code=200)







@app.delete("/clear-seen-docs/{user_id}")
def clear_seen_documents(user_id: str):
    """
    Remove all seen documents for a specific user from Redis.
    """
    seen_docs_key = f"user:{user_id}:seen_docs"
    sr = redis.StrictRedis(host="127.0.0.1", port=6379, decode_responses=True)

    if sr.exists(seen_docs_key):
        sr.delete(seen_docs_key)
        return JSONResponse(content={"message": f"Seen documents for user {user_id} have been cleared."}, status_code=200)
    else:
        raise HTTPException(status_code=404, detail=f"No seen documents found for user {user_id}.")






# --- Database Connection Pool (Async) ---
# Using a connection pool is more efficient for managing database connections
db_pool = None

@app.on_event("startup")
async def startup_db_pool():
    """Event handler to create the database connection pool on startup."""
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            min_size=5,  # Minimum number of connections in the pool
            max_size=20  # Maximum number of connections in the pool
        )
        logger.info("Database connection pool created successfully.")
    except Exception as e:
        logger.error(f"Failed to create database connection pool: {e}")
        # Depending on your application's needs, you might want to exit or handle this error

@app.on_event("shutdown")
async def shutdown_db_pool():
    """Event handler to close the database connection pool on shutdown."""
    global db_pool
    if db_pool:
        await db_pool.close()
        logger.info("Database connection pool closed.")

# --- Asynchronous HTTP Client (for external APIs) ---
# Use a single client instance for potentially better performance
http_client = httpx.AsyncClient(timeout=30.0)  # Set a 10-second timeout

@app.on_event("shutdown")
async def close_http_client():
    """Event handler to close the HTTP client on shutdown."""
    await http_client.close()
    logger.info("HTTP client closed.")

# --- Helper Functions for External API Interaction ---

async def fetch_initial_priority(user_note: str) -> Optional[float]:
    """Fetches the initial priority score from the external prediction API using a GET request with a body."""
    try:
        # Extract the host from the PRIORITY_API_URL
        priority_api_host = "21f5-34-86-143-33.ngrok-free.app"
        
        
        
        # Use a custom request to send a GET request with a body
        response = await http_client.request(
            method="GET",
            url=PRIORITY_API_URL,
            content=json.dumps({"note": user_note}),  # Use the built-in JSON module to encode the body
            headers={
                "ngrok-skip-browser-warning": "true",
                "Host": priority_api_host,
                "Content-Type": "application/json"  # Ensure the server knows the body is JSON
            }
        )
        
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        
        data = response.json()
        # Assuming the API returns a JSON like [{"label": "LABEL_0", "score": 0.8182690143585205}]
        if  data:
            initial_priority = data.get("priority")
            if isinstance(initial_priority, (int, float)):
                # Ensure priority is within 0-1 range if the API doesn't guarantee it
                return max(0.0, min(1.0, float(initial_priority)))
            else:
                logger.warning(f"Priority API returned unexpected data format: {data}")
                return None
        else:
            logger.warning(f"Priority API returned unexpected response: {data}")
            return None
    except httpx.RequestError as e:
        logger.error(f"Error calling Priority API: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching initial priority: {e}")
        return None

async def extract_deadline_from_note(user_note: str) -> Optional[date]:
    """Extracts a deadline date from the user note using the external NER API."""
    try:
        # Extract the host from the NER_API_URL
        ner_api_host = "a1c2-34-16-186-105.ngrok-free.app"
        
        
        
        
        response = await http_client.request(
                        method="POST",

            url=NER_API_URL,
            content=json.dumps({"note": user_note}),
            headers={
                "ngrok-skip-browser-warning": "true",
                "Host": ner_api_host,
                "Content-Type": "application/json"
            }
        )
        
        logger.info(f"response date extraction: {response.text}")
        
        #response.raise_for_status()  # Raise an exception for bad status codes
        #data = response.json()
        # Assuming the NER API returns a JSON like {"deadline": "YYYY-MM-DD"} or {"deadline": null}
        deadline_str = response.text
        if deadline_str:
            try:
                # Try to parse the date string into a date object
                return deadline_str #date_parser.parse(deadline_str).date()
            except ValueError:
                logger.warning(f"NER API returned unparseable date string: {deadline_str}")
                return None
        else:
            return None  # API returned null or no deadline found
    except httpx.RequestError as e:
        logger.error(f"Error calling NER API: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error extracting deadline: {e}")
        return None

# --- Helper Function for Database Interaction ---

async def fetch_official_deadline_from_db(doc_id: str) -> Optional[date]:
    """Fetches the official deadline for a document from the PostgreSQL database."""
    if db_pool is None:
        logger.error("Database connection pool is not initialized.")
        return None

    async with db_pool.acquire() as connection:
        try:
            # Adjust SQL query based on your 'documents' table schema
            # Assuming doc_id is a String and deadline is stored as DATE or TIMESTAMP
            row = await connection.fetchrow(
                "SELECT deadline FROM documents WHERE id = $1",
                doc_id
            )
            if row and row['deadline']:
                 # asyncpg returns datetime.date for DATE or datetime.datetime for TIMESTAMP
                if isinstance(row['deadline'], datetime):
                    return row['deadline'].date()
                elif isinstance(row['deadline'], date):
                    return row['deadline']
                else:
                    logger.warning(f"DB returned unexpected type for deadline: {type(row['deadline'])}")
                    return None
            else:
                logger.info(f"No official deadline found for doc_id: {doc_id}")
                return None
        except Exception as e:
            logger.error(f"Error fetching official deadline from DB for doc_id {doc_id}: {e}")
            return None

# --- Priority Comparison Helper ---

def compare_deadlines(extracted_deadline: Optional[date], official_deadline: Optional[date]) -> Optional[bool]:
    """Compares the extracted deadline with the official deadline."""
    # We only compare if both deadlines were successfully obtained and parsed
    if extracted_deadline is not None and official_deadline is not None:
        return extracted_deadline == official_deadline
    return None # Cannot compare if one or both are missing

# --- FastAPI GET Endpoint ---



#@app.get("/calculate_priority/", response_class=JSONResponse)
async def compute_priority(
  user_role: str, user_note: str, doc_id: str,
    #doc_type: str = Query(..., description="Type of the document (e.g., exam, course, exercice serie)")
):
    """
    Calculates the final priority for a print request based on user input,
    external model predictions, and database information, with variable deadline penalty.
    """
    # 1. Get Initial Priority from External API
    initial_priority = await fetch_initial_priority("Student request: " + user_note if user_role == "student" else "Professor request: " + user_note)
    if initial_priority is None:
        logger.error("Failed to get initial priority from external API.")
        raise HTTPException(status_code=500, detail="Could not calculate initial priority.")

    
    # 2. Extract Deadline from User Note (External API)
    extracted_deadline = await extract_deadline_from_note(user_note)

    # Parse the extracted deadline using the correct format and convert to date
    try:
        extracted_deadline = datetime.strptime(extracted_deadline, "%m-%d-%Y").date()  # Convert to date
    except ValueError as e:
        logger.error(f"Error parsing extracted deadline: {e}")
        raise HTTPException(status_code=400, detail="Invalid deadline format returned by the external API.")

    # 3. Get Official Deadline from Database
    official_deadline = await fetch_official_deadline_from_db(doc_id)

    # 4. Priority Adjustment Logic based on Deadline Comparison (Updated)
    intermediate_priority = initial_priority
    
    logger.info(f"Initial priority for user {user_role} with note '{user_note}' and doc_id {doc_id}: {initial_priority}")

    # Ensure both deadlines are of the same type (date) before comparison
    if user_role == 'student' and extracted_deadline is not None and official_deadline is not None and extracted_deadline < official_deadline:
        # Calculate the absolute time difference in days
        time_difference: timedelta = abs(extracted_deadline - official_deadline)
        days_difference = time_difference.days


        if days_difference <= 7:
            # Calculate the penalty based on the formula
            calculated_penalty = min(MAX_PENALTY, PENALTY_PER_DAY * days_difference)

            # Apply the calculated penalty
            intermediate_priority = initial_priority - calculated_penalty
        else:
            intermediate_priority = initial_priority

        logger.info(f"Deadline mismatch detected for doc_id {doc_id}. User: {extracted_deadline}, Official: {official_deadline}. Difference: {days_difference} days. Applying penalty: {calculated_penalty:.2f}.")

    elif user_role == 'student' and extracted_deadline is not None and official_deadline is None:
        
        
        intermediate_priority = 0.25  # Default priority for students without an official deadline
    elif user_role == 'professor' and official_deadline is not None:
            time_difference: timedelta = abs(extracted_deadline - official_deadline)
            days_difference = time_difference.days
            
            
            if(days_difference <= 7):
                # Calculate the penalty based on the formula
                calculated_penalty = min(MAX_PENALTY, PENALTY_PER_DAY * days_difference)

                # Apply the calculated penalty
                intermediate_priority = initial_priority - calculated_penalty
                
            else:
                intermediate_priority = initial_priority
            
            

        
    # Ensure intermediate priority stays within 0-1 range after potential penalty
    intermediate_priority = max(0.0, min(1.0, intermediate_priority))

    # 5. User Role Consideration (Professor Boost)
    final_priority = intermediate_priority
    if user_role == "professor":
        final_priority = intermediate_priority + PROFESSOR_BOOST
        logger.info(f"Applying professor boost for doc_id {doc_id}.")

    # Ensure final priority stays within 0-1 range
    final_priority = max(0.0, min(1.0, final_priority))

    logger.info(f"Calculated final priority for doc_id {doc_id}: {final_priority}")

    # Return the final calculated priority
    
    logger.info(f"Final priority for user {user_role} with note '{user_note}' and doc_id {doc_id}: {final_priority}")
    return final_priority


async def fetch_pending_requests():
    async with db_pool.acquire() as conn:
        try:
            rows = await conn.fetch(
                "SELECT request_id, pr.user_id, role, doc_id, instructions as note, created_at, status FROM print_requests pr inner join profile p on pr.user_id = p.user_id WHERE status = 'pending'"
            )
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error fetching pending requests: {e}")
            raise HTTPException(status_code=500, detail="Error retrieving pending requests.")






@app.get("/get-queue")
async def get_merged_queue():
    pending_requests = await fetch_pending_requests()
    
    with_note_processed = []
    non_note_profs = []
    non_note_students = []

    # Process requests with notes
    for req in pending_requests:
        if req['note'] != '':
            user_role = req['role']
            try:
                priority = await compute_priority(user_role, req['note'], req['doc_id'])
                
                logger.info(f"Priority for request {req['request_id']} with note '{req['note']}': {priority}")
                with_note_processed.append({
                    'id': req['request_id'],
                    'priority': priority,
                    'sort_key': req['created_at'],
                })
            except Exception as e:
                logger.error(f"Skipping request {req['request_id']}: {e}")

    # Process non-note requests
    for req in [r for r in pending_requests if not r['note']]:
        user_role = req['role']
        official_deadline = await fetch_official_deadline_from_db(req['doc_id'])
        
        # Base priority values
        base_priority = 0.5 if user_role == "professor" else 0.25
        
        if official_deadline:
            # Calculate priority based on deadline urgency
            days_remaining = (official_deadline - date.today()).days
            urgency_boost = max(0.0, 1.0 - (days_remaining / 30))  # 30-day scaling
            final_priority = base_priority + (urgency_boost * 0.3)  # Max 0.3 boost
            final_priority = min(1.0, final_priority)
            sort_key = official_deadline
        else:
            final_priority = base_priority
            sort_key = req['created_at']
        
        entry = {
            'id': req['request_id'],
            'priority': final_priority,
            'sort_key': sort_key,
            'is_professor': user_role == "professor"
        }
        
        if user_role == "professor":
            non_note_profs.append(entry)
        else:
            non_note_students.append(entry)

    # Sort all groups
    with_note_sorted = sorted(with_note_processed, key=lambda x: (-x['priority'], x['sort_key']))
    
    # Sort non-note professors by priority then deadline/submission
    non_note_profs_sorted = sorted(non_note_profs, 
                                 key=lambda x: (-x['priority'], x['sort_key']))
    
    # Sort non-note students by priority then submission time
    non_note_students_sorted = sorted(non_note_students,
                                    key=lambda x: (-x['priority'], x['sort_key']))

    # Merge queue with priority order:
    # 1. Requests with notes (sorted by priority)
    # 2. Non-note professors (sorted by deadline-based priority)
    # 3. Non-note students (sorted by deadline-based priority or FIFO)
    final_queue = (
        [(item['id'], item['priority']) for item in with_note_sorted] +
        [(item['id'], item['priority']) for item in non_note_profs_sorted] +
        [(item['id'], item['priority']) for item in non_note_students_sorted]
    )
    
    # Sorting the list by priority in ascending order
    final_queue = sorted(final_queue, key=lambda x: x[1], reverse=True)
    
    

    return JSONResponse(content=final_queue)


# --- Include your placeholder helper functions and startup/shutdown events ---
# async def fetch_initial_priority(user_note: str) -> Optional[float]: ...
# async def extract_deadline_from_note(user_note: str) -> Optional[date]: ...
# async def fetch_official_deadline_from_db(doc_id: str) -> Optional[date]: ...
# @app.on_event("startup") async def startup_db_pool(): ...
# @app.on_event("shutdown") async def shutdown_db_pool(): ...
# @app.on_event("shutdown") async def close_http_client(): ...




