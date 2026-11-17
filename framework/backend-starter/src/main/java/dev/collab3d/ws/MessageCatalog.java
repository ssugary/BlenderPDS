package dev.collab3d.ws;

import dev.collab3d.spi.MessageTypeHandler;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * The frame-type table. Every {@link MessageTypeHandler} bean lands here, so adding a
 * type is adding a bean.
 *
 * <p>A duplicated {@code type()} fails at boot instead of silently shadowing a handler:
 * two beans claiming {@code sync_ops} would make the winner depend on bean ordering,
 * which is exactly the kind of bug that only shows up in production.
 */
@Component
public class MessageCatalog {

    private final Map<String, MessageTypeHandler> byType;

    public MessageCatalog(List<MessageTypeHandler> handlers) {
        Map<String, MessageTypeHandler> table = new HashMap<>();
        for (MessageTypeHandler handler : handlers) {
            if (table.put(handler.type(), handler) != null) {
                throw new IllegalStateException("Duplicate WS type: " + handler.type());
            }
        }
        this.byType = Map.copyOf(table);
    }

    public Optional<MessageTypeHandler> find(String type) {
        return type == null ? Optional.empty() : Optional.ofNullable(byType.get(type));
    }

    /** The registered types, for diagnostics and tests. */
    public List<String> types() {
        return byType.keySet().stream().sorted().toList();
    }
}
