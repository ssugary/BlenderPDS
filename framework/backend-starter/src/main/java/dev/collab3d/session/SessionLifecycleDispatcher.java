package dev.collab3d.session;

import dev.collab3d.spi.SessionLifecycleListener;
import java.util.List;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Bridges Spring's application events to the application's
 * {@link SessionLifecycleListener} beans.
 *
 * <p>All four callbacks are {@code AFTER_COMMIT}: a listener never sees a room that was
 * rolled back, and it runs outside the room lock. A listener that throws is logged and
 * skipped so one broken listener cannot stop the others or fail the request that already
 * committed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionLifecycleDispatcher {

    private final List<SessionLifecycleListener> listeners;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSessionCreated(SessionCreatedEvent event) {
        deliver("sessionCreated", listener -> listener.sessionCreated(event));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onParticipantJoined(ParticipantJoinedEvent event) {
        deliver("participantJoined", listener -> listener.participantJoined(event));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onParticipantLeft(ParticipantLeftEvent event) {
        deliver("participantLeft", listener -> listener.participantLeft(event));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSessionEnded(SessionEndedEvent event) {
        deliver("sessionEnded", listener -> listener.sessionEnded(event));
    }

    private void deliver(String callback, Consumer<SessionLifecycleListener> call) {
        for (SessionLifecycleListener listener : listeners) {
            try {
                call.accept(listener);
            } catch (RuntimeException ex) {
                log.warn("SessionLifecycleListener.{} falhou em {}: {}", callback,
                        listener.getClass().getName(), ex.toString());
            }
        }
    }
}
