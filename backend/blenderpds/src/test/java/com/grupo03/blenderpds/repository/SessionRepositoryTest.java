package com.grupo03.blenderpds.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.model.SessionStatus;
import com.grupo03.blenderpds.model.User;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class SessionRepositoryTest {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    private User newHost(String nickname) {
        User host = new User();
        host.setNickname(nickname);
        host.setEmail(nickname + "@example.com");
        host.setPasswordHash("{bcrypt}$2a$10$abcdefghijklmnopqrstuv");
        return userRepository.save(host);
    }

    private Session newSession(User host, String code, SessionStatus status) {
        Session session = new Session();
        session.setHost(host);
        session.setCode(code);
        session.setStatus(status);
        return sessionRepository.save(session);
    }

    @Test
    void findsSessionByCode() {
        User host = newHost("sessao-codigo");
        newSession(host, "ABC1234567", SessionStatus.WAITING);

        assertThat(sessionRepository.findByCode("ABC1234567")).isPresent();
        assertThat(sessionRepository.existsByCode("ABC1234567")).isTrue();
        assertThat(sessionRepository.existsByCode("ZZZZZZZZZZ")).isFalse();
        assertThat(sessionRepository.findByCode("NAOEXISTE")).isEmpty();
    }

    @Test
    void findsOnlyOpenSessionOfHost() {
        User host = newHost("sessao-host");
        Session ended = newSession(host, "ENDED00001", SessionStatus.ENDED);

        // an ended one does not count as an "open session"
        assertThat(sessionRepository.findFirstByHostIdAndStatusNot(host.getId(), SessionStatus.ENDED)).isEmpty();

        Session active = newSession(host, "ACTIVE0001", SessionStatus.ACTIVE);
        assertThat(sessionRepository.findFirstByHostIdAndStatusNot(host.getId(), SessionStatus.ENDED))
                .map(Session::getId)
                .contains(active.getId());
        assertThat(ended.getId()).isNotEqualTo(active.getId());
    }

    @Test
    void listsActiveSessionsOfGivenHostsWithHostLoaded() {
        User hostOne = newHost("sessao-um");
        User hostTwo = newHost("sessao-dois");
        newSession(hostOne, "OPEN000001", SessionStatus.ACTIVE);
        newSession(hostTwo, "WAITING001", SessionStatus.WAITING);

        List<Session> open = sessionRepository.findOpenByHostIds(
                List.of(hostOne.getId(), hostTwo.getId()), SessionStatus.ACTIVE);

        assertThat(open).hasSize(1);
        assertThat(open.getFirst().getHost().getNickname()).isEqualTo("sessao-um");
    }

    @Test
    void findByIdForUpdateReturnsTheLockedRow() {
        User host = newHost("sessao-lock");
        Session session = newSession(host, "LOCK000001", SessionStatus.WAITING);

        assertThat(sessionRepository.findByIdForUpdate(session.getId()))
                .map(Session::getCode)
                .contains("LOCK000001");
        assertThat(sessionRepository.findByIdForUpdate(999_999L)).isEmpty();
    }
}
