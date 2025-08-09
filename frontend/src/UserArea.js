import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== USER STATS COMPONENT ====================

const UserStats = ({ user, userPurchases }) => {
  const totalTickets = userPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const totalSpent = userPurchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);
  const activeRaffles = [...new Set(userPurchases.map(p => p.raffle_id))].length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">🎫</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Números Comprados</p>
            <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Investido</p>
            <p className="text-2xl font-bold text-gray-900">R$ {totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-2xl">🎲</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Rifas Participando</p>
            <p className="text-2xl font-bold text-gray-900">{activeRaffles}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== PURCHASE ITEM COMPONENT ====================

const PurchaseItem = ({ purchase, raffle }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {raffle && (
            <img 
              src={raffle.image_url} 
              alt={raffle.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-900">
              {raffle ? raffle.title : "Rifa não encontrada"}
            </h3>
            <p className="text-sm text-gray-500">
              Compra realizada em {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
            </p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600 mr-4">
                {purchase.quantity} números
              </span>
              <span className="text-sm font-bold text-purple-600">
                R$ {purchase.total_amount.toFixed(2)}
              </span>
              {purchase.bonus_boxes > 0 && (
                <span className="ml-4 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  +{purchase.bonus_boxes} caixas bônus
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            purchase.payment_status === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {purchase.payment_status === 'paid' ? 'Pago' : 'Pendente'}
          </span>
        </div>
      </div>
      
      {purchase.payment_status === 'paid' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Seus Números:</h4>
          <div className="flex flex-wrap gap-2">
            {purchase.tickets.slice(0, 20).map((ticket) => (
              <span 
                key={ticket} 
                className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-bold min-w-[60px] text-center"
              >
                {ticket.toString().padStart(6, '0')}
              </span>
            ))}
            {purchase.tickets.length > 20 && (
              <span className="text-gray-500 text-sm px-2 py-1">
                +{purchase.tickets.length - 20} mais
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== RANKINGS COMPONENT ====================

const Rankings = ({ topBuyers, dailyBuyers }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Geral */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🏆</span>
          Top Compradores - Geral
        </h3>
        
        <div className="space-y-3">
          {topBuyers.slice(0, 10).map((buyer, index) => (
            <div key={buyer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-500 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {buyer.user_name || buyer.user_phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    {buyer.total_tickets} números
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">
                  R$ {buyer.total_spent.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Diário */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🔥</span>
          Top Compradores - Hoje
        </h3>
        
        <div className="space-y-3">
          {dailyBuyers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma compra hoje ainda
            </p>
          ) : (
            dailyBuyers.slice(0, 10).map((buyer, index) => (
              <div key={buyer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {buyer.user_name || buyer.user_phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      {buyer.total_tickets} números hoje
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">
                    R$ {buyer.total_spent.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN USER AREA COMPONENT ====================

const UserArea = ({ user }) => {
  const [userPurchases, setUserPurchases] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [dailyBuyers, setDailyBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases');

  useEffect(() => {
    if (user) {
      loadUserData();
      loadRankings();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [purchasesResponse, rafflesResponse] = await Promise.all([
        axios.get(`${API}/purchases/user/${user.id}`),
        axios.get(`${API}/raffles`)
      ]);
      
      setUserPurchases(purchasesResponse.data);
      setRaffles(rafflesResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async () => {
    try {
      const [topResponse, dailyResponse] = await Promise.all([
        axios.get(`${API}/rankings/top-buyers`),
        axios.get(`${API}/rankings/daily-buyers`)
      ]);
      
      setTopBuyers(topResponse.data);
      setDailyBuyers(dailyResponse.data);
    } catch (error) {
      console.error("Erro ao carregar rankings:", error);
    }
  };

  const getRaffleById = (raffleId) => {
    return raffles.find(r => r.id === raffleId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-xl font-bold text-gray-600">Faça login para acessar sua área</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <div className="text-xl font-bold text-gray-600">Carregando sua área...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-600 mr-2">👤</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Olá, {user.name || user.phone}!
                </h1>
                <p className="text-gray-600">Sua área pessoal no Mega12</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'purchases'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Minhas Compras
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rankings'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rankings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'purchases' && (
          <>
            <UserStats user={user} userPurchases={userPurchases} />
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Histórico de Compras
              </h2>
              
              {userPurchases.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-6xl mb-4">🎫</div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    Nenhuma compra realizada
                  </h3>
                  <p className="text-gray-500">
                    Participe das rifas para aparecer aqui!
                  </p>
                </div>
              ) : (
                <div>
                  {userPurchases.map((purchase) => (
                    <PurchaseItem 
                      key={purchase.id} 
                      purchase={purchase} 
                      raffle={getRaffleById(purchase.raffle_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'rankings' && (
          <Rankings topBuyers={topBuyers} dailyBuyers={dailyBuyers} />
        )}
      </main>
    </div>
  );
};

export default UserArea;