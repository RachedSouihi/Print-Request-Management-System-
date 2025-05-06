import numpy as np
import redis
import json
import time
import math
import faiss

import os
import sys


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from UserSession import calculate_session_value, start_session, calculate_context, record_interaction
from embeddings import get_avg_embedding, get_doc_embedding, get_doc_ids_by


# Define base weights for each interaction type (global defaults)
BASE_WEIGHTS = {
    "click": 1,
    "save": 2.5,
    "download": 5,
    "print": 10,
    "dislike": -10
}



# Initialize Redis connection
r = redis.Redis(host='127.0.0.1', port=6379, db=0)
r.ping()
print("Redis connection successful!")




MAX_WEIGHT = 8.0  # Example cap
MIN_WEIGHT = -7.0  # Example floor

def getSubjects(user_id, r):
    user_profile_key = f"profile:{user_id}"
    subjects = json.loads(r.hget(user_profile_key, "subjects").decode())
    print("subjects:", subjects)

def initialize_user_profile(user_id, selected_subjects, r):
    """
    Initializes the user profile by averaging the subject average embeddings,
    and saves an initial multiplier mapping for personalized interaction weights.
    Also, adds initial document scores for the user's documents and initializes interaction counts.
    """
    user_profile_key = f"profile:{user_id}"
    interaction_count_key = f"profile:{user_id}:interaction_counts"  # Redis key for interaction counts

    # Delete existing profile if it exists
    if r.exists(user_profile_key):
        r.delete(user_profile_key)
        print(f"Deleted existing profile for user {user_id}")

    if r.exists(interaction_count_key):
        r.delete(interaction_count_key)
        print(f"Deleted existing interaction counts for user {user_id}")

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
        "view": 0.5,
        "click": 0.5,
        "like": 0.5,
        "share": 0.5,
        "dislike": 0.5
    }
    r.hset(user_profile_key, mapping={
        "embedding": user_profile.tobytes(),
        "subjects": json.dumps(selected_subjects),
        "last_updated": str(current_time),
        "weight_multiplier": json.dumps(initial_multipliers)
    })
    
    # Initialize document scores for each document the user might interact with
    init_score = 0.7
    for doc_id in document_ids:
        r.zadd(f"user:{user_id}:docs:{doc_id}", {doc_id: init_score})
    
    # Initialize interaction counts for the user
    initial_interaction_counts = {
        "view": 0,
        "click": 0,
        "like": 0,
        "share": 0,
        "dislike": 0
    }
    r.hset(interaction_count_key, mapping=initial_interaction_counts)
    print(f"Initialized interaction counts for user {user_id}")

    print(f"Created profile for user {user_id}")
    return user_profile

def get_personalized_weight(user_id, interaction_type, r):
    """
    Retrieves the user-specific multiplier for an interaction type.
    Adjusts the multiplier based on the interaction type counts.
    Returns the personalized weight as: BASE_WEIGHT * adjusted_multiplier.
    """
    user_profile_key = f"profile:{user_id}"
    interaction_count_key = f"profile:{user_id}:interaction_counts"
    
   

    # Retrieve weight multipliers from Redis
    multipliers_json = r.hget(user_profile_key, "weight_multiplier")
    
   
    
    print("multipliers_json:", multipliers_json)
    
    
    
    
    if multipliers_json is not None:
        
        
        
        multipliers = json.loads(multipliers_json.decode())
        user_multiplier = float(multipliers.get(interaction_type, 1.0))
    else:
        user_multiplier = 1.0

    # Retrieve interaction counts from Redis
    #interaction_count = r.hget(interaction_count_key, interaction_type)
    counts = r.hgetall(interaction_count_key)

    if counts is not None:
        
        counts = {k.decode(): int(v) for k, v in counts.items()}
        total = sum(counts.values())
    
        if total == 0:
            return BASE_WEIGHTS.get(interaction_type, 1.0)  # No interactions yet
    
        freq = counts.get(interaction_type, 0) / total
        # Example adjustment: Boost rare interactions, dampen common ones
        adjusted_multiplier = 1 + (1 - freq)  # Range: 1 (frequent) to 2 (rare)
        
        #interaction_count = int(interaction_count)
        # Adjust the multiplier based on interaction count (example logic)
        #adjusted_multiplier = user_multiplier * (1 + math.log(1 + interaction_count))
    else:
        adjusted_multiplier = user_multiplier

    #print(f"Interaction count for {interaction_type}: {counts.get(interaction_type, 0)}")
    #print(f"Adjusted multiplier for {interaction_type}: {adjusted_multiplier}")

    # Return the personalized weight
    return BASE_WEIGHTS.get(interaction_type, 1.0) * adjusted_multiplier

