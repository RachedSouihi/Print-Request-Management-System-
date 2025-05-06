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

PRIORITY_API_URL = 'https://f854-34-125-83-143.ngrok-free.app/get'

NER_API_URL = 'https://8b71-35-233-199-181.ngrok-free.app/extract-deadline'

#NER_API_URL = "https://26cc-34-125-194-165.ngrok-free.app/extract-deadline"
#NER_API_URL = "https://3219-34-125-194-165.ngrok-free.app/extract-deadline"

#NER_API_URL = 'https://50a7-34-125-204-76.ngrok-free.app/extract-deadline'
# Replace with your actual PostgreSQL database credentials and connection details
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASSWORD = "root"
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
    
    document_ids = faiss_search(query_embedding=user_profile, user_id=user_id, top_k=10)
    
    
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
    r = redis.StrictRedis(host="redis", port=6379, decode_responses=True)

    if r.exists(seen_docs_key):
        r.delete(seen_docs_key)
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
        priority_api_host = "f854-34-125-83-143.ngrok-free.app"
        
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
        ner_api_host = "8b71-35-233-199-181.ngrok-free.app"
        
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


@app.get("/calculate_priority/", response_class=JSONResponse)
async def calculate_final_priority(
    user_role: Literal["student", "professor"] = Query(..., description="Role of the user (student or professor)"),
    user_note: str = Query(..., description="The user's text note"),
    doc_id: str = Query(..., description="Unique identifier for the document"),
    doc_type: str = Query(..., description="Type of the document (e.g., exam, course, exercice serie)")
):
    """
    Calculates the final priority for a print request based on user input,
    external model predictions, and database information, with variable deadline penalty.
    """
    # 1. Get Initial Priority from External API
    initial_priority = await fetch_initial_priority(user_note)
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

    # Ensure both deadlines are of the same type (date) before comparison
    if extracted_deadline is not None and official_deadline is not None and extracted_deadline != official_deadline:
        # Calculate the absolute time difference in days
        time_difference: timedelta = abs(extracted_deadline - official_deadline)
        days_difference = time_difference.days

        # Calculate the penalty based on the formula
        calculated_penalty = min(MAX_PENALTY, PENALTY_PER_DAY * days_difference)

        # Apply the calculated penalty
        intermediate_priority = initial_priority - calculated_penalty

        logger.info(f"Deadline mismatch detected for doc_id {doc_id}. User: {extracted_deadline}, Official: {official_deadline}. Difference: {days_difference} days. Applying penalty: {calculated_penalty:.2f}.")

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
    return JSONResponse(content={"final_priority": final_priority})

# --- Include your placeholder helper functions and startup/shutdown events ---
# async def fetch_initial_priority(user_note: str) -> Optional[float]: ...
# async def extract_deadline_from_note(user_note: str) -> Optional[date]: ...
# async def fetch_official_deadline_from_db(doc_id: str) -> Optional[date]: ...
# @app.on_event("startup") async def startup_db_pool(): ...
# @app.on_event("shutdown") async def shutdown_db_pool(): ...
# @app.on_event("shutdown") async def close_http_client(): ...