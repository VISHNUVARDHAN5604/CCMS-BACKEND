"""
Complaint Priority Prediction Model
Trains and saves a model to predict complaint priority based on complaint text
Priority: 3=High, 2=Medium, 1=Low
"""

import numpy as np
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Sample training data - similar to your complaints system
training_data = {
    "complaints": [
        # HIGH PRIORITY (3)
        "fire in lab dangerous",
        "electrical hazard in classroom",
        "gas leak detected",
        "chemical spillage in lab",
        "heavy water leakage emergency",
        "roof collapsed part",
        "broken glass everywhere",
        "fire extinguisher missing",
        "power outage entire building",
        "wall cracked severely",
        "acid leak in chemistry lab",
        "explosion sound in lab",
        "student injured severely",
        "structural damage to building",
        
        # MEDIUM PRIORITY (2)
        "fan not working properly",
        "light bulb broken",
        "door lock damaged",
        "water leakage from roof",
        "chalks not available",
        "bench broken in classroom",
        "window pane cracked",
        "computer not starting",
        "projector not working",
        "internet connection down",
        "toilet seat broken",
        "paint peeling off walls",
        "door hinge loose",
        "whiteboard marker missing",
        "ac not cooling properly",
        "water supply interrupted",
        
        # LOW PRIORITY (1)
        "classroom needs cleaning",
        "desk dusty",
        "floor needs sweeping",
        "notice board full",
        "trash bin overflowing",
        "campus needs beautification",
        "garden needs maintenance",
        "paint faded on wall",
        "sticker on bench",
        "minor stain on floor",
        "leaves scattered in corridor",
        "suggestion for better furniture",
        "seating arrangement improvement",
        "lighting can be better",
    ],
    "priority": [
        # HIGH
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        # MEDIUM
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        # LOW
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ]
}

print("🚀 Training ML Model for Priority Prediction...")
print(f"📊 Total training samples: {len(training_data['complaints'])}")

# Create pipeline: TF-IDF + Logistic Regression
model = Pipeline([
    ('tfidf', TfidfVectorizer(lowercase=True, stop_words='english', max_features=100)),
    ('classifier', LogisticRegression(max_iter=200, random_state=42))
])

# Train the model
X_train = training_data['complaints']
y_train = training_data['priority']
model.fit(X_train, y_train)

# Save the model
model_dir = os.path.dirname(__file__)
model_path = os.path.join(model_dir, 'priority_model.pkl')
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f"✅ Model trained and saved to {model_path}")

# Test predictions
test_complaints = [
    "fire emergency in building",
    "fan not working in room",
    "floor needs cleaning"
]

print("\n🧪 Test Predictions:")
for complaint in test_complaints:
    prediction = model.predict([complaint])[0]
    priority_label = {3: "High", 2: "Medium", 1: "Low"}[prediction]
    print(f"  '{complaint}' → Priority: {priority_label} ({prediction})")
