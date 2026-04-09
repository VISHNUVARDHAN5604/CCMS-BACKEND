# 🤖 ML Priority Prediction - Quick Start Guide

## One-Time Setup

### 1️⃣ Install Dependencies
```bash
# Python dependencies
cd /home/rguktrkvalley/Music/BACKEND/ml_model
pip install -r requirements.txt

# Node dependencies  
cd /home/rguktrkvalley/Music/BACKEND
npm install
```

### 2️⃣ Train ML Model
```bash
cd /home/rguktrkvalley/Music/BACKEND/ml_model
python train_model.py
```

## Running the System

### Start All Services (3 separate terminals)

| Terminal | Command | Purpose | Port |
|----------|---------|---------|------|
| 1 | `cd ml_model && python app.py` | ML API Server | 5001 |
| 2 | `cd . && node index.js` | Node.js Backend | 5000 |
| 3 | `cd react/my-app && npm start` | React Frontend | 3000 |

**From BACKEND directory, use:**
```bash
# Terminal 1
cd ml_model && python app.py

# Terminal 2  
node index.js

# Terminal 3
cd react/my-app && npm start
```

## How to Use

1. **Student Dashboard**
   - Go to: http://localhost:3000 (login as student)
   - Fill "Create New Complaint" form
   - NO need to select Priority anymore!
   - Submit → Priority is **automatically predicted**

2. **View Complaints Flow**
   - Admin sees complaints sorted **by priority** (High→Medium→Low)
   - Workers see assigned complaints by priority
   - Resolved complaints are tracked

## File Locations

```
📁 BACKEND/
  📄 index.js                  ← Updated (ML API integration)
  📄 package.json              ← Updated (axios added)
  📄 ML_SETUP_GUIDE.md         ← Comprehensive guide
  📄 setup-ml.sh               ← Auto-setup script
  📄 setup-ml.bat              ← Windows setup script
  
  📁 ml_model/                 ← NEW ML directory
    📄 train_model.py          ← Train model
    📄 app.py                  ← Flask API
    📄 requirements.txt        ← Python deps
    📄 priority_model.pkl      ← Trained model (auto-generated)
  
  📁 react/my-app/src/
    📁 pages/
      📄 StudentDashboard.js   ← Updated (removed priority selector)
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT SUBMISSION                        │
├─────────────────────────────────────────────────────────────┤
│  1. Student fills: Title + Description + Image (no priority) │
│  2. Clicks "Submit Complaint"                               │
│  3. Frontend sends to Backend (port 5000)                   │
│  4. Backend calls ML API (port 5001)                        │
│  5. ML predicts: High/Medium/Low                            │
│  6. Complaint saved with predicted priority                 │
│  7. ✅ "Success! Priority auto-assigned"                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────┬──────────────────────────────────┐
│    ADMIN DASHBOARD      │     WORKER DASHBOARD             │
├─────────────────────────┼──────────────────────────────────┤
│ • High Priority (↑)     │ • Assigned complaints by priority│
│ • Medium Priority       │ • Sort: High → Medium → Low      │
│ • Low Priority (↓)      │ • Mark as resolved               │
│ • Assign to workers     │ • Add after-image                │
└─────────────────────────┴──────────────────────────────────┘
```

## Test Priority Predictions

Try these examples to verify ML is working:

**HIGH Priority (expect 3)**
- "Fire in the laboratory"
- "Electrical hazard detected"
- "Gas leak emergency"

**MEDIUM Priority (expect 2)**
- "Fan not working properly"
- "Door lock is broken"
- "Water leaking from roof"

**LOW Priority (expect 1)**
- "Classroom needs cleaning"
- "Floor is dusty"
- "Paint is fading"

## Debugging

### Check ML API Status
```bash
curl http://localhost:5001/health
# Should return: {"status": "ok", "message": "ML API is running"}
```

### Test ML Prediction
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"title":"Fire", "description":"Emergency in lab"}'
# Should return: {"priority": 3, "priority_label": "High", "confidence": 0.95}
```

## Possible Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Connection refused" (5001) | Start ML API: `python ml_model/app.py` |
| "Connection refused" (5000) | Start backend: `node index.js` |
| Module not found errors | Run: `pip install -r ml_model/requirements.txt` |
| Model file not found | Train model: `python ml_model/train_model.py` |
| Predictions seem wrong | Add more training data, retrain model |

## Enhancement Ideas

- 🎯 Train model with real complaints from your system
- 📊 Add confidence threshold (review if < 60%)
- 🔁 Retrain model monthly with new data
- 🏢 Create department-specific models
- 🧠 Try neural networks for better accuracy
- 💾 Store ML predictions for analytics

## Support Files

- **ML_SETUP_GUIDE.md** - Complete detailed setup
- **setup-ml.sh** - Bash auto-setup script
- **setup-ml.bat** - Windows auto-setup script

---

**Ready to go!** Follow the "Running the System" section above. 🚀
