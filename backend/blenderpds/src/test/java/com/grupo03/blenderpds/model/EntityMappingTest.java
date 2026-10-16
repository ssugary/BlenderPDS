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

    private Session newSession(User host, String code) {
        Session session = new Session();
        session.setHost(host);
        session.setCode(code);
        session.setStatus(SessionStatus.WAITING);
        return session;
    }

    @Test
    void sessionPointsToItsHostAndIsAudited() {
        User owner = newUser("rene", "rene@example.com");
        em.persist(owner);
        Session session = newSession(owner, "CODE000001");
        em.persist(session);
        em.flush();
        em.clear();

        Session found = em.find(Session.class, session.getId());
        assertThat(found).isNotNull();
        assertThat(found.getHost()).isNotNull();
        assertThat(found.getHost().getId()).isEqualTo(owner.getId());
        assertThat(found.getHost().getNickname()).isEqualTo("rene");
        assertThat(found.getStatus()).isEqualTo(SessionStatus.WAITING);
        assertThat(found.getCode()).isEqualTo("CODE000001");
        // @CreatedDate/@LastModifiedDate do not fire without @EntityListeners: this test is the safety net
        assertThat(found.getCreatedAt()).isNotNull();
        assertThat(found.getUpdatedAt()).isNotNull();
    }

    @Test
    void participantBelongsToSessionAndUserOncePerPair() {
        User host = newUser("paula", "paula@example.com");
        em.persist(host);
        Session session = newSession(host, "CODE000002");
        em.persist(session);

        SessionParticipant participant = new SessionParticipant();
        participant.setSession(session);
        participant.setUser(host);
        participant.setActive(true);
        participant.setLastSeenAt(Instant.now());
        em.persist(participant);
        em.flush();
        em.clear();

        SessionParticipant found = em.find(SessionParticipant.class, participant.getId());
        assertThat(found).isNotNull();
        assertThat(found.isActive()).isTrue();
        assertThat(found.getJoinedAt()).isNotNull();
        assertThat(found.getUser().getNickname()).isEqualTo("paula");

        // the (session, user) pair is unique: joining twice reactivates the same row
        SessionParticipant duplicated = new SessionParticipant();
        duplicated.setSession(em.find(Session.class, session.getId()));
        duplicated.setUser(em.find(User.class, host.getId()));
        assertThatThrownBy(() -> {
            em.persist(duplicated);
            em.flush();
        }).isNotNull();
    }

    @Test
    void operationStoresRawPayloadAndRejectsDuplicatedOpAndSeq() {
        User host = newUser("otavio", "otavio@example.com");
        em.persist(host);
        Session session = newSession(host, "CODE000003");
        em.persist(session);

        SessionOperation operation = new SessionOperation();
        operation.setSession(session);
        operation.setSeq(1L);
        operation.setSiteId("site-otavio");
        operation.setLamport(1L);
        operation.setAuthor(host);
        operation.setKind("add_object");
        operation.setPayload("{\"id\":{\"lamport\":1,\"siteId\":\"site-otavio\"}}");
        em.persist(operation);
        em.flush();
        em.clear();

        SessionOperation found = em.find(SessionOperation.class, operation.getId());
        assertThat(found.getPayload()).contains("site-otavio");
        assertThat(found.getCreatedAt()).isNotNull();
        assertThat(found.getAuthor().getId()).isEqualTo(host.getId());

        // the same op (siteId + lamport) resent must not become a new row
        SessionOperation redelivered = new SessionOperation();
        redelivered.setSession(em.find(Session.class, session.getId()));
        redelivered.setSeq(2L);
        redelivered.setSiteId("site-otavio");
        redelivered.setLamport(1L);
        redelivered.setKind("add_object");
        redelivered.setPayload("{}");
        assertThatThrownBy(() -> {
            em.persist(redelivered);
            em.flush();
            em.clear();
        }).isNotNull();

        // and seq is unique within the session
        SessionOperation sameSeq = new SessionOperation();
        sameSeq.setSession(em.find(Session.class, session.getId()));
        sameSeq.setSeq(1L);
        sameSeq.setSiteId("site-outro");
        sameSeq.setLamport(9L);
        sameSeq.setKind("add_object");
        sameSeq.setPayload("{}");
        assertThatThrownBy(() -> {
            em.persist(sameSeq);
            em.flush();
        }).isNotNull();
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
                        + "where table_schema = 'public' and table_name in "
                        + "('users', 'user_friends', 'friend_requests', 'email_confirm_tokens', "
                        + "'sessions', 'session_participants', 'session_operations')",
                Integer.class);
        assertThat(tables).isEqualTo(7);
    }
}
