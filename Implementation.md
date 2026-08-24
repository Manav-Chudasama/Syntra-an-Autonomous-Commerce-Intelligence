Yes. Since you're committing to **Spring Boot + React**, I'd build it in a way that is simple enough for the 5-hour constraint but still scores well on the architecture/design parts of the PS.

The official brief makes the priorities very clear: **domain/API → commerce strategies → AI advisor → async agentic loop → React console → ADR/walkthrough**. 

# 1. Final architecture

I'd use:

```text
React 18 + Vite
        │
        │ REST
        ▼
┌─────────────────────────────┐
│       Spring Boot 3.x       │
│                             │
│ Controllers                 │
│      ↓                      │
│ Application Services        │
│      ↓                      │
│ CommerceAdvisor             │
│   ┌────────┴────────┐       │
│   ↓                 ↓       │
│ Rule Strategy     AI Strategy
│                       ↓     │
│                  LLM Gateway │
│                             │
│ Event Publisher             │
│      ↓                      │
│ @Async Agentic Loop         │
│                             │
│ JPA Repositories            │
└──────────────┬──────────────┘
               ↓
              H2
```

For the hackathon, **use H2**. It's fast, requires almost no setup, and the brief explicitly allows it. 

---

# 2. Backend folder structure

I'd make the backend like this:

```text
backend/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── kairo/
│   │   │           ├── KairoApplication.java
│   │   │           │
│   │   │           ├── config/
│   │   │           │   ├── AsyncConfig.java
│   │   │           │   ├── CorsConfig.java
│   │   │           │   └── LLMConfig.java
│   │   │           │
│   │   │           ├── product/
│   │   │           │   ├── Product.java
│   │   │           │   ├── ProductRepository.java
│   │   │           │   ├── ProductService.java
│   │   │           │   ├── ProductController.java
│   │   │           │   ├── ProductStatus.java
│   │   │           │   └── Category.java
│   │   │           │
│   │   │           ├── suggestion/
│   │   │           │   ├── PricingSuggestion.java
│   │   │           │   ├── ReorderSuggestion.java
│   │   │           │   ├── PricingSuggestionRepository.java
│   │   │           │   ├── ReorderSuggestionRepository.java
│   │   │           │   ├── SuggestionStatus.java
│   │   │           │   ├── TriggerReason.java
│   │   │           │   ├── PricingSuggestionController.java
│   │   │           │   └── ReorderSuggestionController.java
│   │   │           │
│   │   │           ├── commerce/
│   │   │           │   ├── CommerceAdvisor.java
│   │   │           │   ├── CommerceRecommendation.java
│   │   │           │   ├── RuleBasedCommerceAdvisor.java
│   │   │           │   ├── AICommerceAdvisor.java
│   │   │           │   └── CommerceAdvisorFactory.java
│   │   │           │
│   │   │           ├── ai/
│   │   │           │   ├── LLMGateway.java
│   │   │           │   ├── LLMResponseParser.java
│   │   │           │   ├── AIValidationService.java
│   │   │           │   ├── PromptBuilder.java
│   │   │           │   └── AIException.java
│   │   │           │
│   │   │           ├── agent/
│   │   │           │   ├── InventoryEvent.java
│   │   │           │   ├── DemandSpikeEvent.java
│   │   │           │   ├── AgenticLoopService.java
│   │   │           │   └── AgentEventListener.java
│   │   │           │
│   │   │           └── common/
│   │   │               ├── ApiExceptionHandler.java
│   │   │               └── ResourceNotFoundException.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       └── data.sql
│   │
│   └── test/
│       └── java/
│
├── ADR.md
└── README.md
```

**Don't create 50 packages/classes just for the sake of architecture.** The above is enough to demonstrate separation without slowing you down.

---

# 3. Start with your entities

The brief gives you four important domain objects:

```text
Product
InventorySnapshot
PricingSuggestion
ReorderSuggestion
```



I'd implement them like this.

### Product

```java
@Entity
public class Product {

    @Id
    private String id;

    private String sku;
    private String name;

    @Enumerated(EnumType.STRING)
    private Category category;

    private BigDecimal currentPrice;
    private Integer stockLevel;
    private Integer reorderThreshold;
    private Integer demandVelocity;

    private BigDecimal costPrice;     // nullable - future extension
    private String supplierId;       // nullable - future extension

    @Enumerated(EnumType.STRING)
    private ProductStatus status;
}
```

Category:

```java
public enum Category {
    ELECTRONICS,
    APPAREL,
    HOME
}
```

Status:

```java
public enum ProductStatus {
    ACTIVE,
    PRICE_REVIEW_PENDING,
    OUT_OF_STOCK
}
```

---

# 4. PricingSuggestion

