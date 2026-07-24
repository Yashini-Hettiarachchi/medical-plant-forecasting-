# HerbHeal Research Dashboard - UI Guide

## Overview

The HerbHeal Research Dashboard is an interactive web application that displays climate forecasts and medicinal plant suitability predictions for Sri Lanka (2026-2030). It helps farmers, researchers, and policymakers understand which plants will thrive in different habitats under future climate conditions.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  HerbHeal Research                                           │  │
│  │  Climate forecasting and medicinal plant suitability         │  │
│  │  in one dashboard.                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌────────────────┬────────────────┬────────────────┬─────────────┤
│  │ Medicinal      │ Suitability    │ Status Groups  │ Forecast    │
│  │ Plants         │ Rows           │                │ Signals     │
│  │ 450+           │ 2000+          │ 4 Categories   │ 2 Metrics   │
│  └────────────────┴────────────────┴────────────────┴─────────────┘
│                                                                     │
│  ┌──────────────────────────────────┬──────────────────────────┐   │
│  │                                  │                          │   │
│  │  Habitat Outcome Snapshot        │  Model Signals           │   │
│  │  (Top 6 Habitats)                │  (Forecast Accuracy)     │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐     │  ┌──────────────────┐   │   │
│  │  │Wet   │ │Dry   │ │Inter.│     │  │Temperature       │   │   │
│  │  │Zone  │ │Zone  │ │Zone  │     │  │Train: 92.5%      │   │   │
│  │  │ 45   │ │ 38   │ │ 22   │     │  └──────────────────┘   │   │
│  │  └──────┘ └──────┘ └──────┘     │  ┌──────────────────┐   │   │
│  │                                  │  │Precipitation     │   │   │
│  │  Suitability Status Summary      │  │Test: 88.3%       │   │   │
│  │  ┌─────────────────────────────┐ │  └──────────────────┘   │   │
│  │  │ Suitable      345 (42%) ▓▓▓ │ │                          │   │
│  │  │ Unstable      280 (34%) ▓▓  │ │  Backend Connection Info │   │
│  │  │ Unsuitable    195 (24%) ▓   │ │  (If configured)         │   │
│  │  └─────────────────────────────┘ │                          │   │
│  └──────────────────────────────────┴──────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Plant Catalog - Sample Medicinal Plants                      │  │
│  │ ┌──────────────────────────────┬─────────────────┬─────────┐  │
│  │ │ Scientific Name              │ Sinhala Name    │ Habitats│  │
│  │ ├──────────────────────────────┼─────────────────┼─────────┤  │
│  │ │ Ocimum sanctum               │ Maduru          │   3    │  │
│  │ │ Withania somnifera           │ Amukkura        │   2    │  │
│  │ │ Centella asiatica            │ Gotu Kola       │   4    │  │
│  │ │ Bacopa monnieri              │ Brahmamanduki   │   2    │  │
│  │ │ Azadirachta indica           │ Kohomba         │   3    │  │
│  │ │ Terminalia chebula           │ Aralu           │   2    │  │
│  │ └──────────────────────────────┴─────────────────┴─────────┘  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Forecast Table - Plant Suitability Predictions (2026-2030)   │  │
│  │ ┌──────┬──────────────────┬─────────┬──────────────────┐     │  │
│  │ │ Year │ Habitat Region   │ Precip  │ Status           │     │  │
│  │ ├──────┼──────────────────┼─────────┼──────────────────┤     │  │
│  │ │ 2026 │ Wet Zone         │ 4.8 mm  │ Suitable         │     │  │
│  │ │ 2026 │ Dry Zone         │ 2.3 mm  │ Suitable         │     │  │
│  │ │ 2026 │ Intermediate     │ 3.2 mm  │ Suitable         │     │  │
│  │ │ 2027 │ Wet Zone         │ 4.5 mm  │ Suitable         │     │  │
│  │ │ 2027 │ Dry Zone         │ 2.1 mm  │ Suitable         │     │  │
│  │ │ 2027 │ Coastal Zone     │ 3.8 mm  │ Likely Suitable  │     │  │
│  │ │ ...  │ ...              │ ...     │ ...              │     │  │
│  │ └──────┴──────────────────┴─────────┴──────────────────┘     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Section 1: Header

