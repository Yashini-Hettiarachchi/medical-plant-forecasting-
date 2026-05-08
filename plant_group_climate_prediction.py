import pandas as pd
import numpy as np

# Load cleaned plant data
df_plants = pd.read_csv('cleaned_sinhala_plants.csv')

# Load climate forecast (up to 2030)
df_climate = pd.read_csv('forecast_precipitation_sum_to_2030-12-31.csv')
df_climate['year'] = pd.to_datetime(df_climate['ds']).dt.year

# Define habitat/region types to group by
habitat_cols = [col for col in df_plants.columns if col.startswith('Habitat/Region')]

# Get all unique habitat/region types
habitat_types = set()
for col in habitat_cols:
    habitat_types.update(df_plants[col].dropna().str.strip().unique())
habitat_types = {h for h in habitat_types if isinstance(h, str) and h != ''}

# Group plants by habitat/region type
plant_groups = {habitat: df_plants[
    df_plants[habitat_cols].apply(lambda row: habitat in row.values, axis=1)
]['Scientific Name'].tolist() for habitat in habitat_types}

# Define simple rules for suitability based on precipitation (mm/day)
def get_suitability(habitat, precip):
    if habitat.lower().startswith('dry'):
        return 'Suitable' if precip < 2 else 'Unsuitable'
    elif habitat.lower().startswith('wet'):
        return 'Suitable' if precip > 4 else 'Unsuitable'
    elif habitat.lower().startswith('intermediate'):
        return 'Suitable' if 2 <= precip <= 4 else 'Unsuitable'
    elif habitat.lower().startswith('coastal'):
        return 'Likely Suitable'  # Not directly linked to precipitation
    else:
        return 'Unknown'

# For each year, get mean precipitation and predict suitability for each group
results = []
years = sorted(df_climate['year'].unique())
for year in years:
    precip = df_climate[df_climate['year'] == year]['yhat'].mean()
    for habitat in sorted(habitat_types):
        suitability = get_suitability(habitat, precip)
        results.append({'Year': year, 'Habitat/Region': habitat, 'Mean_Precipitation': precip, 'Suitability': suitability, 'Plant_Count': len(plant_groups[habitat])})

# Save results
df_results = pd.DataFrame(results)
df_results.to_csv('plant_group_climate_prediction_2030.csv', index=False)
print('Prediction saved to plant_group_climate_prediction_2030.csv')
