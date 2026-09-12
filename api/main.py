from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api_call import router as api_routes

app=FastAPI()

origins=["http://localhost:3000"]

#allowed links,headers,methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_routes)