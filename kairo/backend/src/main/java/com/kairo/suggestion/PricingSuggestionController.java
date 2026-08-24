package com.kairo.suggestion;

import com.kairo.product.Product;
import com.kairo.product.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pricing-suggestions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:4200"})
public class PricingSuggestionController {

    private final PricingSuggestionRepository pricingSuggestionRepository;
    private final ProductRepository productRepository;

    @Autowired
    public PricingSuggestionController(PricingSuggestionRepository pricingSuggestionRepository,
                                     ProductRepository productRepository) {
        this.pricingSuggestionRepository = pricingSuggestionRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<PricingSuggestion> getAllPricingSuggestions() {
        return pricingSuggestionRepository.findAll();
    }

    @GetMapping("/pending")
    public List<PricingSuggestion> getPendingPricingSuggestions() {
        return pricingSuggestionRepository.findByStatus(SuggestionStatus.PENDING);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<PricingSuggestion> acceptPricingSuggestion(@PathVariable Long id) {
        Optional<PricingSuggestion> suggestionOpt = pricingSuggestionRepository.findById(id);
        if (suggestionOpt.isPresent()) {
            PricingSuggestion suggestion = suggestionOpt.get();
            suggestion.setStatus(SuggestionStatus.ACCEPTED);
            
            // Update the product price
            Optional<Product> productOpt = productRepository.findById(suggestion.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                product.setCurrentPrice(suggestion.getRecommendedPrice());
                productRepository.save(product);
            }
            
            PricingSuggestion updatedSuggestion = pricingSuggestionRepository.save(suggestion);
            return ResponseEntity.ok(updatedSuggestion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PricingSuggestion> rejectPricingSuggestion(@PathVariable Long id) {
        Optional<PricingSuggestion> suggestionOpt = pricingSuggestionRepository.findById(id);
        if (suggestionOpt.isPresent()) {
            PricingSuggestion suggestion = suggestionOpt.get();
            suggestion.setStatus(SuggestionStatus.REJECTED);
            PricingSuggestion updatedSuggestion = pricingSuggestionRepository.save(suggestion);
            return ResponseEntity.ok(updatedSuggestion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}