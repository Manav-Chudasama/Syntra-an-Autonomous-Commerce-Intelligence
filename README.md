# StockPulse - AI Inventory & Dynamic Pricing Engine

An intelligent inventory management system that provides dynamic pricing and reorder suggestions using both rule-based algorithms and AI.

![StockPulse Dashboard](kairo/frontend/public/hero.png)

## Welcome to StockPulse!

This repository contains the StockPulse project, an AI-powered inventory management system designed to optimize stock levels and pricing strategies. The system monitors inventory levels and demand patterns, generates intelligent pricing and reorder suggestions using both rule-based and AI approaches, and implements an agentic loop that automatically triggers suggestions based on events.

## Quick Start

To get started with StockPulse, navigate to the main project directory:

```bash
cd kairo
```

Then follow the setup instructions in [kairo/README.md](kairo/README.md).

## Project Structure

```
zycushackathon/
│
├── kairo/                     # Main project directory
│   ├── backend/              # Spring Boot backend application
│   ├── frontend/             # React frontend application
│   ├── README.md             # Detailed project documentation
│   └── ...
│
└── README.md                 # This file
```

## Features

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

## Documentation

For detailed instructions on setting up and running the project, please refer to the comprehensive documentation in [kairo/README.md](kairo/README.md).