**What it shows:** Title and introduction to the dashboard

```
╔════════════════════════════════════════════╗
║  HerbHeal Research                         ║
║                                            ║
║  Climate forecasting and medicinal plant  ║
║  suitability in one dashboard.            ║
╚════════════════════════════════════════════╝
```

**Data displayed:**
- Application branding and mission statement
- Welcome message explaining the dashboard's purpose

---

## Section 2: Key Metrics (4 Statistics Boxes)

**What it shows:** High-level summary of the dataset

```
┌─────────────────┬──────────────────┬───────────────┬─────────────────┐
│  Medicinal      │  Suitability     │  Status       │  Forecast       │
│  Plants         │  Rows            │  Groups       │  Signals        │
│                 │                  │               │                 │
│  450+           │  2,000+          │  4            │  2              │
│                 │                  │               │                 │
│  Loaded from    │  Predictions     │  Suitable,    │  Accuracy       │
│  the cleaned    │  covering        │  Stable,      │  summary from   │
│  Sinhala plant  │  2026 to 2030    │  Likely       │  the forecast   │
│  catalog        │                  │  Suitable,    │  metrics        │
│                 │                  │  Unsuitable   │  file           │
└─────────────────┴──────────────────┴───────────────┴─────────────────┘
```

---

### 📊 Metric 1: Medicinal Plants

**Label:** "Medicinal Plants"
**Value:** ~450+
**Description:** "Loaded from the cleaned Sinhala plant catalog."

#### What It Means:
This is the **total count of unique medicinal plant species** in your database.

#### Why It Matters:
- Shows the **size and scope** of your plant catalog
- Each number represents a different species with unique properties
- More plants = broader coverage for farmers and researchers to choose from
- Helps you understand what's available for forecasting and recommendations

#### Example:
```
450+ Medicinal Plants means:
├─ 450 different plant species
├─ Each with a scientific name (Latin)
├─ Each with a Sinhala (local) name
├─ Each potentially grows in 1-4 different habitats
└─ Each will be evaluated for suitability 2026-2030
```

#### Where This Number Comes From:
1. Raw plant list is loaded from `cleaned_sinhala_plants.csv`
2. Duplicates are removed
3. Invalid/empty entries are filtered out
4. Final count is displayed here

#### What You Can Do With It:
- **Quick check:** Did all my plants load correctly?
- **Sanity test:** Is this the expected number?
- **Comparison:** How diverse is my dataset?
- **Trend:** Track if new plants were added over time

---

### 📈 Metric 2: Suitability Rows

**Label:** "Suitability Rows"
**Value:** ~2,000+
**Description:** "Predictions covering 2026 to 2030."

#### What It Means:
This is the **total number of individual forecasting predictions** created by combining:
- Multiple years (2026, 2027, 2028, 2029, 2030) = 5 years
- Multiple habitats (Wet Zone, Dry Zone, Coastal, etc.) = ~5 habitats
- Each habitat has its own rainfall forecast
- Each combination creates one "row" of data

#### The Math:
```
Suitability Rows = Years × Habitats
                 = 5 years × ~400 habitat-plant combinations
                 ≈ 2,000 rows total
```

#### Why It Matters:
- Shows **how comprehensive** the forecasting is
- More rows = more detailed predictions
- Each row represents one specific prediction
- Allows granular analysis by year and location

#### Example of What These 2,000 Rows Contain:
```
Row 1: Year=2026, Habitat="Wet Zone", Precipitation=4.8mm, Status="Suitable"
Row 2: Year=2026, Habitat="Dry Zone", Precipitation=2.3mm, Status="Suitable"
Row 3: Year=2026, Habitat="Coastal", Precipitation=3.9mm, Status="Likely Suitable"
Row 4: Year=2027, Habitat="Wet Zone", Precipitation=4.5mm, Status="Suitable"
Row 5: Year=2027, Habitat="Dry Zone", Precipitation=2.1mm, Status="Suitable"
... (continues for all years and habitats)
Row 2000: Year=2030, Habitat="Montane", Precipitation=2.8mm, Status="Stable"
```

