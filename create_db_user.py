import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["phd_portal"]
    
    admin_db = client["admin"]
    
    try:
        await admin_db.command({
            "createUser": "phd_admin",
            "pwd": "SecurePhd2026!",
            "roles": [
                {"role": "userAdminAnyDatabase", "db": "admin"},
                {"role": "readWriteAnyDatabase", "db": "admin"}
            ]
        })
        print("Successfully created master admin user: phd_admin")
    except Exception as e:
        print("User creation error (maybe it already exists?):", e)

if __name__ == "__main__":
    asyncio.run(main())
