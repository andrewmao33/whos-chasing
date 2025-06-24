"Who's Chasing?" is a privacy-first Mac desktop app that analyzes your iMessage conversations to uncover relationship dynamics—specifically, who's putting in more effort in a situationship. Built using a React frontend styled with Tailwind CSS and animated with Framer Motion, the app is packaged with Electron for local execution and a native-like experience. All message analysis is handled by a Python backend using pandas, sqlite3, and NLP tools like TextBlob, with all data processing happening entirely on the user's machine to ensure privacy. Users select a conversation on a simple start screen, then scroll through a beautifully animated, Wrapped-style analysis revealing detailed insights into how they and the other person communicate.

Message Activity

Total messages sent and received
Who initiates the most conversations
Who texts first in the morning
Who texts last at night
One-word responses (count and breakdown)
One-text replies (without follow-up)
Emoji usage (per person + most common emojis)

Timing & Effort

Response time distributions (per person)
Average response time (hours/minutes/seconds)
Slowest replies from each side
Double texts (multiple consecutive messages)
"Block double texts" (2+ minutes between same-sender messages, creating visual breaks in iMessage)
Who restarts the convo after it ends with a tapback (e.g., “Liked ‘okay’”)

Text Behavior

Average number of messages sent per streak
Average word count per message
Frequency of dry responses
Dryness Index (based on short replies, delays, and tone)

NLP & Sentiment

Sentiment polarity per message
Average sentiment per person
Sentiment trends over time
Sentiment alignment (tone matching)



Chaser Score™ — a weighted score combining initiation, reply timing, double texts, and emotional effort


A desktop application built with Electron, React, and Python FastAPI.

## Project Structure

```
whos-chasing/
├── main.js              # Electron main process
├── preload.js           # Electron preload script for secure IPC
├── package.json         # Main project configuration
├── frontend/            # React application
│   ├── src/            # React source code
│   ├── public/         # Static assets
│   └── package.json    # React app configuration
├── backend/             # Python FastAPI backend
│   ├── main.py         # FastAPI application
│   ├── database.py     # SQLite database configuration
│   ├── models.py       # SQLAlchemy data models
│   ├── api/            # API routes
│   │   └── data.py     # Data API endpoints
│   ├── requirements.txt # Python dependencies
│   └── sample_data.csv # Sample data for testing
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- Python 3.8 or higher
- pip

### Installation

1. Install main project dependencies:
   ```bash
   npm install
   ```

2. Install React app dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. Install Python backend dependencies:
   ```bash
   npm run install:backend
   ```

### Development

#### Option 1: Run everything separately

1. Start the Python FastAPI backend:
   ```bash
   npm run dev:backend
   ```

2. Start the React development server:
   ```bash
   npm run dev:frontend
   ```

3. Start the Electron app in development mode:
   ```bash
   npm run dev
   ```

#### Option 2: Run everything at once (recommended)

```bash
npm run dev:full
```

### Production Build

1. Build the React app:
   ```bash
   npm run build:frontend
   ```

2. Build the Electron app:
   ```bash
   npm run build:electron
   ```

## Available Scripts

- `npm start` - Start the Electron app
- `npm run dev` - Start the Electron app in development mode
- `npm run dev:full` - Start backend, frontend, and Electron together
- `npm run dev:backend` - Start the Python FastAPI backend
- `npm run dev:frontend` - Start the React development server
- `npm run build` - Build both frontend and Electron app
- `npm run build:frontend` - Build only the React app
- `npm run build:electron` - Build only the Electron app
- `npm run install:backend` - Install Python backend dependencies

## API Endpoints

The FastAPI backend provides the following endpoints:

- `GET /api/v1/data/` - Get all data records
- `GET /api/v1/data/{id}` - Get a specific data record
- `POST /api/v1/data/` - Create a new data record
- `PUT /api/v1/data/{id}` - Update a data record
- `DELETE /api/v1/data/{id}` - Delete a data record
- `POST /api/v1/data/upload-csv/` - Upload CSV file
- `GET /api/v1/data/export-csv/` - Export data as CSV
- `GET /api/v1/data/analytics/` - Get data analytics

## Development Notes

- The React app runs on `http://localhost:3000` in development
- The Python FastAPI backend runs on `http://127.0.0.1:8000` in development
- Electron loads the React app from the dev server in development mode
- In production, Electron loads the built React app from `frontend/build/`
- The preload script provides secure communication between main and renderer processes
- API communication is handled through IPC between Electron and the Python backend

## Security

This project follows Electron security best practices:
- Context isolation is enabled
- Node integration is disabled
- Remote module is disabled
- Preload script is used for secure IPC communication
- CORS is configured for secure API communication

## Database

The application uses SQLite as the database with the following tables:
- `users` - User information
- `data_records` - Main data records with pandas integration

The database file (`whos_chasing.db`) is automatically created when the backend starts. 