def get_context_multiplier(context):
    """
    Adjusts weight based on context.
    Example: If 'session_value' is provided (range 0 to 1), 
    use a simple linear scaling: multiplier = 1 + (session_value - 0.5)
    """
    session_value = context.get("session_value", 0.5)
    return 1 + (session_value - 0.5)

def updateUserProfile(user_id, event, doc_id,  decay_rate=np.log(2)/(300 * 3 )): #1 day decay_rate
    """
    Updates the user profile based on an interaction event.
    Applies a time-decay, personalized weight and context-aware multiplier.
    Also updates a per-document score and tracks interaction counts.
    """
    
    
    record_interaction(user_id, r)
    
    context = calculate_context(user_id, r)


    user_profile_key = f"profile:{user_id}"
    interaction_count_key = f"profile:{user_id}:interaction_counts"  # Redis key for interaction counts
    doc_metadata_key = f"user:{user_id}:doc_metadata:{doc_id}"  # Redis key for document metadata (hash)



    counts = r.hgetall(interaction_count_key)
    
    
    print("interaction counts:", counts)
    
    
    record_interaction(user_id, r)
    

    
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

    # Normalize the document embedding if needed
    if not isinstance(doc_embedding, np.ndarray):
        doc_embedding = np.array(doc_embedding, dtype=np.float32)
    # You can normalize here if your embeddings are not already normalized
    normalized_doc =  doc_embedding #np.linalg.norm(doc_embedding)

    # Retrieve personalized weight and apply context multiplier
    personalized_weight = get_personalized_weight(user_id, event["interaction_type"], r=r)
    context_multiplier = get_context_multiplier(context)
    final_weight = personalized_weight * context_multiplier
    
    # Clip the final weight
    final_weight = float(np.clip(final_weight, MIN_WEIGHT, MAX_WEIGHT))
    
    # Compute weighted update using exponential moving average (EMA)
    weighted_update = final_weight * normalized_doc
    updated_emb = decay_factor * current_emb + (1 - decay_factor) * weighted_update
    
    print("personalized_weight:", personalized_weight)
    print("context multiplier:", context_multiplier)
    print("final_weight:", final_weight)

    # Update document score for this user and doc
    old_score = get_document_score(user_id=user_id, doc_id=doc_id, r=r)
    if old_score is None:
        init_score = 0.7
        r.zadd(f"user:{user_id}:docs:{doc_id}", {doc_id: init_score})
        old_score = init_score

    print("Old document score:", old_score)
    new_score = decay_factor * old_score + (1 - decay_factor) * final_weight
    
    # Normalize the new score using min-max normalization
    min_score = -1.0  # Define the minimum possible score
    max_score = 1.0  # Define the maximum possible score
    new_score = np.clip(new_score, min_score, max_score)

    print("Normalized new document score:", new_score)
    r.zadd(f"user:{user_id}:docs:{doc_id}", {doc_id: round(float(new_score), 3)})

    # Update profile in Redis with new embedding and timestamp
    with r.pipeline() as pipe:
        pipe.hset(user_profile_key, "embedding", updated_emb.tobytes())
        pipe.hset(user_profile_key, "last_updated", str(current_time))
        
        pipe.hset(doc_metadata_key, "last_interaction", str(current_time))  # Add last_interaction timestamp

        pipe.execute()

    # Update the weight multiplier for the interaction type
    multipliers_json = r.hget(user_profile_key, "weight_multiplier")
    if multipliers_json is not None:
        multipliers = json.loads(multipliers_json.decode())
        multipliers[event["interaction_type"]] = final_weight
        r.hset(user_profile_key, "weight_multiplier", json.dumps(multipliers))
    else:
        multipliers = {interaction: 1.0 for interaction in BASE_WEIGHTS.keys()}
        multipliers[event["interaction_type"]] = final_weight
        r.hset(user_profile_key, "weight_multiplier", json.dumps(multipliers))

    # Increment interaction count for the specific interaction type
    


    
    r.hincrby(interaction_count_key, event["interaction_type"], 1)

    #print(f"Updated profile for user {user_id} with decay factor {decay_factor:.4f} and final weight {final_weight:.4f}")
    #print(f"Incremented interaction count for {event['interaction_type']}")
    return updated_emb

