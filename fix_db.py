import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["phd_portal"]
    
    # 1. Provide 'is_approved' = True to everyone who doesn't have it (existing accounts)
    result = await db["users"].update_many({"is_approved": {"$exists": False}}, {"$set": {"is_approved": True}})
    print(f"Updated legacy accounts: {result.modified_count}")
    
    # 2. Re-approve ANY user whose role is BUTR to ensure the user isn't locked out of the new BUTR account they made
    result2 = await db["users"].update_many({"role": "BUTR"}, {"$set": {"is_approved": True}})
    print(f"Re-approved BUTR users: {result2.modified_count}")

if __name__ == "__main__":
    asyncio.run(main())
