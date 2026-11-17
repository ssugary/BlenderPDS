package com.grupo03.blenderpds.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.grupo03.blenderpds.dto.ApiErrorDto;
import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.SessionService;
import com.grupo03.blenderpds.service.UserService;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * The REST error contract: every failure the API can produce comes out as
 * {@code {status, error, message}} with the same status it had before the handlers
 * were centralised in {@link ApiExceptionHandler}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
class ExceptionHandlingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @MockitoBean
    private EmailService emailService;

    private Long register(String nickname) {
        return userService.register(nickname, nickname + "@example.com", "senha12345").getId();
    }

    @Test
    void invalidBodyNamesTheFieldThatFailed() throws Exception {
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"","email":"broken@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value(containsString("nickname")));
    }

    @Test
    void malformedJsonIsA400WithAReadableMessage() throws Exception {
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The request body is missing or malformed."));
    }

    @Test
    void wrongPathTypeIsA400NamingTheParameter() throws Exception {
        mockMvc.perform(get("/users/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid value for 'id'."));
    }

    @Test
    void serviceNotFoundBecomes404WithABody() throws Exception {
        mockMvc.perform(get("/sessions/999999/participants"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Not found."));
    }

    @Test
    void invalidDomainRuleBecomes400() throws Exception {
        Long id = register("self-request");

        mockMvc.perform(post("/users/" + id + "/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":" + id + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The request is invalid."));
    }

    @Test
    void conflictingStateBecomes409() throws Exception {
        Long host = register("conflict-host");
        sessionService.createSession(host);

        mockMvc.perform(post("/sessions").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hostId\":" + host + "}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("The request conflicts with the current state."));
    }

    @Test
    void accessRuleBecomes403() throws Exception {
        Long host = register("forbidden-host");
        Long stranger = register("forbidden-stranger");
        Session session = sessionService.createSession(host);

        mockMvc.perform(post("/sessions/" + session.getId() + "/join").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + stranger + "}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("You are not allowed to do that."));
    }

    /** A route the API does not expose still gets the framework's 405, not a blanket 500. */
    @Test
    void unsupportedMethodKeepsTheFrameworkStatus() throws Exception {
        mockMvc.perform(get("/sessions"))
                .andExpect(status().isMethodNotAllowed());
    }

    /**
     * The unique-constraint race is not reproducible on demand, so the mapping is
     * exercised directly: 409 with a generic message, the database detail only logged.
     */
    @Test
    void constraintViolationBecomes409WithoutLeakingTheDatabaseMessage() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/users");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("insert failed",
                new SQLException("duplicate key value violates unique constraint \"uk_users_email\""));

        ResponseEntity<ApiErrorDto> response = new ApiExceptionHandler().dataIntegrity(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message())
                .isEqualTo("The request conflicts with the current state.")
                .doesNotContain("uk_users_email");
    }
}
