# StockPulse Frontend

This is the frontend application for StockPulse - an AI Inventory & Dynamic Pricing Engine.

## Tech Stack

- **React 18** - JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **JavaScript** - Programming language

## Prerequisites

- Node.js 16+
- npm 7+

## Getting Started

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/               # Page components
├── services/            # API service functions
├── utils/               # Utility functions
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
```

## Features

- Dashboard view of all products
- Real-time inventory status tracking
- Pricing and reorder suggestion panels
- Product simulation tools
- Responsive design for different screen sizes
