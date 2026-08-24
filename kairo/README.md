# StockPulse - AI Inventory & Dynamic Pricing Engine

An intelligent inventory management system that provides dynamic pricing and reorder suggestions using both rule-based algorithms and AI.

## Project Overview

StockPulse is an AI-powered inventory management system designed to optimize stock levels and pricing strategies. The system monitors inventory levels and demand patterns, generates intelligent pricing and reorder suggestions using both rule-based and AI approaches, and implements an agentic loop that automatically triggers suggestions based on events.

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

## Project Structure

```
kairo/
│
├── backend/
│   ├── src/main/java/com/kairo/
│   │   ├── product/            # Product entities, repositories, services, controllers
│   │   ├── suggestion/         # Suggestion entities, repositories, services, controllers
│   │   ├── commerce/           # Advisory system (rule-based and AI)
│   │   ├── ai/                 # AI integration components
│   │   ├── agent/              # Agentic loop implementation
│   │   ├── config/             # Configuration classes
│   │   └── KairoApplication.java  # Main application class
│   ├── src/main/resources/
│   │   └── application.properties # Application configuration
│   ├── pom.xml                 # Maven configuration
│   ├── README.md               # Backend documentation
│   └── ADR.md                  # Architectural Decision Records
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service functions
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main application component
│   │   └── main.jsx            # Application entry point
│   ├── public/                 # Static assets
│   ├── package.json            # NPM dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
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

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

   Or build and run:
   ```bash
   ./mvnw clean package
   java -jar target/kairo-0.0.1-SNAPSHOT.jar
   ```

3. Access the H2 console at: http://localhost:8080/h2-console
   - JDBC URL: jdbc:h2:mem:testdb
   - Username: sa
   - Password: password

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Visit http://localhost:5173 in your browser

### Building for Production

#### Backend
```bash
cd backend
./mvnw clean package
```

#### Frontend
```bash
cd frontend
npm run build
```