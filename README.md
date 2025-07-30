# Habit Tracker - Self-Improvement Web App

A minimal web application for tracking daily habits and getting AI-powered personalized improvement tips.

## Features

- ✅ Add and track daily habits (exercise, sleep, journaling, etc.)
- 📊 Mark habit completion for each day
- 📈 View progress summary and statistics
- 🤖 Get personalized AI tips based on recent activity (powered by OpenAI)
- ➕ Add custom habits
- 📤 Export progress to CSV
- 🌙 Light/dark mode toggle
- 📱 Mobile-friendly responsive design

## Setup Instructions

### Backend (FastAPI)

1. **Optional**: Create a `.env` file with your OpenAI API key for personalized AI tips:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   *Note: The app works without OpenAI and provides fallback tips*

2. Install Python dependencies:
   ```bash
   python3 -m pip install fastapi uvicorn python-dotenv python-multipart openai --break-system-packages
   ```

3. Start the backend server:
   ```bash
   cd backend
   python3 main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend (React)

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## API Endpoints

- `GET /habits` - Get all habits
- `POST /habits` - Create a new habit
- `GET /habits/{habit_id}/entries` - Get entries for a habit
- `POST /habits/{habit_id}/entries` - Mark habit as completed for a date
- `DELETE /habits/{habit_id}/entries` - Remove habit completion for a date
- `GET /ai-tips` - Get personalized AI tips based on recent activity
- `GET /export` - Export all data to CSV

## Project Structure

```
/
├── backend/           # FastAPI backend
│   ├── main.py       # Main FastAPI application
│   ├── models.py     # Data models
│   └── storage.py    # JSON storage handler
├── src/              # React frontend
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── App.js        # Main App component
├── public/           # Static files
└── data/             # JSON storage files
```

## Extending the App

The codebase is well-commented and modular. Key areas for extension:

- **Backend**: Add new endpoints in `backend/main.py`
- **Frontend**: Create new components in `src/components/`
- **Storage**: Modify `backend/storage.py` for different storage backends
- **UI**: Update styles in component files for design changes