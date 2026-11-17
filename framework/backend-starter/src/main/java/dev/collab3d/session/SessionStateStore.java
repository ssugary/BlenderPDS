package dev.collab3d.session;

import dev.collab3d.model.SessionOperation;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionStateReducer;
import dev.collab3d.spi.SessionStateView;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Keeps the reduced state of each open room in memory (HS1, optional).
 *
 * <p>Applications that are purely CRDT declare no {@link SessionStateReducer}; for them
 * this component is empty and every lookup answers {@code Optional.empty()}. A domain
 * that needs authority on the server (whose turn it is, is the cell already taken)
 * declares one reducer and reads it through {@link SessionStateView} — never by
 * replaying the log itself.
 *
 * <p>The state is rebuilt from the log the first time a room is touched after a start
 * (the log is the source of truth; a client snapshot never feeds it) and advanced
 * operation by operation inside the session lock, so a policy always decides on the
 * state after every operation that entered before it.
 */
@Component
public class SessionStateStore {

    private final SessionStateReducer<?> reducer;
    private final SessionOperationRepository operationRepository;
    private final ObjectMapper objectMapper;

    /** Reduced state per room; guarded by the caller holding the session lock. */
    private final Map<Long, Object> states = new ConcurrentHashMap<>();

    public SessionStateStore(ObjectProvider<SessionStateReducer<?>> reducers,
            SessionOperationRepository operationRepository,
            ObjectMapper objectMapper) {
        this.reducer = reducers.getIfAvailable();
        this.operationRepository = operationRepository;
        this.objectMapper = objectMapper;
    }

    /** Whether the application declared a reducer at all. */
    public boolean hasReducer() {
        return reducer != null;
    }

    /**
     * The current state of the room, rebuilt from the log on first use. Call it while
     * holding the session lock.
     */
    public SessionStateView view(SessionContext ctx) {
        if (reducer == null) {
            return new SessionStateView() {
                @Override
                public <S> Optional<S> get(Class<S> type) {
                    return Optional.empty();
                }
            };
        }
        long sessionId = ctx.sessionId();
        states.computeIfAbsent(sessionId, id -> rebuild(ctx));
        return new InMemoryView(sessionId);
    }

    /** Folds one operation that just entered the log. */
    public void advance(SessionContext ctx, JsonNode operation, long seq) {
        if (reducer == null) {
            return;
        }
        long sessionId = ctx.sessionId();
        Object current = states.getOrDefault(sessionId, reducer.initial(ctx));
        states.put(sessionId, reduce(current, operation, seq));
    }

    /** Forgets a room that no longer exists (it is rebuilt from the log if it comes back). */
    public void evict(Long sessionId) {
        states.remove(sessionId);
    }

    private Object rebuild(SessionContext ctx) {
        Object state = reducer.initial(ctx);
        for (SessionOperation stored : operationRepository.findBySessionIdOrderBySeqAsc(ctx.sessionId())) {
            state = reduce(state, objectMapper.readTree(stored.getPayload()), stored.getSeq());
        }
        return state;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private Object reduce(Object state, JsonNode operation, long seq) {
        return ((SessionStateReducer) reducer).reduce(state, operation, seq);
    }

    /** Answers only for the type the application's reducer declares. */
    private final class InMemoryView implements SessionStateView {

        private final long sessionId;

        private InMemoryView(long sessionId) {
            this.sessionId = sessionId;
        }

        @Override
        public <S> Optional<S> get(Class<S> type) {
            if (!reducer.stateType().equals(type)) {
                return Optional.empty();
            }
            return Optional.ofNullable(type.cast(states.get(sessionId)));
        }
    }
}
