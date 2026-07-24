"""
=============================================================================
DATA CLEANING & PREPROCESSING SCRIPT
=============================================================================

What this script does:
This script takes the raw medicinal plant dataset and cleans it so it's
ready to use in the dashboard.

The main job is to:
1. Load the plant list (either CSV or Excel format)
2. Clean up any messy data (extra spaces, inconsistent formatting)
3. Reorganize the habitat information into separate columns
4. Save the cleaned data as a new CSV file

Think of it like washing vegetables before cooking:
- Raw input: messy, inconsistent data
- Process: clean and organize
- Output: tidy, standardized data ready for use

To run this script: python clean_preprocess_dataset.py
"""

import pandas as pd  # pandas = data processing library (think: Excel-like operations in Python)
import os           # os = operating system functions (for finding files)

# =============================================================================
# STEP 1: LOAD THE DATA
# =============================================================================

# The name of the file containing the raw plant data
# You can change this if your file has a different name
FILENAME = 'combined_sinhala_plants_final.csv'  # Try this filename first

# Where to save the cleaned output
OUTPUT_FILENAME = 'cleaned_sinhala_plants.csv'

# Smart loading: Try CSV format first, fall back to Excel if not found
if os.path.exists(FILENAME):
    # File exists as CSV, load it
    df = pd.read_csv(FILENAME)
elif os.path.exists(FILENAME.replace('.csv', '.xlsx')):
    # CSV doesn't exist, but Excel version does - use that instead
    FILENAME = FILENAME.replace('.csv', '.xlsx')
    df = pd.read_excel(FILENAME)
else:
    # Neither file found - stop and show an error message
    raise FileNotFoundError(f"Dataset file '{FILENAME}' or '{FILENAME.replace('.csv', '.xlsx')}' not found.")

# =============================================================================
# STEP 2: CLEAN COLUMN NAMES
# =============================================================================

# Remove any extra whitespace from column names
# Example: "Scientific Name " becomes "Scientific Name"
df.columns = df.columns.str.strip()

# =============================================================================
# STEP 3: REORGANIZE HABITAT DATA
# =============================================================================

# The original data has a column "Habitat/Region" that contains multiple values
# separated by semicolons, like: "Wet Zone; Dry Zone; Coastal Zone"
# We want to split this into separate columns:
#   Habitat/Region_1: "Wet Zone"
#   Habitat/Region_2: "Dry Zone"
#   Habitat/Region_3: "Coastal Zone"
#
# This makes it easier to analyze which plants grow in which habitats

if 'Habitat/Region' in df.columns:  # Check if this column exists
    # Split the habitat string by semicolon and expand into separate columns
    # This turns one column with "A;B;C" into three columns: "A", "B", "C"
    habitat_split = df['Habitat/Region'].str.split(';', expand=True)
    
    # Give the new columns proper names: Habitat/Region_1, Habitat/Region_2, etc.
    habitat_split.columns = [f'Habitat/Region_{i+1}' for i in range(habitat_split.shape[1])]
    
    # Replace the original column with the new split columns
    # We drop the original 'Habitat/Region' column and add the split versions
    df = pd.concat([df.drop('Habitat/Region', axis=1), habitat_split], axis=1)
else:
    # If the column doesn't exist, just print a warning and continue
    print("'Habitat/Region' column not found in dataset.")

# =============================================================================
# STEP 4: SAVE THE CLEANED DATA
# =============================================================================

# Tell the user what's happening
print(f"Saving cleaned dataset to {OUTPUT_FILENAME}")

# Save the cleaned dataframe as a CSV file (index=False means don't add row numbers)
df.to_csv(OUTPUT_FILENAME, index=False)

# Confirm it's done
print("Done.")

