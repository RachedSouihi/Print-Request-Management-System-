import numpy as np
import redis
import json
import time
import math
import faiss

import os
import sys


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))


from embeddings import get_avg_embedding, get_doc_embedding, get_doc_ids_by

# Initialize Redis connection
r = redis.Redis(host='redis', port=6379, db=0)
r.ping()
print("Redis connection successful!")

# Define base weights for each interaction type (global defaults)
BASE_WEIGHTS = {
    "view": 1.0,
    "click": 2.5,
    "like": 4.0,
    "share": 5.0,
    "dislike": -5.0
}

def getSubjects(user_id):
    user_profile_key = f"profile:{user_id}"
    subjects = json.loads(r.hget(user_profile_key, "subjects").decode())
    print("subjects:", subjects)

def initialize_user_profile(user_id, selected_subjects):
    """
    Initializes the user profile by averaging the subject average embeddings,
    and saves an initial multiplier mapping for personalized interaction weights.
    Also, adds initial document scores for the user's documents.
    """
    user_profile_key = f"profile:{user_id}"

    # Delete existing profile if it exists
    if r.exists(user_profile_key):
        r.delete(user_profile_key)
        print(f"Deleted existing profile for user {user_id}")

    valid_embeddings = []
    for subject in selected_subjects:
        print("Processing subject:", subject)
        avg_emb = get_avg_embedding(subject=subject)
        if avg_emb is not None:
            valid_embeddings.append(avg_emb)

    if not valid_embeddings:
        raise ValueError("No valid embeddings found for selected subjects")

    document_ids = get_doc_ids_by(subject=selected_subjects)
    print("Number of document IDs:", len(document_ids))

    # Compute user profile as the mean of the subject embeddings
    user_profile = np.mean(np.array(valid_embeddings), axis=0)
    current_time = time.time()
    
    # Save the profile, subjects, last update timestamp, and initial multipliers
    initial_multipliers = {
        "view": 1.0,
        "click": 1.0,
        "like": 1.0,
        "share": 1.0,
        "dislike": 1.0
    }
    r.hset(user_profile_key, mapping={
        "embedding": user_profile.tobytes(),
        "subjects": json.dumps(selected_subjects),
        "last_updated": str(current_time),
        "weight_multiplier": json.dumps(initial_multipliers)
    })
    
    # Initialize document scores for each document the user might interact with
    init_score = 0.6
    for doc_id in document_ids:
        r.zadd(f"user:{user_id}:docs:{doc_id}", {doc_id: init_score})
    
    print(f"Created profile for user {user_id}")
    return user_profile

def get_personalized_weight(user_id, interaction_type):
    """
    Retrieves the user-specific multiplier for an interaction type.
    Returns the personalized weight as: BASE_WEIGHT * multiplier.
    """
    user_profile_key = f"profile:{user_id}"
    multipliers_json = r.hget(user_profile_key, "weight_multiplier")
    if multipliers_json is not None:
        multipliers = json.loads(multipliers_json.decode())
        user_multiplier = float(multipliers.get(interaction_type, 1.0))
    else:
        user_multiplier = 1.0
    return BASE_WEIGHTS.get(interaction_type, 1.0) * user_multiplier

def get_context_multiplier(context):
    """
    Adjusts weight based on context.
    Example: If 'session_value' is provided (range 0 to 1), 
    use a simple linear scaling: multiplier = 1 + (session_value - 0.5)
    """
    session_value = context.get("session_value", 0.5)
    return 1 + (session_value - 0.5)

