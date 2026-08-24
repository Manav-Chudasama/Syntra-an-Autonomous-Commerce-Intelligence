package com.kairo.suggestion;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pricing_suggestions")
public class PricingSuggestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Product ID is required")
    private String productId;
    
    @NotNull(message = "Recommended price is required")
    @Positive(message = "Recommended price must be positive")
    private BigDecimal recommendedPrice;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Direction is required")
    private PriceDirection direction;
    
    @NotNull(message = "Confidence is required")
    @PositiveOrZero(message = "Confidence must be positive or zero")
    @Max(value = 1, message = "Confidence must be between 0 and 1")
    private Double confidence;
    
    @NotNull(message = "Reasoning is required")
    @Column(length = 1000)
    private String reasoning;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status is required")
    private SuggestionStatus status;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Trigger reason is required")
    private TriggerReason triggerReason;
    
    @NotNull(message = "Created at is required")
    private LocalDateTime createdAt;
    
    // Default constructor
    public PricingSuggestion() {
        this.createdAt = LocalDateTime.now();
        this.status = SuggestionStatus.PENDING;
    }
    
    // Constructor with all fields
    public PricingSuggestion(String productId, BigDecimal recommendedPrice, PriceDirection direction, 
                            Double confidence, String reasoning, TriggerReason triggerReason) {
        this();
        this.productId = productId;
        this.recommendedPrice = recommendedPrice;
        this.direction = direction;
        this.confidence = confidence;
        this.reasoning = reasoning;
        this.triggerReason = triggerReason;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    public BigDecimal getRecommendedPrice() {
        return recommendedPrice;
    }
    
    public void setRecommendedPrice(BigDecimal recommendedPrice) {
        this.recommendedPrice = recommendedPrice;
    }
    
    public PriceDirection getDirection() {
        return direction;
    }
    
    public void setDirection(PriceDirection direction) {
        this.direction = direction;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public String getReasoning() {
        return reasoning;
    }
    
    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }
    
    public SuggestionStatus getStatus() {
        return status;
    }
    
    public void setStatus(SuggestionStatus status) {
        this.status = status;
    }
    
    public TriggerReason getTriggerReason() {
        return triggerReason;
    }
    
    public void setTriggerReason(TriggerReason triggerReason) {
        this.triggerReason = triggerReason;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}