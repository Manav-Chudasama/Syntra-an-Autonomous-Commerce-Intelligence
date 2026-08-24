// utils/formatters.js

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'OUT_OF_STOCK':
      return 'red';
    case 'PRICE_REVIEW_PENDING':
      return 'orange';
    default:
      return 'gray';
  }
};

export const getSuggestionStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'blue';
    case 'ACCEPTED':
      return 'green';
    case 'REJECTED':
      return 'red';
    default:
      return 'gray';
  }
};