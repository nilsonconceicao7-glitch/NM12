from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Mega12 - Sistema de Rifas", version="1.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== MODELS ====================

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    total_spent: float = 0.0

class UserCreate(BaseModel):
    phone: str
    name: Optional[str] = None

class Prize(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    value: float
    type: str  # "money", "product"
    image_url: Optional[str] = None
    is_available: bool = True

class Raffle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: str
    price_per_ticket: float
    total_tickets: int
    sold_tickets: int = 0
    draw_date: Optional[datetime] = None
    status: str = "active"  # active, completed, cancelled
    prizes: List[Prize] = []
    bonus_boxes: List[dict] = []  # {quantity: int, boxes: int}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RaffleCreate(BaseModel):
    title: str
    description: str
    image_url: str
    price_per_ticket: float
    total_tickets: int
    draw_date: Optional[datetime] = None
    prizes: List[Prize] = []
    bonus_boxes: List[dict] = []

class Purchase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    raffle_id: str
    tickets: List[int]  # números comprados
    quantity: int
    total_amount: float
    payment_status: str = "pending"  # pending, paid, failed
    bonus_boxes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PurchaseCreate(BaseModel):
    user_id: str
    raffle_id: str
    quantity: int

class Winner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_phone: str
    raffle_id: str
    raffle_title: str
    prize_name: str
    winning_number: int
    date: datetime = Field(default_factory=datetime.utcnow)

# ==================== UTILITY FUNCTIONS ====================

def generate_ticket_numbers(raffle_id: str, quantity: int, existing_tickets: List[int]) -> List[int]:
    """Gera números aleatórios disponíveis para a rifa"""
    available = [i for i in range(1, 10001) if i not in existing_tickets]
    if len(available) < quantity:
        raise HTTPException(status_code=400, detail="Não há números suficientes disponíveis")
    return random.sample(available, quantity)

def calculate_bonus_boxes(quantity: int, bonus_rules: List[dict]) -> int:
    """Calcula quantas caixas bônus o usuário ganha"""
    bonus = 0
    for rule in sorted(bonus_rules, key=lambda x: x['quantity'], reverse=True):
        if quantity >= rule['quantity']:
            bonus = rule['boxes']
            break
    return bonus


# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Mega12 - Sistema de Rifas API", "version": "1.0"}

# ==================== USERS ====================

@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    # Verifica se usuário já existe
    existing = await db.users.find_one({"phone": user.phone})
    if existing:
        return User(**existing)
    
    user_obj = User(**user.dict())
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return User(**user)

# ==================== RAFFLES ====================

@api_router.get("/raffles", response_model=List[Raffle])
async def get_active_raffles():
    raffles = await db.raffles.find({"status": "active"}).to_list(100)
    return [Raffle(**raffle) for raffle in raffles]

@api_router.get("/raffles/{raffle_id}", response_model=Raffle)
async def get_raffle(raffle_id: str):
    raffle = await db.raffles.find_one({"id": raffle_id})
    if not raffle:
        raise HTTPException(status_code=404, detail="Rifa não encontrada")
    return Raffle(**raffle)

@api_router.post("/raffles", response_model=Raffle)
async def create_raffle(raffle: RaffleCreate):
    raffle_obj = Raffle(**raffle.dict())
    await db.raffles.insert_one(raffle_obj.dict())
    return raffle_obj

@api_router.get("/raffles/{raffle_id}/tickets")
async def get_raffle_tickets(raffle_id: str):
    """Retorna todos os números vendidos de uma rifa"""
    purchases = await db.purchases.find({"raffle_id": raffle_id, "payment_status": "paid"}).to_list(1000)
    sold_tickets = []
    for purchase in purchases:
        sold_tickets.extend(purchase["tickets"])
    return {"sold_tickets": sold_tickets}

# ==================== PURCHASES ====================

@api_router.post("/purchases", response_model=Purchase)
async def create_purchase(purchase: PurchaseCreate):
    # Busca a rifa
    raffle = await db.raffles.find_one({"id": purchase.raffle_id})
    if not raffle:
        raise HTTPException(status_code=404, detail="Rifa não encontrada")
    
    raffle_obj = Raffle(**raffle)
    
    # Busca números já vendidos
    existing_purchases = await db.purchases.find({"raffle_id": purchase.raffle_id, "payment_status": "paid"}).to_list(1000)
    existing_tickets = []
    for p in existing_purchases:
        existing_tickets.extend(p["tickets"])
    
    # Gera números
    try:
        tickets = generate_ticket_numbers(purchase.raffle_id, purchase.quantity, existing_tickets)
    except HTTPException as e:
        raise e
    
    # Calcula bônus
    bonus_boxes = calculate_bonus_boxes(purchase.quantity, raffle_obj.bonus_boxes)
    
    # Cria compra
    purchase_obj = Purchase(
        user_id=purchase.user_id,
        raffle_id=purchase.raffle_id,
        tickets=tickets,
        quantity=purchase.quantity,
        total_amount=purchase.quantity * raffle_obj.price_per_ticket,
        bonus_boxes=bonus_boxes,
        payment_status="paid"  # Simulando pagamento aprovado
    )
    
    await db.purchases.insert_one(purchase_obj.dict())
    
    # Atualiza tickets vendidos da rifa
    await db.raffles.update_one(
        {"id": purchase.raffle_id},
        {"$inc": {"sold_tickets": purchase.quantity}}
    )
    
    return purchase_obj

@api_router.get("/purchases/user/{user_id}")
async def get_user_purchases(user_id: str):
    purchases = await db.purchases.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return purchases

@api_router.get("/purchases/raffle/{raffle_id}")
async def get_raffle_purchases(raffle_id: str):
    purchases = await db.purchases.find({"raffle_id": raffle_id, "payment_status": "paid"}).to_list(1000)
    return purchases

# ==================== RANKINGS ====================

@api_router.get("/rankings/top-buyers")
async def get_top_buyers():
    """Top compradores geral"""
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {
            "_id": "$user_id",
            "total_tickets": {"$sum": "$quantity"},
            "total_spent": {"$sum": "$total_amount"}
        }},
        {"$sort": {"total_tickets": -1}},
        {"$limit": 10}
    ]
    
    result = await db.purchases.aggregate(pipeline).to_list(10)
    
    # Busca dados dos usuários
    for item in result:
        user = await db.users.find_one({"id": item["_id"]})
        if user:
            item["user_phone"] = user["phone"]
            item["user_name"] = user.get("name", user["phone"])
    
    return result

