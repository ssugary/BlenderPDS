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
 * Prova ponta a ponta do e-mail de confirmação: o registro envia um e-mail REAL
 * pelo SMTP (Mailpit do compose.yaml, sem @MockitoBean), o teste busca a mensagem
 * na API do Mailpit, extrai o token do link e confirma a conta com ele.
 *
 * <p>Requer o compose de testes no ar (spring.docker.compose.skip.in-tests=false).
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

        // 1) o e-mail chega de verdade ao servidor SMTP
        String messageJson = waitForMailpitMessage(email);

        // 2) o corpo contém o link de confirmação com o token
        Matcher matcher = Pattern.compile("confirm-email\\?token=([0-9a-fA-F-]{36})").matcher(messageJson);
        assertThat(matcher.find())
                .as("o e-mail deve conter o link /users/confirm-email?token=<uuid>")
                .isTrue();
        String token = matcher.group(1);

        // 3) o token confirma a conta (fluxo que o usuário faria clicando no link)
        Optional<User> confirmed = userService.confirmEmailByToken(token);
        assertThat(confirmed).isPresent();
        assertThat(confirmed.orElseThrow().getEmail()).isEqualTo(email);
        assertThat(confirmed.orElseThrow().isEmailVerified()).isTrue();
    }

    /** Consulta a API do Mailpit até a mensagem chegar (timeout de 15s). */
    private String waitForMailpitMessage(String email) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String searchUrl = MAILPIT_API + "/search?query="
                + URLEncoder.encode("to:" + email, StandardCharsets.UTF_8);
        // IDs do Mailpit são base62 (ex.: "6GiL3izbBwr4uYu9lBGKWq"), não hex
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
                .as("o Mailpit deve receber o e-mail de confirmação em até 15s")
                .isNotNull();

        return client.send(
                HttpRequest.newBuilder(URI.create(MAILPIT_API + "/message/" + messageId)).GET().build(),
                BodyHandlers.ofString()).body();
    }
}
