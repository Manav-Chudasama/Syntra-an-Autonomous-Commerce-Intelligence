package com.kairo.agent;

import java.time.LocalDateTime;

public class InventoryEvent {
    private String productId;
    private int previousStockLevel;
    private int newStockLevel;
    private LocalDateTime timestamp;
    
    public InventoryEvent(String productId, int previousStockLevel, int newStockLevel) {
        this.productId = productId;
        this.previousStockLevel = previousStockLevel;
        this.newStockLevel = newStockLevel;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    public int getPreviousStockLevel() {
        return previousStockLevel;
    }
    
    public void setPreviousStockLevel(int previousStockLevel) {
        this.previousStockLevel = previousStockLevel;
    }
    
    public int getNewStockLevel() {
        return newStockLevel;
    }
    
    public void setNewStockLevel(int newStockLevel) {
        this.newStockLevel = newStockLevel;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}