def getUserProfile(user_id=None):
    user_profile_key = f"profile:{user_id}"
    profile_data = r.hgetall(user_profile_key)
    if not profile_data:
        raise ValueError(f"No profile found for user {user_id}")
    current_subjects = json.loads(profile_data[b'subjects'].decode())
    profile = np.frombuffer(profile_data[b'embedding'], dtype=np.float32)
    return profile

def get_document_score(user_id, doc_id, r):
    score = r.zscore(f"user:{user_id}:docs:{doc_id}", doc_id)
    if score is not None:
        return float(score)
    else:
        return None

def faiss_search(query_embedding: np.array, top_k: int = 100, user_id=None):
    """
    Perform a FAISS search for the most similar documents based on the query embedding.
    Exclude already seen documents stored in Redis and return exactly top_k unique documents.
    """
    # Load the FAISS index and document IDs.
    #base_path = "/app/src"
    
    
    base_path = "C:/Users/souih/OneDrive/Documents/GitHub/Print-Request-Management-System-/AI/src"
    
    

    index = faiss.read_index(f"{base_path}/doc_embeddings.index")
    stored_ids = np.load(f"{base_path}/new_doc_ids.npy").squeeze()
    
    # Redis key to track seen documents.
    seen_docs_key = f"user:{user_id}:seen_docs"
    
    # Prepare the query vector.
    query = query_embedding.astype(np.float32).reshape(1, -1)
    
    # Retrieve already seen document IDs from Redis.
    # Manually decode bytes to string since decode_responses is False.
    seen_docs = {doc.decode("utf-8") for doc in r.smembers(seen_docs_key)} if user_id else set()
    print(f"Number of seen docs: {len(seen_docs)}")
    
    filtered_document_ids = []
    # Initialize search_range based on the top_k value plus the number of seen docs.
    search_range = top_k + len(seen_docs)
    
    while len(filtered_document_ids) < top_k:
        # Perform the search using the current search_range.
        distances, indices = index.search(query, search_range)
        document_ids = stored_ids[indices].flatten()
    
        # Convert document IDs to strings to ensure consistency during comparisons.
        document_ids_str = [
            doc.decode("utf-8") if isinstance(doc, bytes) else str(doc)
            for doc in document_ids
        ]
    
        # Filter out documents that are already seen.
        new_docs = [doc for doc in document_ids_str if doc not in seen_docs]
    
        # If no new documents are found, break out (this might happen if we've exhausted the index).
        if not new_docs:
            break
    
        # Determine how many new docs are still needed.
        needed = top_k - len(filtered_document_ids)
        docs_to_add = new_docs[:needed]
    
        # Extend our results and update the seen docs.
        filtered_document_ids.extend(docs_to_add)
        for doc in docs_to_add:
            seen_docs.add(doc)
            if user_id:
                r.sadd(seen_docs_key, doc)
    
        # If we haven't reached the desired count, expand the search range.
        if len(filtered_document_ids) < top_k:
            search_range += top_k  # Expand search range by top_k each iteration.
            # Optionally, safeguard against exceeding the total number of embeddings.
            if search_range > stored_ids.shape[0]:
                break
    
    return filtered_document_ids[:top_k]




def clean_seen_docs(user_id):
    seen_docs_key = f"user:{user_id}:seen_docs"
    sr = redis.StrictRedis(host="localhost", port=6379, decode_responses=True)
    if sr.exists(seen_docs_key):
            sr.delete(seen_docs_key)

    del sr




# Initialize Redis connection



user_id = "9c912fa9-998f-4c02-a6aa-d9397fa21b89"

#start_session(user_id, r)

#context = calculate_context(user_id, r)
# Example usage:

#print(context)

#initialize_user_profile(user_id, ["informatique"], r)

# Update the profile with an interaction event
# Assume event dict has key "interaction_type" (e.g., "click")
# And context is a dict, e.g., {"session_value": 0.8}
#doc_id = "7a0e3168-c2a4-4667-a99d-5dd85712566b"
#profile = updateUserProfile(user_id, {"interaction_type": "download"}, doc_id,)
#profile = getUserProfile(user_id=242619)


#similar_docs = faiss_search(query_embedding=profile, r=r, user_id=242619, top_k=10)

#print("Similar documents:", similar_docs)


