package com.grupo03.blenderpds.service;

import com.grupo03.blenderpds.model.FriendRequest;
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

    /**
     * Envia pedido de amizade de senderId para receiverId.
     *
     * @throws EntityNotFoundException se algum dos dois usuários não existe
     * @throws IllegalArgumentException se senderId == receiverId (pedido para si mesmo)
     * @throws IllegalStateException se já são amigos, já existe pedido aberto
     *                                 ou o outro lado já enviou um pedido
     */
    FriendRequest sendFriendRequest(Long senderId, Long receiverId);

    /**
     * Aceita o pedido: cria a amizade nos DOIS lados do friendList e apaga o pedido.
     *
     * @throws EntityNotFoundException se o pedido não existe ou não foi recebido por receiverId
     */
    FriendRequest acceptFriendRequest(Long requestId, Long receiverId);

    /**
     * Recusa o pedido (só quem recebeu pode). Amizade não é criada; a linha some.
     *
     * @throws EntityNotFoundException se o pedido não existe ou não foi recebido por receiverId
     */
    FriendRequest rejectFriendRequest(Long requestId, Long receiverId);

    /**
     * Cancela um pedido enviado (só quem enviou pode).
     *
     * @throws EntityNotFoundException se o pedido não existe ou não foi enviado por senderId
     */
    FriendRequest cancelFriendRequest(Long requestId, Long senderId);

    /** Pedidos pendentes RECEBIDOS por userId, mais recentes primeiro. */
    List<FriendRequest> getPendingFriendRequests(Long userId);

    /** Pedidos pendentes ENVIADOS por userId (para poder cancelar). */
    List<FriendRequest> getSentFriendRequests(Long userId);

    /** Lista de amigos confirmados de userId. */
    List<User> getFriendList(Long userId);

    /**
     * Remove a amizade dos DOIS lados.
     *
     * @throws EntityNotFoundException se algum usuário não existe
     * @throws IllegalStateException se eles não são amigos
     */
    void removeFriend(Long userId, Long friendId);
}
