package com.grupo03.blenderpds.service.implementation;

import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

/**
 * Sending via SMTP ({@link JavaMailSender}). In dev the recipient is the Mailpit
 * from compose.yaml — nothing goes out to the internet; the message shows up on
 * localhost:8025.
 */
@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    /** Sender (From) of the messages. */
    private final String from;

    /** Public base of the application — the link points at the backend in prod/dev. */
    private final String baseUrl;

    // explicit constructor (instead of @RequiredArgsConstructor) so that unit tests
    // can instantiate the class directly, without Spring.
    public EmailServiceImpl(JavaMailSender mailSender,
                            @Value("${app.mail.from}") String from,
                            @Value("${app.base-url}") String baseUrl) {
        this.mailSender = mailSender;
        this.from = from;
        this.baseUrl = baseUrl;
    }

    @Override
    public void sendConfirmationEmail(User user, String token) {
        String link = baseUrl + "/users/confirm-email?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            // multipart=false: HTML only, no attachment — keeps the message easy to read in tests
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(user.getEmail());
            helper.setSubject("Confirme seu e-mail — BlenderPDS");
            helper.setText(body(user.getNickname(), link), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            // the SMTP wrapper (MailException) is already unchecked and propagates straight;
            // here we only have the message-building error, which is checked.
            throw new MailSendException(
                    "Falha ao enviar e-mail de confirmação para " + user.getEmail(), e);
        }
    }

    private String body(String nickname, String link) {
        // the nickname is user input: escaping avoids HTML injection into the e-mail
        String safeNickname = HtmlUtils.htmlEscape(nickname == null ? "" : nickname);
        return """
                <html><body style="font-family: sans-serif;">
                  <p>Olá, %s!</p>
                  <p>Para concluir seu cadastro no BlenderPDS, confirme seu e-mail clicando no botão abaixo:</p>
                  <p><a href="%s" style="background:#4f46e5;color:#fff;padding:10px 18px;
                     border-radius:6px;text-decoration:none;display:inline-block;">Confirmar e-mail</a></p>
                  <p>Ou copie e cole no navegador: <br><a href="%s">%s</a></p>
                  <p>Se você não criou esta conta, ignore este e-mail.</p>
                </body></html>
                """.formatted(safeNickname, link, link, link);
    }
}
