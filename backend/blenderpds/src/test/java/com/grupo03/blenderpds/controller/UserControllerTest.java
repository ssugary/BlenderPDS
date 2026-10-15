package com.grupo03.blenderpds.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    // o register dispara e-mail; aqui interessa só o HTTP, então mocka o envio
    @MockitoBean
    private EmailService emailService;

    private String lastSentToken() {
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        org.mockito.Mockito.verify(emailService)
                .sendConfirmationEmail(org.mockito.ArgumentMatchers.any(), captor.capture());
        return captor.getValue();
    }

    @Test
    void registerReturnsCreatedWithoutExposingPassword() throws Exception {
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"bia","email":"bia@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nickname").value("bia"))
                .andExpect(jsonPath("$.email").value("bia@example.com"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.emailVerified").value(false))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void registerWithoutPasswordReturns400() throws Exception {
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"bia","email":"bia@example.com"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerWithInvalidEmailReturns400() throws Exception {
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"bia","email":"nao-e-email","password":"senha12345"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerWithTooShortPasswordReturns400() throws Exception {
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"bia","email":"bia@example.com","password":"senha12"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerWithTooLongPasswordReturns400() throws Exception {
        String password = "a".repeat(129);
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"bia\",\"email\":\"bia@example.com\","
                                + "\"password\":\"" + password + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerWithTooShortNicknameReturns400() throws Exception {
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"ab","email":"bia@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerWithTooLongNicknameReturns400() throws Exception {
        String nickname = "a".repeat(33);
        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"" + nickname + "\",\"email\":\"bia@example.com\","
                                + "\"password\":\"senha12345\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerDuplicatedEmailReturns409() throws Exception {
        userService.register("bia", "bia@example.com", "senha12345");

        mockMvc.perform(post("/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"outra-bia","email":"bia@example.com","password":"senha12345"}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void getsUserByIdOrNotFound() throws Exception {
        Long id = userService.register("davi", "davi@example.com", "senha12345").getId();

        mockMvc.perform(get("/users/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("davi"));

        mockMvc.perform(get("/users/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listsRegisteredUsers() throws Exception {
        userService.register("elo", "elo@example.com", "senha12345");

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'elo@example.com')]").exists())
                .andExpect(jsonPath("$[*].password").doesNotExist());
    }

    @Test
    void updateChangesNicknameButNotRoleNorEmailVerified() throws Exception {
        Long id = userService.register("ana", "ana@example.com", "senha12345").getId();

        mockMvc.perform(put("/users/" + id).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"ana-editada","email":"ana@example.com","role":"ADMIN","emailVerified":true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("ana-editada"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.emailVerified").value(false));

        mockMvc.perform(put("/users/999999").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"x","email":"x@example.com"}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteRemovesUser() throws Exception {
        Long id = userService.register("gabi", "gabi@example.com", "senha12345").getId();

        mockMvc.perform(delete("/users/" + id).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/users/" + id))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/users/999999").with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void confirmEmailMarksUserAsVerified() throws Exception {
        Long id = userService.register("carla", "carla@example.com", "senha12345").getId();

        mockMvc.perform(post("/users/" + id + "/confirm-email").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailVerified").value(true));
    }

    @Test
    @WithAnonymousUser
    void confirmEmailByLinkFromEmailWorksAnonymously() throws Exception {
        userService.register("lara", "lara@example.com", "senha12345");
        String token = lastSentToken();

        mockMvc.perform(get("/users/confirm-email").param("token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("lara@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @WithAnonymousUser
    void confirmEmailWithBadOrMissingTokenReturns400() throws Exception {
        userService.register("lara", "lara@example.com", "senha12345");

        mockMvc.perform(get("/users/confirm-email").param("token", "nao-existe"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/users/confirm-email"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithAnonymousUser
    void anonymousUserCannotReadUsers() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isUnauthorized());
    }
}
