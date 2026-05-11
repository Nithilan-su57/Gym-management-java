from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from typing import List, Optional

app = FastAPI()

# Enable CORS so your app.js (running on a different port/file) can communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration: Java Spring Boot Backend URL
JAVA_BACKEND_URL = "http://localhost:8080/api"

# --- Pydantic Models for JSON Requests ---

class MemberRequest(BaseModel):
    name: str
    email: str
    phoneNumber: str
    membershipPlan: str  # Frontend sends plan name string

class PlanRequest(BaseModel):
    planName: str
    basePrice: float
    discountPercentage: float = 0.0
    features: Optional[str] = "Standard gym access"

# --- 1. Member Routes (/api/members) ---

@app.get("/members/all")
async def get_all_members():
    """Fetches all members from Java MemberController[cite: 7]"""
    response = requests.get(f"{JAVA_BACKEND_URL}/members/all")
    return response.json()

@app.post("/members/register")
async def register_member(member: MemberRequest):
    """Proxies registration to Java MemberController[cite: 7]"""
    # Note: Java backend expects a plan object or ID. 
    # We map the string planName to the format Java expects.
    payload = {
        "name": member.name,
        "email": member.email,
        "phoneNumber": member.phoneNumber,
        "membershipPlan": {"planName": member.membershipPlan} 
    }
    response = requests.post(f"{JAVA_BACKEND_URL}/members/register", json=payload)
    return response.json()

@app.get("/members/{member_id}/access")
async def check_access(member_id: int):
    """Checks access via Java MemberController[cite: 7]"""
    response = requests.get(f"{JAVA_BACKEND_URL}/members/{member_id}/access")
    return response.text  # Returns "Access Granted" or "Access Denied"

@app.post("/members/{member_id}/renew")
async def renew_membership(member_id: int, months: int = Query(...)):
    """Renews membership via Java MemberController[cite: 7]"""
    response = requests.post(f"{JAVA_BACKEND_URL}/members/{member_id}/renew", params={"months": months})
    return response.json()

# --- 2. Plan Routes (/api/plans) ---

@app.get("/plans/all")
async def get_all_plans():
    """Fetches all plans from Java MembershipPlanController[cite: 8]"""
    response = requests.get(f"{JAVA_BACKEND_URL}/plans/all")
    return response.json()

@app.post("/plans/create")
async def create_plan(plan: PlanRequest):
    """Creates plan via Java MembershipPlanController[cite: 8]"""
    response = requests.post(f"{JAVA_BACKEND_URL}/plans/create", json=plan.dict())
    return response.json()

@app.put("/plans/{plan_id}/set-discount")
async def set_discount(plan_id: int, discount: float = Query(...)):
    """Updates discount via Java MembershipPlanController[cite: 8]"""
    response = requests.put(f"{JAVA_BACKEND_URL}/plans/{plan_id}/set-discount", params={"discount": discount})
    return response.json()

# --- 3. Manager Routes (/api/manager) ---

@app.get("/manager/report")
async def get_report():
    """Fetches revenue report from Java GymManagerController[cite: 6]"""
    response = requests.get(f"{JAVA_BACKEND_URL}/manager/report")
    return response.text

@app.delete("/manager/cleanup")
async def cleanup_expired():
    """Triggers expired member removal in Java GymManagerController[cite: 6]"""
    response = requests.delete(f"{JAVA_BACKEND_URL}/manager/cleanup")
    return response.text

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)