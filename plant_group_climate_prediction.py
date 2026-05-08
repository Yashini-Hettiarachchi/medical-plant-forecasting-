import pandas as pd

# Load files
df_plants = pd.read_csv('cleaned_sinhala_plants.csv')
df_climate = pd.read_csv('forecast_precipitation_sum.csv')

# 1. Setup Climate Data for 2026-2030
df_climate['ds'] = pd.to_datetime(df_climate['ds'])
df_climate['year'] = df_climate['ds'].dt.year
future_precip = df_climate[df_climate['year'].between(2026, 2030)].groupby('year')['yhat'].mean()

# 2. Extract and Count unique habitats
# We flatten all 'Habitat/Region' columns and count occurrences of each unique type
hab_cols = [c for c in df_plants.columns if 'Habitat' in c]
all_habitats = pd.unique(df_plants[hab_cols].values.ravel())
unique_habitats = [h for h in all_habitats if pd.notna(h) and str(h).strip()]

habitat_counts = {h: (df_plants[hab_cols] == h).any(axis=1).sum() for h in unique_habitats}

# 3. Predict Suitability
def predict_suitability(habitat, precip):
    h = str(habitat).lower()
    if 'dry' in h: return 'Suitable' if precip < 2.5 else 'Unsuitable'
    if 'wet' in h: return 'Suitable' if precip > 4.0 else 'Unsuitable'
    if 'intermediate' in h: return 'Suitable' if 2.5 <= precip <= 4.0 else 'Unsuitable'
    return 'Likely Suitable' if 'coastal' in h else 'Stable'

# 4. Generate Final List
results = []
for year, avg_precip in future_precip.items():
    for hab, count in habitat_counts.items():
        results.append({
            'Year': year,
            'Habitat_Region': hab,
            'Avg_Daily_Precip': round(avg_precip, 2),
            'Status': predict_suitability(hab, avg_precip),
            'Plant_Species_Count': count
        })

# 5. Save and Display
df_final = pd.DataFrame(results)
df_final.to_csv('plant_suitability_2026_2030.csv', index=False)

print("--- Prediction Summary (2026-2030) ---")
print(df_final.head(10)) 
print("\nFull results saved to: plant_suitability_2026_2030.csv")