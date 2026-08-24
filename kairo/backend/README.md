# StockPulse Backend

This is the backend service for StockPulse - an AI Inventory & Dynamic Pricing Engine.

## Tech Stack

- **Spring Boot 3.x** - Framework for building the REST API
- **Java 17** - Programming language
- **Spring Data JPA** - ORM for database interactions
- **H2 Database** - In-memory database for development
- **Maven** - Dependency management

## Prerequisites

- Java 17+
- Maven 3.6+

## Getting Started

1. Clone the repository
2. Navigate to the backend directory
3. Run the application:

```bash
./mvnw spring-boot:run
```

Or build and run:

```bash
./mvnw clean package
java -jar target/kairo-0.0.1-SNAPSHOT.jar
```

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product
- `POST /api/products/{id}/orders?quantity={qty}` - Simulate an order
- `POST /api/products/{id}/receive?quantity={qty}` - Receive inventory

### Pricing Suggestions

- `GET /api/pricing-suggestions` - Get all pricing suggestions
- `GET /api/pricing-suggestions/pending` - Get pending pricing suggestions
- `POST /api/pricing-suggestions/{id}/accept` - Accept a pricing suggestion
- `POST /api/pricing-suggestions/{id}/reject` - Reject a pricing suggestion

### Reorder Suggestions

- `GET /api/reorder-suggestions` - Get all reorder suggestions
- `GET /api/reorder-suggestions/pending` - Get pending reorder suggestions
- `POST /api/reorder-suggestions/{id}/accept` - Accept a reorder suggestion
- `POST /api/reorder-suggestions/{id}/reject` - Reject a reorder suggestion

## Database

The application uses an H2 in-memory database for development. The database is reset each time the application restarts.

To access the H2 console, visit: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:testdb

## Architecture

The backend follows a layered architecture:

1. **Controllers** - Handle HTTP requests
2. **Services** - Business logic layer
3. **Repositories** - Data access layer
4. **Entities** - Data models

## Features

- Product inventory management
- Rule-based and AI-powered pricing suggestions
- Automatic reorder recommendations
- Agentic loop for event-driven suggestions
- RESTful API for frontend integration