"""
Flask API for Complaint Priority Prediction
Serves the trained ML model for priority prediction
"""

from flask import Flask, request, jsonify
import pickle
import os
import sys

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

app = Flask(__name__)

# Load the trained model
model_dir = os.path.dirname(__file__)
model_path = os.path.join(model_dir, 'priority_model.pkl')

try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print(f"Model loaded successfully from {model_path}")
except FileNotFoundError:
    print(f"Model not found at {model_path}")
    print("Please run: python train_model.py")
    sys.exit(1)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "ML API is running"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict priority for a complaint
    
    Expected JSON:
    {
        "title": "complaint title",
        "description": "complaint description"
    }
    
    Returns:
    {
        "priority": 1|2|3,
        "priority_label": "Low"|"Medium"|"High",
        "confidence": 0.0-1.0
    }
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Combine title and description for better context
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        
        if not title and not description:
            return jsonify({"error": "Title or description is required"}), 400
        
        # Combine text for better prediction
        complaint_text = f"{title} {description}".strip()
        
        # Make prediction
        priority = model.predict([complaint_text])[0]
        
        # Get prediction probabilities for confidence
        probabilities = model.predict_proba([complaint_text])[0]
        confidence = float(max(probabilities))
        
        # Map priority number to label
        priority_label = {3: "High", 2: "Medium", 1: "Low"}.get(int(priority), "Low")
        
        return jsonify({
            "priority": int(priority),
            "priority_label": priority_label,
            "confidence": round(confidence, 3)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """
    Predict priority for multiple complaints
    
    Expected JSON:
    {
        "complaints": [
            {"title": "...", "description": "..."},
            {"title": "...", "description": "..."}
        ]
    }
    """
    try:
        data = request.json
        complaints = data.get('complaints', [])
        
        if not isinstance(complaints, list):
            return jsonify({"error": "complaints must be a list"}), 400
        
        results = []
        for complaint in complaints:
            title = complaint.get('title', '').strip()
            description = complaint.get('description', '').strip()
            complaint_text = f"{title} {description}".strip()
            
            if complaint_text:
                priority = model.predict([complaint_text])[0]
                probabilities = model.predict_proba([complaint_text])[0]
                confidence = float(max(probabilities))
                priority_label = {3: "High", 2: "Medium", 1: "Low"}.get(int(priority), "Low")
                
                results.append({
                    "priority": int(priority),
                    "priority_label": priority_label,
                    "confidence": round(confidence, 3)
                })
            else:
                results.append({
                    "priority": 1,
                    "priority_label": "Low",
                    "confidence": 0.0
                })
        
        return jsonify({"predictions": results}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
