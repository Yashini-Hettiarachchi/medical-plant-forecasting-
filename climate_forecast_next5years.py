import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error

# 1. Configuration & Loading
FILENAME = 'SriLanka_Weather_Dataset.csv'
TARGET_DATE = '2030-12-31'
df = pd.read_csv(FILENAME)
df['time'] = pd.to_datetime(df['time'])

def run_forecast(df, col, city="Sri Lanka"):
    if col == 'temperature_2m_mean':
        print(f"\n--- Processing: {col} ---")
    
    # Prepare data for Prophet
    data = df[['time', col]].rename(columns={'time': 'ds', col: 'y'}).dropna()
    

    # Train-Test Split (Last 2 years for validation)
    split_date = data['ds'].max() - pd.DateOffset(years=2)
    train = data[data['ds'] < split_date]
    test = data[data['ds'] >= split_date]

    # Initialize and Fit Model
    model = Prophet(yearly_seasonality=True, daily_seasonality=False, n_changepoints=10)
    model.fit(train)

    # --- Train Accuracy ---
    forecast_train = model.predict(train[['ds']])
    train_results = pd.merge(train, forecast_train[['ds', 'yhat']], on='ds')
    train_mae = mean_absolute_error(train_results['y'], train_results['yhat'])
    train_rmse = np.sqrt(mean_squared_error(train_results['y'], train_results['yhat']))
    train_mape = np.mean(np.abs((train_results['y'] - train_results['yhat']) / train_results['y'].replace(0, np.nan))) * 100
    train_accuracy = 100 - train_mape

    # --- Test Accuracy ---
    # Generate dates for the test period
    future_test = model.make_future_dataframe(periods=len(test), freq='D')
    forecast_test = model.predict(future_test)
    # Merge to align actuals and predictions on the same date
    results = pd.merge(test, forecast_test[['ds', 'yhat']], on='ds')
    mae = mean_absolute_error(results['y'], results['yhat'])
    rmse = np.sqrt(mean_squared_error(results['y'], results['yhat']))
    mape = np.mean(np.abs((results['y'] - results['yhat']) / results['y'].replace(0, np.nan))) * 100
    accuracy = 100 - mape

    if col == 'temperature_2m_mean':
        print(f"Train Accuracy: {train_accuracy:.2f}% | Train MAE: {train_mae:.3f} | Train RMSE: {train_rmse:.3f}")
        print(f"Test Accuracy: {accuracy:.2f}% | Test MAE: {mae:.3f} | Test RMSE: {rmse:.3f}")

    # 3. Future Forecasting (Re-train on all data)
    full_model = Prophet(yearly_seasonality=True, daily_seasonality=False, n_changepoints=10)
    full_model.fit(data)
    
    days_to_forecast = (pd.to_datetime(TARGET_DATE) - data['ds'].max()).days
    if days_to_forecast > 0:
        future_dates = full_model.make_future_dataframe(periods=days_to_forecast, freq='D')
        forecast = full_model.predict(future_dates)
        
        # Save results
        forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_csv(f'forecast_{col}.csv', index=False)
        
        # Plotting
        plt.figure(figsize=(12, 6))
        plt.plot(data['ds'], data['y'], label='Historical', alpha=0.6)
        plt.plot(forecast['ds'], forecast['yhat'], label='Forecast', color='red')
        plt.title(f'{city}: {col} Forecast to 2030')
        plt.legend()
        plt.savefig(f'plot_{col}.png')
        plt.close()
        if col == 'temperature_2m_mean':
            print(f"Forecast saved: forecast_{col}.csv and plot_{col}.png")
    
    return {
        "Train Accuracy": train_accuracy,
        "Train MAE": train_mae,
        "Train RMSE": train_rmse,
        "Test Accuracy": accuracy,
        "Test MAE": mae,
        "Test RMSE": rmse
    }

# 4. Execute for each column
target_cols = ['temperature_2m_mean', 'precipitation_sum']
city_name = df['city'].iloc[0] if 'city' in df.columns else 'Sri Lanka'
final_metrics = {}

for col in target_cols:
    if col in df.columns:
        final_metrics[col] = run_forecast(df, col, city=city_name)

# 5. Export Metrics

# Save both train and test accuracy for each variable
with open('forecast_accuracy_metrics.txt', 'w') as f:
    for col, m in final_metrics.items():
        f.write(f"{col} Train Accuracy: {m['Train Accuracy']:.2f}%\n")
        f.write(f"{col} Test Accuracy: {m['Test Accuracy']:.2f}%\n")

print("\nAll tasks completed.")