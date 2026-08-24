package com.kairo.product;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    private String id;
    
    @NotBlank(message = "SKU is required")
    @Column(unique = true)
    private String sku;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Category is required")
    private Category category;
    
    @NotNull(message = "Current price is required")
    @PositiveOrZero(message = "Price must be positive or zero")
    private BigDecimal currentPrice;
    
    @NotNull(message = "Stock level is required")
    @PositiveOrZero(message = "Stock level must be positive or zero")
    private Integer stockLevel;
    
    @NotNull(message = "Reorder threshold is required")
    @PositiveOrZero(message = "Reorder threshold must be positive or zero")
    private Integer reorderThreshold;
    
    @NotNull(message = "Demand velocity is required")
    @PositiveOrZero(message = "Demand velocity must be positive or zero")
    private Integer demandVelocity;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status is required")
    private ProductStatus status;

    // Default constructor
    public Product() {}
    
    // Constructor with all fields
    public Product(String id, String sku, String name, Category category, BigDecimal currentPrice, 
                   Integer stockLevel, Integer reorderThreshold, Integer demandVelocity, ProductStatus status) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.category = category;
        this.currentPrice = currentPrice;
        this.stockLevel = stockLevel;
        this.reorderThreshold = reorderThreshold;
        this.demandVelocity = demandVelocity;
        this.status = status;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getSku() {
        return sku;
    }
    
    public void setSku(String sku) {
        this.sku = sku;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }
    
    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }
    
    public Integer getStockLevel() {
        return stockLevel;
    }
    
    public void setStockLevel(Integer stockLevel) {
        this.stockLevel = stockLevel;
    }
    
    public Integer getReorderThreshold() {
        return reorderThreshold;
    }
    
    public void setReorderThreshold(Integer reorderThreshold) {
        this.reorderThreshold = reorderThreshold;
    }
    
    public Integer getDemandVelocity() {
        return demandVelocity;
    }
    
    public void setDemandVelocity(Integer demandVelocity) {
        this.demandVelocity = demandVelocity;
    }
    
    public ProductStatus getStatus() {
        return status;
    }
    
    public void setStatus(ProductStatus status) {
        this.status = status;
    }
}