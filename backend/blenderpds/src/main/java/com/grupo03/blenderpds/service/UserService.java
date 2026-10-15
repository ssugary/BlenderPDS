package com.grupo03.blenderpds.service;

import com.grupo03.blenderpds.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {

    /**
     * Cria o usuário (emailVerified=false), grava o token de confirmação e envia o
     * e-mail com o link. Se o envio falhar, a transação é desfeita (não fica
     * usuário sem e-mail pendente).
     */
    User register(String nickname, String email, String rawPassword);

    /**
     * Consome o token e marca o e-mail como verificado.
     *
     * @return o usuário confirmado, ou vazio se o token for desconhecido/expirado
     */
    Optional<User> confirmEmailByToken(String token);

    User create(User user, String rawPassword);

    Optional<User> getById(Long id);

    Optional<User> getByEmail(String email);

    List<User> getAll();

    User update(User user);

    void changePassword(Long id, String rawPassword);

    void confirmEmail(Long id);

    void delete(Long id);
}
