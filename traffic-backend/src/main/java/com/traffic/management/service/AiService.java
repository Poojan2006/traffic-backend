package com.traffic.management.service;

import org.springframework.ai.content.Media;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public AiService(ChatModel chatModel) {
        this.chatModel = chatModel;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Analyzes a traffic violation image using Google Gemini AI.
     */
    public Map<String, Object> analyzeViolationImage(byte[] image, String mimeTypeString) {
        logger.info("Starting REAL AI analysis with Gemini for image of size {} bytes, type {}", image.length,
                mimeTypeString);

        try {
            org.springframework.util.MimeType mimeType = org.springframework.util.MimeTypeUtils
                    .parseMimeType(mimeTypeString != null ? mimeTypeString : "image/jpeg");

            String systemPrompt = """
                    You are a strict Indian Traffic Police automated system. 
                    Analyze the given image and identify any traffic violations according to the Indian Motor Vehicles Act (IMV Act).
                    
                    CRITICAL: Your recommendedFine MUST be exactly one of the standard INR (₹) amounts below when detecting these offenses:
                    - Driving without Helmet: 1000
                    - Driving without Seatbelt: 1000
                    - Jumping Red Light / Stop Sign: 1000 to 5000
                    - Over-speeding / Dangerous Driving: 1000 to 5000
                    - Driving wrong way / lane violation: 500 to 1000
                    - Improper parking: 500
                    - Triple riding on two-wheeler: 1000
                    
                    Respond ONLY with a raw JSON object (no markdown formatting, no backticks).
                    Format:
                    {
                      "description": "Provide a brief description of the specific traffic rule violated under the IMV Act...",
                      "recommendedFine": <number>,
                      "confidence": <number between 0.0 and 1.0>
                    }
                    If no violation is found, set recommendedFine to 0.0.
                    """;

            UserMessage userMessage = UserMessage.builder()
                    .text(systemPrompt)
                    .media(new Media(mimeType, new ByteArrayResource(image)))
                    .build();

            ChatResponse response = chatModel.call(new Prompt(userMessage));
            String content = response.getResult().getOutput().getText();

            logger.info("Gemini raw response: {}", content);

            // Clean response if AI adds markdown backticks
            if (content.contains("```json")) {
                content = content.substring(content.indexOf("```json") + 7);
                content = content.substring(0, content.lastIndexOf("```"));
            } else if (content.contains("```")) {
                content = content.substring(content.indexOf("```") + 3);
                content = content.substring(0, content.lastIndexOf("```"));
            }

            return objectMapper.readValue(content.trim(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});

        } catch (Exception e) {
            String errorMsg = e.getMessage();
            if (e.getCause() != null) {
                errorMsg += " | Cause: " + e.getCause().getMessage();
            }
            logger.error("Error during Gemini AI analysis: {}", errorMsg, e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("description", "Error analyzing image: " + errorMsg);
            errorResult.put("recommendedFine", 0.0);
            errorResult.put("confidence", 0.0);
            return errorResult;
        }
    }
}