```java
@Entity
public class PricingSuggestion {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Product product;

    private BigDecimal currentPrice;
    private BigDecimal recommendedPrice;

    @Enumerated(EnumType.STRING)
    private ChangeDirection direction;

    private Double confidence;

    @Column(length = 2000)
    private String reasoning;

    @Enumerated(EnumType.STRING)
    private SuggestionStatus status;

    @Enumerated(EnumType.STRING)
    private TriggerReason triggerReason;
}
```

Enums:

```java
public enum ChangeDirection {
    INCREASE,
    DECREASE,
    HOLD
}
```

```java
public enum SuggestionStatus {
    PENDING,
    ACCEPTED,
    REJECTED
}
```

```java
public enum TriggerReason {
    INITIAL,
    INVENTORY_LOW,
    DEMAND_SPIKE,
    MANUAL
}
```

---

# 5. ReorderSuggestion

Very similar:

```java
@Entity
public class ReorderSuggestion {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Product product;

    private Integer currentStock;
    private Integer recommendedQuantity;
    private Integer suggestedLeadTimeDays;

    private Double confidence;

    @Column(length = 2000)
    private String reasoning;

    @Enumerated(EnumType.STRING)
    private SuggestionStatus status;

    @Enumerated(EnumType.STRING)
    private TriggerReason triggerReason;
}
```

---

# 6. The most important interface

This is where I would spend serious attention.

The brief specifically wants a **pluggable commerce engine** with rule-based and AI implementations. 

I'd use:

```java
public interface CommerceAdvisor {

    CommerceRecommendation advise(
        Product product,
        TriggerReason triggerReason
    );
}
```

Then:

```java
public class CommerceRecommendation {

    private PricingRecommendation pricing;
    private ReorderRecommendation reorder;
}
```

And:

```java
public class PricingRecommendation {
    private BigDecimal recommendedPrice;
    private ChangeDirection direction;
    private double confidence;
    private String reasoning;
}
```

```java
public class ReorderRecommendation {
    private int recommendedQuantity;
    private int suggestedLeadTimeDays;
    private double confidence;
    private String reasoning;
}
```

Now you have:

```text
             CommerceAdvisor
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
 RuleBasedCommerceAdvisor   AICommerceAdvisor
```

That's your **Strategy Pattern**.

---

# 7. Rule-based strategy

Implement this FIRST.

Don't touch AI until this works.

### Pricing rules from the PS

```text
IF stock < reorder threshold
    → +10%

ELSE IF demand > 2 × category average
    → +5%

ELSE
    → HOLD
```



### Reorder

```text
quantity = (threshold × 3) - currentStock

minimum = 1
```

This gives you a working fallback even if the LLM completely dies.

---

# 8. Runtime strategy switching

Use a property:

```properties
commerce.strategy=ai
```

or:

```properties
commerce.strategy=rule
```

But there's an important phrase in the PS:

> **switchable at runtime without restart**. 

So don't simply read the property once when Spring starts.

I'd make a small:

```java
@Service
public class CommerceAdvisorFactory {

    private final RuleBasedCommerceAdvisor ruleAdvisor;
    private final AICommerceAdvisor aiAdvisor;

    @Value("${commerce.strategy:rule}")
    private String strategy;

    public CommerceAdvisor getAdvisor() {
        return strategy.equalsIgnoreCase("ai")
                ? aiAdvisor
                : ruleAdvisor;
    }
}
```

For a truly runtime-switchable implementation, expose an admin/config endpoint:

```text
PUT /config/commerce-strategy

{
    "strategy": "ai"
}
```

Then store the active strategy in memory.

That gives you a nice demo:

```text
Current Strategy: AI

[ Switch to Rule-Based ]
```

No restart.

---

# 9. LLM layer

Do **not** put HTTP calls to the LLM directly inside `AICommerceAdvisor`.

Use:

```text
AICommerceAdvisor
       ↓
   LLMGateway
       ↓
     LLM API
```

The PS gives you an LLM gateway utility concept specifically for this. 

Your interface:

```java
public interface LLMGateway {

    String callLLM(String prompt);
}
```

Implementation:

```java
@Component
public class ZycusLLMGateway implements LLMGateway {

    @Override
    public String callLLM(String prompt) {
        // POST to provided endpoint
    }
}
```

**Keep the credential in an environment variable. Never commit the provided API key to GitHub.**

---

# 10. Prompt architecture

This is another place where you can score well.

Don't have:

```java
String prompt = "Analyze this product";
```

Create:

```text
PromptBuilder
    │
    ├── buildInventoryLowPrompt()
    │
    └── buildDemandSpikePrompt()
```

The PS explicitly says these should be **genuinely different prompts** because the business decisions are different. 

### Inventory-low prompt

Give the model:

```text
Product
Current price
Stock
Reorder threshold
Demand velocity
Category average
```

Then ask:

