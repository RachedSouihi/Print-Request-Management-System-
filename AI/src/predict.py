import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import RFE
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import (
    StandardScaler,
    OneHotEncoder,
    MinMaxScaler,
    RobustScaler,
    PowerTransformer
)
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt
import seaborn as sns

from xgboost import XGBRegressor


# ----------------------------
# Data Loading
# ----------------------------
def load_data(file_path):
    """
    Load dataset from a CSV file.

    Parameters:
    file_path (str): Path to the CSV file

    Returns:
    df (DataFrame): Loaded dataset
    """
    df = pd.read_csv("./trainingdataset.csv")
    return df


# ----------------------------
# Data Preprocessing
# ----------------------------


def treatOutlier(df, feature):
    
    # Calculate IQR
    Q1 = df[feature].quantile(0.10)
    Q3 = df[feature].quantile(0.6)
    IQR = Q3 - Q1

    # Define bounds
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    # Cap outliers
    df[feature] = df[feature].clip(lower=lower_bound, upper=upper_bound)
    
    return df
        
def preprocess_data(df):
    """
    Enhanced preprocessing function with additional features.
    """
    # Convert date column to datetime
    df["date"] = pd.to_datetime(df["date"])

    # Sort by date
    

    df = df.sort_values("date").reset_index(drop=True)

    # Temporal features
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    df["day_of_month"] = df["date"].dt.day
    df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
    df["is_month_start"] = df["date"].dt.is_month_start.astype(int)
    df["is_month_end"] = df["date"].dt.is_month_end.astype(int)

    # 1. Rate-of-Change Feature
    df["ink_usage_change"] = df["ink_usage_field"] - df["prev_day_ink_usage_field"]

    # 2. Usage Regimes
    df["high_usage_yesterday"] = (df["prev_day_ink_usage_field"] > 100).astype(int)

    # Define features and targets


    #df = treatOutlier(df, 'total_copies')
    targets = ["ink_usage_field"]

    features = [
        "ink_usage_change",
        "high_usage_yesterday",
        'total_requests',
        "total_requests_field",
        "prev_day_total_requests",
        "prev_week_total_requests",
        "moving_avg_7_total_requests",
        "moving_avg_30_total_requests",
        "moving_avg_7_total_copies",
        "moving_avg_30_total_copies",
        "moving_avg_7_ink_usage",
        "moving_avg_30_ink_usage",
        "exam_period",
        "holidays",
        "day_of_week",
        "month",
        "is_weekend",
        "day_of_month",
    ]
    

    '''features = [
        "field",
        
        "ink_usage_change",
        "high_usage_yesterday",

        'total_requests',
        "total_requests_field",
        
        "exam_period",
        "holidays",
        "day_of_week",
        "month",
        "is_weekend",
        "day_of_month",
    ]'''
    

    

    # Add lag features for total_copies
    #for target in  ["ink_usage", "total_copies", 'total_requests']:
        

      #  features.extend([f"{i}_prev_day_{target}" for i in range(2, 8)])
        
    for target in  ["ink_usage_field", "total_copies_field", "total_requests_field"]:
        

        features.extend([f"{i}_prev_day_{target}" for i in range(2, 8)])
    #for target in ["ink_usage", "total_copies", "total_requests"]:
     #   features.append(f"prev_day_{target}")
      #  features.append(f"prev_week_{target}")
       # features.append(f"moving_avg_7_{target}")
       # features.append(f"moving_avg_30_{target}")
        
    for target in ["ink_usage_field", "total_copies_field", "total_requests_field"]:
        features.append(f"prev_day_{target}")
        features.append(f"prev_week_{target}")
        features.append(f"moving_avg_7_{target}")
        features.append(f"moving_avg_30_{target}")
        
        
    



    features = list(set(features))
    
    corr_matrix = df[['total_requests', 'total_requests_field', 'ink_usage', 'ink_usage_field', 
            'total_copies', 'total_copies_field',
            'prev_day_ink_usage', 'prev_day_ink_usage_field', 'prev_week_ink_usage',
            'moving_avg_7_ink_usage_field'
                      ]].corr()
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm')
    plt.show()

    
    features = features + ['field']
    

    
    df = df.fillna(0)

    X = df[features]
    y = df[targets]

    # Apply OneHotEncoder to the 'field' column
    categorical_features = ["field"]
    numeric_features = [
        feature for feature in features if feature not in categorical_features
    ]

    numeric_transformer = Pipeline(
        steps=[("imputer", SimpleImputer(strategy="mean")), ("scaler", MinMaxScaler())]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    X = preprocessor.fit_transform(X)

    # Get feature names after transformation
    feature_names = numeric_features + list(
        preprocessor.transformers_[1][1]["onehot"].get_feature_names_out(
            categorical_features
        )
    )

    # Apply MinMaxScaler to each target
    scalers = {}
        
    for target in targets:

        #if target == "ink_usage":
        y[target] = np.log1p(y[target])

        #scaler = MinMaxScaler()

        #y.loc[:, target] = scaler.fit_transform(y[[target]]).flatten()
        #scalers[target] = scaler
 #       else:
#            y[target] = np.log1p(y[target])
    # Split data into training, validation, and testing sets (temporal split)
    train_size = int(len(df) * 0.7)
    val_size = int(len(df) * 0.15)
    test_size = len(df) - train_size - val_size

    X_train, X_val, X_test = (
        X[:train_size],
        X[train_size : train_size + val_size],
        X[train_size + val_size :],
    )
    y_train, y_val, y_test = (
        y.iloc[:train_size],
        y.iloc[train_size : train_size + val_size],
        y.iloc[train_size + val_size :],
    )

    return (
        X_train,
        X_val,
        X_test,
        y_train,
        y_val,
        y_test,
        scalers,
        preprocessor,
        feature_names,
        features
    )


def chooseReleventFeatures(features_name, model, X, y):
    from sklearn.inspection import permutation_importance
    


    results = permutation_importance(model, X, y, scoring='neg_mean_squared_error', n_repeats=10, random_state=42)
    importance = results.importances_mean
    
    
    print("features shape: ", len(features))
    print("IMPORTANCE SHAPE: ", importance.shape)
    
    for i,v in enumerate(importance):
        try:
            print(f'Feature: {features[i]}, Importance: {v}')
        except:
            pass

# ----------------------------
# Model Training
# ----------------------------
def train_model(features, X_train, y_train, X_val, y_val):
    """
    Train regression models for each target variable.

    Parameters:
    X_train (DataFrame): Training features
    y_train (DataFrame): Training targets
    X_val (DataFrame): Validation features
    y_val (DataFrame): Validation targets

    Returns:
    models (dict): Dictionary of trained models for each target
    """
    models = {}
    targets = ["ink_usage_field"]

    for target in targets:
        # Create and train model

        if target == "ink_usage_field":

            model = XGBRegressor(
                random_state=0,    objective='reg:squarederror',  early_stopping_rounds=10
            )

            model.fit(
                X_train,
                y_train[target],
                eval_set=[(X_val, y_val[target])],
                verbose=False,
            )
            models[target] = model
            
        else:
            model = GradientBoostingRegressor(
                n_estimators=300,
                learning_rate=0.1,
                max_depth=10,
                subsample=0.2,
                random_state=42,
            )
            
            
            model.fit(X_train, y_train[target])
            models[target] = model
            
    chooseReleventFeatures(features, model, X_train, y_train)


    return models


# ----------------------------
# Model Evaluation
# ----------------------------
def evaluate_model(model, X_test, y_test, target, scaler=None):
    """
    Evaluate the performance of a trained model.

    Parameters:
    model (Pipeline): Trained model pipeline
    X_test (DataFrame): Test features
    y_test (DataFrame): Test targets
    target (str): Target variable name

    Returns:
    metrics (dict): Dictionary of evaluation metrics
    """
    
    
    

    y_pred = model.predict(X_test).squeeze()
    

    
    
    
    # Inverse transform

    y_test = (
        scaler.inverse_transform(y_test[target].values.reshape(-1, 1))
        if scaler
        else np.expm1(y_test[target].squeeze())
    )
    y_pred = scaler.inverse_transform(y_pred.reshape(-1, 1)) if scaler else np.expm1(y_pred)
    
    

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    # Visualize prediction errors
    plt.figure(figsize=(10, 6))
    sns.scatterplot(x=y_test, y=y_pred)
    plt.plot([0, max(y_test)], [0, max(y_test)], 'k--')
    plt.xlabel(f'Actual {target}')
    plt.ylabel(f'Predicted {target}')
    plt.title(f'Actual vs Predicted {target}')
    plt.show()

    return {"MAE": mae, "RMSE": rmse, "R2": r2}


# ----------------------------
# Prediction Function
# ----------------------------
def predict_for_date(model, model_requests, model_copies, new_data):
    """
    Make predictions for a new date.

    Parameters:
    model_ink (Pipeline): Trained model for ink_usage
    model_requests (Pipeline): Trained model for total_requests
    model_copies (Pipeline): Trained model for total_copies
    new_data (DataFrame): Data for the new date

    Returns:
    predictions (dict): Dictionary of predictions for each target
    """
    ink_pred = model_ink.predict(new_data)[0]
    requests_pred = model_requests.predict(new_data)[0]
    copies_pred = model_copies.predict(new_data)[0]

    predictions = {
        "ink_usage": ink_pred,
        "total_requests": requests_pred,
        "total_copies": copies_pred,
    }

    return predictions


# ----------------------------
# Feature Importance Function
# ----------------------------
def getImpactfulFeatures(model, target, X_train, feature_names, preprocessor):
    import shap

    # Inverse transform the numeric features
    # numeric_transformer = preprocessor.named_transformers_['num']
    # X_train_numeric = X_train[:, :len(preprocessor.transformers_[0][2])]

    # Inverse transform the categorical features
    ##categorical_transformer = preprocessor.named_transformers_['cat']
    # X_train_categorical = X_train[:, len(preprocessor.transformers_[0][2]):]

    # Get the original categorical feature names
    # categorical_feature_names = list(preprocessor.transformers_[1][1]['onehot'].get_feature_names_out(['field']))

    # Combine the numeric and categorical features
    # X_train_original = np.hstack((X_train_numeric, X_train_categorical))

    # Create a SHAP explainer object for the model
    explainer = shap.TreeExplainer(model)

    # Calculate SHAP values for the training data
    shap_values = explainer.shap_values(X_train)

    # Generate a summary plot of the SHAP values
    shap.summary_plot(shap_values, X_train, feature_names=feature_names, title=target)


# ----------------------------
# Main Execution
# ----------------------------
if __name__ == "__main__":
    # Load data
    df = pd.read_csv("trainingdataset.csv")

    # Preprocess data
    (
        X_train,
        X_val,
        X_test,
        y_train,
        y_val,
        y_test,
        scalers,
        preprocessor,
        feature_names,
        features
    ) = preprocess_data(df)

    # Train models
    models = train_model(features, X_train, y_train, X_val, y_val)

    targets =  ["ink_usage_field"]
    # Evaluate models
    for target in targets:

        if target == "ink_usage":

            metrics = evaluate_model(
                models[target], X_test, y_test, target,
            )

        else:
            metrics = evaluate_model(models[target], X_test, y_test, target,)

        print(f"\nEvaluation metrics for {target}:")
        for metric, value in metrics.items():
            print(f"{metric}: {value:.2f}")

        getImpactfulFeatures(
            models[target], target, X_train, feature_names, preprocessor
        )