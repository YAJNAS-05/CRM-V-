package com.everx.shared.notification;

import com.everx.shared.notification.dto.CreateNotificationRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "SUPABASE_URL=http://localhost",
        "SUPABASE_SERVICE_ROLE_KEY=test-service-role-key"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class NotificationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    @WithMockUser(username = "notify@everx.com", authorities = {"ROLE_EMPLOYEE"})
    void notificationFlow_createListReadAllAndDedupe() throws Exception {
        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .type("info")
                .title("Workflow Approval")
                .message("An item is waiting for your approval")
                .dedupeKey("approval-item-1001")
                .build();

        MvcResult createResultOne = mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("info"))
                .andReturn();

        MvcResult createResultTwo = mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        JsonNode firstPayload = objectMapper.readTree(createResultOne.getResponse().getContentAsString());
        JsonNode secondPayload = objectMapper.readTree(createResultTwo.getResponse().getContentAsString());
        String firstId = firstPayload.path("data").path("id").asText();
        String secondId = secondPayload.path("data").path("id").asText();

        org.junit.jupiter.api.Assertions.assertEquals(firstId, secondId, "dedupe should return existing notification");

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(firstId))
                .andExpect(jsonPath("$.data[0].isRead").value(false));

        mockMvc.perform(patch("/api/v1/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].isRead").value(true));

        int unreadCount = (int) notificationRepository
                .findTop100ByRecipientEmailAndIsDeletedFalseOrderByCreatedAtDesc("notify@everx.com")
                .stream()
                .filter(notification -> !Boolean.TRUE.equals(notification.getIsRead()))
                .count();

        org.junit.jupiter.api.Assertions.assertEquals(0, unreadCount);
    }
}
