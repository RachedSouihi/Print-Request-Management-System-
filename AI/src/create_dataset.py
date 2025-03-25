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

# Filter for student prints only (since we're grouping by student "field")
student_df = df.copy() #df[df['role'] == 'student'].copy()

# Aggregate student prints by date and field
student_daily = student_df.groupby(['date', 'field']).agg(
    student_prints=('copies', 'sum'),
    total_color_pages=('color', 'sum'),
    ink_usage=('ink_usage', 'sum'),
    total_requests=('request_id', 'count')
).reset_index()



# Sort the data by field and date for time series operations
student_daily = student_daily.sort_values(['date'], ascending=True)

# Compute previous day and week dates
#student_daily['prev_day_date'] = student_daily['date'] - pd.DateOffset(days=1)

# Merge previous day's data
#prev_day = student_daily[['date', 'field', 'student_prints']].copy()
#prev_day.rename(columns={'date': 'prev_day_date', 'student_prints': 'prev_day_print_volume'}, inplace=True)
#student_daily = student_daily.merge(prev_day, on=['prev_day_date', 'field'], how='left')





# Compute rolling sum for the last 7 days for prev_week_print_volume

'''student_daily['prev_week_print_volume'] = (
    student_daily
    .set_index('date')  # Set date as index for time-based window
    .groupby('field')['student_prints']
    .rolling('7D', closed='left')  # 7-day window, exclude current date
    .sum()
    .reset_index()
    .sort_values(['field', 'date'])
    ['student_prints']
)'''

daily_total = student_daily.groupby('date', as_index=False)['student_prints'].sum()

daily_total['prev_day_total'] = (
    daily_total.set_index('date')['student_prints']
    .rolling('1D', closed='left')  # 7-day window up to previous day
    .sum()
    .reset_index(drop=True)
)



# Calculate rolling 7-day sum (date-based, closed='left' excludes current date)
daily_total['prev_week_total'] = (
    daily_total.set_index('date')['student_prints']
    .rolling('7D', closed='left')  # 7-day window up to previous day
    .sum()
    .reset_index(drop=True)
)

# Merge the aggregated total back into the original DataFrame

student_daily = student_daily.merge(
    daily_total[['date',  'prev_day_total','prev_week_total']], 
    on='date', 
    how='left'
)



# Rename the column to match your target
student_daily.rename(columns={'prev_week_total': 'prev_week_print_volume'}, inplace=True)

student_daily.rename(columns={'prev_day_total': 'prev_day_print_volume'}, inplace=True)


# Optionally fill NaN values (using forward fill here; alternatives: interpolation or fillna(0))
student_daily['prev_day_print_volume'] = student_daily['prev_day_print_volume'].fillna(method='ffill')
student_daily['prev_week_print_volume'] = student_daily['prev_week_print_volume'].fillna(method='ffill')


#student_daily = student_daily.drop(columns=['prev_day_date'])

#student_daily['moving_avg_7'] = student_daily.groupby('field')['student_prints']\
    #.rolling(7, min_periods=1).mean().reset_index(level=0, drop=True)

daily_total = student_daily.groupby('date', as_index=False)['student_prints'].mean()


daily_total['moving_avg_7'] = (
    daily_total.set_index('date')['student_prints']
    .rolling('7D', closed='left')  # 7-day window up to previous day
    .mean()
    .reset_index(drop=True)
)

#student_daily['moving_avg_30'] = student_daily.groupby('field')['student_prints']\
 #   .rolling(30, min_periods=1).mean().reset_index(level=0, drop=True)


daily_total['moving_avg_30'] = (
    daily_total.set_index('date')['student_prints']
    .rolling('30D', closed='left')  # 7-day window up to previous day
    .mean()
    .reset_index(drop=True)
)



student_daily = student_daily.merge(
    daily_total[['date',  'moving_avg_7','moving_avg_30']], 
    on='date', 
    how='left'
)

student_daily['moving_avg_7'] = student_daily['moving_avg_7'].fillna(value=0)
student_daily['moving_avg_30'] = student_daily['moving_avg_30'].fillna(value=0)
print(student_daily.head(30)[["date", "student_prints", "moving_avg_7", "moving_avg_30"]])




#print(student_daily.head(25)[["date", "student_prints", "moving_avg_7", "moving_avg_30"]])
# Create a calendar dataframe for exam_period and holidays (per date)
calendar = df[['date', 'exam_period', 'holidays']].drop_duplicates()

# Merge calendar and total_copies into the student prints data
training_dataset = student_daily.merge(calendar, on='date', how='left')
training_dataset = training_dataset.merge(total_copies_df, on='date', how='left')

# Sort the final training dataset by date in ascending order
training_dataset = training_dataset.sort_values(by='date')

# Save the final training dataset to CSV
training_dataset.to_csv("training_dataset.csv", index=False)
print("Dataset saved successfully! ✅")

conn.close()
