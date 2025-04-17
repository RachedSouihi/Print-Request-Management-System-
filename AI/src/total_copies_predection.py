import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import timedelta, datetime

from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score, KFold
from sklearn.metrics import r2_score, mean_squared_error

# ------------------------------
# Load and Clean Dataset
# ------------------------------
df = pd.read_csv("trainingdataset.csv")

# Drop fully null or constant columns
df.dropna(axis=1, how='all', inplace=True)
df = df.loc[:, (df != df.iloc[0]).any()]

# ------------------------------
# Target Distribution
# ------------------------------
plt.figure(figsize=(8, 5))
sns.histplot(df['total_copies'], bins=30, kde=True, color="cornflowerblue")
plt.title("Distribution of 'total_copies'")
plt.xlabel("total_copies")
plt.ylabel("Frequency")
plt.tight_layout()
plt.show()

# ------------------------------
# Correlation and Feature Selection
# ------------------------------
corr_matrix = df.corr(numeric_only=True)
top_corr = corr_matrix['total_copies'].drop('total_copies').abs().sort_values(ascending=False).head(10)
top_features = top_corr.index.tolist()
print("Top 10 correlated features:", top_features)

# ------------------------------
# Features & Target
# ------------------------------
X = df[top_features]
y = df['total_copies']
y_log = np.log1p(y)  # log(1 + x)

# ------------------------------
# Train/Test Split (Time-Based)
# ------------------------------
train_size = int(0.8 * len(X))
X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
y_train, y_test = y_log.iloc[:train_size], y_log.iloc[train_size:]

# ------------------------------
# Pipeline and Hyperparameter Tuning
# ------------------------------
pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="mean")),
    ("scaler", MinMaxScaler()),
    ("regressor", GradientBoostingRegressor(random_state=42))
])

param_grid = {
    "regressor__n_estimators": [100, 200],
    "regressor__learning_rate": [0.05, 0.1],
    "regressor__max_depth": [3, 5]
}

grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='r2', n_jobs=-1, verbose=1)
grid_search.fit(X_train, y_train)

print("✅ Best Parameters:", grid_search.best_params_)
print("✅ Best Cross-Validated R² Score:", grid_search.best_score_)

# ------------------------------
# Model Evaluation
# ------------------------------
best_model = grid_search.best_estimator_

# Test Set Prediction
y_pred_log = best_model.predict(X_test)
y_pred = np.expm1(y_pred_log)  # Reverse log transform
y_true = np.expm1(y_test)

# Metrics
r2 = r2_score(y_true, y_pred)
rmse = np.sqrt(mean_squared_error(y_true, y_pred))

print("\n📊 Evaluation on Test Set:")
print(f"R² Score: {r2:.4f}")
print(f"RMSE: {rmse:.2f}")

# Cross-Validation Score on full dataset
cv = KFold(n_splits=5, shuffle=True, random_state=42)
cv_r2 = cross_val_score(best_model, X, y_log, cv=cv, scoring='r2')
cv_rmse = np.sqrt(-cross_val_score(best_model, X, y_log, cv=cv, scoring='neg_mean_squared_error'))

print("\n🔁 Cross-Validation Results:")
print(f"Mean R²: {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
print(f"Mean RMSE: {cv_rmse.mean():.2f} ± {cv_rmse.std():.2f}")

# ------------------------------
# Function to Predict Next N Days
# ------------------------------
def predict_next_n_days(model, reference_df, top_features, start_date, n_days):
    future_dates = [start_date + timedelta(days=i) for i in range(1, n_days + 1)]
    future_df = pd.DataFrame({'date': future_dates})
    
    # Here you must reconstruct the same features (day_of_week, etc.) that were used during training.
    future_df['day_of_week'] = future_df['date'].dt.dayofweek
    future_df['month'] = future_df['date'].dt.month

    # Simulate feature generation based on available data
    for feature in top_features:
        if feature not in future_df.columns:
            if feature in reference_df.columns:
                # Use mean value from training data for missing features
                future_df[feature] = reference_df[feature].mean()
            else:
                future_df[feature] = 0

    # Keep only top_features and ensure order
    future_X = future_df[top_features]
    future_X = future_X.fillna(0)

    predictions_log = model.predict(future_X)
    future_df["predicted_total_copies"] = np.expm1(predictions_log)
    return future_df[["date", "predicted_total_copies"]]

# ------------------------------
# Predicting the Next 7 Days
# ------------------------------
start_date = datetime.now()
future_preds = predict_next_n_days(best_model, df, top_features, start_date, 7)
print("\n📅 Prediction for the Next 7 Days:")
print(future_preds)

# ------------------------------
# Plot Future Predictions
# ------------------------------
plt.figure(figsize=(8, 5))
sns.lineplot(data=future_preds, x='date', y='predicted_total_copies', marker='o')
plt.title("Forecast: Total Copies for the Next 7 Days")
plt.ylabel("Predicted Copies")
plt.xlabel("Date")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
