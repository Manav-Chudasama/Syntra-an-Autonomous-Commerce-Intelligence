package com.kairo.commerce;

import com.kairo.ai.LLMGateway;
import com.kairo.product.Product;
import com.kairo.suggestion.PricingSuggestion;
import com.kairo.suggestion.ReorderSuggestion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AICommerceAdvisor implements CommerceAdvisor {

    private final LLMGateway llmGateway;

    @Autowired
    public AICommerceAdvisor(LLMGateway llmGateway) {
        this.llmGateway = llmGateway;
    }

    @Override
    public List<PricingSuggestion> generatePricingSuggestions(Product product) {
        // TODO: Implement actual AI-based pricing suggestions
        return List.of();
    }

    @Override
    public List<ReorderSuggestion> generateReorderSuggestions(Product product) {
        // TODO: Implement actual AI-based reorder suggestions
        return List.of();
    }
}