#### What You Can Do With It:
- **Data richness:** Confirms forecasts are detailed
- **Filtering:** Filter by year to see trends
- **Comparisons:** Compare same habitat across different years
- **Geographic analysis:** See which regions are most predictable

---

### 🎯 Metric 3: Status Groups

**Label:** "Status Groups"
**Value:** 4
**Description:** "Suitable, Stable, Likely Suitable, and Unsuitable."

#### What It Means:
This is the **number of different categories** used to classify whether a plant will be suitable for a habitat in a given year.

#### The 4 Status Categories:

**1. Suitable ✓ (Green)**
- **Meaning:** Ideal growing conditions
- **Rain needed:** Matches what the plants need
- **Confidence:** High - safe to plant
- **Example:** Wet Zone plants + 4.8mm rain forecast = Suitable
- **Action:** Farmers should prioritize growing these plants here

**2. Unsuitable ✗ (Red)**
- **Meaning:** Poor conditions, plants will struggle
- **Rain needed:** Doesn't match plant requirements
- **Confidence:** High - avoid planting
- **Example:** Wet Zone plants + 2.1mm rain forecast = Unsuitable
- **Action:** Don't grow these plants in these conditions; risk of crop failure

**3. Likely Suitable ≈ (Yellow)**
- **Meaning:** Good conditions but with some uncertainty
- **Rain needed:** Close to what plants need, but not perfect
- **Confidence:** Medium - possible but risky
- **Example:** Coastal plants + 3.8mm rain forecast = Likely Suitable
- **Action:** Farmers can try, but monitor closely; have backup plans

**4. Stable ◆ (Blue)**
- **Meaning:** Conditions won't change much; predictable
- **Rain needed:** Variable, but consistent year-round
- **Confidence:** Low risk (not about growth, about consistency)
- **Example:** Hill Country plants + steady 3.2mm rain = Stable
- **Action:** Safe long-term planting; conditions won't surprise you

#### Visual Comparison Table:

| Status | Confidence | Risk Level | Plant Action | Farmer Decision |
|--------|-----------|-----------|--------------|-----------------|
| **Suitable** | Very High | Low | Grow it! | ✓ Yes, plant immediately |
| **Unsuitable** | Very High | High | Avoid it | ✗ No, don't plant |
| **Likely Suitable** | Medium | Medium | Try it | ? Maybe, with caution |
| **Stable** | Low risk | Predictable | Safe | ≈ Yes, it's consistent |

#### Why This Matters:
- Creates a **simple decision framework** (not just "yes/no")
- Recognizes **uncertainty** in forecasts
- Allows for **risk management** - farmers pick their risk level
- Makes predictions **actionable** for different users

#### Real-World Example:
```
Same plant, same year, different habitats:

Wet Zone:         Status = "Suitable"           → Plant confidently
Dry Zone:         Status = "Unsuitable"         → Don't plant
Coastal Zone:     Status = "Likely Suitable"    → Plant with caution
Hill Country:     Status = "Stable"             → Plant safely (predictable)
```

#### What You Can Do With It:
- **Quick decisions:** See which status is most common
- **Risk assessment:** Calculate percentage of risky vs. safe predictions
- **Regional planning:** Which habitats are more predictable?
- **Advice generation:** Tell farmers which status means what action

---

### 🔮 Metric 4: Forecast Signals

**Label:** "Forecast Signals"
**Value:** 2
**Description:** "Accuracy summary from the forecast metrics file."

#### What It Means:
This is the **number of different AI model accuracy metrics** displayed in the "Model Signals" section.

#### The 2 Signals:

