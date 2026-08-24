# Kairo - AI Inventory & Dynamic Pricing Engine

An intelligent inventory management system that provides dynamic pricing and reorder suggestions using both rule-based algorithms and AI.

![Kairo Dashboard](kairo/frontend/public/hero.png)

## Overview

Kairo is an AI-powered inventory management system designed to optimize stock levels and pricing strategies. The system monitors inventory levels and demand patterns, generates intelligent pricing and reorder suggestions using both rule-based and AI approaches, and implements an agentic loop that automatically triggers suggestions based on events.

## Key Features

- **Real-time Inventory Tracking**: Monitor stock levels, demand velocity, and product status
- **Dual Advisory System**: Choose between rule-based and AI-powered pricing/reorder suggestions
- **Agentic Loop**: Automatically generate suggestions when inventory thresholds are crossed
- **Interactive Dashboard**: Visualize products, suggestions, and simulate inventory changes
- **RESTful API**: Well-documented API for integration with other systems

## Tech Stack

### Backend
- **Spring Boot 3.x** - Framework for building the REST API
- **Java 17** - Programming language
- **Spring Data JPA** - ORM for database interactions
- **H2 Database** - In-memory database for development
- **Maven** - Dependency management

### Frontend
- **React 18** - JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript** - Programming language

### AI Integration
- **Custom LLM Gateway** - Supports multiple AI providers (Qwen, Groq, Ollama)
- **Structured Prompting** - Consistent AI response formatting

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   Frontend      │    │   Backend        │    │   AI Providers     │
│   (React)       │    │   (Spring Boot)  │    │   (Qwen/Groq/etc)  │
│                 │    │                  │    │                    │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌────────────────┐ │
│ │  Dashboard  │ │    │ │  Controllers │ │    │ │   Qwen API     │ │
│ ├─────────────┤ │    │ ├──────────────┤ │    │ ├────────────────┤ │
│ │ ProductCard │ │◄──►│ │  Services    │ │◄──►│ │   Groq API     │ │
│ ├─────────────┤ │    │ ├──────────────┤ │    │ ├────────────────┤ │
│ │SuggestionCard│ │    │ │Repositories  │ │    │ │  Ollama API    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └────────────────┘ │
└─────────────────┘    └─────────▲────────┘    └─────────▲──────────┘
                                 │                       │
                                 │         ┌─────────────┘
                                 ▼         ▼
                            ┌──────────────────┐
                            │   H2 Database    │
                            │ (In-Memory)      │
                            └──────────────────┘
```

## Folder Structure

```
kairo/
│
├── backend/                    # Spring Boot backend application
│   ├── src/main/java/com/kairo/
│   │   ├── product/            # Product entities, repositories, services
│   │   ├── suggestion/         # Suggestion entities and management
│   │   ├── commerce/           # Advisory system (rule-based and AI)
│   │   ├── ai/                 # AI integration components
│   │   ├── agent/              # Agentic loop implementation
│   │   └── config/             # Configuration classes
│   ├── src/main/resources/     # Application configuration
│   ├── pom.xml                 # Maven configuration
│   └── README.md               # Backend documentation
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service functions
│   │   └── utils/              # Utility functions
│   ├── public/                 # Static assets
│   ├── package.json            # NPM dependencies
│   └── README.md               # Frontend documentation
│
├── README.md                   # This file
└── .gitignore                  # Git ignore file
```

## Getting Started

### Prerequisites
- **Backend**: Java 17+, Maven 3.6+
- **Frontend**: Node.js 16+, npm 7+

### Backend Setup
```bash
cd kairo/backend
mvn spring-boot:run
```

### Frontend Setup
```bash
cd kairo/frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser to access the application.

## API Documentation

The backend exposes a RESTful API for all inventory and suggestion operations:

- `GET /api/products` - Retrieve all products
- `POST /api/products/{id}/sell` - Simulate selling inventory
- `POST /api/products/{id}/receive` - Simulate receiving inventory
- `GET /api/pricing-suggestions/pending` - Get pending pricing suggestions
- `POST /api/pricing-suggestions/{id}/accept` - Accept a pricing suggestion
- `GET /api/reorder-suggestions/pending` - Get pending reorder suggestions
- `POST /api/reorder-suggestions/{id}/accept` - Accept a reorder suggestion

## License

This project is licensed under the MIT License.