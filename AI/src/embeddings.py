import numpy as np
import pandas as pd
import redis
import faiss

# Connect to Redis
r = redis.Redis(host="127.0.0.1", port=6379, db=0)

def save_docs():
    r.flushdb()

    # Load data
    #base_url = "/app/src"
    
    
    base_url = "C:/Users/souih/OneDrive/Documents/GitHub/Print-Request-Management-System-/AI/src"


    df = pd.read_csv(f"{base_url}/docs.csv")

    #embeddings = np.load(f"{base_url}/new_doc_embeddings.npy")
    
    index = faiss.read_index('new_doc_embeddings.index')
    
    embeddings = np.array([index.reconstruct(i) for i in range(index.ntotal)])
    doc_ids = np.load(f"{base_url}/new_doc_ids.npy")[:embeddings.shape[0]]

    subjects = df["subject"].values
    levels = df["level"].values
    types = df["type"].values

    with r.pipeline() as pipe:
        for idx, doc_id in enumerate(doc_ids):
            # Create main document hash
            doc_key = f"doc:{doc_id}"
            embedding = embeddings[idx].astype(np.float32)

            pipe.hset(
                doc_key,
                mapping={
                    "doc_id": doc_id,
                    "embedding": embedding.tobytes(),
                    "subject": subjects[idx],
                    "level": levels[idx],
                    "type": types[idx],
                },
            )

            # Add to secondary indexes
            pipe.sadd(f"subject:{subjects[idx]}", doc_id)
            pipe.sadd(f"level:{levels[idx]}", doc_id)
            pipe.sadd(f"type:{types[idx]}", doc_id)
            pipe.zadd("docs:timestamp", {doc_id: idx})  # Using index as timestamp proxy

        # Store ordered ID list and cardinality
        pipe.rpush("doc_id_list", *doc_ids)
        pipe.set("total_docs", len(doc_ids))

        pipe.execute()

    print(f"Stored {len(doc_ids)} documents with metadata")


def get_all_docs():
    # Get all document IDs in order
    stored_ids = [id.decode() for id in r.lrange("doc_id_list", 0, -1)]

    # Batch retrieve embeddings and metadata
    with r.pipeline() as pipe:
        for doc_id in stored_ids:
            pipe.hgetall(f"doc:{doc_id}")
        results = pipe.execute()

    # Process results
    embeddings_list = []
    metadata_list = []

    for res in results:
        metadata = {
            "doc_id": res[b"doc_id"].decode(),
            "subject": res[b"subject"].decode(),
            "level": res[b"level"].decode(),
            "type": res[b"type"].decode(),
        }
        embeddings_list.append(np.frombuffer(res[b"embedding"], dtype=np.float32))
        metadata_list.append(metadata)

    embeddings_array = np.vstack(embeddings_list)

    print(f"Retrieved {len(embeddings_array)} documents")
    print("Sample metadata:", metadata_list[0])
    print("Embedding shape:", embeddings_array.shape)

    return embeddings_array, metadata_list


# Additional helper functions
def get_filtered_embeddings(subject=None, level=None, type=None):
    # Find matching doc IDs
    pipe = r.pipeline()
    if subject:
        pipe.smembers(f"subject:{subject}")
    if level:
        pipe.smembers(f"level:{level}")
    if type:
        pipe.smembers(f"type:{type}")
    results = [set(r.decode() for r in res) for res in pipe.execute() if res]

    # Intersect filters
    doc_ids = list(set.intersection(*results)) if results else []

    # Batch get embeddings
    with r.pipeline() as pipe:
        for doc_id in doc_ids:
            pipe.hget(f"doc:{doc_id}", "embedding")
        embeddings = [np.frombuffer(emb, dtype=np.float32) for emb in pipe.execute()]


    if(embeddings != []):
        return np.vstack(embeddings), doc_ids
    
    return np.array([]), []


def get_doc_metadata(doc_id):
    data = r.hgetall(f"doc:{doc_id}")
    return (
        {
            "doc_id": data[b"doc_id"].decode(),
            "subject": data[b"subject"].decode(),
            "level": data[b"level"].decode(),
            "type": data[b"type"].decode(),
            "embedding": np.frombuffer(data[b"embedding"], dtype=np.float32),
        }
        if data
        else None
    )


def get_avg_embedding(subject=None, level=None, type=None):
    embeddings, _ = get_filtered_embeddings(subject=subject, level=level, type=type)
    if len(embeddings) == 0:
        return None  # Handle empty results
    
    print("Docs found:", embeddings.shape)
    return np.mean(embeddings, axis=0)


def get_doc_embedding(doc_id):
    data = r.hget(f"doc:{doc_id}", "embedding")
    if data:
        return np.frombuffer(data, dtype=np.float32)
    else:
        return None


def save_faiss_index(index_path="doc_embeddings.index"):
    embeddings, metadata = get_all_docs()
    if len(embeddings) == 0:
        print("No embeddings found to save in FAISS index.")
        return

    # Extract doc_ids from metadata
    doc_ids = [meta["doc_id"] for meta in metadata]
    np.save("doc_ids.npy", doc_ids)

    # Create a FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    # Save the index
    faiss.write_index(index, index_path)
    print(f"FAISS index saved to {index_path}")


'''def get_doc_ids(subject=None, level=None, type=None):
    
    print("subjects: ", subject)
    embeddings, doc_ids = get_filtered_embeddings(subject=subject, level=level, type=type)
    if not doc_ids:
        return []

    docs = []
    for doc_id in doc_ids:
        metadata = get_doc_metadata(doc_id)
        if metadata:
            docs.append(metadata)

    return docs
'''

def get_doc_ids_by(subject=None, level=None, type=None):
    def get_filter_set(filter_list, filter_type):
        pipe = r.pipeline()
        for filter_value in filter_list:
            pipe.smembers(f"{filter_type}:{filter_value}")
        return [set(r.decode() for r in res) for res in pipe.execute() if res]

    results = []
    if subject:
        results.append(get_filter_set(subject, "subject"))
    if level:
        results.append(get_filter_set(level, "level"))
    if type:
        results.append(get_filter_set(type, "type"))
        
        

    # Intersect filters
    doc_ids = list(set.intersection(*results[0])) if results else []
    
    return doc_ids

    # Batch get embeddings and metadata
    docs_ids = []
    with r.pipeline() as pipe:
        for doc_id in doc_ids:
            pipe.hgetall(f"doc:{doc_id}")
        results = pipe.execute()

    for res in results:
        metadata = {
            "doc_id": res[b"doc_id"].decode(),
            "subject": res[b"subject"].decode(),
            "level": res[b"level"].decode(),
            "type": res[b"type"].decode(),
        }
        docs_ids.append(metadata.get("doc_id"))

    return docs_ids


