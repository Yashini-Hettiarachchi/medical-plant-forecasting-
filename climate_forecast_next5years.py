import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet
import os

# Load the dataset
FILENAME = 'SriLanka_Weather_Dataset.csv'
df = pd.read_csv(FILENAME)

# Parse date column
if 'time' in df.columns:
    df['time'] = pd.to_datetime(df['time'])
else:
    raise ValueError("No 'time' column found in dataset.")

# Forecasting function

from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

def forecast_column(df, col, forecast_until='2030-12-31', freq='D', city='Colombo', test_years=2, metrics_dict=None):
    # Prepare data for Prophet
    data = df[['time', col]].rename(columns={'time': 'ds', col: 'y'})
    data = data.dropna()
    # Train-test split (last N years for test)
    split_date = data['ds'].max() - pd.DateOffset(years=test_years)
    train = data[data['ds'] < split_date]
    test = data[data['ds'] >= split_date]
    # Fit model on train
    model = Prophet(yearly_seasonality=True, daily_seasonality=False, n_changepoints=10)
    model.fit(train)
    # Forecast for test period
    future_test = model.make_future_dataframe(periods=len(test), freq=freq)
    forecast_test = model.predict(future_test)
    # Align forecast and test
    forecast_test = forecast_test.set_index('ds').loc[test['ds']]
    # Evaluation
    mae = mean_absolute_error(test['y'], forecast_test['yhat'])
    rmse = np.sqrt(mean_squared_error(test['y'], forecast_test['yhat']))
    print(f"{col} Test MAE: {mae:.3f}, RMSE: {rmse:.3f}")
    if metrics_dict is not None:
        metrics_dict[col] = {'MAE': mae, 'RMSE': rmse}
    # Plot test results
    plt.figure(figsize=(12, 6))
    plt.plot(train['ds'], train['y'], label='Train')
    plt.plot(test['ds'], test['y'], label='Test', color='orange')
    plt.plot(test['ds'], forecast_test['yhat'], label='Predicted (Test)', color='red')
    plt.xlabel('Date')
    plt.ylabel(col)
    plt.title(f'{col} Train/Test Split and Prediction ({city})')
    plt.legend()
    plt.tight_layout()
    plt.savefig(f'train_test_{col}.png')
    plt.close()
    # Save test forecast
    test_out = test.copy()
    test_out['yhat'] = forecast_test['yhat'].values
    test_out.to_csv(f'test_forecast_{col}.csv', index=False)
    # Retrain on all data for future forecast
    model_full = Prophet(yearly_seasonality=True, daily_seasonality=False, n_changepoints=10)
    model_full.fit(data)
    # Calculate number of days to forecast until 2030-12-31
    last_date = data['ds'].max()
    forecast_end = pd.to_datetime(forecast_until)
    periods = (forecast_end - last_date).days
    if periods <= 0:
        print(f"Warning: Dataset already extends beyond {forecast_until}. No future forecast needed.")
        return
    future = model_full.make_future_dataframe(periods=periods, freq=freq)
    forecast = model_full.predict(future)
    # Plot full forecast
    plt.figure(figsize=(12, 6))
    plt.plot(data['ds'], data['y'], label='Historical')
    plt.plot(forecast['ds'], forecast['yhat'], label='Forecast', color='red')
    plt.xlabel('Date')
    plt.ylabel(col)
    plt.title(f'{col} Forecast for {city} (to {forecast_until})')
    plt.legend()
    plt.tight_layout()
    plt.savefig(f'forecast_{col}_to_{forecast_until}.png')
    plt.close()
    # Save forecast
    forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_csv(f'forecast_{col}_to_{forecast_until}.csv', index=False)
    print(f"Forecast for {col} saved as forecast_{col}_to_{forecast_until}.csv and forecast_{col}_to_{forecast_until}.png")
    print(f"Train/test plot saved as train_test_{col}.png, test forecast as test_forecast_{col}.csv")



# Forecast temperature and precipitation up to 2030-12-31 and collect accuracy metrics
metrics = {}
forecast_column(df, 'temperature_2m_mean', forecast_until='2030-12-31', city=df['city'][0] if 'city' in df.columns else 'Sri Lanka', metrics_dict=metrics)
forecast_column(df, 'precipitation_sum', forecast_until='2030-12-31', city=df['city'][0] if 'city' in df.columns else 'Sri Lanka', metrics_dict=metrics)

# Print and save accuracy metrics
print("\nModel Accuracy (Test Set):")
with open('forecast_accuracy_metrics.txt', 'w') as f:
    for col, vals in metrics.items():
        line = f"{col}: MAE = {vals['MAE']:.3f}, RMSE = {vals['RMSE']:.3f}"
        print(line)
        f.write(line + '\n')
print("\nAccuracy metrics saved to forecast_accuracy_metrics.txt")

print("Done. Forecasts and plots saved in the current directory.")