def updateUserProfile(user_id, event, doc_id, context={}, decay_rate=np.log(2)/(300)):
    """
    Updates the user profile based on an interaction event.
    Applies a time-decay, personalized weight and context-aware multiplier.
    Also updates a per-document score.
    """
    print('-'*50)

    print("user_id: ", user_id)
    
    
    print('-'*50)
    
    print('event: ', event)
    
    print('-'*50)
    user_profile_key = f"profile:{user_id}"
    profile_data = r.hgetall(user_profile_key)
    if not profile_data:
        raise ValueError(f"No profile found for user {user_id}")

    # Get document embedding
    doc_embedding = get_doc_embedding(doc_id)
    if doc_embedding is not None:
        print(f"Retrieved embedding for doc_id {doc_id}")
    else:
        raise ValueError(f"No embedding found for doc_id {doc_id}")

    # Parse profile data and current time
    current_emb = np.frombuffer(profile_data[b'embedding'], dtype=np.float32)
    current_time = time.time()
    last_updated = float(profile_data.get(b'last_updated', current_time))
    
    print("last_update: ", last_updated)
    delta_t = current_time - last_updated

    # Calculate decay factor (time-based)
    decay_factor = np.exp(-decay_rate * delta_t).astype(np.float32)
    print("Decay rate:", decay_rate)
    print("Delta t:", delta_t)

    # Normalize the document embedding if needed
    if not isinstance(doc_embedding, np.ndarray):
        doc_embedding = np.array(doc_embedding, dtype=np.float32)
    # You can normalize here if your embeddings are not already normalized
    normalized_doc = doc_embedding  #/ np.linalg.norm(doc_embedding)

    # Retrieve personalized weight and apply context multiplier
    #personalized_weight = get_personalized_weight(user_id, event["interaction_type"])
    #context_multiplier = get_context_multiplier(context)
    final_weight = BASE_WEIGHTS.get(event['interaction_type'], 1) #personalized_weight * context_multiplier

    # Compute weighted update using exponential moving average (EMA)
    weighted_update = final_weight * normalized_doc
    updated_emb = decay_factor * current_emb + (1 - decay_factor) * weighted_update

    # Optionally normalize the updated embedding (if required)
    # updated_emb /= np.linalg.norm(updated_emb)

    # Update document score for this user and doc
    old_score = get_document_score(user_id=user_id, doc_id=doc_id)
    if old_score is None:
        init_score = 0.6
        r.zadd(f"user:{user_id}:docs:{doc_id}", {doc_id: init_score})
        old_score = init_score

    print("Old document score:", old_score)
    new_score = decay_factor * old_score + (1 - decay_factor) * final_weight
    new_score = np.tanh(new_score)  # Optionally squash the score
    print("New document score:", new_score)
    r.zadd(f"user:{user_id}:docs:{doc_id}", {doc_id: round(float(new_score), 3)})

    # Update profile in Redis with new embedding and timestamp
    with r.pipeline() as pipe:
        pipe.hset(user_profile_key, "embedding", updated_emb.tobytes())
        pipe.hset(user_profile_key, "last_updated", str(current_time))
        pipe.execute()

    print(f"Updated profile for user {user_id} with decay factor {decay_factor:.4f} and final weight {final_weight:.4f}")
    return updated_emb

def getUserProfile(user_id=None):
    user_profile_key = f"profile:{user_id}"
    profile_data = r.hgetall(user_profile_key)
    if not profile_data:
        raise ValueError(f"No profile found for user {user_id}")
    current_subjects = json.loads(profile_data[b'subjects'].decode())
    profile = np.frombuffer(profile_data[b'embedding'], dtype=np.float32)
    return profile

def get_document_score(user_id, doc_id):
    score = r.zscore(f"user:{user_id}:docs:{doc_id}", doc_id)
    if score is not None:
        return float(score)
    else:
        return None

def faiss_search(query_embedding: np.array, top_k: int = 20):
    index = faiss.read_index("doc_embeddings.index")
    stored_ids = np.load("doc_ids.npy").squeeze()
    print("Stored IDs shape:", stored_ids.shape)

    query = query_embedding.astype(np.float32).reshape(1, -1)
    distances, indices = index.search(query, top_k)
    return stored_ids[indices]

# Example usage:


#initialize_user_profile(242619, ["informatique"])

# Update the profile with an interaction event
# Assume event dict has key "interaction_type" (e.g., "click")
# And context is a dict, e.g., {"session_value": 0.8}
#info_doc_id = "6d9afcfa-815c-4a2d-ad15-085b989b8a50"
#profile = updateUserProfile(242619, {"interaction_type": "click"}, info_doc_id, context={"session_value": 0.8})
#profile = getUserProfile(242619)
#similar_docs = faiss_search(profile)
#print("Most similar documents:", similar_docs)

# Fetch subjects from a user profile
#getSubjects(242619)
