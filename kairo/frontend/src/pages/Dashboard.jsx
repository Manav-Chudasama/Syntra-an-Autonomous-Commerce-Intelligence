// pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import SuggestionCard from '../components/SuggestionCard';
import { api } from '../services/api';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Show a toast message that auto-dismisses
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Background fetch — does NOT trigger a loading spinner or page jump
  const backgroundFetch = useCallback(async () => {
    try {
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
      console.error('Background refresh failed:', err);
    }
  }, []);

  // Initial fetch — shows spinner only on first load
  const initialFetch = useCallback(async () => {
    try {
      setInitialLoading(true);
      await backgroundFetch();
    } finally {
      setInitialLoading(false);
    }
  }, [backgroundFetch]);

  // Manual refresh button — shows a small indicator but no full-page spinner
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await backgroundFetch();
    setRefreshing(false);
    showToast('Data refreshed!', 'success');
  };

  useEffect(() => {
    initialFetch();
    // Auto-refresh every 30 seconds
    const interval = setInterval(backgroundFetch, 30000);
    return () => clearInterval(interval);
  }, [initialFetch, backgroundFetch]);

  const handleSimulateOrder = async (productId, quantity) => {
    try {
      await api.simulateOrder(productId, quantity);
      // Immediate update for stock numbers
      await backgroundFetch();
      showToast(`Sold ${quantity} unit(s). Checking for AI suggestions...`, 'info');
      // Wait 1.5s for the async agentic loop on the backend to finish, then re-poll
      setTimeout(async () => {
        await backgroundFetch();
        showToast('Dashboard updated with latest suggestions!', 'success');
      }, 1500);
    } catch (err) {
      console.error('Failed to simulate order', err);
      showToast('Failed to process order', 'error');
    }
  };

  const handleReceiveInventory = async (productId, quantity) => {
    try {
      await api.receiveInventory(productId, quantity);
      await backgroundFetch();
      showToast(`Added ${quantity} units to stock!`, 'success');
    } catch (err) {
      console.error('Failed to receive inventory', err);
      showToast('Failed to receive inventory', 'error');
    }
  };

  const handleAcceptPricingSuggestion = async (suggestionId) => {
    try {
      await api.acceptPricingSuggestion(suggestionId);
      await backgroundFetch();
      showToast('Pricing suggestion accepted! Product price updated.', 'success');
    } catch (err) {
      console.error('Failed to accept pricing suggestion', err);
      showToast('Failed to accept suggestion', 'error');
    }
  };

  const handleRejectPricingSuggestion = async (suggestionId) => {
    try {
      await api.rejectPricingSuggestion(suggestionId);
      await backgroundFetch();
      showToast('Pricing suggestion rejected.', 'info');
    } catch (err) {
      console.error('Failed to reject pricing suggestion', err);
      showToast('Failed to reject suggestion', 'error');
    }
  };

  const handleAcceptReorderSuggestion = async (suggestionId) => {
    try {
      await api.acceptReorderSuggestion(suggestionId);
      await backgroundFetch();
      showToast('Reorder suggestion accepted!', 'success');
    } catch (err) {
      console.error('Failed to accept reorder suggestion', err);
      showToast('Failed to accept suggestion', 'error');
    }
  };

  const handleRejectReorderSuggestion = async (suggestionId) => {
    try {
      await api.rejectReorderSuggestion(suggestionId);
      await backgroundFetch();
      showToast('Reorder suggestion rejected.', 'info');
    } catch (err) {
      console.error('Failed to reject reorder suggestion', err);
      showToast('Failed to reject suggestion', 'error');
    }
  };

  if (initialLoading) {
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

  const toastColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="space-y-8">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toastColors[toast.type]} text-white px-5 py-3 rounded-lg shadow-lg text-sm transition-all`}>
          {toast.message}
        </div>
      )}

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
            id="refresh-btn"
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
          >
            {refreshing && <span className="animate-spin inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>}
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
          <h2 className="text-xl font-semibold text-gray-900">
            🤖 Pricing Suggestions ({pricingSuggestions.length})
          </h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingSuggestions.map(suggestion => {
              const product = products.find(p => p.id === suggestion.productId);
              return (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  product={product}
                  type="pricing"
                  onAccept={handleAcceptPricingSuggestion}
                  onReject={handleRejectPricingSuggestion}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Reorder Suggestions Section */}
      {reorderSuggestions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            📦 Reorder Suggestions ({reorderSuggestions.length})
          </h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reorderSuggestions.map(suggestion => {
              const product = products.find(p => p.id === suggestion.productId);
              return (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  product={product}
                  type="reorder"
                  onAccept={handleAcceptReorderSuggestion}
                  onReject={handleRejectReorderSuggestion}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for suggestions */}
      {pricingSuggestions.length === 0 && reorderSuggestions.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
          <p className="text-lg">No pending suggestions yet.</p>
          <p className="text-sm mt-1">Sell items on low-stock products to trigger AI suggestions.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;