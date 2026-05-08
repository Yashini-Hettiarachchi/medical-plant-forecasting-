import pandas as pd
import os

# Set the filename (update if your file is not named as below)
FILENAME = 'combined_sinhala_plants_final.csv'  # Change to .xlsx if Excel
OUTPUT_FILENAME = 'cleaned_sinhala_plants.csv'

# Try to read as CSV, fallback to Excel if not found
if os.path.exists(FILENAME):
    df = pd.read_csv(FILENAME)
elif os.path.exists(FILENAME.replace('.csv', '.xlsx')):
    FILENAME = FILENAME.replace('.csv', '.xlsx')
    df = pd.read_excel(FILENAME)
else:
    raise FileNotFoundError(f"Dataset file '{FILENAME}' or '{FILENAME.replace('.csv', '.xlsx')}' not found.")

# Clean column names (strip whitespace)
df.columns = df.columns.str.strip()

# Split 'Habitat/Region' into separate columns
if 'Habitat/Region' in df.columns:
    # Split by ';' and expand into new columns
    habitat_split = df['Habitat/Region'].str.split(';', expand=True)
    # Rename new columns
    habitat_split.columns = [f'Habitat/Region_{i+1}' for i in range(habitat_split.shape[1])]
    # Concatenate with original df (drop old column)
    df = pd.concat([df.drop('Habitat/Region', axis=1), habitat_split], axis=1)
else:
    print("'Habitat/Region' column not found in dataset.")

# Save cleaned dataset
print(f"Saving cleaned dataset to {OUTPUT_FILENAME}")
df.to_csv(OUTPUT_FILENAME, index=False)
print("Done.")

