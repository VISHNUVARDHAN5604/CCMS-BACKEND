"""
Complaint Priority Prediction Model
Trains and saves a model to predict complaint priority based on complaint text
Priority: 3=High, 2=Medium, 1=Low
"""

import numpy as np
import pickle
import os
import sys
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

complaints = [
    # Fire related
    "fire in lab dangerous",
    "fire in building",
    "fire emergency",
    "fire broke out in hostel",
    "fire alarm ringing",
    "fire fire fire urgent",
    "smoke and fire in room",
    "fire detected in kitchen",
    "fire spreading fast",
    "fire in electrical panel",
    "fire extinguisher missing emergency",

    # Gas / Chemical
    "gas leak detected",
    "gas leak in lab",
    "gas smell in corridor",
    "chemical spillage in lab",
    "acid leak in chemistry lab",
    "toxic fumes from lab",
    "chemical burn hazard",
    "hazardous material spill",

    # Electrical hazards
    "electrical hazard in classroom",
    "live wire exposed",
    "electric shock risk",
    "sparking from switchboard",
    "short circuit in building",
    "electrical fire danger",
    "wiring caught fire",
    "power line fallen",

    # Structural / Collapse
    "roof collapsed part",
    "wall cracked severely",
    "building structure damage",
    "ceiling about to fall",
    "wall collapsed in hostel",
    "structural damage to building",
    "pillar cracked dangerously",
    "floor sinking in room",

    # Explosion / Injury
    "explosion sound in lab",
    "blast in chemistry lab",
    "student injured severely",
    "someone got hurt badly",
    "serious injury reported",
    "heavy water leakage emergency",
    "emergency situation urgent",

    # Broken dangerous
    "broken glass everywhere",
    "glass shattered dangerous",
    "power outage entire building",
    "complete blackout emergency",
    "flooding in basement",
    "water flooding inside rooms",
    "snake found in campus",
    "dangerous animal spotted",

    # ========== MEDIUM PRIORITY (2) ==========
    # Equipment not working
    "fan not working properly",
    "fan not working in classroom",
    "fan broken in room",
    "light bulb broken",
    "tube light not working",
    "light flickering in room",
    "projector not working",
    "projector display broken",
    "computer not starting",
    "computer screen broken",
    "printer not working",
    "ac not cooling properly",
    "ac making noise",
    "ac not working",
    "heater not working",

    # Door / Window / Lock
    "door lock damaged",
    "door lock not working",
    "door hinge loose",
    "door broken in classroom",
    "window pane cracked",
    "window glass broken",
    "window not closing properly",

    # Plumbing / Water
    "water leakage from roof",
    "water dripping from ceiling",
    "tap leaking continuously",
    "water supply interrupted",
    "pipe burst in washroom",
    "toilet not flushing",
    "toilet seat broken",
    "bathroom drain blocked",
    "drain clogged in corridor",

    # Furniture damage
    "bench broken in classroom",
    "chair broken",
    "desk damaged",
    "table wobbly and unstable",
    "cupboard door broken",

    # Connectivity / Supplies
    "internet connection down",
    "wifi not working",
    "network issue in lab",
    "chalks not available",
    "whiteboard marker missing",
    "duster missing from classroom",
    "paint peeling off walls",
    "wall plaster falling",

    # ========== LOW PRIORITY (1) ==========
    # Cleaning
    "classroom needs cleaning",
    "classroom dirty",
    "room needs cleaning",
    "desk dusty",
    "floor needs sweeping",
    "floor needs mopping",
    "cobwebs in corner",
    "dust on furniture",

    # Minor maintenance
    "notice board full",
    "notice board needs update",
    "trash bin overflowing",
    "dustbin not emptied",
    "campus needs beautification",
    "garden needs maintenance",
    "lawn not trimmed",
    "grass needs cutting",
    "plants need watering",

    # Cosmetic
    "paint faded on wall",
    "wall needs painting",
    "sticker on bench",
    "graffiti on wall",
    "minor stain on floor",
    "scratch on desk",
    "old posters need removal",

    # Suggestions
    "leaves scattered in corridor",
    "suggestion for better furniture",
    "seating arrangement improvement",
    "lighting can be better",
    "more dustbins needed",
    "request better chairs",
    "decoration needed in hall",
    "need more plug points",
    "ventilation needs improvement",
    "canteen food quality",
    "parking area needs marking",
    "request new water cooler",
]

