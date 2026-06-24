from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes import auth, users, applications, thesis, documents, lifecycle, announcements, settings, moms

app = FastAPI(title="Ph.D. Management System API")

# Configure CORS so the frontend can safely talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(applications.router)
app.include_router(thesis.router)
app.include_router(documents.router)
app.include_router(lifecycle.router)
app.include_router(announcements.router)
app.include_router(settings.router)
app.include_router(moms.router)

import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Welcome to the Ph.D. Management System API. Go to /docs for the interactive Swagger UI."}