@api_router.get("/rankings/daily-buyers")
async def get_daily_top_buyers():
    """Top compradores do dia"""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    pipeline = [
        {"$match": {
            "payment_status": "paid",
            "created_at": {"$gte": today}
        }},
        {"$group": {
            "_id": "$user_id",
            "total_tickets": {"$sum": "$quantity"},
            "total_spent": {"$sum": "$total_amount"}
        }},
        {"$sort": {"total_tickets": -1}},
        {"$limit": 10}
    ]
    
    result = await db.purchases.aggregate(pipeline).to_list(10)
    
    # Busca dados dos usuários
    for item in result:
        user = await db.users.find_one({"id": item["_id"]})
        if user:
            item["user_phone"] = user["phone"]
            item["user_name"] = user.get("name", user["phone"])
    
    return result

# ==================== WINNERS ====================

@api_router.get("/winners", response_model=List[Winner])
async def get_winners():
    winners = await db.winners.find().sort("date", -1).to_list(50)
    return [Winner(**winner) for winner in winners]

@api_router.post("/winners", response_model=Winner)
async def create_winner(winner: Winner):
    await db.winners.insert_one(winner.dict())
    return winner

# ==================== STATS ====================

@api_router.get("/stats")
async def get_stats():
    total_raffles = await db.raffles.count_documents({})
    active_raffles = await db.raffles.count_documents({"status": "active"})
    total_users = await db.users.count_documents({})
    total_purchases = await db.purchases.count_documents({"payment_status": "paid"})
    
    return {
        "total_raffles": total_raffles,
        "active_raffles": active_raffles,
        "total_users": total_users,
        "total_purchases": total_purchases
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()