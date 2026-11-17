package dev.collab3d.ws;

import dev.collab3d.spi.OperationKindValidator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * The operation-kind table: every {@link OperationKindValidator} bean lands here, so
 * teaching the server a new kind is adding a bean to the application.
 *
 * <p>A kind without a validator is rejected by {@link OperationValidator} — that is the
 * "secure by default" rule: the framework knows no domain kind of its own.
 *
 * <p>A duplicated {@code kind()} fails at boot for the same reason a duplicated frame
 * type does in {@link MessageCatalog}: the winner would depend on bean ordering.
 */
@Component
public class OperationKindRegistry {

    private final Map<String, OperationKindValidator> byKind;

    public OperationKindRegistry(List<OperationKindValidator> validators) {
        Map<String, OperationKindValidator> table = new HashMap<>();
        for (OperationKindValidator validator : validators) {
            if (validator.kind() == null || validator.kind().isBlank()) {
                throw new IllegalStateException("OperationKindValidator without a kind: "
                        + validator.getClass().getName());
            }
            if (table.put(validator.kind(), validator) != null) {
                throw new IllegalStateException("Duplicate operation kind: " + validator.kind());
            }
        }
        this.byKind = Map.copyOf(table);
    }

    public Optional<OperationKindValidator> find(String kind) {
        return kind == null ? Optional.empty() : Optional.ofNullable(byKind.get(kind));
    }

    /** The registered kinds, for diagnostics and tests. */
    public List<String> kinds() {
        return byKind.keySet().stream().sorted().toList();
    }
}
