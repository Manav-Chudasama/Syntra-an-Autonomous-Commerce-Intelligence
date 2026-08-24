package com.kairo.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * Provider-specific HTTP for Qwen, Groq, Ollama.
 * Returns raw text — parsing, validation, fallback are yours.
 *
 * Configure in application.properties:
 *   llm.provider  = qwen
 *   llm.api-key   = ${LLM_API_KEY}
 *   llm.model     = qwen-cursor
 *   llm.base-url  = https://litellm-qc.zycus.net/v1
 */
@Component
public class LLMGateway {

    @Value("${llm.provider}")
    private String provider;
    
    @Value("${llm.api-key:}")
    private String apiKey;
    
    @Value("${llm.model}")
    private String model;
    
    @Value("${llm.base-url}")
    private String baseUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    public String callLLM(String prompt) {
        try {
            return switch (provider.toLowerCase()) {
                case "qwen" -> callQwen(prompt);
                case "groq" -> callOpenAICompatible(prompt, baseUrl + "/openai/v1/chat/completions");
                case "ollama" -> callOpenAICompatible(prompt, baseUrl + "/v1/chat/completions");
                default -> throw new IllegalStateException("Unknown provider: " + provider);
            };
        } catch (RestClientResponseException e) {
            throw new AIException("LLM API call failed: " + e.getMessage(), e);
        }
    }

    private String callQwen(String prompt) {
        String url = baseUrl + "/chat/completions";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        headers.add("product", "PC1");
        
        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", 0.7
        );
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
                
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            throw new AIException("Invalid response format from Qwen API");
        } catch (RestClientResponseException e) {
            throw new AIException("Qwen API call failed: " + e.getResponseBodyAsString(), e);
        }
    }

    private String callOpenAICompatible(String prompt, String url) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (!apiKey.isEmpty()) {
            headers.setBearerAuth(apiKey);
        }
        
        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", 0.7
        );
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
                
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            throw new AIException("Invalid response format from OpenAI-compatible API");
        } catch (RestClientResponseException e) {
            throw new AIException("OpenAI-compatible API call failed: " + e.getResponseBodyAsString(), e);
        }
    }
}