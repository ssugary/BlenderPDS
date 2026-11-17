package com.grupo03.blenderpds;

import static org.assertj.core.api.Assertions.assertThat;

import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.service.UserService;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/**
 * End-to-end proof of the confirmation e-mail: the registration sends a REAL e-mail
 * through SMTP (the Mailpit from compose.yaml, no @MockitoBean), the test fetches the
 * message from the Mailpit API, extracts the token out of the link and confirms the
 * account with it.
 *
 * <p>Requires the test compose up (spring.docker.compose.skip.in-tests=false).
 */
@SpringBootTest
@Transactional
class EmailConfirmationEndToEndTest {

    private static final String MAILPIT_API = "http://localhost:8025/api/v1";

    @Autowired
    private UserService userService;

    @Test
    void registrationDeliversRealEmailAndTokenActivatesAccount() throws Exception {
        String email = "e2e-" + UUID.randomUUID() + "@example.com";

        userService.register("e2e", email, "senha123");

        // 1) the e-mail really arrives at the SMTP server
        String messageJson = waitForMailpitMessage(email);

        // 2) the body contains the confirmation link with the token
        Matcher matcher = Pattern.compile("confirm-email\\?token=([0-9a-fA-F-]{36})").matcher(messageJson);
        assertThat(matcher.find())
                .as("the e-mail must contain the /users/confirm-email?token=<uuid> link")
                .isTrue();
        String token = matcher.group(1);

        // 3) the token confirms the account (the flow the user would do by clicking the link)
        Optional<User> confirmed = userService.confirmEmailByToken(token);
        assertThat(confirmed).isPresent();
        assertThat(confirmed.orElseThrow().getEmail()).isEqualTo(email);
        assertThat(confirmed.orElseThrow().isEmailVerified()).isTrue();
    }

    /** Queries the Mailpit API until the message arrives (15s timeout). */
    private String waitForMailpitMessage(String email) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String searchUrl = MAILPIT_API + "/search?query="
                + URLEncoder.encode("to:" + email, StandardCharsets.UTF_8);
        // Mailpit IDs are base62 (e.g. "6GiL3izbBwr4uYu9lBGKWq"), not hex
        Pattern idPattern = Pattern.compile("\"ID\":\"([A-Za-z0-9]+)\"");

        long deadline = System.currentTimeMillis() + 15_000;
        String messageId = null;
        while (System.currentTimeMillis() < deadline && messageId == null) {
            String json = client.send(
                    HttpRequest.newBuilder(URI.create(searchUrl)).GET().build(),
                    BodyHandlers.ofString()).body();
            Matcher id = idPattern.matcher(json);
            if (id.find()) {
                messageId = id.group(1);
            } else {
                Thread.sleep(250);
            }
        }
        assertThat(messageId)
                .as("Mailpit must receive the confirmation e-mail within 15s")
                .isNotNull();

        return client.send(
                HttpRequest.newBuilder(URI.create(MAILPIT_API + "/message/" + messageId)).GET().build(),
                BodyHandlers.ofString()).body();
    }
}
