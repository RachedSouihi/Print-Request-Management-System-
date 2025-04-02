import numpy as np
import redis
import json
import time
import faiss

from embeddings import get_avg_embedding, get_doc_embedding

r = redis.Redis(host='localhost', port=6379, db=0)  # Default Redis connection
r.ping()
print("Redis connection successful!")

def initialize_user_profile(user_id, selected_subjects):
    user_profile_key = f"profile:{user_id}"
    
    # Delete existing user profile if it exists
    if r.exists(user_profile_key):
        r.delete(user_profile_key)
        print(f"Deleted existing profile for user {user_id}")
    
    valid_embeddings = []
    
    for subject in selected_subjects:
        print("subject")
        avg_emb = get_avg_embedding(subject=subject)
        if avg_emb is not None:
            valid_embeddings.append(avg_emb)
    
    if not valid_embeddings:
        raise ValueError("No valid embeddings found for selected subjects")
    
    #normalized = [emb / np.linalg.norm(emb) for emb in valid_embeddings]
    user_profile = np.mean(np.array(valid_embeddings), axis=0)
    
    current_time = time.time()
    r.hset(user_profile_key, mapping={
        "embedding": user_profile.tobytes(),
        "subjects": json.dumps(selected_subjects),
        "last_updated": str(current_time)  # Store timestamp as string
    })
    
    print(f"Created profile for user {user_id}")
    return user_profile

# Starting with a decay_rate of 5 minutes (300 seconds)
def updateUserProfile(user_id, event, doc_id, decay_rate=np.log(2)/300):
    weights = {
        "view": 1.0,
        "click": 2.5,
        "like": 4.0,
        "share": 5.0
    }
    
    user_profile_key = f"profile:{user_id}"
    profile_data = r.hgetall(user_profile_key)
    
    if not profile_data:
        raise ValueError(f"No profile found for user {user_id}")
    
    doc_embedding = get_doc_embedding(doc_id)
    if doc_embedding is not None:
        print(f"Embedding for doc_id {doc_id}")
    else:
        raise ValueError(f"No embedding found for doc_id {doc_id}")
    
    # Parse profile data
    current_emb = np.frombuffer(profile_data[b'embedding'], dtype=np.float32)
    current_time = time.time()
    
    # Handle timestamp with backward compatibility
    last_updated = float(profile_data.get(b'last_updated', current_time))
    
    # Calculate time difference in seconds
    delta_t = current_time - last_updated
    
    # Calculate decay factor using exponential function
    decay_factor = np.exp(-decay_rate * delta_t).astype(np.float32)
    
    # Validate and normalize input
    if not isinstance(doc_embedding, np.ndarray):
        doc_embedding = np.array(doc_embedding, dtype=np.float32)
    normalized_doc = doc_embedding / np.linalg.norm(doc_embedding)
    
    # Cast weight to float32 to prevent type promotion
    weight = np.float32(weights.get(event["interaction_type"], 1.0))
    weighted_update = weight * normalized_doc
    
    # Apply exponential decay EMA (all operations in float32)
    updated_emb = decay_factor * current_emb + (1 - decay_factor) * weighted_update
    #updated_emb /= np.linalg.norm(updated_emb)  # Maintain unit length
    
    # Update profile with new timestamp
    with r.pipeline() as pipe:
        pipe.hset(user_profile_key, "embedding", updated_emb.tobytes())
        pipe.hset(user_profile_key, "last_updated", str(current_time))
        pipe.execute()
    
    print(f"Updated profile for user {user_id} with decay factor {decay_factor:.4f}")
    return updated_emb

def getUserProfile(user_id=None):
    user_profile_key = f"profile:{user_id}"
    profile_data = r.hgetall(user_profile_key)
    if not profile_data:
        raise ValueError(f"No profile found for user {user_id}")
    
    current_subjects = json.loads(profile_data[b'subjects'].decode())
    profile = np.frombuffer(profile_data[b'embedding'], dtype=np.float32)
    
    return profile

def fetchDocs(user_id=None):
    if user_id is None:
        pass
    
    user_profile_key = f"profile:{user_id}"
    profile_data = r.hgetall(user_profile_key)
    if not profile_data:
        raise ValueError(f"No profile found for user {user_id}")
    
    profile = np.frombuffer(profile_data[b'embedding'], dtype=np.float32)

def faiss_search(query_embedding: np.array, top_k: int = 20):
    index = faiss.read_index("doc_embeddings.index")
    stored_ids = np.load("doc_ids.npy").squeeze()
    
    print(stored_ids.shape)

    # Ensure correct dtype and shape
    query = query_embedding.astype(np.float32).reshape(1, -1)
    
    # FAISS search
    distances, indices = index.search(query, top_k)
    
    return stored_ids[indices]
    
    print(indices)
    
    # Get corresponding doc_ids
    results = []
    for idx, distance in zip(indices[0], distances[0]):
        if idx >= 0:  # FAISS returns -1 for invalid indices
            doc_id = stored_ids[idx]
            results.append((doc_id, float(distance)))
    
    return results

# Example usage
profile = initialize_user_profile(889655487, ['anglais'])
#profile = updateUserProfile(242619, {"interaction_type": "click"}, '9110983e-8cc9-4a3b-bd6d-c88db161611f')
# profile = getUserProfile(242619)
similar_docs = faiss_search(profile)
print("Most similar documents:", similar_docs)




