#!/bin/bash

# ML Setup & Start Script for Windows/MacOS/Linux
# This script handles the complete setup for ML-based priority prediction

BACKEND_DIR="/home/rguktrkvalley/Music/BACKEND"
ML_DIR="$BACKEND_DIR/ml_model"
REACT_DIR="$BACKEND_DIR/react/my-app"

echo "🚀 Setting up ML-Based Complaint Priority System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Install Python dependencies
echo -e "${BLUE}Step 1: Installing Python dependencies...${NC}"
cd "$ML_DIR" || exit
pip install -r requirements.txt > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Python dependencies installation may need manual attention${NC}"
fi
echo ""

# Step 2: Train ML model
echo -e "${BLUE}Step 2: Training ML model...${NC}"
python train_model.py
if [ -f "$ML_DIR/priority_model.pkl" ]; then
    echo -e "${GREEN}✓ ML model trained and saved${NC}"
else
    echo -e "${YELLOW}⚠ Model file not found${NC}"
fi
echo ""

# Step 3: Install Node dependencies
echo -e "${BLUE}Step 3: Installing Node.js dependencies...${NC}"
cd "$BACKEND_DIR" || exit
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Node.js dependencies installation may need manual attention${NC}"
fi
echo ""

# Step 4: Show next steps
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next: Start the services in separate terminals:${NC}"
echo ""
echo -e "${BLUE}Terminal 1 - ML API Server:${NC}"
echo "cd $ML_DIR && python app.py"
echo ""
echo -e "${BLUE}Terminal 2 - Node.js Backend:${NC}"
echo "cd $BACKEND_DIR && node index.js"
echo ""
echo -e "${BLUE}Terminal 3 - React Frontend:${NC}"
echo "cd $REACT_DIR && npm start"
echo ""
echo -e "${YELLOW}Service URLs:${NC}"
echo "  ML API:        http://localhost:5001"
echo "  Backend:       http://localhost:5000"
echo "  Frontend:      http://localhost:3000"
echo ""
