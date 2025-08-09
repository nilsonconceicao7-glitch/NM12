import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== HEADER COMPONENT ====================

const Header = ({ user, setUser }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone) return;

    try {
      const response = await axios.post(`${API}/users`, { phone });
      setUser(response.data);
      setShowLogin(false);
      setPhone("");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">🎲</div>
            <h1 className="text-2xl font-bold">MEGA12</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Olá, {user.name || user.phone}</span>
                <button 
                  onClick={() => setUser(null)}
                  className="text-xs bg-white/20 px-2 py-1 rounded"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Entrar no Mega12</h2>
            <form onSubmit={handleLogin}>
              <input
                type="tel"
                placeholder="Digite seu telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 text-gray-800"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

// ==================== RAFFLE CARD COMPONENT ====================

const RaffleCard = ({ raffle, onBuy }) => {
  const progress = (raffle.sold_tickets / raffle.total_tickets) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <img 
          src={raffle.image_url} 
          alt={raffle.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          {progress.toFixed(1)}% vendido
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{raffle.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{raffle.description}</p>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{raffle.sold_tickets} vendidos</span>
            <span>{raffle.total_tickets} total</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-purple-600">
            R$ {raffle.price_per_ticket.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">por número</span>
        </div>
        
        <button 
          onClick={() => onBuy(raffle)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          🎯 Participar Agora!
        </button>
      </div>
    </div>
  );
};

// ==================== PURCHASE MODAL COMPONENT ====================

const PurchaseModal = ({ raffle, user, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);

  const quickQuantities = [10, 50, 100, 200, 500, 1000];
  const total = quantity * raffle.price_per_ticket;

  const getBonusBoxes = (qty) => {
    for (let bonus of raffle.bonus_boxes.sort((a, b) => b.quantity - a.quantity)) {
      if (qty >= bonus.quantity) {
        return bonus.boxes;
      }
    }
    return 0;
  };

  const handlePurchase = async () => {
    if (!user) {
      alert("Faça login para continuar");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/purchases`, {
        user_id: user.id,
        raffle_id: raffle.id,
        quantity: quantity
      });
      
      onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error("Erro na compra:", error);
      alert("Erro ao processar compra. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Participar da Rifa</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <img 
              src={raffle.image_url} 
              alt={raffle.title}
              className="w-full h-32 object-cover rounded-lg"
            />
            <h3 className="font-bold mt-2">{raffle.title}</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de números:
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {quickQuantities.map((qty) => (
              <button
                key={qty}
                onClick={() => setQuantity(qty)}
                className={`p-2 rounded-lg border text-sm font-medium ${
                  quantity === qty 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                +{qty}
              </button>
            ))}
          </div>
          
          {getBonusBoxes(quantity) > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">🎁</span>
                <span className="text-sm font-medium text-yellow-800">
                  Você ganha {getBonusBoxes(quantity)} caixa(s) bônus!
                </span>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Quantidade:</span>
              <span className="font-bold">{quantity} números</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Valor unitário:</span>
              <span>R$ {raffle.price_per_ticket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-purple-600">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handlePurchase}
            disabled={loading || !user}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Processando..." : "💳 Finalizar Compra"}
          </button>
          
          {!user && (
            <p className="text-center text-sm text-red-500 mt-2">
              Faça login para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SUCCESS MODAL COMPONENT ====================

const SuccessModal = ({ purchase, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Parabéns!</h2>
          <p className="text-gray-600 mb-4">Sua compra foi realizada com sucesso!</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">Seus números:</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {purchase.tickets.slice(0, 10).map((ticket) => (
                <span key={ticket} className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-bold">
                  {ticket.toString().padStart(4, '0')}
                </span>
              ))}
              {purchase.tickets.length > 10 && (
                <span className="text-gray-500 text-sm">
                  +{purchase.tickets.length - 10} mais
                </span>
              )}
            </div>
          </div>
          
          {purchase.bonus_boxes > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center">
                <span className="text-yellow-600 mr-2">🎁</span>
                <span className="text-sm font-medium text-yellow-800">
                  Você ganhou {purchase.bonus_boxes} caixa(s) bônus!
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN HOME COMPONENT ====================

const Home = ({ user, setUser }) => {
  const [raffles, setRaffles] = useState([]);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [successPurchase, setSuccessPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      const response = await axios.get(`${API}/raffles`);
      setRaffles(response.data);
    } catch (error) {
      console.error("Erro ao carregar rifas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = (raffle) => {
    setSelectedRaffle(raffle);
  };

  const handlePurchaseSuccess = (purchase) => {
    setSuccessPurchase(purchase);
    loadRaffles(); // Recarrega as rifas para atualizar progresso
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎲</div>
          <div className="text-xl font-bold text-gray-600">Carregando rifas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} setUser={setUser} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🎯 MEGA12 🎯
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Sua sorte está aqui! Participe das melhores rifas online
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div>
              <div className="text-2xl font-bold">{raffles.length}</div>
              <div>Rifas Ativas</div>
            </div>
            <div>
              <div className="text-2xl font-bold">100%</div>
              <div>Seguro</div>
            </div>
            <div>
              <div className="text-2xl font-bold">24h</div>
              <div>Suporte</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Raffles Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            ⚡ Rifas Ativas
          </h2>
          
          {raffles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhuma rifa ativa</h3>
              <p className="text-gray-500">Novas rifas em breve!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map((raffle) => (
                <RaffleCard 
                  key={raffle.id} 
                  raffle={raffle} 
                  onBuy={handleBuyClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-2">🎲 MEGA12</div>
          <p className="text-gray-400 mb-4">Sua plataforma de rifas online</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-purple-400">📞 Suporte</a>
            <a href="#" className="hover:text-purple-400">📱 WhatsApp</a>
            <a href="#" className="hover:text-purple-400">📧 Contato</a>
          </div>
        </div>
      </footer>
      
      {/* Modals */}
      {selectedRaffle && (
        <PurchaseModal 
          raffle={selectedRaffle}
          user={user}
          onClose={() => setSelectedRaffle(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
      
      {successPurchase && (
        <SuccessModal 
          purchase={successPurchase}
          onClose={() => setSuccessPurchase(null)}
        />
      )}
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home user={user} setUser={setUser} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;