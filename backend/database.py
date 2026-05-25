from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB  = os.getenv("MONGODB_DB", "skillbridge")

client: AsyncIOMotorClient = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(MONGODB_URL)
    print(f"✅ Connected to MongoDB: {MONGODB_URL}/{MONGODB_DB}")

async def close_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")

def get_db():
    return client[MONGODB_DB]

# Collection helpers
def col_students():    return get_db()["students"]
def col_assessments(): return get_db()["assessments"]
def col_roadmaps():    return get_db()["roadmaps"]
def col_results():     return get_db()["assessment_results"]
