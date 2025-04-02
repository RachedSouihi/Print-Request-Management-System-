import psycopg2
import pandas as pd
import numpy as np

# PostgreSQL connection details
DB_CONFIG = {
    "dbname": "prms",
    "user": "postgres",
    "password": "root",
    "host": "localhost",
    "port": 5432
}

# Connect to PostgreSQL

# Connect to PostgreSQL Database
try:
    conn = psycopg2.connect(**DB_CONFIG)
    print("Connected to PostgreSQL successfully!")
except Exception as e:
    print(f"Error connecting to database: {e}")
    exit()
# Fetch raw print request data
query = """
SELECT 
    request_id, user_id, created_at, color, copies, ink_usage, urgency
FROM print_requests;
"""
df = pd.read_sql(query, conn)

# Convert timestamps to datetime
df['created_at'] = pd.to_datetime(df['created_at'])

# Extract date-related features
df['date'] = df['created_at'].dt.date
df['day_of_week'] = df['created_at'].dt.dayofweek  # 0=Monday, 6=Sunday

# Define exam period and holidays manually (Replace with actual data)
exam_dates = pd.to_datetime(["2025-06-01", "2025-06-15"])  # Example exam dates
df['exam_period'] = df['date'].apply(lambda x: 1 if pd.to_datetime(x) in exam_dates else 0)

holiday_dates = pd.to_datetime(["2025-01-01", "2025-12-25"])  # Example holidays
df['holidays'] = df['date'].apply(lambda x: 1 if pd.to_datetime(x) in holiday_dates else 0)

# Aggregate daily print volume
daily_prints = df.groupby('date').agg(
    total_pages=('copies', 'sum'),
    total_color_pages=('color', 'sum'),
    ink_usage=('ink_usage', 'sum'),
    total_requests=('request_id', 'count')
).reset_index()

# Compute lagged features (previous day/week print volume)
daily_prints['prev_day_print_volume'] = daily_prints['total_pages'].shift(1)
daily_prints['prev_week_print_volume'] = daily_prints['total_pages'].shift(7)

# Compute moving averages (last 7 and 30 days)
# Compute moving averages with min_periods to reduce NaNs
daily_prints['moving_avg_7'] = daily_prints['total_pages'].rolling(7, min_periods=1).mean()
daily_prints['moving_avg_30'] = daily_prints['total_pages'].rolling(30, min_periods=1).mean()

# Alternatively, forward-fill NaN values
daily_prints['moving_avg_7'] = daily_prints['moving_avg_7'].fillna(method='ffill')
daily_prints['moving_avg_30'] = daily_prints['moving_avg_30'].fillna(method='ffill')

# Or use interpolation
daily_prints['moving_avg_7'] = daily_prints['moving_avg_7'].interpolate()
daily_prints['moving_avg_30'] = daily_prints['moving_avg_30'].interpolate()
# Add student and professor statistics
profile_query = """
SELECT user_id, role
FROM Profile;
"""
profiles = pd.read_sql(profile_query, conn)

# Merge profiles with the main dataframe
df = df.merge(profiles, on='user_id', how='left')

# Ensure 'date' column is in datetime format for merging
df['date'] = pd.to_datetime(df['date'])
daily_prints['date'] = pd.to_datetime(daily_prints['date'])

# Filter student and professor prints
student_prints = df[df['role'] == 'student']
professor_prints = df[df['role'] == 'professor']



# Aggregate student and professor prints by date
student_daily_prints = student_prints.groupby('date')['copies'].sum().reset_index()
professor_daily_prints = professor_prints.groupby('date').agg({'copies': 'sum'}).reset_index()

# Ensure 'date' column is in datetime format for merging
student_daily_prints['date'] = pd.to_datetime(student_daily_prints['date'])
professor_daily_prints['date'] = pd.to_datetime(professor_daily_prints['date'])

# Rename columns for clarity
student_daily_prints.rename(columns={'copies': 'student_prints_30'}, inplace=True)
professor_daily_prints.rename(columns={'copies': 'professor_print_volume_7'}, inplace=True)

# Merge with daily_prints
daily_prints = daily_prints.merge(student_daily_prints, on='date', how='left')
daily_prints = daily_prints.merge(professor_daily_prints, on='date', how='left')

# Fill NaN values with 0
daily_prints['student_prints_30'] = daily_prints['student_prints_30'].fillna(0)
daily_prints['professor_print_volume_7'] = daily_prints['professor_print_volume_7'].fillna(0)

# Compute student to professor print ratio
daily_prints['student_professor_ratio'] = daily_prints['student_prints_30'] / daily_prints['professor_print_volume_7'] if daily_prints['professor_print_volume_7'].all() != 0 else 0

# Handle printer errors (Assuming 'errors' table exists with 'date' and 'error_count' columns)
'''printer_errors_query = "SELECT date, COUNT(*) as error_count FROM printer_errors GROUP BY date"
printer_errors = pd.read_sql(printer_errors_query, conn)

daily_prints = daily_prints.merge(printer_errors, on='date', how='left')'''
daily_prints['printer_errors'] = 0 #daily_prints['printer_errors'].fillna(0)

# Save dataset to CSV
daily_prints.to_csv("training_dataset.csv", index=False)
print("Dataset saved successfully! ✅")

conn.close()
