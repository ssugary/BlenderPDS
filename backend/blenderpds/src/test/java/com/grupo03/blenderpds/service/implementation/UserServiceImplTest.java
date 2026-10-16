package com.grupo03.blenderpds.service.implementation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import com.grupo03.blenderpds.model.EmailConfirmationToken;
import com.grupo03.blenderpds.model.Role;
import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.repository.EmailConfirmationTokenRepository;
import com.grupo03.blenderpds.repository.UserRepository;
import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class UserServiceImplTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailConfirmationTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // we do not want real SMTP in a service test: the sending is checked through the mock
    @MockitoBean
    private EmailService emailService;

    @PersistenceContext
    private EntityManager em;

    @Test
    void registerHashesPasswordAndSetsDefaults() {
        User user = userService.register("bia", "bia@example.com", "senha123");

        assertThat(user.getId()).isNotNull();
        assertThat(user.getPasswordHash()).isNotEqualTo("senha123");
        assertThat(user.getPasswordHash()).startsWith("{bcrypt}");
        assertThat(passwordEncoder.matches("senha123", user.getPasswordHash())).isTrue();
        assertThat(user.getRole()).isEqualTo(Role.USER);
        assertThat(user.isEmailVerified()).isFalse();
        assertThat(user.getCreatedAt()).isNotNull();
    }

    @Test
    void findsUserByIdAndEmail() {
        Long id = userService.register("davi", "davi@example.com", "senha123").getId();
        em.flush();
        em.clear();

        assertThat(userService.getById(id)).isPresent();
        assertThat(userService.getById(id).orElseThrow().getNickname()).isEqualTo("davi");
        assertThat(userService.getByEmail("davi@example.com")).isPresent();
        assertThat(userService.getByEmail("nao-existe@example.com")).isEmpty();
        assertThat(userService.getAll()).extracting(User::getEmail).contains("davi@example.com");
    }

    @Test
    void updateChangesNicknameAndRoleButKeepsPasswordAndCreatedAt() {
        User user = userService.register("elo", "elo@example.com", "senha123");
        String originalHash = user.getPasswordHash();
        em.flush();
        em.clear();

        User changes = userService.getById(user.getId()).orElseThrow();
        changes.setNickname("elo-editada");
        changes.setRole(Role.ADMIN);
        User updated = userService.update(changes);

        em.flush();
        em.clear();

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updated.getEmail()).isEqualTo("elo@example.com");
        assertThat(reloaded.getNickname()).isEqualTo("elo-editada");
        assertThat(reloaded.getRole()).isEqualTo(Role.ADMIN);
        assertThat(reloaded.getPasswordHash()).isEqualTo(originalHash);
        assertThat(reloaded.getCreatedAt()).isNotNull();
    }

    @Test
    void updateOfUnknownUserThrows() {
        User ghost = new User();
        ghost.setId(999999L);
        ghost.setNickname("ghost");
        ghost.setEmail("ghost@example.com");

        assertThatThrownBy(() -> userService.update(ghost))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void changePasswordReplacesHash() {
        User user = userService.register("rafa", "rafa@example.com", "senha123");
        String oldHash = user.getPasswordHash();

        userService.changePassword(user.getId(), "nova-senha");
        em.flush();
        em.clear();

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getPasswordHash()).isNotEqualTo(oldHash);
        assertThat(passwordEncoder.matches("nova-senha", reloaded.getPasswordHash())).isTrue();
        assertThat(passwordEncoder.matches("senha123", reloaded.getPasswordHash())).isFalse();
    }

    @Test
    void confirmEmailMarksVerified() {
        User user = userService.register("carla", "carla@example.com", "senha123");
        assertThat(user.isEmailVerified()).isFalse();

        userService.confirmEmail(user.getId());
        em.flush();
        em.clear();

        assertThat(userRepository.findById(user.getId()).orElseThrow().isEmailVerified()).isTrue();
    }

    @Test
    void deleteRemovesUser() {
        User user = userService.register("gabi", "gabi@example.com", "senha123");
        Long id = user.getId();

        userService.delete(id);
        em.flush();
        em.clear();

        assertThat(userRepository.findById(id)).isEmpty();
    }

    @Test
    void deleteOfUnknownUserThrows() {
        assertThatThrownBy(() -> userService.delete(999999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void registerCreatesTokenAndSendsConfirmationEmail() {
        User user = userService.register("bia", "bia@example.com", "senha123");

        ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(emailService).sendConfirmationEmail(userCaptor.capture(), tokenCaptor.capture());

        assertThat(userCaptor.getValue().getEmail()).isEqualTo("bia@example.com");
        String token = tokenCaptor.getValue();
        assertThat(token).isNotBlank();

        EmailConfirmationToken stored = tokenRepository.findByToken(token).orElseThrow();
        assertThat(stored.getUser().getId()).isEqualTo(user.getId());
        assertThat(stored.getExpiresAt()).isAfter(Instant.now());
        assertThat(stored.getExpiresAt()).isBefore(Instant.now().plus(25, ChronoUnit.HOURS));
        assertThat(user.isEmailVerified()).isFalse();
    }

    @Test
    void confirmEmailByTokenVerifiesUserAndConsumesToken() {
        User user = userService.register("carla", "carla@example.com", "senha123");
        ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendConfirmationEmail(any(), tokenCaptor.capture());
        String token = tokenCaptor.getValue();

        Optional<User> confirmed = userService.confirmEmailByToken(token);

        assertThat(confirmed).isPresent();
        assertThat(confirmed.orElseThrow().isEmailVerified()).isTrue();
        em.flush();
        em.clear();
        assertThat(userRepository.findById(user.getId()).orElseThrow().isEmailVerified()).isTrue();
        // the token is single use
        assertThat(tokenRepository.findByToken(token)).isEmpty();
        assertThat(userService.confirmEmailByToken(token)).isEmpty();
    }

    @Test
    void confirmEmailByUnknownTokenReturnsEmpty() {
        assertThat(userService.confirmEmailByToken("nao-existe")).isEmpty();
        assertThat(userService.confirmEmailByToken(null)).isEmpty();
        assertThat(userService.confirmEmailByToken("  ")).isEmpty();
    }

    @Test
    void confirmEmailByExpiredTokenReturnsEmptyAndKeepsUserUnverified() {
        User user = userService.register("davi", "davi@example.com", "senha123");
        ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendConfirmationEmail(any(), tokenCaptor.capture());
        String token = tokenCaptor.getValue();

        EmailConfirmationToken stored = tokenRepository.findByToken(token).orElseThrow();
        stored.setExpiresAt(Instant.now().minus(1, ChronoUnit.MINUTES));
        tokenRepository.save(stored);
        em.flush();
        em.clear();

        assertThat(userService.confirmEmailByToken(token)).isEmpty();
        assertThat(userRepository.findById(user.getId()).orElseThrow().isEmailVerified()).isFalse();
    }
}
