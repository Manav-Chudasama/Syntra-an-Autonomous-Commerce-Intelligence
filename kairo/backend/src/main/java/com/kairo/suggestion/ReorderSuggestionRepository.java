package com.kairo.suggestion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReorderSuggestionRepository extends JpaRepository<ReorderSuggestion, Long> {
    List<ReorderSuggestion> findByProductId(String productId);
    List<ReorderSuggestion> findByStatus(SuggestionStatus status);
    List<ReorderSuggestion> findByTriggerReason(TriggerReason triggerReason);
    List<ReorderSuggestion> findByProductIdAndTriggerReasonAndStatus(String productId, TriggerReason triggerReason, SuggestionStatus status);
}