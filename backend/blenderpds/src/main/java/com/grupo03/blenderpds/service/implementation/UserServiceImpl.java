package com.grupo03.blenderpds.service.implementation;

import com.grupo03.blenderpds.model.EmailConfirmationToken;
import com.grupo03.blenderpds.model.FriendRequest;
import com.grupo03.blenderpds.model.Role;
import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.repository.EmailConfirmationTokenRepository;
import com.grupo03.blenderpds.repository.FriendRequestRepository;
import com.grupo03.blenderpds.repository.UserRepository;
import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    /** Validade do link de confirmação enviado por e-mail. */
    private static final Duration CONFIRM_TOKEN_TTL = Duration.ofHours(24);

    private final UserRepository userRepository;
    private final EmailConfirmationTokenRepository confirmationTokenRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional
    public User register(String nickname, String email, String rawPassword) {
        User user = new User();
        user.setNickname(nickname);
        user.setEmail(email);
        user.setRole(Role.USER);
        user.setEmailVerified(false);
        User created = create(user, rawPassword);

        // gera o token e envia o e-mail DENTRO da transação: se o SMTP falhar,
        // nada é persistido e o cliente recebe o erro em vez de um cadastro
        // órfão que nunca pode ser confirmado.
        EmailConfirmationToken token = new EmailConfirmationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(created);
        token.setExpiresAt(Instant.now().plus(CONFIRM_TOKEN_TTL));
        confirmationTokenRepository.save(token);
        emailService.sendConfirmationEmail(created, token.getToken());

        return created;
    }

    @Override
    @Transactional
    public Optional<User> confirmEmailByToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return confirmationTokenRepository.findByToken(token)
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .map(t -> {
                    User user = t.getUser();
                    user.setEmailVerified(true);
                    confirmationTokenRepository.delete(t);
                    return userRepository.save(user);
                });
    }

    @Override
    @Transactional
    public User create(User user, String rawPassword) {
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User update(User user) {
        User existing = findOrThrow(user.getId());
        existing.setNickname(user.getNickname());
        existing.setEmail(user.getEmail());
        if (user.getRole() != null) {
            existing.setRole(user.getRole());
        }

        return userRepository.save(existing);
    }

    @Override
    @Transactional
    public void changePassword(Long id, String rawPassword) {
        User user = findOrThrow(id);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void confirmEmail(Long id) {
        User user = findOrThrow(id);
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = findOrThrow(id);
        // FK de user_friends: as linhas em que user é DONO (user_id) o Hibernate apaga
        // sozinho, mas as em que ele é o AMIGO (friend_id) ficam — remove o usuário da
        // lista de cada amigo antes, senão o DELETE viola a constraint.
        for (User friend : Set.copyOf(user.getFriendList())) {
            friend.getFriendList().remove(user);
            userRepository.save(friend);
        }
        // FK de friend_requests.sender_id/receiver_id
        friendRequestRepository.deleteBySenderId(user.getId());
        friendRequestRepository.deleteByReceiverId(user.getId());
        // FK de email_confirm_tokens.user_id: sem isto o delete viola a constraint
        confirmationTokenRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    // ---------------- Pedidos de amizade ----------------

    @Override
    @Transactional
    public FriendRequest sendFriendRequest(Long senderId, Long receiverId) {
        if (senderId != null && senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Não é possível enviar pedido de amizade para si mesmo");
        }
        User sender = findOrThrow(senderId);
        User receiver = findOrThrow(receiverId);
        if (sender.getFriendList().contains(receiver)) {
            throw new IllegalStateException("Usuários já são amigos");
        }
        if (friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId).isPresent()) {
            throw new IllegalStateException("Já existe um pedido de amizade pendente para este usuário");
        }
        if (friendRequestRepository.findBySenderIdAndReceiverId(receiverId, senderId).isPresent()) {
            throw new IllegalStateException(
                    "Este usuário já te enviou um pedido — aceite o pedido dele em vez de enviar outro");
        }
        FriendRequest request = new FriendRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        return friendRequestRepository.save(request);
    }

    @Override
    @Transactional
    public FriendRequest acceptFriendRequest(Long requestId, Long receiverId) {
        FriendRequest request = findRequestReceivedBy(requestId, receiverId);
        User sender = request.getSender();
        User receiver = request.getReceiver();
        // amizade é mútua: ambos ganham o outro na lista
        sender.getFriendList().add(receiver);
        receiver.getFriendList().add(sender);
        userRepository.save(sender);
        userRepository.save(receiver);
        friendRequestRepository.delete(request); // consumido
        return request;
    }

    @Override
    @Transactional
    public FriendRequest rejectFriendRequest(Long requestId, Long receiverId) {
        FriendRequest request = findRequestReceivedBy(requestId, receiverId);
        friendRequestRepository.delete(request);
        return request;
    }

    @Override
    @Transactional
    public FriendRequest cancelFriendRequest(Long requestId, Long senderId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .filter(r -> senderId != null && senderId.equals(r.getSender().getId()))
                .orElseThrow(() -> new EntityNotFoundException("Pedido de amizade não encontrado: " + requestId));
        friendRequestRepository.delete(request);
        return request;
    }

    @Override
    public List<FriendRequest> getPendingFriendRequests(Long userId) {
        findOrThrow(userId);
        return friendRequestRepository.findByReceiverIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<FriendRequest> getSentFriendRequests(Long userId) {
        findOrThrow(userId);
        return friendRequestRepository.findBySenderIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<User> getFriendList(Long userId) {
        return List.copyOf(findOrThrow(userId).getFriendList());
    }

    @Override
    @Transactional
    public void removeFriend(Long userId, Long friendId) {
        User user = findOrThrow(userId);
        User friend = findOrThrow(friendId);
        if (!user.getFriendList().remove(friend)) {
            throw new IllegalStateException("Usuários não são amigos");
        }
        friend.getFriendList().remove(user);
        userRepository.save(user);
        userRepository.save(friend);
    }

    /** Pedido que foi recebido por receiverId (ou 404 — não vaza pedidos de terceiros). */
    private FriendRequest findRequestReceivedBy(Long requestId, Long receiverId) {
        return friendRequestRepository.findById(requestId)
                .filter(r -> receiverId != null && receiverId.equals(r.getReceiver().getId()))
                .orElseThrow(() -> new EntityNotFoundException("Pedido de amizade não encontrado: " + requestId));
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + id));
    }
}
