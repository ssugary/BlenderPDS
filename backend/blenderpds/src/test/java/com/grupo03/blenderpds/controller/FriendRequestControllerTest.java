package com.grupo03.blenderpds.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fluxo de pedidos de amizade na camada HTTP: registro → pedido → aceite/recusa →
 * listas → unfriend, incluindo as regras de erro (400/404/409). O envio de e-mail
 * é mockado: aqui só interessa o REST.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
class FriendRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @MockitoBean
    private EmailService emailService;

    private Long register(String nickname) {
        return userService.register(nickname, nickname + "@example.com", "senha123").getId();
    }

    /** Envia um pedido e devolve o id gerado (extraído do corpo da resposta). */
    private long sendRequest(Long senderId, Long receiverId) throws Exception {
        var result = mockMvc.perform(post("/users/" + senderId + "/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":" + receiverId + "}"))
                .andExpect(status().isCreated())
                .andReturn();
        return ((Number) JsonPath.read(result.getResponse().getContentAsString(), "$.id")).longValue();
    }

    @Test
    void sendRequestCreatesPendingOnBothSidesWithoutFriendshipYet() throws Exception {
        Long a = register("ana");
        Long b = register("bruno");

        mockMvc.perform(post("/users/" + a + "/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":" + b + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.senderId").value(a.intValue()))
                .andExpect(jsonPath("$.receiverId").value(b.intValue()))
                .andExpect(jsonPath("$.senderNickname").value("ana"))
                .andExpect(jsonPath("$.receiverNickname").value("bruno"));

        // o destinatário vê o pedido pendente…
        mockMvc.perform(get("/users/" + b + "/friend-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].senderId").value(a.intValue()));

        // …e o remetente vê o pedido enviado
        mockMvc.perform(get("/users/" + a + "/friend-requests/sent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].receiverId").value(b.intValue()));

        // ainda não são amigos
        mockMvc.perform(get("/users/" + b + "/friends"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void sendRequestToSelfReturns400() throws Exception {
        Long a = register("ana");

        mockMvc.perform(post("/users/" + a + "/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":" + a + "}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sendRequestToUnknownUserReturns404() throws Exception {
        Long a = register("ana");

        mockMvc.perform(post("/users/" + a + "/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":999999}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/users/999999/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":" + a + "}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void duplicateSendReturns409() throws Exception {
        Long a = register("ana");
        Long b = register("bruno");
        sendRequest(a, b);

        mockMvc.perform(post("/users/" + a + "/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":" + b + "}"))
                .andExpect(status().isConflict());
    }

    @Test
    void reverseRequestReturns409PointingToTheIncomingOne() throws Exception {
        Long a = register("ana");
        Long b = register("bruno");
        sendRequest(a, b);

        // b já tem pedido de a pendente: não pode mandar outro para trás
        mockMvc.perform(post("/users/" + b + "/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":" + a + "}"))
                .andExpect(status().isConflict());
    }

    @Test
    void acceptMakesThemFriendsOnBothSides() throws Exception {
        Long a = register("ana");
        Long b = register("bruno");
        long requestId = sendRequest(a, b);

        mockMvc.perform(post("/users/" + b + "/friend-requests/" + requestId + "/accept").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(a.intValue()))
                .andExpect(jsonPath("$.nickname").value("ana"));

        // amizade vale nos dois lados
        mockMvc.perform(get("/users/" + a + "/friends"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nickname").value("bruno"));

        mockMvc.perform(get("/users/" + b + "/friends"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nickname").value("ana"));

        // o pedido foi consumido (nem recebido nem enviado resta)
        mockMvc.perform(get("/users/" + b + "/friend-requests")).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(get("/users/" + a + "/friend-requests/sent")).andExpect(jsonPath("$").isEmpty());

        // já são amigos → novo pedido dá 409
        mockMvc.perform(post("/users/" + a + "/friend-requests").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":" + b + "}"))
                .andExpect(status().isConflict());
    }

    @Test
    void acceptBySomeoneElseReturns404AndKeepsRequestPending() throws Exception {
        Long a = register("ana");
        Long b = register("bruno");
        Long c = register("carla");
        long requestId = sendRequest(a, b);

        mockMvc.perform(post("/users/" + c + "/friend-requests/" + requestId + "/accept").with(csrf()))
                .andExpect(status().isNotFound());

        // ninguém aceitou: segue pendente para b
        mockMvc.perform(get("/users/" + b + "/friend-requests"))
                .andExpect(jsonPath("$.length()").value(1));
        mockMvc.perform(get("/users/" + b + "/friends")).andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void rejectDoesNotCreateFriendship() throws Exception {
        Long a = register("ana");
        Long b = register("bruno");
        long requestId = sendRequest(a, b);

        mockMvc.perform(post("/users/" + b + "/friend-requests/" + requestId + "/reject").with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/users/" + b + "/friend-requests")).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(get("/users/" + a + "/friend-requests/sent")).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(get("/users/" + a + "/friends")).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(get("/users/" + b + "/friends")).andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void cancelRemovesSentRequestButOnlyByTheSender() throws Exception {
        Long a = register("ana");
        Long b = register("bruno");
        Long c = register("carla");
        long requestId = sendRequest(a, b);

        // só o remetente pode cancelar
        mockMvc.perform(delete("/users/" + c + "/friend-requests/" + requestId).with(csrf()))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/users/" + a + "/friend-requests/" + requestId).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/users/" + a + "/friend-requests/sent")).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(get("/users/" + b + "/friend-requests")).andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void unfriendRemovesBothSides() throws Exception {
        Long a = register("ana");
        Long b = register("bruno");
        long requestId = sendRequest(a, b);
        mockMvc.perform(post("/users/" + b + "/friend-requests/" + requestId + "/accept").with(csrf()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/users/" + a + "/friends/" + b).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/users/" + a + "/friends")).andExpect(jsonPath("$").isEmpty());
        mockMvc.perform(get("/users/" + b + "/friends")).andExpect(jsonPath("$").isEmpty());

        // de novo agora que não são mais → 409
        mockMvc.perform(delete("/users/" + a + "/friends/" + b).with(csrf()))
                .andExpect(status().isConflict());
    }

    @Test
    void friendsOfUnknownUserReturns404() throws Exception {
        mockMvc.perform(get("/users/999999/friends"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/users/999999/friend-requests"))
                .andExpect(status().isNotFound());
    }
}
