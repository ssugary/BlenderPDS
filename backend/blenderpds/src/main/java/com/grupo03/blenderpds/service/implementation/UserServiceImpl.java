package com.grupo03.blenderpds.service.implementation;

import com.grupo03.blenderpds.model.EmailConfirmationToken;
import com.grupo03.blenderpds.model.Role;
import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.repository.EmailConfirmationTokenRepository;
import com.grupo03.blenderpds.repository.UserRepository;
import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
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
                    confirmationTokenRepository.delete(t); // token de uso único
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
        // FK de email_confirm_tokens.user_id: sem isto o delete viola a constraint
        confirmationTokenRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + id));
    }
}
