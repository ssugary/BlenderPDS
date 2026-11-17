package com.grupo03.blenderpds.service.implementation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.model.SessionOperation;
import com.grupo03.blenderpds.model.SessionStatus;
import com.grupo03.blenderpds.repository.SessionOperationRepository;
import com.grupo03.blenderpds.repository.SessionParticipantRepository;
import com.grupo03.blenderpds.repository.SessionRepository;
import com.grupo03.blenderpds.service.EmailService;
import com.grupo03.blenderpds.service.SessionOperationInput;
import com.grupo03.blenderpds.service.SessionService;
import com.grupo03.blenderpds.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

/**
 * Room rules: one open session per host, entry for the host's friends only,
 * participant cap, presence and the behaviour of the operation log
 * (sequencing, deduplication, catch-up and snapshot).
 */
@SpringBootTest
@Transactional
class SessionServiceImplTest {

    private static final String MATRIX = "[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]";

    @Autowired
    private SessionService sessionService;

    @Autowired
    private UserService userService;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private SessionParticipantRepository participantRepository;

    @Autowired
    private SessionOperationRepository operationRepository;

    // registering fires an e-mail; only the domain matters here
    @MockitoBean
    private EmailService emailService;

    private Long register(String nickname) {
        return userService.register(nickname, nickname + "@example.com", "senha12345").getId();
    }

    private void befriend(Long a, Long b) {
        Long requestId = userService.sendFriendRequest(a, b).getId();
        userService.acceptFriendRequest(requestId, b);
    }

    private SessionOperationInput op(String siteId, long lamport, String objectId) {
        String payload = "{\"id\":{\"lamport\":" + lamport + ",\"siteId\":\"" + siteId + "\"},"
                + "\"author\":\"" + siteId + "\",\"deps\":[],\"kind\":\"add_object\","
                + "\"objectId\":\"" + objectId + "\",\"geometry\":\"cube\","
                + "\"transform\":" + MATRIX + ",\"color\":16711680}";
        return new SessionOperationInput(siteId, lamport, "add_object", payload);
    }

    @Test
    void createStartsWaitingWithHostAsInactiveParticipant() {
        Long host = register("host-cria");

        Session session = sessionService.createSession(host);

        assertThat(session.getId()).isNotNull();
        assertThat(session.getStatus()).isEqualTo(SessionStatus.WAITING);
        assertThat(session.getCode()).isNotBlank().hasSize(10);
        assertThat(session.getCreatedAt()).isNotNull();
        assertThat(sessionService.countParticipants(session.getId())).isEqualTo(1);
        assertThat(sessionService.getParticipants(session.getId()))
                .singleElement()
                .satisfies(participant -> {
                    assertThat(participant.getUser().getId()).isEqualTo(host);
                    // not connected yet: the WebSocket is what marks presence
                    assertThat(participant.isActive()).isFalse();
                });
    }

    @Test
    void hostCannotHaveTwoOpenSessionsButCanAfterEnding() {
        Long host = register("host-duas");
        Session first = sessionService.createSession(host);

        assertThatThrownBy(() -> sessionService.createSession(host))
                .isInstanceOf(IllegalStateException.class);

        sessionService.endSession(first.getId(), host);

        Session second = sessionService.createSession(host);
        assertThat(second.getId()).isNotEqualTo(first.getId());
    }

    @Test
    void openSessionOfTheHostIsTheRoomItHasNotEndedYet() {
        Long host = register("host-retoma");
        Long other = register("outro-host");

        assertThat(sessionService.getOpenSessionFor(host)).isEmpty();

        Session session = sessionService.createSession(host);
        assertThat(sessionService.getOpenSessionFor(host))
                .get()
                .satisfies(open -> assertThat(open.getId()).isEqualTo(session.getId()));
        assertThat(sessionService.getOpenSessionFor(other)).isEmpty();

        // the host can host again only once the previous room is really over
        sessionService.endSession(session.getId(), host);
        assertThat(sessionService.getOpenSessionFor(host)).isEmpty();
    }

