// services/api.js
const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
  // Product endpoints
  getProducts: () => fetch(`${API_BASE_URL}/products`).then(res => res.json()),
  getProduct: (id) => fetch(`${API_BASE_URL}/products/${id}`).then(res => res.json()),
  createProduct: (product) => fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  }).then(res => res.json()),
  updateProduct: (id, product) => fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  }).then(res => res.json()),
  deleteProduct: (id) => fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
  }),
  simulateOrder: (id, quantity) => fetch(`${API_BASE_URL}/products/${id}/orders?quantity=${quantity}`, {
    method: 'POST',
  }).then(res => res.json()),
  receiveInventory: (id, quantity) => fetch(`${API_BASE_URL}/products/${id}/receive?quantity=${quantity}`, {
    method: 'POST',
  }).then(res => res.json()),

  // Pricing suggestion endpoints
  getPricingSuggestions: () => fetch(`${API_BASE_URL}/pricing-suggestions`).then(res => res.json()),
  getPendingPricingSuggestions: () => fetch(`${API_BASE_URL}/pricing-suggestions/pending`).then(res => res.json()),
  acceptPricingSuggestion: (id) => fetch(`${API_BASE_URL}/pricing-suggestions/${id}/accept`, {
    method: 'POST',
  }).then(res => res.json()),
  rejectPricingSuggestion: (id) => fetch(`${API_BASE_URL}/pricing-suggestions/${id}/reject`, {
    method: 'POST',
  }).then(res => res.json()),

  // Reorder suggestion endpoints
  getReorderSuggestions: () => fetch(`${API_BASE_URL}/reorder-suggestions`).then(res => res.json()),
  getPendingReorderSuggestions: () => fetch(`${API_BASE_URL}/reorder-suggestions/pending`).then(res => res.json()),
  acceptReorderSuggestion: (id) => fetch(`${API_BASE_URL}/reorder-suggestions/${id}/accept`, {
    method: 'POST',
  }).then(res => res.json()),
  rejectReorderSuggestion: (id) => fetch(`${API_BASE_URL}/reorder-suggestions/${id}/reject`, {
    method: 'POST',
  }).then(res => res.json()),
};