package dev.support;

import dev.collab3d.session.ParticipantJoinedEvent;
import dev.collab3d.session.ParticipantLeftEvent;
import dev.collab3d.session.SessionCreatedEvent;
import dev.collab3d.session.SessionEndedEvent;
import dev.collab3d.spi.SessionLifecycleListener;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

/**
 * Records every lifecycle callback so the test can assert what fired, for
 * {@code SessionLifecycleTest}.
 *
 * <p>Lives in {@code dev.support}, outside the package the starter scans, so it is a
 * bean only of the context that imports it.
 */
public class LifecycleRecorder implements SessionLifecycleListener {

    private final List<String> events = new CopyOnWriteArrayList<>();

    @Override
    public void sessionCreated(SessionCreatedEvent event) {
        events.add("created:" + event.sessionId() + ":" + event.hostId());
    }

    @Override
    public void participantJoined(ParticipantJoinedEvent event) {
        events.add("joined:" + event.sessionId() + ":" + event.userId());
    }

    @Override
    public void participantLeft(ParticipantLeftEvent event) {
        events.add("left:" + event.sessionId() + ":" + event.userId());
    }

    @Override
    public void sessionEnded(SessionEndedEvent event) {
        events.add("ended:" + event.sessionId());
    }

    public List<String> events() {
        return List.copyOf(events);
    }

    @TestConfiguration(proxyBeanMethods = false)
    public static class Configuration {

        @Bean
        LifecycleRecorder lifecycleRecorder() {
            return new LifecycleRecorder();
        }
    }
}
