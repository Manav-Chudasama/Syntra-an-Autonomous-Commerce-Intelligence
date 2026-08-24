// components/SuggestionCard.jsx
import React from 'react';
import { formatCurrency, formatPercentage, getSuggestionStatusColor } from '../utils/formatters';

const SuggestionCard = ({ suggestion, product, type, onAccept, onReject }) => {
  const statusColor = getSuggestionStatusColor(suggestion.status);
  
  const isPricing = type === 'pricing';
  
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">
            {isPricing ? 'Pricing' : 'Reorder'} Suggestion
          </h3>
          <p className="text-gray-900 font-medium">{product?.name || 'Unknown Product'}</p>
          <p className="text-gray-500 text-xs">ID: {suggestion.productId}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
          {suggestion.status}
        </span>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {isPricing ? (
          <>
            <div>
              <p className="text-gray-500">Current Price</p>
              <p className="font-medium line-through text-gray-500">
                {product ? formatCurrency(product.currentPrice) : '$XX.XX'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Suggested Price</p>
              <p className="font-medium">{formatCurrency(suggestion.recommendedPrice)}</p>
            </div>
            <div>
              <p className="text-gray-500">Direction</p>
              <p className={`font-medium ${
                suggestion.direction === 'INCREASE' ? 'text-green-600' : 
                suggestion.direction === 'DECREASE' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {suggestion.direction}
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-gray-500">Current Stock</p>
              <p className="font-medium text-gray-500">
                {product ? `${product.stockLevel} units` : 'XX units'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Suggested Quantity</p>
              <p className="font-medium">{suggestion.recommendedQuantity} units</p>
            </div>
          </>
        )}
        
        <div>
          <p className="text-gray-500">Confidence</p>
          <p className="font-medium">{formatPercentage(suggestion.confidence)}</p>
        </div>
        <div>
          <p className="text-gray-500">Trigger</p>
          <p className="font-medium">{suggestion.triggerReason.replace('_', ' ')}</p>
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-gray-500 text-sm">Reasoning</p>
        <p className="text-sm">{suggestion.reasoning}</p>
      </div>
      
      {suggestion.status === 'PENDING' && (
        <div className="mt-4 flex space-x-2">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onAccept(suggestion.id); }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm transition-colors"
          >
            Accept
          </button>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onReject(suggestion.id); }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;