    @Test
    void createForUnknownHostIsNotFound() {
        assertThatThrownBy(() -> sessionService.createSession(999_999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void joinRequiresFriendshipWithHost() {
        Long host = register("host-amigo");
        Long friend = register("amigo");
        Long stranger = register("estranho");
        befriend(host, friend);
        Session session = sessionService.createSession(host);

        assertThatThrownBy(() -> sessionService.joinSession(session.getId(), stranger))
                .isInstanceOf(AccessDeniedException.class);

        assertThat(sessionService.joinSession(session.getId(), friend).getId()).isEqualTo(session.getId());
        assertThat(sessionService.countParticipants(session.getId())).isEqualTo(2);
    }

    @Test
    void joiningTwiceReactivatesTheSameParticipantRow() {
        Long host = register("host-reentra");
        Long friend = register("amigo-reentra");
        befriend(host, friend);
        Session session = sessionService.createSession(host);

        sessionService.joinSession(session.getId(), friend);
        sessionService.joinSession(session.getId(), friend);

        assertThat(sessionService.countParticipants(session.getId())).isEqualTo(2);
        assertThat(participantRepository.findBySessionIdAndUserId(session.getId(), friend)).isPresent();
    }

    @Test
    void joinOnMissingOrEndedSessionFails() {
        Long host = register("host-fim");
        Long friend = register("amigo-fim");
        befriend(host, friend);
        Session session = sessionService.createSession(host);

        assertThatThrownBy(() -> sessionService.joinSession(999_999L, friend))
                .isInstanceOf(EntityNotFoundException.class);

        sessionService.endSession(session.getId(), host);
        assertThatThrownBy(() -> sessionService.joinSession(session.getId(), friend))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void connectingMarksParticipantActiveAndLeavingPutsSessionBackToWaiting() {
        Long host = register("host-presenca");
        Session session = sessionService.createSession(host);

        sessionService.connectParticipant(session.getId(), host);
        assertThat(sessionService.getById(session.getId()).orElseThrow().getStatus())
                .isEqualTo(SessionStatus.ACTIVE);

        sessionService.leaveSession(session.getId(), host);
        assertThat(sessionService.getById(session.getId()).orElseThrow().getStatus())
                .isEqualTo(SessionStatus.WAITING);
        assertThat(sessionService.getParticipants(session.getId()))
                .singleElement()
                .satisfies(participant -> assertThat(participant.isActive()).isFalse());
    }

    @Test
    void sessionIsCappedAtMaxParticipants() {
        Long host = register("host-limite");
        Session session = sessionService.createSession(host);
        List<Long> guests = new ArrayList<>();
        for (int i = 0; i < SessionServiceImpl.MAX_PARTICIPANTS; i++) {
            Long guest = register("convidado-" + i);
            befriend(host, guest);
            guests.add(guest);
        }

        sessionService.connectParticipant(session.getId(), host);
        // host + 3 guests = 4 connected (the limit)
        for (int i = 0; i < SessionServiceImpl.MAX_PARTICIPANTS - 1; i++) {
            sessionService.connectParticipant(session.getId(), guests.get(i));
        }

        Long extra = guests.get(SessionServiceImpl.MAX_PARTICIPANTS - 1);
        assertThatThrownBy(() -> sessionService.connectParticipant(session.getId(), extra))
                .isInstanceOf(IllegalStateException.class);

        // Whoever is already inside may reconnect even with the room full.
        sessionService.connectParticipant(session.getId(), guests.get(0));

        // Somebody leaves and the seat comes back.
        sessionService.leaveSession(session.getId(), guests.get(0));
        sessionService.connectParticipant(session.getId(), extra);
    }

    @Test
    void onlyHostCanEndAndEndingMarksEveryoneOffline() {
        Long host = register("host-encerra");
        Long guest = register("convidado-encerra");
        befriend(host, guest);
        Session session = sessionService.createSession(host);
        sessionService.connectParticipant(session.getId(), host);
        sessionService.connectParticipant(session.getId(), guest);

        assertThatThrownBy(() -> sessionService.endSession(session.getId(), guest))
                .isInstanceOf(AccessDeniedException.class);

        sessionService.endSession(session.getId(), host);

        Session ended = sessionService.getById(session.getId()).orElseThrow();
        assertThat(ended.getStatus()).isEqualTo(SessionStatus.ENDED);
        assertThat(ended.getEndedAt()).isNotNull();
        assertThat(sessionService.getParticipants(session.getId()))
                .allSatisfy(participant -> assertThat(participant.isActive()).isFalse());
    }

    @Test
    void onlyFriendsActiveSessionsAppearAsJoinable() {
        Long host = register("host-listagem");
        Long friend = register("amigo-listagem");
        Long stranger = register("estranho-listagem");
        befriend(host, friend);
        Session session = sessionService.createSession(host);

        // WAITING (the host has not connected yet) does not show as "hosting"
        assertThat(sessionService.getJoinableSessionsFor(friend)).isEmpty();

        sessionService.connectParticipant(session.getId(), host);
        assertThat(sessionService.getJoinableSessionsFor(friend))
                .singleElement()
                .satisfies(open -> assertThat(open.getId()).isEqualTo(session.getId()));
        assertThat(sessionService.getJoinableSessionsFor(stranger)).isEmpty();
    }

    @Test
    void appendOperationsAssignsIncreasingSeqAndStoresRawPayload() {
        Long host = register("host-log");
        Session session = sessionService.createSession(host);
        sessionService.connectParticipant(session.getId(), host);

        List<SessionOperation> saved = sessionService.appendOperations(session.getId(), host,
                List.of(op("site-a", 1, "obj-1"), op("site-a", 2, "obj-2")));

        assertThat(saved).hasSize(2);
        assertThat(saved).extracting(SessionOperation::getSeq).containsExactly(1L, 2L);
        assertThat(saved.get(0).getKind()).isEqualTo("add_object");
        // the payload stays intact: the client is the one interpreting the CRDT
        assertThat(saved.get(0).getPayload()).contains("\"objectId\":\"obj-1\"");
        assertThat(saved.get(0).getCreatedAt()).isNotNull();
    }

    @Test
    void appendOperationsDropsRedeliveredOperation() {
        Long host = register("host-dedupe");
        Session session = sessionService.createSession(host);
        sessionService.connectParticipant(session.getId(), host);
        SessionOperationInput first = op("site-a", 1, "obj-1");

        sessionService.appendOperations(session.getId(), host, List.of(first));
        List<SessionOperation> second = sessionService.appendOperations(session.getId(), host, List.of(first));

        assertThat(second).isEmpty(); // a reconnect redelivery: nothing new
        assertThat(operationRepository.findBySessionIdOrderBySeqAsc(session.getId())).hasSize(1);
    }

    @Test
    void appendOperationsRequiresActiveParticipantAndOpenSession() {
        Long host = register("host-ativo");
        Long friend = register("amigo-ativo");
        befriend(host, friend);
        Session session = sessionService.createSession(host);
        sessionService.connectParticipant(session.getId(), host);
        // joined the room (REST) but never connected
        sessionService.joinSession(session.getId(), friend);

        assertThatThrownBy(() -> sessionService.appendOperations(session.getId(), friend, List.of(op("site-b", 1, "o"))))
                .isInstanceOf(AccessDeniedException.class);

        // a user that does not even exist is, by definition, somebody who is not
        // connected to the session: the same 403 as the case above (and it does not
        // leak whether that id exists)
        assertThatThrownBy(() -> sessionService.appendOperations(session.getId(), 999_999L, List.of(op("site-c", 1, "o"))))
                .isInstanceOf(AccessDeniedException.class);

        sessionService.endSession(session.getId(), host);
        assertThatThrownBy(() -> sessionService.appendOperations(session.getId(), host, List.of(op("site-a", 5, "o"))))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void syncSinceSendsOnlyWhatTheClientIsMissing() {
        Long host = register("host-sync");
        Long guest = register("convidado-sync");
        befriend(host, guest);
        Session session = sessionService.createSession(host);
        sessionService.connectParticipant(session.getId(), host);
        sessionService.connectParticipant(session.getId(), guest);

        sessionService.appendOperations(session.getId(), host, List.of(op("site-a", 1, "obj-1")));
        sessionService.appendOperations(session.getId(), guest, List.of(op("site-b", 1, "obj-2")));
        sessionService.appendOperations(session.getId(), host, List.of(op("site-a", 2, "obj-3")));

        // A new client: receives everything, in seq order
        assertThat(sessionService.syncSince(session.getId(), Map.of()))
                .extracting(SessionOperation::getSeq)
                .containsExactly(1L, 2L, 3L);

        // A client that already has both site-a ops receives only the site-b one
        assertThat(sessionService.syncSince(session.getId(), Map.of("site-a", 2)))
                .extracting(SessionOperation::getSiteId)
                .containsExactly("site-b");

        assertThat(sessionService.syncSinceSeq(session.getId(), 1L))
                .extracting(SessionOperation::getSeq)
                .containsExactly(2L, 3L);
    }

    @Test
    void snapshotIsStoredOnlyForParticipantsAndRespectsTheSizeCap() {
        Long host = register("host-snapshot");
        Long stranger = register("estranho-snapshot");
        Session session = sessionService.createSession(host);

        sessionService.saveSnapshot(session.getId(), host, "{\"objects\":[{\"id\":\"obj-1\"}]}");
        assertThat(sessionService.getSnapshot(session.getId()))
                .contains("{\"objects\":[{\"id\":\"obj-1\"}]}");

        assertThatThrownBy(() -> sessionService.saveSnapshot(session.getId(), stranger, "{}"))
                .isInstanceOf(AccessDeniedException.class);

        String tooBig = "{\"objects\":\"" + "x".repeat(SessionServiceImpl.MAX_SNAPSHOT_BYTES) + "\"}";
        assertThatThrownBy(() -> sessionService.saveSnapshot(session.getId(), host, tooBig))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deletingAUserTakesTheirSessionsAndDetachesTheirOperationsElsewhere() {
        Long host = register("host-apagado");
        Long friend = register("amigo-apagado");
        befriend(host, friend);

        Session hosted = sessionService.createSession(host);
        sessionService.connectParticipant(hosted.getId(), host);
        sessionService.connectParticipant(hosted.getId(), friend);
        sessionService.appendOperations(hosted.getId(), friend, List.of(op("site-b", 1, "obj-do-amigo")));

        // the friend also has a room of their own, with one of their ops
        Session friendSession = sessionService.createSession(friend);
        sessionService.connectParticipant(friendSession.getId(), friend);
        sessionService.appendOperations(friendSession.getId(), friend, List.of(op("site-b", 2, "obj-2")));

        sessionService.deleteAllForUser(friend);

        assertThat(sessionService.getById(friendSession.getId())).isEmpty();
        assertThat(participantRepository.findBySessionIdAndUserId(hosted.getId(), friend)).isEmpty();
        // their op in the host's room stays in the log (the scene must not lose history),
        // it just stays without an author
        assertThat(operationRepository.findBySessionIdOrderBySeqAsc(hosted.getId()))
                .singleElement()
                .satisfies(operation -> assertThat(operation.getAuthor()).isNull());
        assertThat(sessionRepository.findById(hosted.getId())).isPresent();
    }
}
