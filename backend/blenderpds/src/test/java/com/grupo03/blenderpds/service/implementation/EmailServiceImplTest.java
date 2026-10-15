package com.grupo03.blenderpds.service.implementation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.grupo03.blenderpds.model.User;
import jakarta.mail.Message;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Teste de unidade (sem Spring): o {@link JavaMailSender} é mockado e a mensagem
 * montada é inspecionada diretamente.
 */
class EmailServiceImplTest {

    private final JavaMailSender mailSender = mock(JavaMailSender.class);

    private final EmailServiceImpl service =
            new EmailServiceImpl(mailSender, "no-reply@blenderpds.local", "http://localhost:8080");

    @BeforeEach
    void setUp() throws Exception {
        // mensagem real "vazia": pode ser montada sem servidor SMTP por perto
        when(mailSender.createMimeMessage()).thenReturn(new JavaMailSenderImpl().createMimeMessage());
    }

    @Test
    void sendsConfirmationEmailWithLinkAndToken() throws Exception {
        User user = new User();
        user.setNickname("bia");
        user.setEmail("bia@example.com");

        service.sendConfirmationEmail(user, "11111111-2222-3333-4444-555555555555");

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        MimeMessage sent = captor.getValue();

        assertThat(sent.getRecipients(Message.RecipientType.TO))
                .extracting(Object::toString)
                .containsExactly("bia@example.com");
        assertThat(sent.getSubject()).contains("Confirme seu e-mail");
        String html = sent.getContent().toString();
        assertThat(html).contains("http://localhost:8080/users/confirm-email?token=11111111-2222-3333-4444-555555555555");
        assertThat(html).contains("Olá, bia!");
    }

    @Test
    void escapesHtmlInTheNickname() throws Exception {
        User user = new User();
        user.setNickname("<script>alert(1)</script>");
        user.setEmail("atacante@example.com");

        service.sendConfirmationEmail(user, "token");

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        String html = captor.getValue().getContent().toString();

        assertThat(html).doesNotContain("<script>");
        assertThat(html).contains("&lt;script&gt;");
    }

    @Test
    void transportFailurePropagatesAsMailSendException() {
        // send(MimeMessage) é void: doThrow em vez de when(...).thenThrow(...)
        org.mockito.Mockito.doThrow(new MailSendException("SMTP fora do ar"))
                .when(mailSender).send(any(MimeMessage.class));

        User user = new User();
        user.setNickname("bia");
        user.setEmail("bia@example.com");

        // a falha de transporte é unchecked (MailSendException) e propaga direto,
        // derrubando o registro na transação — sem engolir o erro
        assertThatThrownBy(() -> service.sendConfirmationEmail(user, "token"))
                .isInstanceOf(MailSendException.class)
                .hasMessageContaining("SMTP fora do ar");
    }
}
