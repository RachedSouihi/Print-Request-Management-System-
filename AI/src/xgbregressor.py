# -*- coding: utf-8 -*-
"""
Complete Updated Pipeline for Predictive Analytics of Print Requests

Dataset structure:
    date, field, student_prints, total_color_pages, ink_usage, total_requests, 
    prev_day_print_volume, prev_week_print_volume, moving_avg_7, moving_avg_30, 
    exam_period, holidays, total_copies

Targets: Predict total_requests, ink_usage, and total_copies for the next n days.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import TimeSeriesSplit
from datetime import timedelta, datetime

# ----------------------------
# 1. DATA LOADING & PREPROCESSING
# ----------------------------
def load_and_preprocess(file_path):
    """Load and preprocess the training dataset."""
    # Load CSV and convert date
    df = pd.read_csv(file_path)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df.sort_values(by='date', inplace=True)
    df.dropna(subset=['date'], inplace=True)
    
    # ---------------------------------------------
    # Handle missing values: For numerical columns, fill with median;
    # for categorical/flag columns, fill with a default value (e.g., 0)
    # ---------------------------------------------
    num_cols = ['student_prints', 'total_color_pages', 'ink_usage', 'total_requests',
                'prev_day_print_volume', 'prev_week_print_volume', 
                'moving_avg_7', 'moving_avg_30', 'total_copies']
    for col in num_cols:
        df[col].fillna(df[col].median(), inplace=True)
        
    # For binary flags like exam_period and holidays, fill missing with 0
    df['exam_period'] = df['exam_period'].fillna(0)
    df['holidays'] = df['holidays'].fillna(0)
    
    # For categorical field, fill missing with "Unknown"

    
    # ---------------------------------------------
    # Outlier Handling: Use IQR method on key numerical features
    # ---------------------------------------------
    def remove_outliers(df, col):
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        # Replace outliers with the median value
        df[col] = np.where((df[col] < lower_bound) | (df[col] > upper_bound),
                           df[col].median(), df[col])
        return df
    
    #for col in ['ink_usage', 'total_copies']:
     #   df = remove_outliers(df, col)
    
    # ---------------------------------------------
    # Feature Engineering
    # ---------------------------------------------
    # Temporal features
    df['day_of_week'] = df['date'].dt.dayofweek  # 0=Monday, 6=Sunday
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    
    # Ratio of color pages to total copies (avoid division by zero)
    df['color_ratio'] = df.apply(lambda x: x['total_color_pages'] / x['total_copies']
                                 if x['total_copies'] > 0 else 0, axis=1)
    
    # Compute workday volume as average of lag features
    df['workday_volume'] = df[['prev_day_print_volume', 'prev_week_print_volume']].mean(axis=1)
    
    # For categorical field, fill missing with "Unknown"
    df['field'] = df['field'].fillna("Unknown")

    # One-Hot Encoding for 'field' without prefixing and keeping the same attribute name
    field_dummies = pd.get_dummies(df['field'], prefix='', prefix_sep='')
    df = pd.concat([df.drop('field', axis=1), field_dummies], axis=1)
    # One-Hot Encoding for 'field' without prefixing and keeping the same attribute name
 
    # Return processed dataframe (set date aside for forecasting if needed)
    return df.drop('date', axis=1), df['date'].max()

# Define model configuration
model_config = {
    'n_estimators': 1000,
    'learning_rate': 0.05,
    'early_stopping_rounds': 50,
    'eval_metric': 'mae',
    'verbosity': 0
}

# ----------------------------
# 2. MODEL TRAINING
# ----------------------------

# ----------------------------
# 3. TIME SERIES CROSS-VALIDATION
# ----------------------------
def time_series_validation(X, y, n_splits=3):
    """Perform time series cross-validation and return average MAE."""
    tscv = TimeSeriesSplit(n_splits=n_splits)
    metrics = []
    
    for train_index, test_index in tscv.split(X):
        X_train_cv, X_test_cv = X.iloc[train_index], X.iloc[test_index]
        y_train_cv, y_test_cv = y.iloc[train_index], y.iloc[test_index]
        model = XGBRegressor().fit(X_train_cv, y_train_cv)
        preds = model.predict(X_test_cv)
        metrics.append(mean_absolute_error(y_test_cv, preds))
    
    return np.mean(metrics)

# ----------------------------
# 4. FORECASTING NEXT N DAYS
# ----------------------------
def predict_next_n_days(models, last_known_data, start_date, n_days=7):
    """Predict target values for the next n days using the trained models.
       Update lag features with a decay to simulate evolving trends."""
    predictions = []
    current_data = last_known_data.copy()
    
    # Convert start_date to datetime object
    last_date = datetime.strptime(start_date, '%Y-%m-%d')
    
    for day in range(1, n_days + 1):
        new_date = last_date + timedelta(days=day)
        
        # Update temporal features for the new date
        current_data['day_of_week'] = new_date.weekday()
        current_data['is_weekend'] = int(new_date.weekday() >= 5)
        
        # Generate predictions for each target
        pred_total_requests = max(0, round(models['total_requests'].predict(current_data)[0]))
        pred_total_copies = max(0, round(models['total_copies'].predict(current_data)[0]))
        pred_ink_usage = max(0, round(models['ink_usage'].predict(current_data)[0], 1))
        
        preds = {
            'date': new_date.strftime("%Y-%m-%d"),
            'total_requests': pred_total_requests,
            'total_copies': pred_total_copies,
            'ink_usage': pred_ink_usage
        }
        
        # Update lag features with decay factors
        current_data['prev_day_print_volume'] = current_data['prev_day_print_volume'] * 0.9 + pred_total_copies
        current_data['prev_week_print_volume'] = current_data['prev_week_print_volume'] * 0.8 + pred_total_copies
        
        predictions.append(preds)
    
    return pd.DataFrame(predictions)

# ----------------------------
# 5. MAIN EXECUTION
# ----------------------------
if __name__ == "__main__":
    # Load and preprocess data
    processed_df, last_date = load_and_preprocess("training_dataset.csv")
    print("Processed Features:", processed_df.columns.tolist())
    
    # Prepare targets and features for modeling
    y = processed_df[['total_requests', 'total_copies', 'ink_usage']]
    X = processed_df.drop(['total_requests', 'total_copies', 'ink_usage'], axis=1)
    
    # Split data: Use 80% for training and 20% for testing (based on time order)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # Train separate models for each target
    models = train_models(X_train, y_train, model_config)
    
    # Evaluate models
    print("\nModel Evaluation:")
    for target in models:
        test_preds = models[target].predict(X_test)
        mae = mean_absolute_error(y_test[target], test_preds)
        print(f"{target} MAE: {mae:.2f}")
        # Optionally perform time series cross-validation
        cv_score = time_series_validation(X, y[target])
        print(f"{target} CV MAE: {cv_score:.2f}")
    
    # Forecasting for the next n days using the last row of the test set
    last_known_data = X_test.iloc[[-1]]
    forecast_start_date = '2025-05-09'  # Set your desired start date for forecasting
    n_days = 14
    
    forecast = predict_next_n_days(models, last_known_data, forecast_start_date, n_days=n_days)
    
    print(f"\n{n_days}-Day Forecast:")
    print(forecast)
    
    # Optional: Visualize the forecast
    plt.figure(figsize=(10, 6))
    plt.plot(forecast['date'], forecast['total_requests'], marker='o', label='Total Requests')
    plt.plot(forecast['date'], forecast['total_copies'], marker='o', label='Total Copies')
    plt.plot(forecast['date'], forecast['ink_usage'], marker='o', label='Ink Usage')
    plt.xlabel("Date")
    plt.ylabel("Predicted Values")
    plt.title("7-Day Forecast for Print Requests")
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
