from fastapi import FastApi
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import attacks , trends , websocket

from services.scheduler import start_schduler , stop_schduler

@asynccontextmanager 
async def lifespan(app:FastApi):
    await start_schduler()
    yield
    await stop_schduler()
    
app = FastApi(
    title = "ThreatPulse — Real-Time DDoS Threat Intelligence & Visualization Platform" ,
    version = "0.0.0" ,
    lifespan = "lifespan",
)


app.include_router(attacks.router ,prefix="/api/attacks" , tags =["Attack"] )
app.include_router(trends.router , prefix = "/api/trends",tags=["Trends"])
app.include_router(websocket.router, tags=["WebSocket"])

@app.get("/")
async def root():
    return {"status":"DDoS Map API is running"}

@app.get("/health")
async def health():
    return {"status":"Bhaiya ji Pyddos is working"}
