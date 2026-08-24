package com.kairo.agent;

import com.kairo.commerce.CommerceAdvisor;
import com.kairo.commerce.CommerceAdvisorFactory;
import com.kairo.product.Product;
import com.kairo.product.ProductRepository;
import com.kairo.suggestion.PricingSuggestion;
import com.kairo.suggestion.PricingSuggestionRepository;
import com.kairo.suggestion.ReorderSuggestion;
import com.kairo.suggestion.ReorderSuggestionRepository;
import com.kairo.suggestion.SuggestionStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AgenticLoopService {

    private final ProductRepository productRepository;
    private final PricingSuggestionRepository pricingSuggestionRepository;
    private final ReorderSuggestionRepository reorderSuggestionRepository;
    private final CommerceAdvisorFactory advisorFactory;
    
    // In-memory store for tracking recently processed events to prevent duplicates
    private final Set<String> processedEvents = ConcurrentHashMap.newKeySet();

    @Autowired
    public AgenticLoopService(
            ProductRepository productRepository,
            PricingSuggestionRepository pricingSuggestionRepository,
            ReorderSuggestionRepository reorderSuggestionRepository,
            CommerceAdvisorFactory advisorFactory) {
        this.productRepository = productRepository;
        this.pricingSuggestionRepository = pricingSuggestionRepository;
        this.reorderSuggestionRepository = reorderSuggestionRepository;
        this.advisorFactory = advisorFactory;
    }

    @Async("taskExecutor")
    public void processInventoryEvent(InventoryEvent event) {
        String eventId = "inventory-" + event.getProductId() + "-" + event.getTimestamp().toString();
        
        // Prevent duplicate processing
        if (processedEvents.contains(eventId)) {
            return;
        }
        processedEvents.add(eventId);
        
        try {
            Product product = productRepository.findById(event.getProductId()).orElse(null);
            if (product == null) {
                return;
            }
            
            // Check if stock level dropped below threshold
            if (event.getNewStockLevel() <= product.getReorderThreshold() && 
                event.getPreviousStockLevel() > product.getReorderThreshold()) {
                generateSuggestionsForProduct(product, "LOW_INVENTORY");
            }
        } finally {
            // Clean up old event IDs to prevent memory leaks
            cleanupProcessedEvents();
        }
    }

    @Async("taskExecutor")
    public void processDemandSpikeEvent(DemandSpikeEvent event) {
        String eventId = "demand-" + event.getProductId() + "-" + event.getTimestamp().toString();
        
        // Prevent duplicate processing
        if (processedEvents.contains(eventId)) {
            return;
        }
        processedEvents.add(eventId);
        
        try {
            Product product = productRepository.findById(event.getProductId()).orElse(null);
            if (product == null) {
                return;
            }
            
            // Check if velocity crossed threshold
            if (event.getNewVelocity() >= event.getThreshold() && 
                event.getPreviousVelocity() < event.getThreshold()) {
                generateSuggestionsForProduct(product, "DEMAND_SPIKE");
            }
        } finally {
            // Clean up old event IDs to prevent memory leaks
            cleanupProcessedEvents();
        }
    }

    private void generateSuggestionsForProduct(Product product, String triggerType) {
        // Use AI strategy by default, but could be configurable
        CommerceAdvisor advisor = advisorFactory.getAdvisor("ai");
        
        // Generate pricing suggestions
        List<PricingSuggestion> pricingSuggestions = advisor.generatePricingSuggestions(product);
        for (PricingSuggestion suggestion : pricingSuggestions) {
            // Only save if not already existing
            if (!isDuplicatePricingSuggestion(suggestion)) {
                pricingSuggestionRepository.save(suggestion);
            }
        }
        
        // Generate reorder suggestions
        List<ReorderSuggestion> reorderSuggestions = advisor.generateReorderSuggestions(product);
        for (ReorderSuggestion suggestion : reorderSuggestions) {
            // Only save if not already existing
            if (!isDuplicateReorderSuggestion(suggestion)) {
                reorderSuggestionRepository.save(suggestion);
            }
        }
    }

    private boolean isDuplicatePricingSuggestion(PricingSuggestion suggestion) {
        // Check for existing pending suggestions for the same product and trigger reason
        return !pricingSuggestionRepository
            .findByProductIdAndTriggerReasonAndStatus(
                suggestion.getProductId(), 
                suggestion.getTriggerReason(), 
                SuggestionStatus.PENDING)
            .isEmpty();
    }

    private boolean isDuplicateReorderSuggestion(ReorderSuggestion suggestion) {
        // Check for existing pending suggestions for the same product and trigger reason
        return !reorderSuggestionRepository
            .findByProductIdAndTriggerReasonAndStatus(
                suggestion.getProductId(), 
                suggestion.getTriggerReason(), 
                SuggestionStatus.PENDING)
            .isEmpty();
    }

    private void cleanupProcessedEvents() {
        // In a real implementation, we would implement a more sophisticated cleanup
        // For now, we'll just clear if we have too many entries
        if (processedEvents.size() > 10000) {
            processedEvents.clear();
        }
    }
}