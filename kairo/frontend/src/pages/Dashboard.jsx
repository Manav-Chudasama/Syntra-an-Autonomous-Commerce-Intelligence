// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import SuggestionCard from '../components/SuggestionCard';
import { api } from '../services/api';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, pricingData, reorderData] = await Promise.all([
        api.getProducts(),
        api.getPendingPricingSuggestions(),
        api.getPendingReorderSuggestions(),
      ]);
      
      setProducts(productsData);
      setPricingSuggestions(pricingData);
      setReorderSuggestions(reorderData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateOrder = async (productId, quantity) => {
    try {
      await api.simulateOrder(productId, quantity);
      fetchData(); // Refresh data after order
    } catch (err) {
      console.error('Failed to simulate order', err);
    }
  };

  const handleReceiveInventory = async (productId, quantity) => {
    try {
      await api.receiveInventory(productId, quantity);
      fetchData(); // Refresh data after receiving inventory
    } catch (err) {
      console.error('Failed to receive inventory', err);
    }
  };

  const handleAcceptPricingSuggestion = async (suggestionId) => {
    try {
      await api.acceptPricingSuggestion(suggestionId);
      fetchData(); // Refresh data after accepting suggestion
    } catch (err) {
      console.error('Failed to accept pricing suggestion', err);
    }
  };

  const handleRejectPricingSuggestion = async (suggestionId) => {
    try {
      await api.rejectPricingSuggestion(suggestionId);
      fetchData(); // Refresh data after rejecting suggestion
    } catch (err) {
      console.error('Failed to reject pricing suggestion', err);
    }
  };
  const handleAcceptReorderSuggestion = async (suggestionId) => {
    try {
      await api.acceptReorderSuggestion(suggestionId);
      fetchData(); // Refresh data after accepting suggestion
    } catch (err) {
      console.error('Failed to accept reorder suggestion', err);
    }
  };

  const handleRejectReorderSuggestion = async (suggestionId) => {
    try {
      await api.rejectReorderSuggestion(suggestionId);
      fetchData(); // Refresh data after rejecting suggestion
    } catch (err) {
      console.error('Failed to reject reorder suggestion', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">StockPulse Dashboard</h1>
        <p className="mt-2 text-gray-600">
          AI-powered inventory management and dynamic pricing engine
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Products</h3>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
          <p className="text-2xl font-bold">
            {products.filter(p => p.stockLevel <= p.reorderThreshold).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Pricing Suggestions</h3>
          <p className="text-2xl font-bold">{pricingSuggestions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Reorder Suggestions</h3>
          <p className="text-2xl font-bold">{reorderSuggestions.length}</p>
        </div>
      </div>

      {/* Products Section */}
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Products</h2>
          <button 
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSimulateOrder={handleSimulateOrder}
              onReceiveInventory={handleReceiveInventory}
            />
          ))}
        </div>
      </div>

      {/* Pricing Suggestions Section */}
      {pricingSuggestions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pricing Suggestions</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingSuggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                type="pricing"
                onAccept={handleAcceptPricingSuggestion}
                onReject={handleRejectPricingSuggestion}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reorder Suggestions Section */}
      {reorderSuggestions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reorder Suggestions</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reorderSuggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                type="reorder"
                onAccept={handleAcceptReorderSuggestion}
                onReject={handleRejectReorderSuggestion}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;