from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List

# 1. Database Setup (Creates a local file 'gym.db')
SQLALCHEMY_DATABASE_URL = "sqlite:///./gym.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Database Models
class Plan(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True) # Monthly, Quarterly, Yearly
    price = Column(Float)
    discount = Column(Float)

class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    plan_name = Column(String)

Base.metadata.create_all(bind=engine)

# 3. FastAPI App
app = FastAPI(title="Gym Management API")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINTS FOR FRONTEND DEVS ---

@app.post("/plans/")
def create_plan(name: str, price: float, discount: float, db: Session = Depends(get_db)):
    db_plan = Plan(name=name, price=price, discount=discount)
    db.add(db_plan)
    db.commit()
    return {"message": "Plan Created", "data": db_plan}

@app.post("/register/")
def register_member(name: str, email: str, plan_name: str, db: Session = Depends(get_db)):
    # Verify plan exists
    plan = db.query(Plan).filter(Plan.name == plan_name).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan name not found in system")
    
    new_member = Member(name=name, email=email, plan_name=plan_name)
    db.add(new_member)
    db.commit()
    return {"message": "Member Registered", "member": name}

@app.get("/report/")
def revenue_report(db: Session = Depends(get_db)):
    members = db.query(Member).all()
    total_revenue = 0.0
    
    for m in members:
        plan = db.query(Plan).filter(Plan.name == m.plan_name).first()
        if plan:
            # Calculation: Price - Discount%
            final_price = plan.price * (1 - (plan.discount / 100))
            total_revenue += final_price
            
    return {
        "total_members": len(members),
        "total_revenue": round(total_revenue, 2),
        "currency": "INR"
    }

@app.get("/members/")
def list_members(db: Session = Depends(get_db)):
    return db.query(Member).all()