package dev.collab3d.ws;

import dev.collab3d.autoconfigure.Collab3dProperties;
import dev.collab3d.session.SessionOperationInput;
import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.OperationFields;
import dev.collab3d.spi.OperationKindValidator;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * The sieve for everything that arrives over the network before it becomes a row in
 * the database.
 *
 * <p>It validates the <em>envelope</em> only ({@code id}, {@code author}, {@code deps},
 * {@code kind}); the fields of each kind belong to the application and are checked by
 * the {@link OperationKindValidator} registered for it in {@link OperationKindRegistry}.
 * A kind nobody registered is refused — the framework no longer knows a single domain
 * kind. This is the Java mirror of the envelope part of
 * {@code apps/design-editor/web/src/collab/validate.ts}.
 *
 * <p>What does not pass is DROPPED (it does not take the connection down): a
 * participant with a newer client version must not be able to break everyone else's
 * room.
 *
 * <p>Note: the project uses Jackson 3 ({@code tools.jackson}), Spring Boot 4's JSON
 * — the API is the same as the Jackson 2 examples, only the package changed.
 */
@Component
@RequiredArgsConstructor
public class OperationValidator {

    private final ObjectMapper objectMapper;
    private final OperationKindRegistry kinds;
    private final Collab3dProperties properties;

    /** Only the valid operations of the batch; an empty batch means "nothing usable". */
    public List<SessionOperationInput> validateBatch(JsonNode opsNode) {
        if (opsNode == null || !opsNode.isArray()) {
            return List.of();
        }

        int maxOps = properties.sync().maxOpsPerMessage();
        List<SessionOperationInput> valid = new ArrayList<>();
        for (JsonNode node : opsNode) {
            if (valid.size() >= maxOps) {
                break;
            }
            validate(node).ifPresent(valid::add);
        }
        return valid;
    }

    /** checks the envelope, then hands the payload to the kind's validator */
    public Optional<SessionOperationInput> validate(JsonNode node) {
        if (node == null || !node.isObject()) {
            return Optional.empty();
        }

        JsonNode id = node.get("id");
        if (id == null || !id.isObject()) {
            return Optional.empty();
        }

        JsonNode lamport = id.get("lamport");
        if (lamport == null || !lamport.isIntegralNumber() || lamport.asLong() < 0) {
            return Optional.empty();
        }

        String siteId = OperationFields.shortString(id.get("siteId"));
        if (siteId == null) {
            return Optional.empty();
        }

        // The author must be the very replica that signed the operation.
        JsonNode author = node.get("author");
        if (author == null || !author.isTextual() || !author.asString().equals(siteId)) {
            return Optional.empty();
        }

        // An empty deps is the client's current contract (an MVP without explicit causal delivery).
        JsonNode deps = node.get("deps");
        if (deps == null || !deps.isArray() || !deps.isEmpty()) {
            return Optional.empty();
        }

        JsonNode kindNode = node.get("kind");
        if (kindNode == null || !kindNode.isTextual()) {
            return Optional.empty();
        }
        String kind = kindNode.asString();

        // No validator, no entry: an unknown kind is refused, never trusted.
        OperationKindValidator validator = kinds.find(kind).orElse(null);
        if (validator == null) {
            return Optional.empty();
        }
        try {
            validator.validate(node);
        } catch (InvalidOperationException ex) {
            return Optional.empty();
        }

        // Writing back an already parsed node does not fail in practice; the catch is only a safety net.
        try {
            return Optional.of(new SessionOperationInput(
                    siteId, lamport.asLong(), kind, objectMapper.writeValueAsString(node)));
        } catch (RuntimeException ex) {
            return Optional.empty();
        }
    }
}
