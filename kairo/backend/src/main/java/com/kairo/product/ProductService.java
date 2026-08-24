package com.kairo.product;

import com.kairo.agent.AgenticLoopService;
import com.kairo.agent.InventoryEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AgenticLoopService agenticLoopService;

    @Autowired
    public ProductService(ProductRepository productRepository, AgenticLoopService agenticLoopService) {
        this.productRepository = productRepository;
        this.agenticLoopService = agenticLoopService;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(String id, Product productDetails) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setSku(productDetails.getSku());
            product.setName(productDetails.getName());
            product.setCategory(productDetails.getCategory());
            product.setCurrentPrice(productDetails.getCurrentPrice());
            product.setStockLevel(productDetails.getStockLevel());
            product.setReorderThreshold(productDetails.getReorderThreshold());
            product.setDemandVelocity(productDetails.getDemandVelocity());
            product.setStatus(productDetails.getStatus());
            
            return Optional.of(productRepository.save(product));
        }
        return Optional.empty();
    }

    public boolean deleteProduct(String id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Product> simulateOrder(String id, int quantity) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            int previousStockLevel = product.getStockLevel();
            
            // Update stock level
            int newStockLevel = Math.max(0, product.getStockLevel() - quantity);
            product.setStockLevel(newStockLevel);
            
            // Update status if out of stock
            if (newStockLevel == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            
            Product updatedProduct = productRepository.save(product);
            
            // Trigger agentic loop if stock level is below or equal to threshold
            if (newStockLevel <= product.getReorderThreshold()) {
                InventoryEvent event = new InventoryEvent(id, previousStockLevel, newStockLevel);
                agenticLoopService.processInventoryEvent(event);
            }
            
            return Optional.of(updatedProduct);
        }
        return Optional.empty();
    }

    public Optional<Product> receiveInventory(String id, int quantity) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            int previousStockLevel = product.getStockLevel();
            
            // Update stock level
            int newStockLevel = product.getStockLevel() + quantity;
            product.setStockLevel(newStockLevel);
            
            // Update status if now active
            if (newStockLevel > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                product.setStatus(ProductStatus.ACTIVE);
            }
            
            Product updatedProduct = productRepository.save(product);
            
            // Trigger agentic loop if stock level crossed threshold
            if (previousStockLevel <= product.getReorderThreshold() && 
                newStockLevel > product.getReorderThreshold()) {
                InventoryEvent event = new InventoryEvent(id, previousStockLevel, newStockLevel);
                agenticLoopService.processInventoryEvent(event);
            }
            
            return Optional.of(updatedProduct);
        }
        return Optional.empty();
    }
}