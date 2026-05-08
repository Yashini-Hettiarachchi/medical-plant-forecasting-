# Medical Plant Climate Forecasting

## Research Problem

Climate change is expected to significantly impact the distribution and suitability of medicinal plants in Sri Lanka. This project aims to forecast future climate conditions and predict the suitability of different habitats for medicinal plants up to the year 2030, supporting conservation and sustainable use.

## Methodology

1. **Data Collection & Preprocessing**
   - Plant data was collected and cleaned using `clean_preprocess_dataset.py`, which splits habitat/region information into distinct columns for analysis.
   - Historical weather data for Colombo, Sri Lanka, was used as the climate dataset.

2. **Climate Forecasting**
   - The `climate_forecast_next5years.py` script uses the Prophet time series model (with reduced complexity, n_changepoints=10) to forecast daily mean temperature and precipitation up to 2030.
   - Model accuracy is evaluated using MAE and RMSE on a test set (last 2 years of historical data).

3. **Plant Grouping and Suitability Prediction**
   - Plants are grouped by distinct habitat/region types (e.g., Dry, Wet, Intermediate, Coastal).
   - The `plant_group_climate_prediction.py` script uses simple rule-based logic to predict the suitability of each habitat group for each year up to 2030, based on forecasted precipitation.
   - Output is saved as `plant_group_climate_prediction_2030.csv`.

## Final Output

- **Forecasted climate data** (temperature and precipitation) up to 2030.
- **Group-wise suitability predictions** for medicinal plants, by habitat/region and year, in `plant_group_climate_prediction_2030.csv`.
- **Model accuracy metrics** for climate forecasting (see `forecast_accuracy_metrics.txt`).

## Future Scope

- Integrate more advanced machine learning models to predict plant suitability based on multiple climate variables (temperature, humidity, etc.).
- Incorporate spatial data for region-specific predictions across Sri Lanka.
- Use ecological niche modeling for more robust plant distribution forecasts.
- Expand to include more plant species and additional environmental factors.
- Develop a web dashboard for interactive exploration of predictions.

---

**Authors:** Yashini Hettiarachchi et al.

**Repository:** https://github.com/Yashini-Hettiarachchi/medical-plant-forecasting-
