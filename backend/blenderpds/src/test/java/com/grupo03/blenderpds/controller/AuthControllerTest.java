package com.grupo03.blenderpds.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.UserService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * The login is what lets the browser talk to the rest of the backend: the context
 * stays in the HTTP session, and it is that session's cookie that also authenticates
 * the WebSocket handshake (the browser cannot send headers on the upgrade).
 */
/**
 * Without {@code @WithAnonymousUser}: the test annotation replaces the chain's
 * {@code SecurityContextRepository}, and then the context the login stored in the
 * HTTP session would be ignored — exactly what this test has to verify.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @MockitoBean
    private EmailService emailService;

    private Long register(String nickname, boolean confirmed) {
        Long id = userService.register(nickname, nickname + "@example.com", "senha12345").getId();
        if (confirmed) {
            userService.confirmEmail(id);
        }
        return id;
    }

    /**
     * The SPA needs a readable token to send on the POST: it comes out in the body of
     * this route (the address is not public by accident — the front calls it before
     * having a session).
     */
    @Test
    void csrfEndpointGivesTheSpaATokenWithoutAuthentication() throws Exception {
        var csrf = mockMvc.perform(get("/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        assertThat(JsonPath.read(csrf.getResponse().getContentAsString(), "$.token").toString()).isNotBlank();
        assertThat(JsonPath.read(csrf.getResponse().getContentAsString(), "$.headerName").toString()).isNotBlank();
    }

    /**
     * With the plain handler (not the Xor), the raw token the front receives is exactly
     * what the filter accepts: this proves it is accepted — and that a wrong value is
     * refused with 403, that is, the test does not pass by accident.
     */
    @Test
    void csrfTokenFromTheEndpointIsAcceptedInTheAdvertisedHeader() throws Exception {
        register("csrf-round-trip", true);
        MockHttpSession session = new MockHttpSession();

        var csrf = mockMvc.perform(get("/auth/csrf").session(session))
                .andExpect(status().isOk())
                .andReturn();

        String token = JsonPath.read(csrf.getResponse().getContentAsString(), "$.token");
        String headerName = JsonPath.read(csrf.getResponse().getContentAsString(), "$.headerName");

        // without .with(csrf()): the only thing sending the token here is the advertised
        // header, with the session the browser carries on its own via the JSESSIONID cookie
        mockMvc.perform(post("/auth/login").session(session).header(headerName, token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"csrf-round-trip@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/auth/login").session(session).header(headerName, "token-invalido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"csrf-round-trip@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginStoresTheSecurityContextInTheHttpSession() throws Exception {
        register("login-ok", true);

        var result = mockMvc.perform(post("/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"login-ok@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("login-ok@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andReturn();

        // without a session there would be no JSESSIONID cookie for the WebSocket handshake
        assertThat(result.getRequest().getSession(false)).isNotNull();
    }

    @Test
    void loginWithWrongPasswordOrUnconfirmedEmailIsUnauthorized() throws Exception {
        register("login-ok2", true);
        register("login-nao-confirmado", false);

        mockMvc.perform(post("/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"login-ok2@example.com","password":"errada123"}
                                """))
                .andExpect(status().isUnauthorized());

        // UserDetailsServiceImpl marks the account disabled until the e-mail is confirmed
        mockMvc.perform(post("/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"login-nao-confirmado@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"ninguem@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithoutBodyIsRejected() throws Exception {
        mockMvc.perform(post("/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logoutEndsTheHttpSession() throws Exception {
        register("logout-user", true);

        var login = mockMvc.perform(post("/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"logout-user@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        var session = login.getRequest().getSession(false);
        assertThat(session).isNotNull();

        // the session cookie authenticates the next request (same path as the browser)
        mockMvc.perform(post("/auth/logout").with(csrf()).session((MockHttpSession) session))
                .andExpect(status().isNoContent());
    }

    @Test
    void registrationIsPublicAndStillValidates() throws Exception {
        // with no previous account nobody could create the first one: POST /users is public
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"cadastro-novo","email":"cadastro-novo@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.emailVerified").value(false));

        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"x","email":"curto@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isBadRequest());
    }
}
