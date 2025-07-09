# Who's Chasing?

A privacy-first Mac desktop app that analyzes iMessage conversations to uncover relationship dynamics. Built with Electron, React, and Python FastAPI.


## Project Structure

```
whos-chasing/
├── main.js              # Electron main process
├── preload.js           # Electron preload script
├── frontend/            # React application
│   └── src/components/  # React components
├── backend/             # Python FastAPI backend
│   ├── main.py         # FastAPI application
│   └── requirements.txt # Python dependencies
└── package.json         # Main project configuration
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   pip install -r backend/requirements.txt
   ```

2. Run in development:
   ```bash
   npm run dev:frontend  # Start React dev server
   npm run dev           # Start Electron app
   ```

## Development

- Frontend: React with basic routing and components
- Backend: FastAPI with SQLAlchemy and pandas
- Desktop: Electron for native app packaging 