package dev.collab3d.mail;

import dev.collab3d.model.User;

/**
 * Sending of the domain's transactional e-mails. Today only the registration
 * confirmation e-mail; new types (password reset, etc.) go here.
 */
public interface EmailService {

    /**
     * Sends to {@code user.getEmail()} the confirmation link containing {@code token}.
     *
     * @throws org.springframework.mail.MailException if the sending fails
     */
    void sendConfirmationEmail(User user, String token);
}
