```
# Live DDoS Attack Map

A real-time DDoS attack visualization dashboard built with FastAPI and React. The application collects attack intelligence, processes geolocation data, and displays live attack traffic on an interactive 3D globe using WebSockets.

## Features

- Real-time DDoS attack visualization
- Interactive 3D globe
- Live attack feed
- WebSocket-based updates
- IP geolocation
- Threat confidence scoring
- Traffic trend charts
- Layer 3 protocol statistics
- Mock data support for development

## Tech Stack

- Frontend: React, Vite
- Backend: FastAPI
- WebSockets
- globe.gl (Three.js)
- Recharts
- Pydantic
- httpx
- AbuseIPDB API
- Cloudflare Radar API
- ip-api.com

## Project Structure

```

Live-DDoS-Attack-Map/
├── backend/
├── frontend/
└── README.md

````

## Installation

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate    # Linux/macOS
# or
venv\Scripts\activate       # Windows

pip install -r requirements.txt

uvicorn main:app --reload
````

### Frontend

```bash
cd frontend

npm install
npm run dev
```

## Configuration

Create a `.env` file inside the backend directory and add the required API keys.

```env
ABUSEIPDB_API_KEY=your_api_key
CLOUDFLARE_API_TOKEN=your_api_token
```

The application can also run with mock data if API keys are not provided.

## API Endpoints

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| GET    | `/`                    | Health check          |
| GET    | `/api/attacks/arcs`    | Get attack arcs       |
| GET    | `/api/attacks/stats`   | Get statistics        |
| POST   | `/api/attacks/refresh` | Refresh attack data   |
| GET    | `/api/trends/http`     | HTTP traffic trends   |
| GET    | `/api/trends/layer3`   | Layer 3 protocol data |
| WS     | `/ws`                  | WebSocket endpoint    |

## Future Improvements

* Database persistence
* User authentication
* Historical attack replay
* Docker support
* Deployment configuration
* Alert notifications

## License

This project is licensed under the MIT License.

```
```