> Stock is critically low. Should we protect remaining inventory through a modest price increase, hold the price, or decrease it to clear inventory?

### Demand-spike prompt

Ask:

> Demand is significantly higher than the category average. Determine whether a modest price adjustment is appropriate while ensuring we don't overreact to a temporary spike.

---

# 11. AI output

Force JSON.

For example:

```json
{
  "recommendedPrice": 84.99,
  "direction": "INCREASE",
  "confidence": 0.82,
  "reasoning": "Demand is above the category average while stock is approaching the reorder threshold."
}
```

For reorder:

```json
{
  "recommendedQuantity": 45,
  "confidence": 0.78,
  "reasoning": "Current stock is below the reorder threshold and demand velocity is elevated."
}
```

Then parse with Jackson.

---

# 12. AI validation

Never trust the LLM blindly.

Create:

```text
AIValidationService
```

Check:

```text
recommendedPrice > 0

recommendedPrice isn't ridiculously
different from current price

recommendedQuantity > 0

recommendedQuantity is integer

confidence >= 0
confidence <= 1
```

The PS explicitly expects bounds validation and fallback handling. 

---

# 13. AI fallback

Your flow should be:

```text
AI Strategy
     ↓
Call LLM
     ↓
 ┌───┴────┐
 ↓        ↓
Valid    Failed
 ↓        ↓
Return   Rule Strategy
         ↓
      Return result
```

Failures include:

```text
Timeout
Invalid JSON
API error
Missing fields
Negative price
Crazy price
Invalid quantity
```

This is one of the things I'd definitely demonstrate to the panel.

---

# 14. Now the REALLY important part: agentic loop

This is the heart of the assignment. 

Don't call AI directly from:

```text
PATCH /stock
```

Instead:

```text
PATCH /stock
      ↓
Update product
      ↓
Check trigger
      ↓
Publish event
      ↓
Return HTTP response
```

Meanwhile:

```text
                 Event
                   ↓
             @EventListener
                   ↓
                 @Async
                   ↓
          AgenticLoopService
                   ↓
             CommerceAdvisor
              /          \
          Pricing       Reorder
             ↓             ↓
        Save Suggestion
```

---

# 15. Event classes

Create:

```java
public record InventoryChangedEvent(
    String productId,
    TriggerReason reason
) {}
```

Then:

```java
@Component
public class AgentEventListener {

    @Async
    @EventListener
    public void handleInventoryChange(
        InventoryChangedEvent event
    ) {
        agenticLoopService.process(event);
    }
}
```

Enable async:

```java
@EnableAsync
@SpringBootApplication
public class KairoApplication {
}
```

This is exactly the kind of event-driven implementation the PS suggests. 

---

# 16. Trigger logic

When stock changes:

```java
if (product.getStockLevel() < product.getReorderThreshold()) {

    publisher.publishEvent(
        new InventoryChangedEvent(
            product.getId(),
            TriggerReason.INVENTORY_LOW
        )
    );
}
```

For demand:

```text
demand velocity > 3 × category average
```

Then:

```java
TriggerReason.DEMAND_SPIKE
```

The threshold should come from configuration:

```properties
agent.demand-spike.multiplier=3
```

---

# 17. Prevent duplicate suggestions

This is easy to forget but the PS explicitly asks for it.

Before creating a suggestion:

```text
Does a PENDING pricing suggestion already exist
for this product + trigger reason?
```

If yes:

```text
Don't create another.
```

Same for reorder.

This makes your agentic loop **idempotent**.

That's a great word to know for the presentation:

> "I made the event processing idempotent so repeated inventory events don't create duplicate pending recommendations."

---

# 18. Product APIs

Build these in this order:

```text
POST   /products
GET    /products
PATCH  /products/{id}/stock
POST   /products/{id}/orders

POST   /products/{id}/suggest-pricing
POST   /products/{id}/suggest-reorder

PATCH  /pricing-suggestions/{id}
PATCH  /reorder-suggestions/{id}
```

These are directly from the PS. 

---

# 19. Accept/reject behavior

This is important.

### Accept pricing

```text
Suggestion
    ↓
ACCEPTED
    ↓
Product.currentPrice = recommendedPrice
```

### Reject pricing

```text
Suggestion
    ↓
REJECTED
```

Price does NOT change.

---

### Accept reorder

```text
Suggestion
    ↓
ACCEPTED
    ↓
stock += recommendedQuantity
```

The PS specifically defines this as simulated inbound stock. 

---

# 20. React structure

Keep the frontend MUCH simpler:

```text
frontend/
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── api/
│   │   ├── productApi.js
│   │   └── suggestionApi.js
│   │
│   ├── components/
│   │   ├── ProductTable.jsx
│   │   ├── ProductCard.jsx
│   │   ├── PricingSuggestion.jsx
│   │   ├── ReorderSuggestion.jsx
│   │   ├── SuggestionCard.jsx
│   │   ├── StatusBadge.jsx
│   │   └── SimulateSaleButton.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   └── Products.jsx
│   │
│   └── hooks/
│       └── useProducts.js
```

