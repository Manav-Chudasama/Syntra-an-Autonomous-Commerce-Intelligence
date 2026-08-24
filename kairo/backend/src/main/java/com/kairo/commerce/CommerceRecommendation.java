package com.kairo.commerce;

import com.kairo.suggestion.PricingSuggestion;
import com.kairo.suggestion.ReorderSuggestion;

import java.util.List;

public class CommerceRecommendation {
    private List<PricingSuggestion> pricingSuggestions;
    private List<ReorderSuggestion> reorderSuggestions;
    
    public CommerceRecommendation(List<PricingSuggestion> pricingSuggestions, List<ReorderSuggestion> reorderSuggestions) {
        this.pricingSuggestions = pricingSuggestions;
        this.reorderSuggestions = reorderSuggestions;
    }
    
    // Getters and Setters
    public List<PricingSuggestion> getPricingSuggestions() {
        return pricingSuggestions;
    }
    
    public void setPricingSuggestions(List<PricingSuggestion> pricingSuggestions) {
        this.pricingSuggestions = pricingSuggestions;
    }
    
    public List<ReorderSuggestion> getReorderSuggestions() {
        return reorderSuggestions;
    }
    
    public void setReorderSuggestions(List<ReorderSuggestion> reorderSuggestions) {
        this.reorderSuggestions = reorderSuggestions;
    }
}