package com.kairo.commerce;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class CommerceAdvisorFactory {

    private final RuleBasedCommerceAdvisor ruleBasedCommerceAdvisor;
    private final AICommerceAdvisor aiCommerceAdvisor;

    @Autowired
    public CommerceAdvisorFactory(
            RuleBasedCommerceAdvisor ruleBasedCommerceAdvisor,
            AICommerceAdvisor aiCommerceAdvisor) {
        this.ruleBasedCommerceAdvisor = ruleBasedCommerceAdvisor;
        this.aiCommerceAdvisor = aiCommerceAdvisor;
    }

    public CommerceAdvisor getAdvisor(String strategy) {
        return switch (strategy.toLowerCase()) {
            case "ai" -> aiCommerceAdvisor;
            case "rule" -> ruleBasedCommerceAdvisor;
            default -> ruleBasedCommerceAdvisor; // Default to rule-based
        };
    }
}