Don't waste time on complicated frontend architecture.

---

# 21. Dashboard

Your main page should basically have:

```text
┌───────────────────────────────────────────┐
│ KAIRO                    Commerce: AI ▼   │
├───────────────────────────────────────────┤
│                                           │
│  Products     Low Stock     Pending       │
│     8             3             4         │
│                                           │
├───────────────────────────────────────────┤
│ PRODUCTS                                  │
│                                           │
│ Product      Price    Stock   Demand      │
│ Earbuds      ₹79.99   45      3/day       │
│ T-Shirt      ₹24.99    8     12/day ⚠     │
│ Hoodie       ₹54.99   11     15/day ⚡     │
│                                           │
│ [Simulate Sale]                           │
├───────────────────────────────────────────┤
│ AI SUGGESTIONS                            │
│                                           │
│ ⚠ INVENTORY LOW                           │
│ T-Shirt                                   │
│ Price: ₹24.99 → ₹27.49                    │
│ Confidence: 82%                           │
│ Reason: ...                               │
│                                           │
│ [ACCEPT] [REJECT]                         │
│                                           │
│ Reorder: 37 units                         │
│ [ACCEPT] [REJECT]                         │
└───────────────────────────────────────────┘
```

That is enough.

---

# 22. Your demo flow

This should be your **golden path**.

Seed:

```text
T-Shirt

Price: ₹24.99
Stock: 8
Threshold: 15
Demand: 12
```

Click:

> **Simulate Sale**

Backend:

```text
POST /products/PRD-003/orders
```

Stock becomes:

```text
7
```

Trigger:

```text
7 < 15
```

Event published.

Async agent runs.

AI generates:

```text
Pricing Suggestion
+
Reorder Suggestion
```

React polls.

Suggestions appear:

```text
⚠ INVENTORY_LOW
```

Then you click:

> Accept Price

Price updates.

Then:

> Accept Reorder

Stock increases.

**That's the entire demo.**

---

# 23. Build order tomorrow

Don't build things randomly. Follow this exact order:

### Phase 1 — Setup

```text
Spring Boot
JPA
H2
Validation
CORS
```

### Phase 2 — Domain

```text
Product
PricingSuggestion
ReorderSuggestion
Enums
Repositories
```

### Phase 3 — APIs

```text
Product CRUD
Stock
Orders
Accept/reject
```

### Phase 4 — Rule engine

```text
CommerceAdvisor
RuleBasedCommerceAdvisor
```

**Test this before touching AI.**

### Phase 5 — AI

```text
LLMGateway
PromptBuilder
AICommerceAdvisor
Parser
Validation
Fallback
```

### Phase 6 — Agentic loop

```text
Events
@Async
Inventory trigger
Demand trigger
Duplicate prevention
```

### Phase 7 — React

```text
Products
Suggestions
Accept/reject
Simulate sale
```

### Phase 8 — Polish

```text
Loading
Errors
Badges
Strategy switch
```

### Phase 9 — ADR + README

Do **not** leave this for the final 5 minutes. The PS gives ADR + walkthrough **20 points**, and explicitly says the ADR matters as much as the code. 

---

# 24. What I would NOT build

Given the time limit:

❌ Microservices
❌ Redis
❌ Kafka
❌ Docker
❌ Kubernetes
❌ PostgreSQL setup
❌ Authentication
❌ Complex state management in React
❌ SSE initially
❌ Competitor scraping
❌ Supplier APIs
❌ Automated purchase orders

The brief itself says to drop SSE first and then UI extras if you're running behind. **Protect the agentic loop and ADR.** 

---

# 25. Your final project structure

At the repo level:

```text
kairo/
│
├── backend/
│   ├── pom.xml
│   ├── src/
│   ├── ADR.md
│   └── README.md
│
├── frontend/
│   ├── package.json
│   ├── src/
│   └── README.md
│
├── README.md
└── .gitignore
```

And the core architecture to remember is:

```text
                    USER
                      │
                      ▼
                   REACT
                      │
                     REST
                      │
                      ▼
              ┌───────────────┐
              │ Spring Boot   │
              └───────┬───────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Product    Suggestions   Strategy
       Service      Service        │
                                   │
                         ┌─────────┴─────────┐
                         ▼                   ▼
                     RuleBased              AI
                                             │
                                             ▼
                                         LLM Gateway
                                             
                      ▲
                      │
                 Async Events
                      │
              Stock / Order Change
```

**Build the RuleBased path first, get the complete loop working, then replace the strategy with AI.** That is the safest way to finish within five hours while still hitting the highest-value parts of the PS. 
