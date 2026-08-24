# Architectural Decision Records (ADRs)

## 1. Technology Stack Selection

**Status:** Accepted

**Context:** We needed to choose a technology stack for rapid development of a commerce advisory system with AI capabilities within a 5-hour timeframe.

**Decision:** 
- Backend: Spring Boot 3.x with Java 17
- Frontend: React 18 with Vite
- Database: H2 in-memory database
- AI Integration: Custom LLM gateway supporting multiple providers

**Rationale:**
- Spring Boot provides rapid development capabilities with minimal configuration
- Java 17 offers modern language features while maintaining stability
- H2 eliminates database setup overhead for hackathon timeframe
- React with Vite offers fast build times and modern development experience
- Custom LLM gateway allows flexibility in AI provider selection

## 2. Domain Model Design

**Status:** Accepted

**Context:** Need to represent products, pricing suggestions, and reorder suggestions in a way that supports both rule-based and AI-driven advisory.

**Decision:** 
- Product entity with stock levels, pricing, and demand metrics
- Separate suggestion entities for pricing and reordering
- Enum-based status and trigger systems for categorization
- Temporal tracking of suggestion creation

**Rationale:**
- Separation of concerns between product data and advisory suggestions
- Enables both historical tracking and current state management
- Flexible trigger system allows for future expansion of advisory types
- Temporal aspects support agentic loop duplicate prevention

## 3. Advisory Strategy Pattern

**Status:** Accepted

**Context:** System must support both rule-based and AI-driven advisory approaches, with potential for future strategy additions.

**Decision:** 
- Implemented Strategy pattern with CommerceAdvisor interface
- Factory pattern for advisor selection
- Clear separation between rule-based and AI implementations

**Rationale:**
- Enables easy switching between advisory approaches
- Supports future addition of new advisory strategies
- Maintains clean separation of concerns
- Facilitates testing of different approaches

## 4. Agentic Loop Implementation

**Status:** Accepted

**Context:** System must automatically generate suggestions based on inventory and demand events without manual intervention.

**Decision:** 
- Event-driven architecture with InventoryEvent and DemandSpikeEvent
- Asynchronous processing using Spring's @Async
- Duplicate prevention through event tracking
- Integration with advisor strategies for suggestion generation

**Rationale:**
- Event-driven approach enables reactive system behavior
- Asynchronous processing prevents UI blocking
- Duplicate prevention maintains data quality
- Integration with existing advisor patterns promotes consistency

## 5. AI Integration Approach

**Status:** Accepted

**Context:** System needs to integrate with LLM providers while maintaining flexibility and handling failures gracefully.

**Decision:** 
- Custom LLM gateway supporting multiple providers
- Structured prompting for consistent AI responses
- Simple regex-based response parsing for MVP
- Failover to rule-based approach on AI failures

**Rationale:**
- Provider flexibility allows for cost optimization and experimentation
- Structured prompting improves AI response quality
- Regex parsing sufficient for hackathon timeframe
- Graceful degradation maintains system functionality

## 6. API Design

**Status:** Accepted

**Context:** Frontend needs clear, consistent API for interacting with backend services.

**Decision:** 
- RESTful API design with clear resource-oriented endpoints
- Consistent HTTP status codes and response formats
- Cross-origin resource sharing configured for frontend development
- Separate endpoints for different suggestion types

**Rationale:**
- REST principles provide familiar patterns for frontend developers
- Consistent API design reduces integration complexity
- CORS configuration enables seamless frontend development
- Resource separation supports focused feature development