import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router

DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:3000"


def cors_origins() -> list[str]:
    return [o.strip() for o in os.getenv("CORS_ORIGINS", DEFAULT_ORIGINS).split(",") if o.strip()]


app = FastAPI(title="kids-mini-game records")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
