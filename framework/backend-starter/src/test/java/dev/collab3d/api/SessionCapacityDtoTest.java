package dev.collab3d.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import dev.collab3d.mail.EmailService;
import dev.support.LegacyIdentityConfiguration;
import dev.collab3d.user.UserService;
import dev.support.CapacityTwoConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * P1.13 acceptance: {@code SessionDto.maxParticipants} reports what the
 * {@code SessionCapacityPolicy} chain decided, not a constant. Shape unchanged; only the
 * value follows the configured rule.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
@Import({CapacityTwoConfiguration.class, LegacyIdentityConfiguration.class})
class SessionCapacityDtoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @MockitoBean
    private EmailService emailService;

    @Test
    void theDtoAnnouncesTheCapacityOfThePolicy() throws Exception {
        Long host = userService.register("capacidade-host", "capacidade-host@example.com", "senha12345").getId();

        var created = mockMvc.perform(post("/sessions").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hostId\":" + host + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.maxParticipants").value(2))
                .andReturn();

        long sessionId = ((Number) JsonPath.read(created.getResponse().getContentAsString(), "$.id")).longValue();

        mockMvc.perform(get("/sessions/" + sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maxParticipants").value(2));
    }
}
