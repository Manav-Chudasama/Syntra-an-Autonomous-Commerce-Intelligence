// components/ProductCard.jsx
import React from 'react';
import { formatCurrency, getStatusColor } from '../utils/formatters';

const ProductCard = ({ product, onSimulateOrder, onReceiveInventory }) => {
  const statusColor = getStatusColor(product.status);

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-gray-600 text-sm">{product.sku}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
          {product.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Category</p>
          <p className="font-medium">{product.category}</p>
        </div>
        <div>
          <p className="text-gray-500">Price</p>
          <p className="font-medium">{formatCurrency(product.currentPrice)}</p>
        </div>
        <div>
          <p className="text-gray-500">Stock</p>
          <p className={`font-medium ${product.stockLevel <= product.reorderThreshold ? 'text-red-600' : ''}`}>
            {product.stockLevel} units
          </p>
        </div>
        <div>
          <p className="text-gray-500">Threshold</p>
          <p className="font-medium">{product.reorderThreshold} units</p>
        </div>
        <div>
          <p className="text-gray-500">Velocity</p>
          <p className="font-medium">{product.demandVelocity}/period</p>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); onSimulateOrder(product.id, 1); }}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm transition-colors"
        >
          Sell 1
        </button>
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); onSimulateOrder(product.id, 5); }}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm transition-colors"
        >
          Sell 5
        </button>
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); onReceiveInventory(product.id, 10); }}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm transition-colors"
        >
          +10 Stock
        </button>
      </div>
    </div>
  );
};

export default ProductCard;