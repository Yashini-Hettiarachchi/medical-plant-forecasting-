"""
=============================================================================
CLIMATE FORECASTING SCRIPT - Predict Sri Lanka Weather for 2026-2030
=============================================================================

What this script does:
This script uses historical weather data to predict future weather conditions
(temperature and rainfall) for the next 5 years (2026-2030).

This is important for the medicinal plant dashboard because plants grow better
in certain climate conditions. By knowing future weather, we can predict which
plants will thrive in which areas.

How it works:
1. Loads historical weather data from Sri Lanka
2. Uses an AI model called "Prophet" to learn weather patterns
3. Tests how accurate the predictions are
4. Creates forecasts through 2030
5. Saves the predictions so the dashboard can display them

To run this script: python climate_forecast_next5years.py
"""

import pandas as pd              # pandas = data processing
import numpy as np              # numpy = math and numbers
import matplotlib.pyplot as plt # matplotlib = create charts and graphs
from prophet import Prophet     # Prophet = AI forecasting tool from Facebook
from sklearn.metrics import mean_absolute_error, mean_squared_error  # How accurate are predictions?

# =============================================================================
# STEP 1: LOAD THE HISTORICAL DATA
# =============================================================================

# Filename of the weather data file we're reading
FILENAME = 'SriLanka_Weather_Dataset.csv'

# How far into the future do we want to forecast?
TARGET_DATE = '2030-12-31'  # Forecast all the way to end of 2030

# Load the CSV file into a dataframe (think: spreadsheet in Python)
df = pd.read_csv(FILENAME)

# Convert the 'time' column to proper date format
# (Sometimes dates are stored as text, we need them as actual dates)
df['time'] = pd.to_datetime(df['time'])

# =============================================================================
# STEP 2: FORECASTING FUNCTION
# =============================================================================