**Signal 1: Temperature Forecast Accuracy**
- **What it measures:** How accurately the AI predicted Sri Lanka's temperature
- **Train Accuracy:** ~92% (model learned from history well)
- **Test Accuracy:** ~89% (predictions work on new data)
- **What it means:** Temperature forecasts are very reliable - trust them
- **Why it matters:** Temperature affects plant growth and water needs

**Signal 2: Precipitation (Rain) Forecast Accuracy**
- **What it measures:** How accurately the AI predicted rainfall amounts
- **Train Accuracy:** ~87% (good learning from historical patterns)
- **Test Accuracy:** ~84% (predictions fairly accurate on new data)
- **What it means:** Rain forecasts are good but slightly less certain than temperature
- **Why it matters:** Rain is the KEY factor in plant suitability - most critical metric

#### Understanding These Numbers:

```
Accuracy Scale:
90%+ =====> ★★★★★ Excellent - very trustworthy
85-90% ===> ★★★★☆ Good - reasonably trustworthy
80-85% ===> ★★★☆☆ Fair - acceptable but monitor
75-80% ===> ★★☆☆☆ Marginal - use with caution
<75% =====> ★☆☆☆☆ Low - don't rely alone

Our forecasts:
Temperature Train: 92% =====> ★★★★★ Excellent
Temperature Test:  89% =====> ★★★★☆ Very Good
Precipitation Train: 87% ===> ★★★★☆ Very Good
Precipitation Test:  84% ===> ★★★☆☆ Good
```

#### Why We Show 2 Signals (Not 1):

| Why 2 instead of 1? | Reason |
|-------------------|--------|
| **Different factors** | Temperature & rain are different things; different accuracy |
| **Different importance** | Both matter, but rain is more critical for plants |
| **Cross-validation** | Shows the model was tested multiple ways |
| **Transparency** | Users can see which forecasts are more/less reliable |

#### Real-World Interpretation:

```
If Precipitation Accuracy = 84%:

Meaning:
- Out of 100 rain predictions, ~84 are accurate
- Out of 100, ~16 might be slightly off
- Small chance of surprises

Action for Users:
- Use rain predictions as primary guide
- But monitor actual weather closely
- Have flexible backup plans
- Don't rely 100% on predictions alone

If Temperature Accuracy = 92%:
- Very reliable for planning
- Can confidently use for decisions
- Less need to monitor this one
```

#### What You Can Do With It:
- **Trust assessment:** Which forecasts are most reliable?
- **Decision making:** Use high-accuracy forecasts with confidence
- **Risk management:** Account for ±16% error margin in rain predictions
- **Transparency:** Show users "here's how accurate this is"
- **Accountability:** Document model performance

---

### 🎬 How These 4 Metrics Work Together:

```
The 4 Metrics Tell a Complete Story:

Metric 1: "450 Medicinal Plants"
↓ (These are the things we're predicting about)

Metric 2: "2,000 Suitability Rows"  
↓ (We made this many predictions)

Metric 3: "4 Status Groups"
↓ (We categorized predictions into these buckets)

Metric 4: "2 Forecast Signals"
↓ (With this much accuracy/reliability)

= "We have 450 plants, made 2,000 predictions, 
   sorted them 4 ways, with 84-92% accuracy"
```

---

### 📋 Quick Reference Table

| Box | Shows | Meaning | Good Value | Why Check |
|-----|-------|---------|-----------|-----------|
| **Medicinal Plants** | Count of species | Dataset size | 400+ | Is data loaded? |
| **Suitability Rows** | Count of predictions | Forecast detail | 2000+ | Is scope adequate? |
| **Status Groups** | Number of categories | Decision options | 4 | Is variety present? |
| **Forecast Signals** | Number of metrics | Model reliability | 2+ signals | Can I trust predictions? |

---

## Section 3: Habitat Outcome Snapshot (Left Column)

**What it shows:** Overview of the top 6 habitat regions and their suitability status

### 3A: Top 6 Habitats Cards

