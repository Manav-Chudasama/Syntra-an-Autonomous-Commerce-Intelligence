package com.kairo.suggestion;

import com.kairo.product.Product;
import com.kairo.product.ProductRepository;
import com.kairo.product.ProductStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reorder-suggestions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:4200"})
public class ReorderSuggestionController {

    private final ReorderSuggestionRepository reorderSuggestionRepository;
    private final ProductRepository productRepository;

    @Autowired
    public ReorderSuggestionController(ReorderSuggestionRepository reorderSuggestionRepository,
                                       ProductRepository productRepository) {
        this.reorderSuggestionRepository = reorderSuggestionRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ReorderSuggestion> getAllReorderSuggestions() {
        return reorderSuggestionRepository.findAll();
    }

    @GetMapping("/pending")
    public List<ReorderSuggestion> getPendingReorderSuggestions() {
        return reorderSuggestionRepository.findByStatus(SuggestionStatus.PENDING);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ReorderSuggestion> acceptReorderSuggestion(@PathVariable Long id) {
        Optional<ReorderSuggestion> suggestionOpt = reorderSuggestionRepository.findById(id);
        if (suggestionOpt.isPresent()) {
            ReorderSuggestion suggestion = suggestionOpt.get();
            suggestion.setStatus(SuggestionStatus.ACCEPTED);
            
            // Update the product stock
            Optional<Product> productOpt = productRepository.findById(suggestion.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                int newStock = product.getStockLevel() + suggestion.getRecommendedQuantity();
                product.setStockLevel(newStock);
                if (newStock > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
                    product.setStatus(ProductStatus.ACTIVE);
                }
                productRepository.save(product);
            }
            
            ReorderSuggestion updatedSuggestion = reorderSuggestionRepository.save(suggestion);
            return ResponseEntity.ok(updatedSuggestion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ReorderSuggestion> rejectReorderSuggestion(@PathVariable Long id) {
        Optional<ReorderSuggestion> suggestionOpt = reorderSuggestionRepository.findById(id);
        if (suggestionOpt.isPresent()) {
            ReorderSuggestion suggestion = suggestionOpt.get();
            suggestion.setStatus(SuggestionStatus.REJECTED);
            ReorderSuggestion updatedSuggestion = reorderSuggestionRepository.save(suggestion);
            return ResponseEntity.ok(updatedSuggestion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}