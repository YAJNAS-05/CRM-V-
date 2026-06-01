package com.everx.crm.account;

import com.everx.crm.account.dto.CreateAccountRequest;
import com.everx.crm.account.dto.AccountDto;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "SALES_MANAGER")
    public void testCreateAccount() throws Exception {
        CreateAccountRequest request = CreateAccountRequest.builder()
                .name("Test Account")
                .email("test@account.com")
                .phone("123-456-7890")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/crm/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Account"))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).contains("Test Account");
    }

    @Test
    @WithMockUser(roles = "SALES_MANAGER")
    public void testGetAllAccounts() throws Exception {
        mockMvc.perform(get("/api/v1/crm/accounts")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "SALES_MANAGER")
    public void testGetAccountById() throws Exception {
        // First create an account
        CreateAccountRequest request = CreateAccountRequest.builder()
                .name("Test Account")
                .email("test@account.com")
                .phone("123-456-7890")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/v1/crm/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        AccountDto createdAccount = objectMapper.readValue(
            objectMapper.readTree(responseBody).get("data").toString(),
            AccountDto.class
        );

        // Then retrieve it
        mockMvc.perform(get("/api/v1/crm/accounts/" + createdAccount.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Account"));
    }

    @Test
    @WithMockUser(roles = "SALES_MANAGER")
    public void testUpdateAccount() throws Exception {
        // First create an account
        CreateAccountRequest request = CreateAccountRequest.builder()
                .name("Test Account")
                .email("test@account.com")
                .phone("123-456-7890")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/v1/crm/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        AccountDto createdAccount = objectMapper.readValue(
            objectMapper.readTree(responseBody).get("data").toString(),
            AccountDto.class
        );

        // Update the account
        CreateAccountRequest updateRequest = CreateAccountRequest.builder()
                .name("Updated Account")
                .email("updated@account.com")
                .phone("987-654-3210")
                .build();

        mockMvc.perform(put("/api/v1/crm/accounts/" + createdAccount.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Account"));
    }

    @Test
    @WithMockUser(roles = "SALES_MANAGER")
    public void testDeleteAccount() throws Exception {
        // First create an account
        CreateAccountRequest request = CreateAccountRequest.builder()
                .name("Test Account")
                .email("test@account.com")
                .phone("123-456-7890")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/v1/crm/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        AccountDto createdAccount = objectMapper.readValue(
            objectMapper.readTree(responseBody).get("data").toString(),
            AccountDto.class
        );

        // Delete the account
        mockMvc.perform(delete("/api/v1/crm/accounts/" + createdAccount.getId())
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