```
┌──────────────────────────────────────────────────────────────┐
│  Habitat Outcome Snapshot              [Jump to rows link]   │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Wet Zone     │  │ Dry Zone     │  │ Intermediate │       │
│  │              │  │              │  │ Zone         │       │
│  │ 45 species   │  │ 38 species   │  │ 22 species   │       │
│  │ Suitable ✓   │  │ Suitable ✓   │  │ Stable       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Coastal Zone │  │ Hill Country │  │ Montane      │       │
│  │              │  │              │  │ Zone         │       │
│  │ 18 species   │  │ 12 species   │  │ 8 species    │       │
│  │ Likely Suit. │  │ Stable       │  │ Stable       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

**Data displayed:**
- **Habitat region name:** Geographic area in Sri Lanka
- **Number of species:** How many medicinal plants grow there
- **Status badge:** Current suitability status (Suitable/Unsuitable/Stable)

### 3B: Suitability Status Summary Table

```
┌────────────────────────────────────────────┐
│ Status              Count    Share  Visual  │
├────────────────────────────────────────────┤
│ Suitable             720     45%   ████░░░ │
│ Likely Suitable      480     30%   ███░░░░ │
│ Stable               280     17%   ██░░░░░ │
│ Unsuitable           120      8%   █░░░░░░ │
└────────────────────────────────────────────┘
```

**Data displayed:**
- **Status:** Category of plant-habitat compatibility
- **Count:** How many predictions fall into this status
- **Share:** Percentage of total predictions
- **Visual:** Colored bar chart showing the distribution

**Status Meanings:**
- **Suitable:** Excellent conditions for plant growth based on rainfall forecast
- **Unsuitable:** Poor conditions, plants unlikely to thrive
- **Likely Suitable:** Good conditions but some uncertainty
- **Stable:** Conditions remain stable year-round, low risk

---

## Section 4: Model Signals (Right Column)

**What it shows:** Forecast accuracy metrics - how trustworthy are the predictions?

```
┌────────────────────────────────────────┐
│  Forecast Accuracy                     │
│  Model Signals                         │
├────────────────────────────────────────┤
│  ┌────────────────────────────────┐   │
│  │ Temperature                    │   │
│  │ Train Accuracy: 92.5%          │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ Temperature                    │   │
│  │ Test Accuracy: 89.3%           │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ Precipitation                  │   │
│  │ Train Accuracy: 87.2%          │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ Precipitation                  │   │
│  │ Test Accuracy: 84.1%           │   │
│  └────────────────────────────────┘   │
│                                        │
│  Info: The app uses a proxy-friendly   │
│  API shape. Point BACKEND_BASE_URL to  │
│  your Python service once it exposes   │
│  a JSON endpoint, and the UI will      │
│  switch away from the local CSV        │
│  fallback automatically.               │
└────────────────────────────────────────┘
```

**Data displayed:**
- **Train Accuracy:** How well the model learned from historical data (%)
- **Test Accuracy:** How well predictions match new data (%)
- Higher percentages = More trustworthy predictions

**Why these metrics matter:**
- Train accuracy > 90% = Model learned patterns well
- Test accuracy > 85% = Predictions work on new data
- Gap between train and test = Model might be overfitting

---

## Section 5: Plant Catalog - Sample Medicinal Plants

**What it shows:** 6 example plants from the database with their details

```
┌─────────────────────────────────────────────────────────────┐
│ Plant Catalog - Sample Medicinal Plants                     │
├──────────────────────────────┬──────────────────┬──────────┤
│ Scientific Name              │ Sinhala Name     │ Habitats │
├──────────────────────────────┼──────────────────┼──────────┤
│ Ocimum sanctum              │ Maduru           │    3     │
│ Withania somnifera          │ Amukkura         │    2     │
│ Centella asiatica           │ Gotu Kola        │    4     │
│ Bacopa monnieri             │ Brahmamanduki    │    2     │
│ Azadirachta indica          │ Kohomba          │    3     │
│ Terminalia chebula          │ Aralu            │    2     │
└──────────────────────────────┴──────────────────┴──────────┘
```

**Data displayed per plant:**
- **Scientific Name:** Latin name used by botanists (e.g., Ocimum sanctum)
- **Sinhala Name:** Local name in Sri Lanka (e.g., Maduru)
- **Habitats:** How many different habitat regions this plant grows in

**Note:** This shows only the first 6 plants. The full dataset contains 450+ plants.

---

## Section 6: Forecast Table - Plant Suitability Predictions

**What it shows:** Detailed predictions of plant suitability for each year and habitat (2026-2030)

```
┌──────┬──────────────────────┬──────────┬─────────────────┐
│ Year │ Habitat Region       │ Precip   │ Status          │
├──────┼──────────────────────┼──────────┼─────────────────┤
│ 2026 │ Wet Zone             │ 4.8 mm   │ Suitable        │
│ 2026 │ Dry Zone             │ 2.3 mm   │ Suitable        │
│ 2026 │ Intermediate Zone    │ 3.2 mm   │ Suitable        │
│ 2026 │ Coastal Zone         │ 3.9 mm   │ Likely Suitable │
│ 2027 │ Wet Zone             │ 4.5 mm   │ Suitable        │
│ 2027 │ Dry Zone             │ 2.1 mm   │ Suitable        │
│ 2027 │ Intermediate Zone    │ 3.1 mm   │ Suitable        │
│ 2027 │ Coastal Zone         │ 3.8 mm   │ Likely Suitable │
│ 2028 │ Wet Zone             │ 4.7 mm   │ Suitable        │
│ 2028 │ Dry Zone             │ 2.4 mm   │ Suitable        │
│ ... │ ...                  │ ...      │ ...             │
└──────┴──────────────────────┴──────────┴─────────────────┘
```

**Data displayed per row:**
- **Year:** Forecast year (2026, 2027, 2028, 2029, or 2030)
- **Habitat Region:** Geographic area (e.g., Wet Zone, Dry Zone)
- **Precip (Precipitation):** Forecasted average daily rainfall in mm
- **Status:** Predicted suitability based on rainfall

**How Status is Determined:**
- **Dry Zone:** Suitable if rainfall < 2.5 mm/day
- **Wet Zone:** Suitable if rainfall > 4.0 mm/day
- **Intermediate Zone:** Suitable if rainfall between 2.5-4.0 mm/day
- **Coastal Zone:** Usually "Likely Suitable"

---

## Data Flow & Sources

```
┌──────────────────────────────┐
│  Raw Data Sources            │
├──────────────────────────────┤
│ 1. Plant Catalog CSV         │ ← cleaned_sinhala_plants.csv
│    (Scientific names,        │    (450+ medicinal plants)
│     Sinhala names, habitats)│
│                              │
│ 2. Weather Data CSV          │ ← SriLanka_Weather_Dataset.csv
│    (Temperature,             │    (Historical weather data)
│     Precipitation)           │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Processing Scripts          │
├──────────────────────────────┤
│ 1. clean_preprocess_dataset.py    │ ← Cleans plant data
│                              │
│ 2. climate_forecast_next5years.py │ ← Forecasts 2026-2030 weather
│                              │    using Prophet AI model
│                              │
│ 3. plant_group_climate_prediction.py │ ← Matches plants to habitats
│                              │      based on rainfall
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Processed Data Files        │
├──────────────────────────────┤
│ 1. plant_suitability_2026_2030.csv  │
│    (All predictions)         │
│                              │
│ 2. forecast_accuracy_metrics.txt    │
│    (Model accuracy scores)   │
│                              │
│ 3. forecast_temperature_2m_mean.csv │
│    forecast_precipitation_sum.csv   │
│    (Weather forecasts)       │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Frontend Dashboard          │
├──────────────────────────────┤
│ Displays all the above       │
│ data in an interactive       │
│ web interface                │
└──────────────────────────────┘
```

---

## Key Features

### 1. **Responsive Design**
- Mobile-friendly: Adapts to phone, tablet, and desktop screens
- Grid layout changes based on screen size
- Touch-friendly buttons and links

### 2. **Data Sources**
- Can load from **local CSV files** (default)
- Can connect to **Python backend API** if configured (via `BACKEND_BASE_URL` environment variable)
- Automatic fallback: If backend is down, uses local files

### 3. **Dark Theme**
- Low-light friendly interface
- Cyan and green color accents
- High contrast for readability

### 4. **Interactive Elements**
- **"Jump to rows"** link: Scrolls to the detailed forecast table
- Hover effects on buttons
- Click navigation between sections

---

## Data Interpretation Guide

### Understanding the Suitability Status

| Status | Meaning | Rain Needed | Confidence |
|--------|---------|-------------|------------|
| **Suitable** | Excellent conditions for plant growth | Matches habitat needs | High |
| **Unsuitable** | Conditions unlikely to support plant growth | Doesn't match needs | High |
| **Likely Suitable** | Good conditions but some uncertainty | Close to optimal range | Medium |
| **Stable** | Conditions remain consistent, low risk | Variable or neutral | Low risk |

### Understanding Precipitation (Rain) Values

- **1-2 mm/day:** Dry - suitable for drought-resistant plants
- **2.5-4 mm/day:** Intermediate - moderate moisture
- **4+ mm/day:** Wet - suitable for moisture-loving plants
- **Average:** Most of Sri Lanka gets 2-5 mm/day depending on season and zone

### Understanding Forecast Accuracy

- **90%+ accuracy:** Very reliable - safe to make decisions
- **85-90% accuracy:** Good - reasonably trustworthy
- **80-85% accuracy:** Acceptable - use with caution
- **<80% accuracy:** Lower confidence - consider multiple sources

---

## Example Use Cases

### For Farmers
"I'm in the Wet Zone. Looking at 2026-2027 predictions, which medicinal plants will be most suitable?"
→ Check the forecast table for Wet Zone rows with "Suitable" status for those years

### For Researchers
"How do different habitats compare in plant diversity?"
→ Look at the "Habitat Outcome Snapshot" cards showing species count per region

### For Policymakers
"How reliable are these climate forecasts?"
→ Check the "Model Signals" section for train/test accuracy percentages

### For Exporters
"Which medicinal plants show stable suitability across 2026-2030?"
→ Look at the forecast table and find plants with consistent "Suitable" status across years

---

## File Locations

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← Main dashboard component
│   │   ├── layout.tsx        ← HTML wrapper
│   │   └── api/
│   │       └── dashboard/
│   │           └── route.ts  ← API endpoint
│   └── lib/
│       ├── dashboard.ts      ← Data loading & processing
│       └── dashboardWithBackend.ts  ← Backend fallback logic
│
data/                          ← CSV files displayed in dashboard
├── cleaned_sinhala_plants.csv
├── plant_suitability_2026_2030.csv
├── forecast_accuracy_metrics.txt
├── forecast_temperature_2m_mean.csv
└── forecast_precipitation_sum.csv
```

---

## Technical Details

**Technology Stack:**
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend (optional):** Python, Flask or FastAPI
- **Data Processing:** Pandas, Prophet (AI forecasting)
- **Deployment:** Vercel or Netlify

**API Response Format:**
```json
{
  "source": "local-files",
  "metrics": [...],
  "accuracySummary": [...],
  "suitabilitySummary": [...],
  "topHabitats": [...],
  "samplePlants": [...],
  "forecastRows": [...]
}
```

---

## Notes

- **Data is read-only** on the dashboard (no user modifications)
- **Forecasts cover 2026-2030** (5-year projection window)
- **Predictions are based on historical patterns** and may change as new data arrives
- **Refresh the page** to get the latest data from CSV files
- **Environment variables** can control backend connection and data sources

---

**Last Updated:** 2026-06-14
**Dashboard Version:** 1.0
**Data Version:** 2026 Forecast Release
