import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== ADMIN STATS COMPONENT ====================

const AdminStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">🎲</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total de Rifas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_raffles}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">⚡</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Rifas Ativas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active_raffles}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-2xl">👥</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Usuários</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Compras</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_purchases}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== RAFFLE FORM COMPONENT ====================

const RaffleForm = ({ onSubmit, onCancel, raffle = null }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    price_per_ticket: "",
    total_tickets: "",
    draw_date: "",
    prizes: [],
    bonus_boxes: []
  });

  useEffect(() => {
    if (raffle) {
      setFormData({
        title: raffle.title || "",
        description: raffle.description || "",
        image_url: raffle.image_url || "",
        price_per_ticket: raffle.price_per_ticket || "",
        total_tickets: raffle.total_tickets || "",
        draw_date: raffle.draw_date ? new Date(raffle.draw_date).toISOString().slice(0, 16) : "",
        prizes: raffle.prizes || [],
        bonus_boxes: raffle.bonus_boxes || []
      });
    }
  }, [raffle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price_per_ticket: parseFloat(formData.price_per_ticket),
      total_tickets: parseInt(formData.total_tickets),
      draw_date: formData.draw_date ? new Date(formData.draw_date) : null
    };
    onSubmit(submitData);
  };

  const addPrize = () => {
    const newPrize = {
      id: `prize-${Date.now()}`,
      name: "",
      value: 0,
      type: "money",
      image_url: "",
      is_available: true
    };
    setFormData({
      ...formData,
      prizes: [...formData.prizes, newPrize]
    });
  };

  const updatePrize = (index, field, value) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setFormData({ ...formData, prizes: updatedPrizes });
  };

  const removePrize = (index) => {
    const updatedPrizes = formData.prizes.filter((_, i) => i !== index);
    setFormData({ ...formData, prizes: updatedPrizes });
  };

  const addBonusRule = () => {
    setFormData({
      ...formData,
      bonus_boxes: [...formData.bonus_boxes, { quantity: 0, boxes: 0 }]
    });
  };

  const updateBonusRule = (index, field, value) => {
    const updatedRules = [...formData.bonus_boxes];
    updatedRules[index] = { ...updatedRules[index], [field]: parseInt(value) };
    setFormData({ ...formData, bonus_boxes: updatedRules });
  };

  const removeBonusRule = (index) => {
    const updatedRules = formData.bonus_boxes.filter((_, i) => i !== index);
    setFormData({ ...formData, bonus_boxes: updatedRules });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {raffle ? "Editar Rifa" : "Nova Rifa"}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Rifa
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço por Número (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price_per_ticket}
                  onChange={(e) => setFormData({...formData, price_per_ticket: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de Números
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.total_tickets}
                  onChange={(e) => setFormData({...formData, total_tickets: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Sorteio
                </label>
                <input
                  type="datetime-local"
                  value={formData.draw_date}
                  onChange={(e) => setFormData({...formData, draw_date: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border rounded-lg h-24"
                required
              />
            </div>
            
            {/* Prêmios */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Prêmios</h3>
                <button
                  type="button"
                  onClick={addPrize}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  + Adicionar Prêmio
                </button>
              </div>
              
              {formData.prizes.map((prize, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Nome do prêmio"
                      value={prize.name}
                      onChange={(e) => updatePrize(index, 'name', e.target.value)}
                      className="p-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Valor (R$)"
                      value={prize.value}
                      onChange={(e) => updatePrize(index, 'value', parseFloat(e.target.value))}
                      className="p-2 border rounded"
                    />
                    <select
                      value={prize.type}
                      onChange={(e) => updatePrize(index, 'type', e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="money">Dinheiro</option>
                      <option value="product">Produto</option>
                    </select>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Regras de Bônus */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Caixas Bônus</h3>
                <button
                  type="button"
                  onClick={addBonusRule}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  + Adicionar Regra
                </button>
              </div>
              
              {formData.bonus_boxes.map((rule, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        A partir de quantos números:
                      </label>
                      <input
                        type="number"
                        value={rule.quantity}
                        onChange={(e) => updateBonusRule(index, 'quantity', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Quantas caixas ganha:
                      </label>
                      <input
                        type="number"
                        value={rule.boxes}
                        onChange={(e) => updateBonusRule(index, 'boxes', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeBonusRule(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
              >
                {raffle ? "Atualizar Rifa" : "Criar Rifa"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== RAFFLE LIST COMPONENT ====================

const RaffleList = ({ raffles, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Rifas Cadastradas</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rifa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progresso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {raffles.map((raffle) => {
              const progress = (raffle.sold_tickets / raffle.total_tickets) * 100;
              return (
                <tr key={raffle.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={raffle.image_url} 
                        alt={raffle.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {raffle.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {raffle.description.slice(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      R$ {raffle.price_per_ticket.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {raffle.sold_tickets} / {raffle.total_tickets}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {progress.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      raffle.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {raffle.status === 'active' ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEdit(raffle)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(raffle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== MAIN ADMIN PANEL COMPONENT ====================

const AdminPanel = () => {
  const [stats, setStats] = useState({
    total_raffles: 0,
    active_raffles: 0,
    total_users: 0,
    total_purchases: 0
  });
  const [raffles, setRaffles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, rafflesResponse] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/raffles`)
      ]);
      
      setStats(statsResponse.data);
      setRaffles(rafflesResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRaffle = async (raffleData) => {
    try {
      await axios.post(`${API}/raffles`, raffleData);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error("Erro ao criar rifa:", error);
      alert("Erro ao criar rifa");
    }
  };

  const handleEditRaffle = (raffle) => {
    setEditingRaffle(raffle);
    setShowForm(true);
  };

  const handleDeleteRaffle = async (raffleId) => {
    if (window.confirm("Tem certeza que deseja excluir esta rifa?")) {
      try {
        // Note: This would need a DELETE endpoint in the backend
        // await axios.delete(`${API}/raffles/${raffleId}`);
        alert("Funcionalidade de exclusão não implementada ainda");
      } catch (error) {
        console.error("Erro ao excluir rifa:", error);
        alert("Erro ao excluir rifa");
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRaffle(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <div className="text-xl font-bold text-gray-600">Carregando painel...</div>
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
              <div className="text-2xl font-bold text-purple-600 mr-2">🎲</div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mega12 - Painel Administrativo
              </h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              + Nova Rifa
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AdminStats stats={stats} />
        <RaffleList 
          raffles={raffles} 
          onEdit={handleEditRaffle}
          onDelete={handleDeleteRaffle}
        />
      </main>

      {/* Form Modal */}
      {showForm && (
        <RaffleForm 
          raffle={editingRaffle}
          onSubmit={handleCreateRaffle}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default AdminPanel;