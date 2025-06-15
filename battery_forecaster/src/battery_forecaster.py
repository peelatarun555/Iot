import psycopg
import pandas as pd
import numpy as np
import sys
import os
import logging
import scipy.optimize as optimize


host = os.getenv("POSTGRES_HOST")
username = os.getenv("POSTGRES_USER")
password = os.getenv("POSTGRES_PASSWORD")
dbname = os.getenv("POSTGRES_DB")
logLevel = os.getenv("LOG_LEVEL", "info")

port=5432
sensors_table_name = "sensors"
datapoints_table_name = "datapoints"
sensor_type_table_name = "sensor_types"
sensor_type = "battery"
forecast_type = f"{sensor_type}_forecast"

CONNECTION = f"postgres://{username}:{password}@{host}:{port}/{dbname}"

logging.basicConfig(level=logLevel.upper()) # CRITICAL, ERROR, WARNING, INFO, DEBUG

def get_relevant_forecast_data(sensor_id):
    try:
        with psycopg.connect(CONNECTION) as conn:
            with conn.cursor() as cursor:
                data_query = f"SELECT timestamp, sensor_id, value FROM datapoints WHERE timestamp BETWEEN (NOW() - INTERVAL '4 weeks') AND NOW() AND sensor_id = {sensor_id} ORDER BY timestamp ASC;"
                cursor.execute(data_query)
                result = cursor.fetchall()
                col_names = [desc[0] for desc in cursor.description]
                df = pd.DataFrame(result, columns=col_names)
        if len(df) == 0:
            return None
        df['timestamp'] = df['timestamp'].dt.tz_convert(None)
        df = df.sort_values(by='timestamp').reset_index(drop=True)
        df['time_diff'] = df['timestamp'].diff().dt.total_seconds() / 3600  # time difference in hours
        df['value_diff'] = df['value'].diff().abs()
        df['gap_or_spike'] = (df['time_diff'] > 1) | (df['value_diff'] > 0.2)
        if df['gap_or_spike'].any():
            last_valid_index = df[df['gap_or_spike']].index[-1] + 1
            df_cleaned = df.iloc[last_valid_index:].copy()
        else:
            df_cleaned = df.copy()
        df_cleaned = df_cleaned.drop(columns=['time_diff', 'value_diff', 'gap_or_spike'])
        df_cleaned = df_cleaned[df_cleaned['value'] < 4.3]
        if len(df_cleaned) < 864:
            logging.info(f"Only {len(df_cleaned)} relevant values retrieved for sensor_id {sensor_id}. Not enough data to forecast.")
            return None
        else:
            return df_cleaned
    except Exception as e:
        logging.error(f"Retrieving forecast data not possible for sensor_id {sensor_id}:\n {e}")
        return None
        
        
def write_forecast_to_database( sensor_id, value):
    try:
        with psycopg.connect(CONNECTION) as conn:
            with conn.cursor() as cursor:
                insert_query = f"INSERT INTO datapoints (timestamp, sensor_id, value) VALUES (NOW(), {sensor_id}, {value});"
                cursor.execute(insert_query)
        return None
    except Exception as e:
        logging.error(f"Unable to write forecast for sensor {sensor_id}:\n {e}")
        return None 
              
	
def get_sensor_type_id(sensor_type: str):
    with psycopg.connect(CONNECTION) as conn:
        with conn.cursor() as cursor:
            sql_type_number = f"SELECT id FROM {sensor_type_table_name} WHERE name='{sensor_type}';"
            cursor.execute(sql_type_number)
            result = cursor.fetchall()
            [desc[0] for desc in cursor.description]
            if result == []:
                logging.error(f"Could not retrieve sensor_type_id for type '{sensor_type}'. You may need to add it first to the sensor_type_id table.")
                return None
            sensor_type_id = result[0][0]
            return sensor_type_id
            

