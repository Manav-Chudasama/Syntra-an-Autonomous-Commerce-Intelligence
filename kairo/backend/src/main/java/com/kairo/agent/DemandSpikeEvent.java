package com.kairo.agent;

import java.time.LocalDateTime;

public class DemandSpikeEvent {
    private String productId;
    private int previousVelocity;
    private int newVelocity;
    private int threshold;
    private LocalDateTime timestamp;
    
    public DemandSpikeEvent(String productId, int previousVelocity, int newVelocity, int threshold) {
        this.productId = productId;
        this.previousVelocity = previousVelocity;
        this.newVelocity = newVelocity;
        this.threshold = threshold;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    public int getPreviousVelocity() {
        return previousVelocity;
    }
    
    public void setPreviousVelocity(int previousVelocity) {
        this.previousVelocity = previousVelocity;
    }
    
    public int getNewVelocity() {
        return newVelocity;
    }
    
    public void setNewVelocity(int newVelocity) {
        this.newVelocity = newVelocity;
    }
    
    public int getThreshold() {
        return threshold;
    }
    
    public void setThreshold(int threshold) {
        this.threshold = threshold;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}