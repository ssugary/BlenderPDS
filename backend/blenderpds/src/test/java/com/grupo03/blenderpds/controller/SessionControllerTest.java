package com.grupo03.blenderpds.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.SessionService;
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
 * Sessions on the HTTP layer: create, fetch by id/code, join (through the friendship
 * gate), leave, end and list friends' rooms.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
class SessionControllerTest {

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

    private void befriend(Long a, Long b) {
        Long requestId = userService.sendFriendRequest(a, b).getId();
        userService.acceptFriendRequest(requestId, b);
    }

    private long createSession(Long hostId) throws Exception {
        var result = mockMvc.perform(post("/sessions").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hostId\":" + hostId + "}"))
                .andExpect(status().isCreated())
                .andReturn();
        return ((Number) JsonPath.read(result.getResponse().getContentAsString(), "$.id")).longValue();
    }

    @Test
    void createReturnsCodeStatusAndHost() throws Exception {
        Long host = register("harry");

        mockMvc.perform(post("/sessions").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hostId\":" + host + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.code").isString())
                .andExpect(jsonPath("$.status").value("WAITING"))
                .andExpect(jsonPath("$.hostId").value(host))
                .andExpect(jsonPath("$.hostNickname").value("harry"))
                .andExpect(jsonPath("$.maxParticipants").value(4))
                .andExpect(jsonPath("$.participantCount").value(1))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    void createWithUnknownHostReturns404AndSecondOpenSessionReturns409() throws Exception {
        mockMvc.perform(post("/sessions").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hostId\":999999}"))
                .andExpect(status().isNotFound());

        Long host = register("heloisa");
        mockMvc.perform(post("/sessions").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hostId\":" + host + "}"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/sessions").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hostId\":" + host + "}"))
                .andExpect(status().isConflict());
    }

    @Test
    void getByIdAndByCodeFindTheSession() throws Exception {
        Long host = register("hugo");
        long sessionId = createSession(host);
        Session session = sessionService.getById(sessionId).orElseThrow();

        mockMvc.perform(get("/sessions/" + sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("WAITING"));

        mockMvc.perform(get("/sessions/code/" + session.getCode()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sessionId));

        // the code is normalised (the user may paste it in lowercase)
        mockMvc.perform(get("/sessions/code/" + session.getCode().toLowerCase()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sessionId));

        mockMvc.perform(get("/sessions/999999")).andExpect(status().isNotFound());
        mockMvc.perform(get("/sessions/code/NAOEXISTE")).andExpect(status().isNotFound());
    }

    @Test
    void participantsIncludeTheHost() throws Exception {
        Long host = register("helena");
        long sessionId = createSession(host);

        mockMvc.perform(get("/sessions/" + sessionId + "/participants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].userId").value(host))
                .andExpect(jsonPath("$[0].nickname").value("helena"))
                .andExpect(jsonPath("$[0].active").value(false));

        mockMvc.perform(get("/sessions/999999/participants")).andExpect(status().isNotFound());
    }

    @Test
    void joiningRequiresFriendshipAndAnOpenSession() throws Exception {
        Long host = register("hosana");
        Long friend = register("fabio");
        Long stranger = register("zeca");
        befriend(host, friend);
        long sessionId = createSession(host);

        mockMvc.perform(post("/sessions/" + sessionId + "/join").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + stranger + "}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/sessions/" + sessionId + "/join").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + friend + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participantCount").value(2));

        mockMvc.perform(post("/sessions/999999/join").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + friend + "}"))
                .andExpect(status().isNotFound());

        // an ended room accepts nobody else
        mockMvc.perform(post("/sessions/" + sessionId + "/end").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + host + "}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/sessions/" + sessionId + "/join").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + friend + "}"))
                .andExpect(status().isConflict());
    }

    @Test
    void leaveReturnsNoContentAndEndIsHostOnly() throws Exception {
        Long host = register("iara");
        Long guest = register("jonas");
        befriend(host, guest);
        long sessionId = createSession(host);

        mockMvc.perform(post("/sessions/" + sessionId + "/leave").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + host + "}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/sessions/" + sessionId + "/end").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + guest + "}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/sessions/" + sessionId + "/end").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + host + "}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/sessions/" + sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ENDED"))
                .andExpect(jsonPath("$.endedAt").isNotEmpty());
    }

    @Test
    void friendsSessionsExposeOnlyActiveSessionsOfFriends() throws Exception {
        Long host = register("karla");
        Long friend = register("lucas");
        Long stranger = register("mario");
        befriend(host, friend);
        long sessionId = createSession(host);

        // WAITING (nobody connected) is not "hosting" yet
        mockMvc.perform(get("/sessions/friends/" + friend))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        sessionService.connectParticipant(sessionId, host);

        mockMvc.perform(get("/sessions/friends/" + friend))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(sessionId))
                .andExpect(jsonPath("$[0].hostNickname").value("karla"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));

        mockMvc.perform(get("/sessions/friends/" + stranger))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void stateReturnsTheSnapshotOrNotFound() throws Exception {
        Long host = register("nadia");
        long sessionId = createSession(host);

        mockMvc.perform(get("/sessions/" + sessionId + "/state")).andExpect(status().isNotFound());

        sessionService.saveSnapshot(sessionId, host, "{\"objects\":[]}");

        var result = mockMvc.perform(get("/sessions/" + sessionId + "/state"))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getContentAsString()).isEqualTo("{\"objects\":[]}");
        assertThat(result.getResponse().getContentType()).contains(MediaType.APPLICATION_JSON_VALUE);
    }
}
