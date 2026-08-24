package com.kairo.suggestion;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDateTime;

@Entity
@Table(name = "reorder_suggestions")
public class ReorderSuggestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Product ID is required")
    private String productId;
    
    @NotNull(message = "Recommended quantity is required")
    @Positive(message = "Recommended quantity must be positive")
    private Integer recommendedQuantity;
    
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
    public ReorderSuggestion() {
        this.createdAt = LocalDateTime.now();
        this.status = SuggestionStatus.PENDING;
    }
    
    // Constructor with all fields
    public ReorderSuggestion(String productId, Integer recommendedQuantity, Double confidence, 
                            String reasoning, TriggerReason triggerReason) {
        this();
        this.productId = productId;
        this.recommendedQuantity = recommendedQuantity;
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
    
    public Integer getRecommendedQuantity() {
        return recommendedQuantity;
    }
    
    public void setRecommendedQuantity(Integer recommendedQuantity) {
        this.recommendedQuantity = recommendedQuantity;
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