def add_sensor_for_device(name:str, device_id:int):
    sensor_type_id = get_sensor_type_id(name)
    try:
        with psycopg.connect(CONNECTION) as conn:
            with conn.cursor() as cursor:
                insert_query = f"INSERT INTO sensors (name, sensor_type_id, device_id) VALUES ('{name}', '{sensor_type_id}', '{device_id}') RETURNING *;"
                cursor.execute(insert_query)
                new_row = cursor.fetchone() 
            return new_row[0]  # return new sensor_id

    except Exception as e:
        logging.error(f"Unable to add forecast sensor for device {device_id}:\n {e}")
        return None
   
        
def add_forecast_for_sensor(sensor_id:int, forecast_sensor_id:int):
    model_fit = np.poly1d(np.load('./models/Combined_Polyfit_9.npy'))

    df = get_relevant_forecast_data(sensor_id)
    if df is None:
        return
    logging.info(f"Calculating forecast for sensor_id {sensor_id} with forecast_sensor_id {forecast_sensor_id}.")
    values_list = []
    count_list = []

    current_count = 0

    for i in range(len(df) - 1):
        values_list.append(df.iloc[i]['value'])
        time_diff = (df.iloc[i + 1]['timestamp'] - df.iloc[i]['timestamp']).total_seconds() / 60.0
        if time_diff > 5:
            additional_intervals = int(time_diff // 5) - 1
            current_count += additional_intervals
        count_list.append(current_count)
        current_count += 1

    values_list.append(df.iloc[-1]['value'])
    count_list.append(current_count)
    data = np.array(values_list).astype('float64')
    index = np.array(count_list)
    
    def least_squares_fitting(var):
        dividing_factor = var[0]
        offset = var[-1]
        x_init = np.array(index, dtype='float64')
        x_fitted = ((x_init/max(index))*dividing_factor)+offset
        model_data = model_fit(x_fitted)
        return np.sqrt(np.sum(np.square(model_data - data)))

    initial_guess = [1.0,0.0] # no stretch or offset

    result = optimize.minimize(least_squares_fitting, initial_guess, method="Nelder-Mead", options={'disp':False, 'fatol':1e-04})
    if result.success:
        remaining = (data.shape[0]/result.x[0])*(1-result.x[0]-result.x[1])
        remaining_days = remaining/288.0
        logging.info(f"Forecast for sensor_id {sensor_id} with forecast_sensor_id {forecast_sensor_id} is {remaining_days} days.")
        write_forecast_to_database(forecast_sensor_id, remaining_days)
    else:
        logging.warning(f"Could not fit model to data for sensor_id {sensor_id} with forecast_sensor_id {forecast_sensor_id}. No forecast is written to database.")
    
       

with psycopg.connect(CONNECTION) as conn:
    with conn.cursor() as cursor:
        sql_fcst = f"SELECT * FROM {sensors_table_name};"
        sql_type_number = f"SELECT * FROM {sensors_table_name};"
        cursor.execute(sql_fcst)
        result = cursor.fetchall()
        col_names = [desc[0] for desc in cursor.description]
        sensor_df = pd.DataFrame(result, columns=col_names)
        battery_sensor_df  = sensor_df[sensor_df['name'] == sensor_type]
        forecast_sensor_df = sensor_df[sensor_df['name'] == forecast_type]
        
try: 
    battery_df = battery_sensor_df[["id","device_id"]]
    forecast_df = forecast_sensor_df[["id","device_id"]]
except Exception as e:
    logging.error(f"Could not retrieve battery sensor and forecast sensor IDs. Aborting forecasts:\n {e}")
    sys.exit(1)
  
merged_df = pd.merge(battery_df, forecast_df, on="device_id", how='left')

for _, row in merged_df.iterrows():
    forecast_sensor_id = row['id_y']
    if pd.isna(forecast_sensor_id):
        forecast_sensor_id = add_sensor_for_device(forecast_type, int(row['device_id']))
        if forecast_sensor_id is None:
            continue
    add_forecast_for_sensor(sensor_id=int(row['id_x']), forecast_sensor_id=int(forecast_sensor_id))
