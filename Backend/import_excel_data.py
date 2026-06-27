import asyncio
import pandas as pd
from config import db, client
from auth_utils import get_password_hash
from models.application import AdmissionLevel, ApplicationStatus, PetResult, PaymentStatus
from models.user import UserRole
import uuid
from datetime import datetime

async def import_data():
    file_path = r'D:\FInal year project\files\Status for MGMU PET-2024 Admitted.xlsx'
    print(f"Reading Excel file from {file_path}...")
    
    # Header is at row 6 (0-indexed 6 is row 7)
    df = pd.read_excel(file_path, header=6)
    
    # Strip column names
    df.columns = df.columns.str.strip()
    
    # Drop rows where 'Candidate Name' is NaN
    if 'Candidate Name' not in df.columns:
        print("Column 'Candidate Name' not found in Excel sheet. Available columns:", df.columns)
        return

    df = df.dropna(subset=['Candidate Name'])
    
    users_collection = db["users"]
    apps_collection = db["applications"]
    
    success_count = 0
    
    for index, row in df.iterrows():
        candidate_name = str(row['Candidate Name']).strip()
        faculty = str(row.get('Name of Faculty', '')).strip()
        subject = str(row.get('Subject', '')).strip()
        
        # Parse scores
        raw_marks = pd.to_numeric(row.get('Obtained Marks (Out of 200)'), errors='coerce')
        normalized_marks = pd.to_numeric(row.get('PET- 100%'), errors='coerce')
        pet_weightage = pd.to_numeric(row.get(0.7), errors='coerce')  # 0.7 column
        fwc_weightage = pd.to_numeric(row.get(0.3), errors='coerce')  # 0.3 column
        total_score = pd.to_numeric(row.get('Total    (6+7)'), errors='coerce')
        
        status_raw = str(row.get('Admitted/Not Admitted', '')).strip().upper()
        
        # Create Email
        name_parts = candidate_name.lower().replace(" ", ".")
        email = f"{name_parts}@example.com"
        
        # Check if user exists
        existing_user = await users_collection.find_one({"email": email})
        if existing_user:
            print(f"User {email} already exists. Skipping.")
            continue
            
        print(f"Processing candidate: {candidate_name} ({status_raw})")
        
        # Create User Document
        user_doc = {
            "email": email,
            "name": candidate_name,
            "password": get_password_hash("password123"),
            "role": UserRole.STUDENT.value,
            "department": faculty,
            "research_area": subject,
            "is_approved": True, # Automatically approve imported students
            "faculty_roles": []
        }
        
        user_result = await users_collection.insert_one(user_doc)
        user_id = str(user_result.inserted_id)
        
        # Determine Admission Logic
        if status_raw == 'ADMITTED':
            current_level = AdmissionLevel.ADMISSION_COMPLETE.value
            app_status = ApplicationStatus.ENROLLED.value
            pet_res = PetResult.PASSED.value
            
            # If total_score is NaN but we have raw_marks, recalculate
            if pd.isna(total_score) and not pd.isna(raw_marks):
                normalized = raw_marks / 2.0
                p_weight = normalized * 0.7
                f_weight = fwc_weightage if not pd.isna(fwc_weightage) else 0.0
                tot = p_weight + f_weight
            else:
                normalized = normalized_marks if not pd.isna(normalized_marks) else (raw_marks/2.0 if not pd.isna(raw_marks) else 0.0)
                p_weight = pet_weightage if not pd.isna(pet_weightage) else (normalized * 0.7)
                f_weight = fwc_weightage if not pd.isna(fwc_weightage) else 0.0
                tot = total_score if not pd.isna(total_score) else (p_weight + f_weight)

            # Reconstruct FWC Marks (fwc_marks * 0.3 = f_weight) -> fwc_marks = f_weight / 0.3
            f_marks = f_weight / 0.3 if f_weight > 0 else 0.0
                
        else:
            current_level = AdmissionLevel.REJECTED.value
            app_status = ApplicationStatus.REJECTED.value
            pet_res = PetResult.FAILED.value
            normalized = raw_marks / 2.0 if not pd.isna(raw_marks) else 0.0
            p_weight = 0.0
            f_weight = 0.0
            f_marks = 0.0
            tot = 0.0

        # Create Application Document
        app_doc = {
            "studentId": user_id,
            "current_level": current_level,
            "status": app_status,
            "documents": [],
            "submittedAt": datetime.utcnow(),
            "paymentStatus": PaymentStatus.PAID.value,
            
            "pet_result": pet_res,
            "pet_raw_marks": float(raw_marks) if not pd.isna(raw_marks) else None,
            "pet_normalized_marks": float(normalized) if not pd.isna(normalized) else None,
            "pet_merit_weightage": float(p_weight) if not pd.isna(p_weight) else None,
            
            "fwc_marks": float(f_marks) if not pd.isna(f_marks) else None,
            "fwc_merit_weightage": float(f_weight) if not pd.isna(f_weight) else None,
            
            "total_merit_score": float(tot) if not pd.isna(tot) else None,
        }
        
        await apps_collection.insert_one(app_doc)
        success_count += 1
        
    print(f"\n--- Import Complete ---")
    print(f"Successfully imported {success_count} students.")
    
    # Close MongoDB client
    client.close()

if __name__ == "__main__":
    asyncio.run(import_data())
