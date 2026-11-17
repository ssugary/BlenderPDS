package dev.collab3d.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.collab3d.model.SessionOperation;
import dev.collab3d.model.SessionStatus;
import dev.collab3d.repository.SessionOperationRepository;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionStateReducer;
import dev.collab3d.spi.SessionStateView;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.ObjectProvider;
import tools.jackson.databind.json.JsonMapper;

/**
 * The optional reduced state (HS1): rebuilt from the log on first use, advanced per
 * operation, and empty when the application declares no reducer.
 */
class SessionStateStoreTest {

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final SessionContext CTX =
            new SessionContext(7L, "design", SessionStatus.ACTIVE, 1L, List.of(1L), 0L);

    @Test
    void theStateIsRebuiltFromTheLogTheFirstTimeTheRoomIsTouched() {
        SessionOperationRepository repository = mock(SessionOperationRepository.class);
        when(repository.findBySessionIdOrderBySeqAsc(7L))
                .thenReturn(List.of(stored(1), stored(2), stored(3)));
        SessionStateStore store = new SessionStateStore(provider(new CounterReducer()), repository, JSON);

        SessionStateView view = store.view(CTX);

        assertThat(view.get(Integer.class)).contains(3);
    }

    @Test
    void advancingFoldsEachOperationInOrder() {
        SessionStateStore store = new SessionStateStore(provider(new CounterReducer()),
                mock(SessionOperationRepository.class), JSON);

        SessionStateView view = store.view(CTX);
        assertThat(view.get(Integer.class)).contains(0);

        store.advance(CTX, JSON.readTree("{}"), 1);
        store.advance(CTX, JSON.readTree("{}"), 2);

        assertThat(view.get(Integer.class)).contains(2);
    }

    @Test
    void evictingForcesARebuildFromTheLogOnTheNextLookup() {
        SessionOperationRepository repository = mock(SessionOperationRepository.class);
        when(repository.findBySessionIdOrderBySeqAsc(7L)).thenReturn(List.of(stored(1)));
        SessionStateStore store = new SessionStateStore(provider(new CounterReducer()), repository, JSON);

        assertThat(store.view(CTX).get(Integer.class)).contains(1);
        store.evict(7L);
        assertThat(store.view(CTX).get(Integer.class)).contains(1);
    }

    @Test
    void withoutAReducerEveryLookupIsEmpty() {
        SessionStateStore store = new SessionStateStore(provider(null),
                mock(SessionOperationRepository.class), JSON);

        assertThat(store.hasReducer()).isFalse();
        assertThat(store.view(CTX).get(Integer.class)).isEmpty();
    }

    @Test
    void theViewOnlyAnswersForTheDeclaredStateType() {
        SessionStateStore store = new SessionStateStore(provider(new CounterReducer()),
                mock(SessionOperationRepository.class), JSON);

        assertThat(store.view(CTX).get(String.class)).isEmpty();
    }

    private static SessionOperation stored(long seq) {
        SessionOperation operation = new SessionOperation();
        operation.setSeq(seq);
        operation.setPayload("{}");
        return operation;
    }

    /** Wraps a reducer (or nothing) in the {@link ObjectProvider} the component takes. */
    @SuppressWarnings("unchecked")
    private static ObjectProvider<SessionStateReducer<?>> provider(SessionStateReducer<?> reducer) {
        DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
        if (reducer != null) {
            factory.registerSingleton("reducer", reducer);
        }
        return factory.getBeanProvider((Class) SessionStateReducer.class);
    }

    /** Counts the operations it folded; good enough to see rebuild and advance. */
    private static final class CounterReducer implements SessionStateReducer<Integer> {

        @Override
        public Integer initial(SessionContext ctx) {
            return 0;
        }

        @Override
        public Integer reduce(Integer current, tools.jackson.databind.JsonNode operation, long seq) {
            return current + 1;
        }

        @Override
        public Class<Integer> stateType() {
            return Integer.class;
        }
    }
}