# Build priority labels to match exactly
priorities = (
    [3] * 11 +  # fire (11)
    [3] * 8 +   # gas/chemical (8)
    [3] * 8 +   # electrical (8)
    [3] * 8 +   # structural (8)
    [3] * 7 +   # explosion/injury (7)
    [3] * 8 +   # broken/dangerous (8)
    # Total HIGH = 50

    [2] * 15 +  # equipment (15)
    [2] * 7 +   # door/window (7)
    [2] * 9 +   # plumbing (9)
    [2] * 5 +   # furniture (5)
    [2] * 8 +   # connectivity/supplies (8)
    # Total MEDIUM = 44

    [1] * 8 +   # cleaning (8)
    [1] * 9 +   # minor maintenance (9)
    [1] * 7 +   # cosmetic (7)
    [1] * 12    # suggestions (12)
    # Total LOW = 36
)

# Verify data alignment
assert len(complaints) == len(priorities), \
    f"Mismatch! complaints={len(complaints)} vs priority={len(priorities)}"

high_count = priorities.count(3)
med_count = priorities.count(2)
low_count = priorities.count(1)
total = len(complaints)

print("Training ML Model for Priority Prediction...")
print(f"Total training samples: {total}")
print(f"   HIGH (3): {high_count}")
print(f"   MEDIUM (2): {med_count}")
print(f"   LOW (1): {low_count}")

# Create pipeline: TF-IDF + Logistic Regression
# Using ngram_range=(1,2) to capture two-word phrases like "fire emergency", "gas leak"
model = Pipeline([
    ('tfidf', TfidfVectorizer(
        lowercase=True,
        stop_words='english',
        max_features=500,
        ngram_range=(1, 2),  # unigrams + bigrams
    )),
    ('classifier', LogisticRegression(
        max_iter=500,
        random_state=42,
        C=1.0,
        class_weight='balanced',  # handles class imbalance
    ))
])

# Train the model
model.fit(complaints, priorities)

# Save the model
model_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(model_dir, 'priority_model.pkl')
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"\nModel trained and saved to {model_path}")

# Comprehensive test predictions
test_complaints = [
    # Should be HIGH (3)
    ("fire emergency in building", "HIGH"),
    ("fire", "HIGH"),
    ("gas leak in hostel", "HIGH"),
    ("wall cracked dangerously", "HIGH"),
    ("explosion in lab", "HIGH"),
    ("student got injured", "HIGH"),
    ("electrical hazard sparking", "HIGH"),
    ("roof collapsed", "HIGH"),

    # Should be MEDIUM (2)
    ("fan not working in room", "MEDIUM"),
    ("door lock broken", "MEDIUM"),
    ("water leaking from pipe", "MEDIUM"),
    ("projector stopped working", "MEDIUM"),
    ("toilet is broken", "MEDIUM"),
    ("ac not cooling", "MEDIUM"),
    ("internet is down", "MEDIUM"),

    # Should be LOW (1)
    ("floor needs cleaning", "LOW"),
    ("dustbin is full", "LOW"),
    ("garden needs maintenance", "LOW"),
    ("wall needs painting", "LOW"),
    ("suggestion for new chairs", "LOW"),
    ("classroom is dusty", "LOW"),
]

print("\nTest Predictions:")
print("-" * 65)
correct = 0
total_tests = len(test_complaints)
for complaint, expected in test_complaints:
    prediction = model.predict([complaint])[0]
    probas = model.predict_proba([complaint])[0]
    confidence = max(probas)
    priority_label = {3: "High", 2: "Medium", 1: "Low"}[prediction]
    match = "OK" if priority_label.upper() == expected else "WRONG"
    if match == "OK":
        correct += 1
    print(f"  [{match}] '{complaint}'")
    print(f"       -> {priority_label} ({prediction}) Confidence: {confidence:.0%} | Expected: {expected}")
print("-" * 65)
print(f"Accuracy: {correct}/{total_tests} ({correct/total_tests:.0%})")
