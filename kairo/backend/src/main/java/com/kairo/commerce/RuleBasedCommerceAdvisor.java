package com.kairo.commerce;

import com.kairo.product.Product;
import com.kairo.suggestion.PricingSuggestion;
import com.kairo.suggestion.ReorderSuggestion;
import com.kairo.suggestion.PriceDirection;
import com.kairo.suggestion.TriggerReason;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class RuleBasedCommerceAdvisor implements CommerceAdvisor {

    @Override
    public List<PricingSuggestion> generatePricingSuggestions(Product product) {
        List<PricingSuggestion> suggestions = new ArrayList<>();
        
        // Check if stock is low
        if (product.getStockLevel() <= product.getReorderThreshold()) {
            // Increase price if demand is high
            if (product.getDemandVelocity() > 10) {
                BigDecimal newPrice = product.getCurrentPrice().multiply(new BigDecimal("1.1")); // 10% increase
                PricingSuggestion suggestion = new PricingSuggestion(
                    product.getId(),
                    newPrice,
                    PriceDirection.INCREASE,
                    0.8,
                    "High demand with low inventory justifies price increase to optimize revenue",
                    TriggerReason.LOW_INVENTORY
                );
                suggestions.add(suggestion);
            } else if (product.getDemandVelocity() < 3) {
                // Decrease price if demand is low and stock is low
                BigDecimal newPrice = product.getCurrentPrice().multiply(new BigDecimal("0.95")); // 5% decrease
                PricingSuggestion suggestion = new PricingSuggestion(
                    product.getId(),
                    newPrice,
                    PriceDirection.DECREASE,
                    0.7,
                    "Low demand with low inventory suggests price reduction to stimulate sales",
                    TriggerReason.LOW_INVENTORY
                );
                suggestions.add(suggestion);
            }
        } else if (product.getDemandVelocity() > 15) {
            // High demand velocity - increase price
            BigDecimal newPrice = product.getCurrentPrice().multiply(new BigDecimal("1.05")); // 5% increase
            PricingSuggestion suggestion = new PricingSuggestion(
                product.getId(),
                newPrice,
                PriceDirection.INCREASE,
                0.75,
                "High demand velocity justifies slight price increase to maximize revenue",
                TriggerReason.HIGH_DEMAND
            );
            suggestions.add(suggestion);
        }
        
        return suggestions;
    }

    @Override
    public List<ReorderSuggestion> generateReorderSuggestions(Product product) {
        List<ReorderSuggestion> suggestions = new ArrayList<>();
        
        // Check if stock is below reorder threshold
        if (product.getStockLevel() <= product.getReorderThreshold()) {
            // Calculate reorder quantity based on demand velocity
            int reorderQuantity = Math.max(
                product.getReorderThreshold() * 3, // Minimum 3x threshold
                product.getDemandVelocity() * 10   // Based on 10 periods of demand
            );
            
            ReorderSuggestion suggestion = new ReorderSuggestion(
                product.getId(),
                reorderQuantity,
                0.9,
                "Current stock " + product.getStockLevel() + " is below threshold " + product.getReorderThreshold() + 
                ". Recommended reorder quantity based on demand velocity of " + product.getDemandVelocity(),
                TriggerReason.LOW_INVENTORY
            );
            suggestions.add(suggestion);
        } else if (product.getDemandVelocity() > 15) {
            // High demand velocity - suggest reorder even if above threshold
            int reorderQuantity = product.getDemandVelocity() * 8; // Based on 8 periods of demand
            
            ReorderSuggestion suggestion = new ReorderSuggestion(
                product.getId(),
                reorderQuantity,
                0.8,
                "High demand velocity (" + product.getDemandVelocity() + ") suggests proactive reorder",
                TriggerReason.DEMAND_SPIKE
            );
            suggestions.add(suggestion);
        }
        
        return suggestions;
    }
}