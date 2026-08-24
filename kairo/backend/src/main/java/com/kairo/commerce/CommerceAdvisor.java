package com.kairo.commerce;

import com.kairo.product.Product;
import com.kairo.suggestion.PricingSuggestion;
import com.kairo.suggestion.ReorderSuggestion;

import java.util.List;

public interface CommerceAdvisor {
    List<PricingSuggestion> generatePricingSuggestions(Product product);
    List<ReorderSuggestion> generateReorderSuggestions(Product product);
}