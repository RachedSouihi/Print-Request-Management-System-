import psycopg2
import pandas as pd
import numpy as np

# PostgreSQL connection details
DB_CONFIG = {
    "dbname": "prms",
    "user": "postgres",
    "password": "242619",
    "host": "localhost",
    "port": 5432
}

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

df['created_at'] = pd.to_datetime(df['created_at'])
df['date'] = df['created_at'].dt.date
df['day_of_week'] = df['created_at'].dt.dayofweek  # 0=Monday, 6=Sunday

# Define exam period and holidays manually (Replace with actual data)
exam_dates = pd.to_datetime(["2025-06-01", "2025-06-15"])  # Example exam dates
df['exam_period'] = df['date'].apply(lambda x: 1 if pd.to_datetime(x) in exam_dates else 0)

holiday_dates = pd.to_datetime(["2025-01-01", "2025-12-25"])  # Example holidays
df['holidays'] = df['date'].apply(lambda x: 1 if pd.to_datetime(x) in holiday_dates else 0)

# Fetch profile data with the "field" attribute
profile_query = """
SELECT user_id, role, field
FROM Profile;
"""
profiles = pd.read_sql(profile_query, conn)

# Merge profiles with print request data
df = df.merge(profiles, on='user_id', how='left')
df['date'] = pd.to_datetime(df['date'])  # ensure proper datetime format


# Compute total copies for all print requests per date
total_copies_df = df.groupby('date')['copies'].sum().reset_index()
total_copies_df.rename(columns={'copies': 'total_copies'}, inplace=True)

total_requests_df = df.groupby('date')['request_id'].count().reset_index()
total_requests_df.rename(columns={'request_id': 'total_requests'}, inplace=True)

ink_usage_df = df.groupby('date')['ink_usage'].sum().reset_index()

# Filter for student prints only (since we're grouping by student "field")
student_df = df.copy() #df[df['role'] == 'student'].copy()

# Aggregate student prints by date and field
student_daily = student_df.groupby(['date', 'field']).agg(
    #student_prints=('copies', 'sum'),
    total_copies_field = ('copies', 'sum'),
    total_color_pages=('color', 'sum'),
    ink_usage_field=('ink_usage', 'sum'),
    total_requests_field=('request_id', 'count')
).reset_index()



student_daily = student_daily.merge(total_copies_df, on='date', how='left')

student_daily = student_daily.merge(total_requests_df, on='date', how='left')

student_daily = student_daily.merge(ink_usage_df, on='date', how='left')



# Sort the data by field and date for time series operations
student_daily = student_daily.sort_values(['date'], ascending=True)



# Compute previous day and previous week values for target features
for target in ['ink_usage', 'total_copies', 'total_requests']:
    daily_target = student_daily.groupby('date', as_index=False)[target].sum()
    
    
    
    
    daily_target[f'prev_day_{target}'] = (
        daily_target.set_index('date')[target]
        .rolling('1D', closed='left')  # 1-day window up to previous day
        .sum()
        .reset_index(drop=True)
    )
    
    student_daily[f'prev_day_{target}_field'] = (
        student_daily.set_index('date').sort_index().groupby(['date', 'field'])[f'{target}_field']
        .rolling('1D', closed='left')  # 1-day window up to previous day
        .sum()
        .reset_index(drop=True)
    )
    
    student_daily[f'prev_week_{target}_field'] = (
        student_daily.set_index('date').sort_index().groupby(['date', 'field'])[f'{target}_field']
        .rolling('7D', closed='left')  # 7-day window up to previous day
        .sum()
        .reset_index(drop=True)
    )
   
    
    
    for i in range(2, 8):
        daily_target[f'{i}_prev_day_{target}'] = (
        daily_target.set_index('date')[target]
        .rolling(f'{i}D', closed='left')  # 1-day window up to previous day
        .sum()
        .reset_index(drop=True)
    )
        
    for i in range(2, 8):
        student_daily[f'{i}_prev_day_{target}_field'] = (
        student_daily.set_index('date').sort_index().groupby(['date', 'field'])[f'{target}_field']
        .rolling(f'{i}D', closed='left')  # 1-day window up to previous day
        .sum()
        .reset_index(drop=True)
    )
    
    for i in [7, 30]:
        student_daily[f'moving_avg_{i}_{target}_field'] = (
        student_daily.set_index('date').sort_index().groupby(['date', 'field'])[f'{target}_field']
        .rolling(f'{i}D', closed='left')  # 1-day window up to previous day
        .mean()
        .reset_index(drop=True)
    )
        
    
    
    
    daily_target[f'prev_week_{target}'] = (
        daily_target.set_index('date')[target]
        .rolling('7D', closed='left')  # 7-day window up to previous day
        .sum()
        .reset_index(drop=True)
    )
    

    
    #lag features
    lag_features = [f'{i}_prev_day_{target}' for i in range(2, 8)]
    
    # Merge the aggregated target features back into the original DataFrame
    student_daily = student_daily.merge(
        daily_target[['date', f'prev_day_{target}', f'prev_week_{target}', *lag_features]], 
        on='date', 
        how='left'
    )
    
    # Optionally fill NaN values for target features
    student_daily[f'prev_day_{target}'] = student_daily[f'prev_day_{target}'].fillna(method='ffill')
    student_daily[f'prev_week_{target}'] = student_daily[f'prev_week_{target}'].fillna(method='ffill')

# Compute moving averages for target features
avg_df = pd.DataFrame({})
avg_df['date'] = student_daily['date'].unique()



for target in ['total_requests', 'total_copies', 'ink_usage']:
    avg_df[f'{target}_avg'] = student_daily.groupby('date')[target].sum().to_numpy().squeeze()
    
    avg_df[f'moving_avg_7_{target}'] = (
        avg_df.set_index('date')[f'{target}_avg']
        .rolling('7D', closed='left')  # 7-day window up to previous day
        .mean()
        .reset_index(drop=True)
    )
    
    avg_df[f'moving_avg_30_{target}'] = (
        avg_df.set_index('date')[f'{target}_avg']
        .rolling('30D', closed='left')  # 30-day window up to previous day
        .mean()
        .reset_index(drop=True)
    )
    
    student_daily = student_daily.merge(
        avg_df[['date', f'moving_avg_7_{target}', f'moving_avg_30_{target}']], 
        on='date', 
        how='left'
    )
    student_daily[f'moving_avg_7_{target}'] = student_daily[f'moving_avg_7_{target}'].fillna(value=0)
    student_daily[f'moving_avg_30_{target}'] = student_daily[f'moving_avg_30_{target}'].fillna(value=0)


# Create a calendar dataframe for exam_period and holidays (per date)
calendar = df[['date', 'exam_period', 'holidays']].drop_duplicates()

# Merge calendar and total_copies into the student prints data
training_dataset = student_daily.merge(calendar, on='date', how='left')

# Sort the final training dataset by date in ascending order
training_dataset = training_dataset.sort_values(by='date')

# Save the final training dataset to CSV
training_dataset.to_csv("trainingdataset.csv", index=False)
print("Dataset saved successfully! ✅")

conn.close()