def run_forecast(df, col, city="Sri Lanka"):
    """
    This function does all the forecasting work for ONE weather measurement
    (either temperature or rainfall).
    
    What it does:
    1. Trains the AI model on historical data
    2. Tests how accurate the model is
    3. Creates a forecast for the future
    4. Saves the results to files
    5. Creates a chart
    
    Arguments:
    - df: the weather dataframe
    - col: which column to forecast (e.g., 'temperature_2m_mean' or 'precipitation_sum')
    - city: the location name (for display)
    """
    
    # Show progress (only for temperature, to avoid cluttering output)
    if col == 'temperature_2m_mean':
        print(f"\n--- Processing: {col} ---")
    
    # =========================================================================
    # Prepare Data
    # =========================================================================
    
    # Extract just the date and the column we care about
    # 'ds' = date (Prophet expects this name)
    # 'y' = value to forecast (Prophet expects this name)
    # dropna() = remove any rows with missing data
    data = df[['time', col]].rename(columns={'time': 'ds', col: 'y'}).dropna()
    
    # =========================================================================
    # Split Data: Training (learn) vs Testing (validate)
    # =========================================================================
    
    # The AI model needs to "learn" from old data, then we test it on new data
    # We use the last 2 years of data for testing
    # (Everything before that year is training data)
    
    split_date = data['ds'].max() - pd.DateOffset(years=2)  # Go back 2 years
    train = data[data['ds'] < split_date]  # Data before split date = training
    test = data[data['ds'] >= split_date]  # Data after split date = testing

    # =========================================================================
    # Train the Model
    # =========================================================================
    
    # Create the Prophet model with settings:
    # - yearly_seasonality: Yes, weather has yearly patterns (hot in summer, cold in winter)
    # - daily_seasonality: No, we're doing daily-to-yearly data, not hourly
    # - n_changepoints: 10 = allow the model to adapt to 10 major changes in the data
    model = Prophet(yearly_seasonality=True, daily_seasonality=False, n_changepoints=10)
    
    # Train the model on historical data
    # The model learns the patterns so it can make future predictions
    model.fit(train)

    # =========================================================================
    # Evaluate Training Accuracy
    # =========================================================================
    
    # Make predictions on the training data to see how well the model learns
    forecast_train = model.predict(train[['ds']])
    
    # Combine actual values with predictions to compare them
    train_results = pd.merge(train, forecast_train[['ds', 'yhat']], on='ds')
    
    # Calculate how far off predictions are from actual values
    # MAE = Mean Absolute Error (average difference between prediction and actual)
    train_mae = mean_absolute_error(train_results['y'], train_results['yhat'])
    
    # RMSE = Root Mean Squared Error (another way to measure error)
    train_rmse = np.sqrt(mean_squared_error(train_results['y'], train_results['yhat']))
    
    # MAPE = Mean Absolute Percentage Error (percentage difference)
    train_mape = np.mean(np.abs((train_results['y'] - train_results['yhat']) / train_results['y'].replace(0, np.nan))) * 100
    
    # Accuracy = 100% minus the error percentage
    train_accuracy = 100 - train_mape

    # =========================================================================
    # Evaluate Test Accuracy (on data the model hasn't seen)
    # =========================================================================
    
    # Create placeholder dates for the test period
    future_test = model.make_future_dataframe(periods=len(test), freq='D')
    
    # Predict for those dates
    forecast_test = model.predict(future_test)
    
    # Compare predictions with actual test data
    results = pd.merge(test, forecast_test[['ds', 'yhat']], on='ds')
    
    # Calculate test accuracy (same metrics as training)
    mae = mean_absolute_error(results['y'], results['yhat'])
    rmse = np.sqrt(mean_squared_error(results['y'], results['yhat']))
    mape = np.mean(np.abs((results['y'] - results['yhat']) / results['y'].replace(0, np.nan))) * 100
    accuracy = 100 - mape

    # Print results to screen (again, only for temperature)
    if col == 'temperature_2m_mean':
        print(f"Train Accuracy: {train_accuracy:.2f}% | Train MAE: {train_mae:.3f} | Train RMSE: {train_rmse:.3f}")
        print(f"Test Accuracy: {accuracy:.2f}% | Test MAE: {mae:.3f} | Test RMSE: {rmse:.3f}")

    # =========================================================================
    # Make Future Forecast
    # =========================================================================
    
    # Now retrain on ALL historical data (not just training set)
    # to make the best possible future forecast
    full_model = Prophet(yearly_seasonality=True, daily_seasonality=False, n_changepoints=10)
    full_model.fit(data)
    
    # How many days from now until our target date?
    days_to_forecast = (pd.to_datetime(TARGET_DATE) - data['ds'].max()).days
    
    # Only forecast if there are days remaining to forecast
    if days_to_forecast > 0:
        # Create dates for all future days
        future_dates = full_model.make_future_dataframe(periods=days_to_forecast, freq='D')
        
        # Make predictions for those dates
        forecast = full_model.predict(future_dates)
        
        # =====================================================================
        # Save Forecast Results
        # =====================================================================
        
        # Save the forecast to a CSV file for the dashboard to use
        # yhat = the predicted value
        # yhat_lower/yhat_upper = confidence range (prediction might be off by this much)
        forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_csv(f'forecast_{col}.csv', index=False)
        
        # =====================================================================
        # Create a Chart
        # =====================================================================
        
        # Create a visual chart showing past data and future forecast
        plt.figure(figsize=(12, 6))  # Create a new chart (12 inches wide, 6 high)
        plt.plot(data['ds'], data['y'], label='Historical', alpha=0.6)  # Plot past data
        plt.plot(forecast['ds'], forecast['yhat'], label='Forecast', color='red')  # Plot predictions
        plt.title(f'{city}: {col} Forecast to 2030')  # Title of the chart
        plt.legend()  # Show the legend
        plt.savefig(f'plot_{col}.png')  # Save chart to image file
        plt.close()  # Close the chart
        
        if col == 'temperature_2m_mean':
            print(f"Forecast saved: forecast_{col}.csv and plot_{col}.png")
    
    # Return all the accuracy metrics so we can save them later
    return {
        "Train Accuracy": train_accuracy,
        "Train MAE": train_mae,
        "Train RMSE": train_rmse,
        "Test Accuracy": accuracy,
        "Test MAE": mae,
        "Test RMSE": rmse
    }

# =============================================================================
# STEP 3: RUN THE FORECAST FOR EACH WEATHER MEASUREMENT
# =============================================================================

# Which weather measurements do we want to forecast?
# Temperature and Rainfall are what matters for plants
target_cols = ['temperature_2m_mean', 'precipitation_sum']

# Get the city name from the data (or use default)
city_name = df['city'].iloc[0] if 'city' in df.columns else 'Sri Lanka'

# Storage for all the accuracy metrics
final_metrics = {}

# Run the forecast for each weather measurement
for col in target_cols:
    if col in df.columns:  # Only if the column exists in our data
        final_metrics[col] = run_forecast(df, col, city=city_name)

# =============================================================================
# STEP 4: SAVE ACCURACY METRICS
# =============================================================================

# Export both training and testing accuracy for all weather measurements
# This gets displayed in the dashboard so users can trust the predictions
with open('forecast_accuracy_metrics.txt', 'w') as f:
    for col, m in final_metrics.items():
        f.write(f"{col} Train Accuracy: {m['Train Accuracy']:.2f}%\n")
        f.write(f"{col} Test Accuracy: {m['Test Accuracy']:.2f}%\n")

# Done!
print("\nAll tasks completed.")