# ML-Based Complaint Priority Prediction - Setup Guide

This guide will help you set up the machine learning integration for automatic complaint priority prediction in your MERN complaint management system.

## 📁 Project Structure

```
BACKEND/
├── index.js                    # Node.js Express server (UPDATED)
├── package.json               # Node dependencies (UPDATED - added axios)
├── models/
│   ├── Complaint.js
│   └── User.js
├── react/my-app/src/
│   └── pages/
│       └── StudentDashboard.js # (UPDATED - removed manual priority selection)
└── ml_model/                   # NEW - ML model directory
    ├── train_model.py          # Train ML model
    ├── app.py                  # Flask API server
    ├── requirements.txt        # Python dependencies
    └── priority_model.pkl      # Trained model (generated)
```

## 🚀 Setup Instructions

### Step 1: Install Python Dependencies

First, ensure you have Python 3.7+ installed. Then install the required Python packages:

```bash
cd /home/rguktrkvalley/Music/BACKEND/ml_model
pip install -r requirements.txt
```

### Step 2: Train the ML Model

```bash
python train_model.py
```

You should see output like:
```
🚀 Training ML Model for Priority Prediction...
📊 Total training samples: 42
✅ Model trained and saved to .../ml_model/priority_model.pkl

🧪 Test Predictions:
  'fire emergency in building' → Priority: High (3)
  'fan not working in room' → Priority: Medium (2)
  'floor needs cleaning' → Priority: Low (1)
```

### Step 3: Install Node.js Dependencies

```bash
cd /home/rguktrkvalley/Music/BACKEND
npm install
```

This will add `axios` for making HTTP requests to the ML API.

### Step 4: Start the Services (in separate terminals)

**Terminal 1: Start the ML API Server**
```bash
cd /home/rguktrkvalley/Music/BACKEND/ml_model
python app.py
```

Expected output:
```
 * Running on http://localhost:5001/ (Press CTRL+C to quit)
🚀 Starting ML API server on http://localhost:5001
```

**Terminal 2: Start the Node.js Backend Server**
```bash
cd /home/rguktrkvalley/Music/BACKEND
node index.js
```

**Terminal 3: Start the React Frontend**
```bash
cd /home/rguktrkvalley/Music/BACKEND/react/my-app
npm start
```

## 🧠 How It Works

### 1. **Data Flow**
```
Student creates complaint
         ↓
Frontend sends title + description (NO priority)
         ↓
Node.js backend receives request
         ↓
Backend calls Flask ML API
         ↓
ML Model predicts priority (1/2/3)
         ↓
Backend saves complaint with ML-predicted priority
         ↓
Response sent to frontend
```

### 2. **ML Model Features**

- **Algorithm**: TF-IDF Vectorizer + Logistic Regression
- **Training Data**: 42 pre-labeled complaints (high/medium/low)
- **Prediction}: Returns priority (1=Low, 2=Medium, 3=High)
- **Confidence**: Returns confidence score for each prediction

### 3. **Priority Classification**

The model automatically categorizes complaints:

- **HIGH (3)**: Emergencies, safety hazards, critical issues
  - Examples: "fire", "electrical hazard", "gas leak", "explosion"

- **MEDIUM (2)**: Important but not critical, maintenance issues  
  - Examples: "not working", "broken", "damaged", "leakage"

- **LOW (1)**: Minor issues, cosmetic, cleanliness
  - Examples: "needs cleaning", "dusty", "faded", "overflowing"

## 📝 Changes Made

### Frontend (StudentDashboard.js)
- ❌ Removed manual priority selection dropdown
- ✅ Added AI priority assignment info box
- ✅ Updated success message to mention AI assignment
- ✅ Form now only requires: title, description, image

### Backend (index.js)
- ✅ Added axios import
- ✅ Modified `/complaints` POST endpoint to call ML API
- ✅ Fallback to Low priority if ML API is unavailable
- ✅ Added logging for ML predictions

### Node Dependencies (package.json)
- ✅ Added `axios@^1.4.0`

## ✅ Testing the Integration

1. **Test 1: High Priority**
   - Title: "Fire in laboratory"
   - Description: "There is a fire in the chemistry lab"
   - Expected: Priority = High (3)

2. **Test 2: Medium Priority**
   - Title: "Fan not working"
   - Description: "The ceiling fan in classroom 101 is not working"
   - Expected: Priority = Medium (2)

3. **Test 3: Low Priority**
   - Title: "Floor needs cleaning"
   - Description: "Please clean the corridor floor"
   - Expected: Priority = Low (1)

## 🔧 Customization

### Update Training Data
Edit `ml_model/train_model.py` to add more complaints following the same format:

```python
training_data = {
    "complaints": [
        "your complaint text here",
        ...
    ],
    "priority": [3, ...]  # 3=High, 2=Medium, 1=Low
}
```

Then retrain:
```bash
python train_model.py
```

### Change ML Algorithm
Replace `LogisticRegression` in `ml_model/train_model.py`:

```python
from sklearn.ensemble import RandomForestClassifier
model = Pipeline([
    ('tfidf', TfidfVectorizer(...)),
    ('classifier', RandomForestClassifier(n_estimators=100))
])
```

### Adjust ML API Port
Change port in `app.py`:
```python
app.run(debug=True, port=5002)  # Change 5001 to desired port
```

And update Node.js:
```javascript
const ML_API_URL = "http://localhost:5002";
```

## 📊 Monitoring ML Predictions

Check terminal where ML API is running - you'll see logs like:
```
🤖 ML API predicted priority: High (3) for complaint: "Fire in lab"
```

## ⚠️ Troubleshooting

### "Connection refused" error
- Ensure ML API server is running on port 5001
- Check firewall settings

### "Module not found" error
- Run `pip install -r requirements.txt` again
- Check Python version: `python --version`

### Model predictions seem inaccurate
- Add more training data to `train_model.py`
- Retrain the model
- Consider changing the ML algorithm

### ML API taking too long
- Reduce training data size
- Use a simpler model (already optimized)

## 🎯 Future Enhancements

1. **Ensemble Models**: Combine multiple ML models
2. **Deep Learning**: Use neural networks for better accuracy
3. **Active Learning**: Improve model from user feedback
4. **Real-time Retraining**: Update model as new complaints come in
5. **Department-Specific Models**: Separate models for each department
6. **Confidence Thresholds**: Manual review if confidence < threshold

## 📚 API Documentation

### Flask ML API Endpoints

**GET /health**
- Check if ML API is running
- Response: `{"status": "ok", "message": "ML API is running"}`

**POST /predict**
- Predict priority for a single complaint
- Request: `{"title": "text", "description": "text"}`
- Response: `{"priority": 1|2|3, "priority_label": "Low/Medium/High", "confidence": 0.0-1.0}`

**POST /batch-predict**
- Predict priority for multiple complaints
- Request: `{"complaints": [{"title": "...", "description": "..."}, ...]}`
- Response: `{"predictions": [{...}, {...}]}`

---

**Questions or Issues?** Check the logs in both terminals for debugging information.
