import psycopg2
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import logging
logging.basicConfig(level=logging.DEBUG)

# Connexion à la base de données PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="prms",
    user="postgres",
    password="root"
)

cursor = conn.cursor()

# Récupérer les utilisateurs (fix: added missing comma)
cursor.execute("SELECT user_id, email  FROM users")
utilisateurs = cursor.fetchall()

# Récupérer les documents
cursor.execute("SELECT id, title FROM documents")
documents = cursor.fetchall()

# Récupérer les consultations des utilisateurs (documents sauvegardés)
cursor.execute("SELECT user_id, document_id FROM saved_documents")
consultations = cursor.fetchall()

# Créer une matrice vide avec des utilisateurs en lignes et des documents en colonnes
interaction_matrix = pd.DataFrame(0, index=[user[0] for user in utilisateurs], columns=[doc[0] for doc in documents])

# Remplir la matrice avec les consultations (1 si l'utilisateur a consulté le document)
for user_id, document_id in consultations:
    if user_id in interaction_matrix.index and document_id in interaction_matrix.columns:
        interaction_matrix.at[user_id, document_id] = 1

# Afficher la matrice d'interaction
print("Matrice d'interaction :")
print(interaction_matrix)

# Calculer la similarité entre utilisateurs (convert to float)
similarity_matrix = cosine_similarity(interaction_matrix.astype(float))

# Afficher la matrice de similarité
print("\nMatrice de similarité (entre utilisateurs) :")
print(pd.DataFrame(similarity_matrix, index=interaction_matrix.index, columns=interaction_matrix.index))

# Fermer la connexion
cursor.close()
conn.close()
# Recommander des documents pour chaque utilisateur
recommandations = {}

for idx, user_id in enumerate(interaction_matrix.index):
    # Similarité de l'utilisateur courant avec tous les autres
    user_similarities = similarity_matrix[idx]
    
    # Score pour chaque document (pondéré par la similarité des autres utilisateurs)
    scores = pd.Series(0, index=interaction_matrix.columns)

    for jdx, other_user_id in enumerate(interaction_matrix.index):
        if user_id == other_user_id:
            continue  # ne pas se comparer à soi-même
        similarity = user_similarities[jdx]
        other_user_interactions = interaction_matrix.loc[other_user_id]
        
        # Ajouter les scores pondérés pour les documents
        scores += other_user_interactions * similarity

    # Écarter les documents déjà consultés
    already_seen = interaction_matrix.loc[user_id]
    scores[already_seen == 1] = -1  # mettre un score négatif pour ne pas les recommander

    # Sélectionner les N meilleures recommandations
    top_docs = scores.sort_values(ascending=False).head(5).index.tolist()
    recommandations[user_id] = top_docs

# Afficher les recommandations
print("\nRecommandations de documents :")
for user_id, docs in recommandations.items():
    print(f"Utilisateur {user_id} → Documents recommandés : {docs}")
