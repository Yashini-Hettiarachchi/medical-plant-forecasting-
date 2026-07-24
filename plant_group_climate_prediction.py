"""
=============================================================================
PLANT SUITABILITY PREDICTION SCRIPT
=============================================================================

What this script does:
This script combines plant data with weather forecasts to predict whether
each medicinal plant will be suitable to grow in each habitat during
2026-2030.

Think of it like a matchmaker:
- Plants need certain rainfall to thrive (some like dry, some like wet)
- We know what rainfall is forecasted for each habitat
- This script matches plants to habitats where they'll do well

Why this matters:
- Farmers know which plants to grow
- Researchers understand climate risks
- The dashboard shows users what to expect

To run this script: python plant_group_climate_prediction.py
"""

import pandas as pd  # pandas = data processing library

# =============================================================================
# STEP 1: LOAD THE DATA FILES
# =============================================================================

# Load the cleaned plant catalog (with scientific names, Sinhala names, habitats)
df_plants = pd.read_csv('cleaned_sinhala_plants.csv')

# Load the temperature/rainfall forecast for 2026-2030 (created by the weather script)
df_climate = pd.read_csv('forecast_temperature_2m_mean.csv')

# =============================================================================
# STEP 2: EXTRACT WEATHER DATA FOR 2026-2030
# =============================================================================

# Convert the date column to proper date format
df_climate['ds'] = pd.to_datetime(df_climate['ds'])

# Extract the year from each date
# (We need to group data by year to get average rainfall per year)
df_climate['year'] = df_climate['ds'].dt.year

# Calculate average daily rainfall for each year (2026-2030)
# between(2026, 2030) = keep only rows for years 2026 through 2030
# groupby('year') = group all rows by year
# ['yhat'].mean() = calculate average of the forecast value for each year
future_precip = df_climate[df_climate['year'].between(2026, 2030)].groupby('year')['yhat'].mean()

# Example of what future_precip looks like:
# 2026: 4.5  (average rainfall)
# 2027: 4.3
# etc.

# =============================================================================
# STEP 3: EXTRACT ALL UNIQUE HABITATS
# =============================================================================

# In the plant data, there are columns like:
# Habitat/Region_1, Habitat/Region_2, Habitat/Region_3
# This line finds all column names that contain the word "Habitat"
hab_cols = [c for c in df_plants.columns if 'Habitat' in c]

# Get all unique habitat values from those columns
# .values.ravel() = flatten all the data into one list
# pd.unique() = get only the unique values (no duplicates)
all_habitats = pd.unique(df_plants[hab_cols].values.ravel())

# Clean up: remove empty/null values and whitespace
unique_habitats = [h for h in all_habitats if pd.notna(h) and str(h).strip()]

# =============================================================================
# STEP 4: COUNT HOW MANY PLANTS ARE IN EACH HABITAT
# =============================================================================

# For each habitat, count how many plant species grow there
# This uses a dictionary (a list of key-value pairs)
habitat_counts = {
    h: (df_plants[hab_cols] == h).any(axis=1).sum() 
    for h in unique_habitats
}

# Example of what habitat_counts looks like:
# {'Wet Zone': 45, 'Dry Zone': 38, 'Coastal': 22, ...}

# =============================================================================
# STEP 5: DEFINE SUITABILITY RULES
# =============================================================================

def predict_suitability(habitat, precip):
    """
    This function decides if a habitat is suitable for growing plants
    based on the type of habitat and the rainfall forecast.
    
    Rules:
    - Dry Zone plants: Need less than 2.5 mm rainfall per day
    - Wet Zone plants: Need more than 4.0 mm rainfall per day
    - Intermediate Zone plants: Need between 2.5 and 4.0 mm rainfall
    - Coastal zones: Usually suitable
    - Everything else: Stable (not too risky)
    
    Arguments:
    - habitat: name of the habitat region (e.g., "Wet Zone")
    - precip: average daily precipitation (rainfall) in mm
    
    Returns:
    - A status: "Suitable", "Unsuitable", "Likely Suitable", or "Stable"
    """
    
    # Convert habitat name to lowercase for easier comparison
    h = str(habitat).lower()
    
    # Check each habitat type and apply its rule
    if 'dry' in h:
        # Dry Zone plants need low rainfall
        # If forecast is < 2.5 mm per day, conditions are Suitable
        return 'Suitable' if precip < 2.5 else 'Unsuitable'
    
    if 'wet' in h:
        # Wet Zone plants need high rainfall
        # If forecast is > 4.0 mm per day, conditions are Suitable
        return 'Suitable' if precip > 4.0 else 'Unsuitable'
    
    if 'intermediate' in h:
        # Intermediate Zone plants need medium rainfall
        # If forecast is between 2.5-4.0 mm, conditions are Suitable
        return 'Suitable' if 2.5 <= precip <= 4.0 else 'Unsuitable'
    
    # Special cases
    if 'coastal' in h:
        # Coastal areas are usually good for plants
        return 'Likely Suitable'
    
    # Default for anything else
    return 'Stable'

# =============================================================================
# STEP 6: CREATE THE FINAL PREDICTION TABLE
# =============================================================================

# Create a list to store all predictions
results = []

# For each year in the forecast (2026-2030)
for year, avg_precip in future_precip.items():
    # For each habitat in our data
    for hab, count in habitat_counts.items():
        # Create one prediction row
        results.append({
            'Year': year,                                           # Which year?
            'Habitat_Region': hab,                                  # Which habitat?
            'Avg_Daily_Precip': round(avg_precip, 2),              # How much rain? (rounded to 2 decimals)
            'Status': predict_suitability(hab, avg_precip),        # Is it suitable? (based on rainfall)
            'Plant_Species_Count': count                           # How many plant species here?
        })

# Convert the list of dictionaries into a nicely organized table
df_final = pd.DataFrame(results)

# =============================================================================
# STEP 7: SAVE AND DISPLAY RESULTS
# =============================================================================

# Save the final predictions to a CSV file for the dashboard to display
df_final.to_csv('plant_suitability_2026_2030.csv', index=False)

# Show a preview of the first 10 rows
print("--- Prediction Summary (2026-2030) ---")
print(df_final.head(10))

# Tell the user where the full results are
print("\nFull results saved to: plant_suitability_2026_2030.csv")