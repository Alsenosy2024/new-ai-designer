import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import BASE_DIR, CORS_ORIGINS, STORAGE_DIR
from app.db import Base, engine
from app.routes.auth import router as auth_router
from app.routes.state import router as state_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Designer API", version="0.1.0")

origins = [origin.strip() for origin in CORS_ORIGINS if origin.strip()]
allow_credentials = False if "*" in origins else True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(state_router)
app.include_router(auth_router)

os.makedirs(STORAGE_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=STORAGE_DIR), name="files")

static_dir = os.path.abspath(os.path.join(BASE_DIR, ".."))
if os.path.isfile(os.path.join(static_dir, "index.html")):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
