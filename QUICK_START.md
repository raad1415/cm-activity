# 🚀 Quick Start Guide - Habit Tracker

## Prerequisites
- Python 3.7+ 
- Node.js 14+ and npm
- Terminal/Command line access

## Step-by-Step Setup

### 1. 📁 Navigate to Project Directory
```bash
cd /workspace
```

### 2. 🐍 Start the Backend (FastAPI)

#### Install Python Dependencies
```bash
python3 -m pip install fastapi uvicorn python-dotenv python-multipart openai --break-system-packages
```

#### Start Backend Server
```bash
cd backend
python3 main.py
```

**✅ Backend should show:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test backend:** Open browser to `http://localhost:8000` - you should see:
```json
{"message":"Habit Tracker API is running!"}
```

### 3. ⚛️ Start the Frontend (React)

#### Open New Terminal/Tab
```bash
cd /workspace
```

#### Install Node Dependencies 
```bash
npm install
```

#### Start React Development Server
```bash
BROWSER=none npm start
```

**✅ Frontend should show:**
```
Local:            http://localhost:3000
```

### 4. 🌐 Access the Application

**Open your browser to: `http://localhost:3000`**

You should see the Habit Tracker application with:
- Header with current date and theme toggle
- Progress summary cards
- Default habits (Exercise, Sleep, Journaling, Reading)
- Add new habit button

## 🎯 How to Use

1. **Mark habits complete:** Click the checkboxes next to each habit
2. **Add new habits:** Click "Add New Habit" button
3. **View progress:** See your daily completion rate and streaks
4. **Get AI tips:** View personalized suggestions (add OpenAI API key for better tips)
5. **Export data:** Click "Export" button to download CSV
6. **Toggle theme:** Click sun/moon icon in header

## 🔧 Troubleshooting

### Frontend (localhost:3000) Not Working?

1. **Kill existing processes:**
   ```bash
   pkill -f "npm start"
   pkill -f "react-scripts"
   ```

2. **Restart frontend:**
   ```bash
   cd /workspace
   BROWSER=none npm start
   ```

3. **Check if running:**
   ```bash
   curl http://localhost:3000/
   ```

### Backend (localhost:8000) Not Working?

1. **Kill existing processes:**
   ```bash
   pkill -f "python3 main.py"
   ```

2. **Restart backend:**
   ```bash
   cd backend
   python3 main.py
   ```

3. **Check if running:**
   ```bash
   curl http://localhost:8000/
   ```

## 🤖 Optional: Add AI Tips

Create `.env` file in project root:
```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

Restart backend to enable personalized AI suggestions.

## ✅ Success Indicators

- ✅ Backend: `http://localhost:8000` shows API message
- ✅ Frontend: `http://localhost:3000` shows the habit tracker app
- ✅ Default habits appear automatically
- ✅ You can check off habits and see progress update
- ✅ Theme toggle works (sun/moon icon)
- ✅ Add habit form works

## 📱 Features Available

- **Daily habit tracking** with visual checkboxes
- **Progress analytics** with completion rates and streaks
- **AI-powered tips** based on your habits
- **Dark/light theme** with smooth transitions
- **Mobile-responsive** design
- **CSV export** of your data
- **Custom habits** with categories

Enjoy building better habits! 🌟