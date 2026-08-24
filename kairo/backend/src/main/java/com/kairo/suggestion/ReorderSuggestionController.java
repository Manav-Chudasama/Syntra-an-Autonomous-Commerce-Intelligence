package com.kairo.suggestion;

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

    @Autowired
    public ReorderSuggestionController(ReorderSuggestionRepository reorderSuggestionRepository) {
        this.reorderSuggestionRepository = reorderSuggestionRepository;
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