# Medical Plant Climate Forecasting

## Research Problem

Climate change is expected to significantly impact the distribution and suitability of medicinal plants in Sri Lanka. This project aims to forecast future climate conditions and predict the suitability of different habitats for medicinal plants up to the year 2030, supporting conservation and sustainable use.


## Models Used

- **Prophet** (by Meta/Facebook): For time series forecasting of temperature and precipitation.
- **Rule-based Classifier**: For predicting plant group suitability based on precipitation thresholds and habitat/region types.

## Methodology

1. **Data Collection & Preprocessing**
   - Plant data was collected and cleaned using `clean_preprocess_dataset.py`, which splits habitat/region information into distinct columns for analysis.
   - Historical weather data for Colombo, Sri Lanka, was used as the climate dataset.


2. **Climate Forecasting**
   - The `climate_forecast_next5years.py` script uses the **Prophet** time series model (by Meta/Facebook, with reduced complexity, n_changepoints=10) to forecast daily mean temperature and precipitation up to 2030.
   - Model accuracy is evaluated using MAE and RMSE on a test set (last 2 years of historical data).


3. **Plant Grouping and Suitability Prediction**
   - Plants are grouped by distinct habitat/region types (e.g., Dry, Wet, Intermediate, Coastal).
   - The `plant_group_climate_prediction.py` script uses a **rule-based classifier** (custom logic based on precipitation thresholds) to predict the suitability of each habitat group for each year up to 2030, based on forecasted precipitation.
   - Output is saved as `plant_group_climate_prediction_2026_2030.csv` (for years 2026–2030 only) and previously as `plant_group_climate_prediction_2030.csv` (for all years).



## Final Output

- **Forecasted climate data**
   - `forecast_temperature_2m_mean_to_2030-12-31.csv` and `forecast_precipitation_sum_to_2030-12-31.csv`: Daily forecasts up to 2030 for temperature and precipitation.
- **Group-wise suitability predictions**
   - `plant_group_climate_prediction_2026_2030.csv`: Suitability of each habitat/region group for years 2026–2030.
   - `plant_group_climate_prediction_2030.csv`: Suitability for all years (if needed for reference).
- **Model accuracy metrics**
   - `forecast_accuracy_metrics.txt`: Only the accuracy percentage for each variable (e.g., "temperature_2m_mean Accuracy = 95.20%").

## Requirements

- Python 3.8+
- Packages: prophet, matplotlib, pandas, numpy, scikit-learn

Install requirements with:
```bash
pip install prophet matplotlib pandas numpy scikit-learn
```

## Usage

1. Preprocess the plant dataset:
    ```bash
    python clean_preprocess_dataset.py
    ```
2. Forecast climate up to 2030:
    ```bash
    python climate_forecast_next5years.py
    ```
3. Predict plant group suitability for 2026–2030:
    ```bash
    python plant_group_climate_prediction.py
    ```

All outputs will be saved in the working directory.

## Future Scope

- Develop a web dashboard for interactive exploration of predictions.

---

**Authors:** Yashini Hettiarachchi et al.

**Repository:** https://github.com/Yashini-Hettiarachchi/medical-plant-forecasting-
