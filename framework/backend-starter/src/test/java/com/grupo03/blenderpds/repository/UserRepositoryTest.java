package com.grupo03.blenderpds.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.grupo03.blenderpds.model.Role;
import com.grupo03.blenderpds.model.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager em;

    private User newUser(String nickname, String email) {
        User user = new User();
        user.setNickname(nickname);
        user.setEmail(email);
        user.setPasswordHash("{bcrypt}$2a$10$abcdefghijklmnopqrstuv");
        user.setRole(Role.USER);
        return user;
    }

    @Test
    void savesAndReloadsUser() {
        User saved = userRepository.saveAndFlush(newUser("bia", "bia@example.com"));

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.isEmailVerified()).isFalse();

        em.clear();

        User found = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getNickname()).isEqualTo("bia");
        assertThat(found.getEmail()).isEqualTo("bia@example.com");
        assertThat(found.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void findsByEmail() {
        userRepository.saveAndFlush(newUser("davi", "davi@example.com"));
        em.clear();

        assertThat(userRepository.findByEmail("davi@example.com"))
                .hasValueSatisfying(user -> assertThat(user.getNickname()).isEqualTo("davi"));
        assertThat(userRepository.findByEmail("ninguem@example.com")).isEmpty();
    }

    @Test
    void checksExistingEmail() {
        userRepository.saveAndFlush(newUser("elo", "elo@example.com"));
        em.clear();

        assertThat(userRepository.existsByEmail("elo@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("nao-existe@example.com")).isFalse();
    }

    @Test
    void emailRemainsUniqueAtDatabaseLevel() {
        userRepository.saveAndFlush(newUser("rafa", "rafa@example.com"));
        em.clear();

        User duplicate = newUser("outro-rafa", "rafa@example.com");
        assertThatThrownBy(() -> userRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
