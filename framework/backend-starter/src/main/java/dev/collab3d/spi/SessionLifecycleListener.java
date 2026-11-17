package dev.collab3d.spi;

import dev.collab3d.session.ParticipantJoinedEvent;
import dev.collab3d.session.ParticipantLeftEvent;
import dev.collab3d.session.SessionCreatedEvent;
import dev.collab3d.session.SessionEndedEvent;

/**
 * Observer for the room lifecycle, so an application can react to what happened without
 * the service knowing it exists (a notification, a scoreboard that resets, an audit
 * line).
 *
 * <p>Every callback runs <strong>after the transaction commits</strong>
 * ({@code @TransactionalEventListener(AFTER_COMMIT)}), which means it sees a state that
 * really happened — it never fires for a rollback — and may safely read the database
 * and send e-mail without holding the room lock. Declare one bean per listener; all of
 * them are called, and one failing does not stop the others.
 */
public interface SessionLifecycleListener {

    default void sessionCreated(SessionCreatedEvent event) {
    }

    default void participantJoined(ParticipantJoinedEvent event) {
    }

    default void participantLeft(ParticipantLeftEvent event) {
    }

    default void sessionEnded(SessionEndedEvent event) {
    }
}
