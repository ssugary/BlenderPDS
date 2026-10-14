package com.grupo03.blenderpds.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class EntityMappingTest {

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private JdbcTemplate jdbc;

    private User newUser(String nickname, String email) {
        User user = new User();
        user.setNickname(nickname);
        user.setEmail(email);
        user.setPasswordHash("{bcrypt}$2a$10$abcdefghijklmnopqrstuv");
        user.setRole(Role.USER);
        return user;
    }

    @Test
    void persistsAndReloadsUser() {
        User saved = newUser("larissa", "larissa@example.com");
        em.persist(saved);
        em.flush();
        em.clear();

        User found = em.find(User.class, saved.getId());
        assertThat(found).isNotNull();
        assertThat(found.getNickname()).isEqualTo("larissa");
        assertThat(found.getEmail()).isEqualTo("larissa@example.com");
        assertThat(found.getPasswordHash()).isEqualTo("{bcrypt}$2a$10$abcdefghijklmnopqrstuv");
        assertThat(found.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void roleIsPersistedAsStringAndDefaultsToUser() {
        assertThat(new User().getRole()).isEqualTo(Role.USER);

        User admin = newUser("admin", "admin@example.com");
        admin.setRole(Role.ADMIN);
        em.persist(admin);
        em.flush();

        String stored = jdbc.queryForObject(
                "select role from users where email = ?", String.class, "admin@example.com");
        assertThat(stored).isEqualTo("ADMIN");
    }

    @Test
    void emailVerifiedStartsFalseAndOnlyChangesWhenConfirmed() {
        User user = newUser("joao", "joao@example.com");
        assertThat(user.isEmailVerified()).isFalse();

        em.persist(user);
        em.flush();
        em.clear();

        assertThat(em.find(User.class, user.getId()).isEmailVerified()).isFalse();

        User confirmed = em.find(User.class, user.getId());
        confirmed.setEmailVerified(true);
        em.flush();
        em.clear();

        assertThat(em.find(User.class, user.getId()).isEmailVerified()).isTrue();
    }

    @Test
    void createdAtIsStampedOnceByAuditing() {
        User user = newUser("carla", "carla@example.com");
        em.persist(user);
        em.flush();
        assertThat(user.getCreatedAt()).isNotNull();

        em.clear();
        User loaded = em.find(User.class, user.getId());
        Instant createdAt = loaded.getCreatedAt();
        assertThat(createdAt).isNotNull();

        Integer stored = jdbc.queryForObject(
                "select count(*) from users where email = ? and created_at is not null",
                Integer.class, "carla@example.com");
        assertThat(stored).isEqualTo(1);

        loaded.setNickname("carla-editada");
        em.flush();
        em.clear();

        User afterUpdate = em.find(User.class, user.getId());
        assertThat(afterUpdate.getNickname()).isEqualTo("carla-editada");
        assertThat(afterUpdate.getCreatedAt()).isEqualTo(createdAt);
    }

    @Test
    void sessionPointsToItsOwner() {
        User owner = new User();
        owner.setNickname("rene");
        owner.setEmail("rene@example.com");
        owner.setPasswordHash("{bcrypt}$2a$10$abcdefghijklmnopqrstuv");
        owner.setRole(Role.USER);
        em.persist(owner);
        Session session = new Session(null, owner);
        em.persist(session);
        em.flush();
        em.clear();

        Session found = em.find(Session.class, session.getId());
        assertThat(found).isNotNull();
        assertThat(found.getUser()).isNotNull();
        assertThat(found.getUser().getId()).isEqualTo(owner.getId());
        assertThat(found.getUser().getNickname()).isEqualTo("rene");
    }

    @Test
    void emailIsUnique() {
        em.persist(newUser("ana", "ana@example.com"));
        em.flush();

        assertThatThrownBy(() -> {
            em.persist(newUser("outra-ana", "ana@example.com"));
            em.flush();
        }).isNotNull();
    }

    @Test
    void tablesWereCreatedInPostgres() {
        Integer tables = jdbc.queryForObject(
                "select count(*) from information_schema.tables "
                        + "where table_schema = 'public' and table_name in ('users', 'sessions')",
                Integer.class);
        assertThat(tables).isEqualTo(2);
    }
}
