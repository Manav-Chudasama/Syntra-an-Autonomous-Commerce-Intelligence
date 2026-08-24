package com.kairo.suggestion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PricingSuggestionRepository extends JpaRepository<PricingSuggestion, Long> {
    List<PricingSuggestion> findByProductId(String productId);
    List<PricingSuggestion> findByStatus(SuggestionStatus status);
    List<PricingSuggestion> findByTriggerReason(TriggerReason triggerReason);
    List<PricingSuggestion> findByProductIdAndTriggerReasonAndStatus(String productId, TriggerReason triggerReason, SuggestionStatus status);
}