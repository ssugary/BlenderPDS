package com.grupo03.blenderpds.service;

import com.grupo03.blenderpds.model.User;

/**
 * Envio de e-mails transacionais do domínio. Hoje só o e-mail de confirmação de
 * cadastro; novos tipos (redefinição de senha, etc.) entram aqui.
 */
public interface EmailService {

    /**
     * Envia para {@code user.getEmail()} o link de confirmação contendo {@code token}.
     *
     * @throws org.springframework.mail.MailException se o envio falhar
     */
    void sendConfirmationEmail(User user, String token);
}
