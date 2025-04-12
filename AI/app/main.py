from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
import redis
import sys
import os


app = FastAPI()



sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from src.profile import getUserProfile, faiss_search



# Document Retrieval Request Model
class RetrievalRequest(BaseModel):
    user_id: str
    page: int = 1
    page_size: int = 20

@app.get("/retrieve-docs/{user_id}")
def retrieve_documents(user_id: str, page: int = Query(1, ge=1), page_size: int = Query(10, le=100)):
    

    user_profile = getUserProfile(user_id)
    if not user_profile.shape[0]:
             raise HTTPException(status_code=404, detail="User not found")

    #We don't need offset in faiss
    #offset = (page - 1) * page_size
    
    document_ids = faiss_search(query_embedding=user_profile, user_id=user_id, top_k=page_size)
    
    
    if document_ids is None or not document_ids:
        raise HTTPException(status_code=404, detail="No documents found")
    
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





