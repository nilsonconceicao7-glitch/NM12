import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import from server
sys.path.append(str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def create_sample_raffles():
    """Cria rifas de exemplo para testar o sistema"""
    
    # Limpa rifas existentes
    await db.raffles.delete_many({})
    
    sample_raffles = [
        {
            "id": "rifa-iphone-15",
            "title": "iPhone 15 Pro Max 256GB",
            "description": "iPhone 15 Pro Max 256GB Titânio Natural + Carregador + Capinha",
            "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=300&fit=crop",
            "price_per_ticket": 5.0,
            "total_tickets": 2000,
            "sold_tickets": 347,
            "draw_date": datetime.utcnow() + timedelta(days=7),
            "status": "active",
            "prizes": [
                {
                    "id": "prize-iphone",
                    "name": "iPhone 15 Pro Max 256GB",
                    "value": 8999.0,
                    "type": "product",
                    "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop",
                    "is_available": True
                }
            ],
            "bonus_boxes": [
                {"quantity": 100, "boxes": 1},
                {"quantity": 200, "boxes": 2},
                {"quantity": 500, "boxes": 5}
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": "rifa-dinheiro-10k",
            "title": "R$ 10.000 em Dinheiro",
            "description": "R$ 10 mil reais via PIX para o ganhador! Valor líquido sem descontos.",
            "image_url": "https://images.unsplash.com/photo-1554672723-d42a16e533db?w=500&h=300&fit=crop",
            "price_per_ticket": 2.0,
            "total_tickets": 5000,
            "sold_tickets": 1243,
            "draw_date": datetime.utcnow() + timedelta(days=5),
            "status": "active",
            "prizes": [
                {
                    "id": "prize-10k",
                    "name": "R$ 10.000,00",
                    "value": 10000.0,
                    "type": "money",
                    "image_url": "https://images.unsplash.com/photo-1554672723-d42a16e533db?w=300&h=300&fit=crop",
                    "is_available": True
                }
            ],
            "bonus_boxes": [
                {"quantity": 50, "boxes": 1},
                {"quantity": 100, "boxes": 2},
                {"quantity": 300, "boxes": 5},
                {"quantity": 1000, "boxes": 10}
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": "rifa-notebook-gamer",
            "title": "Notebook Gamer RTX 4060",
            "description": "Notebook Gamer Acer Nitro 5 RTX 4060 16GB RAM 512GB SSD",
            "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=300&fit=crop",
            "price_per_ticket": 10.0,
            "total_tickets": 1000,
            "sold_tickets": 156,
            "draw_date": datetime.utcnow() + timedelta(days=10),
            "status": "active",
            "prizes": [
                {
                    "id": "prize-notebook",
                    "name": "Notebook Gamer RTX 4060",
                    "value": 4999.0,
                    "type": "product",
                    "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=300&fit=crop",
                    "is_available": True
                }
            ],
            "bonus_boxes": [
                {"quantity": 50, "boxes": 1},
                {"quantity": 100, "boxes": 3},
                {"quantity": 200, "boxes": 6}
            ],
            "created_at": datetime.utcnow()
        },
        {
            "id": "rifa-multiple-premios",
            "title": "Múltiplos Prêmios - Caixinha",
            "description": "Raspadinha com múltiplos prêmios! R$ 50 a R$ 1000 + produtos especiais",
            "image_url": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop",
            "price_per_ticket": 1.0,
            "total_tickets": 10000,
            "sold_tickets": 2847,
            "draw_date": datetime.utcnow() + timedelta(days=3),
            "status": "active",
            "prizes": [
                {
                    "id": "prize-50",
                    "name": "R$ 50,00",
                    "value": 50.0,
                    "type": "money",
                    "is_available": True
                },
                {
                    "id": "prize-100",
                    "name": "R$ 100,00",
                    "value": 100.0,
                    "type": "money",
                    "is_available": True
                },
                {
                    "id": "prize-200",
                    "name": "R$ 200,00",
                    "value": 200.0,
                    "type": "money",
                    "is_available": True
                },
                {
                    "id": "prize-500",
                    "name": "R$ 500,00",
                    "value": 500.0,
                    "type": "money",
                    "is_available": True
                },
                {
                    "id": "prize-1000",
                    "name": "R$ 1.000,00",
                    "value": 1000.0,
                    "type": "money",
                    "is_available": True
                }
            ],
            "bonus_boxes": [
                {"quantity": 100, "boxes": 1},
                {"quantity": 500, "boxes": 3},
                {"quantity": 1000, "boxes": 6},
                {"quantity": 3000, "boxes": 15}
            ],
            "created_at": datetime.utcnow()
        }
    ]
    
    # Insere as rifas
    for raffle in sample_raffles:
        await db.raffles.insert_one(raffle)
        print(f"✅ Rifa criada: {raffle['title']}")
    
    print(f"\n🎉 {len(sample_raffles)} rifas de exemplo criadas com sucesso!")
    
    # Cria alguns ganhadores de exemplo
    sample_winners = [
        {
            "id": "winner-1",
            "user_id": "user-joao",
            "user_phone": "(11) 99999-1234",
            "raffle_id": "rifa-finalizada-1",
            "raffle_title": "iPhone 14 Pro",
            "prize_name": "iPhone 14 Pro 128GB",
            "winning_number": 1547,
            "date": datetime.utcnow() - timedelta(days=2)
        },
        {
            "id": "winner-2",
            "user_id": "user-maria",
            "user_phone": "(21) 99999-5678",
            "raffle_id": "rifa-finalizada-2",
            "raffle_title": "R$ 5.000 em Dinheiro",
            "prize_name": "R$ 5.000,00",
            "winning_number": 892,
            "date": datetime.utcnow() - timedelta(days=5)
        },
        {
            "id": "winner-3",
            "user_id": "user-carlos",
            "user_phone": "(31) 99999-9012",
            "raffle_id": "rifa-finalizada-3",
            "raffle_title": "PlayStation 5",
            "prize_name": "PlayStation 5 + 2 Jogos",
            "winning_number": 3421,
            "date": datetime.utcnow() - timedelta(days=7)
        }
    ]
    
    # Limpa ganhadores existentes e insere novos
    await db.winners.delete_many({})
    for winner in sample_winners:
        await db.winners.insert_one(winner)
        print(f"🏆 Ganhador criado: {winner['user_phone']} - {winner['prize_name']}")
    
    print(f"\n🎊 {len(sample_winners)} ganhadores de exemplo criados!")

async def main():
    """Função principal"""
    print("🎲 Criando dados de exemplo para o Mega12...")
    print("=" * 50)
    
    try:
        await create_sample_raffles()
        print("\n✅ Dados de exemplo criados com sucesso!")
        print("🌐 Acesse o frontend para ver as rifas!")
    except Exception as e:
        print(f"❌ Erro ao criar dados: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())