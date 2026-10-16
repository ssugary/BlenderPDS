package com.grupo03.blenderpds.websocket;

import com.grupo03.blenderpds.service.SessionOperationInput;
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
 * <p>It is the Java mirror of {@code frontend/src/collab/validate.ts} — the source of
 * truth for operation types is the client, and this file has to follow whenever it
 * grows. The rule is the same as the comments there say: nothing that comes from the
 * socket is trustworthy, so shape and size are checked before any persistence.
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

    /** Same cap as validate.ts: object/site ids and geometry names. */
    public static final int MAX_ID_LENGTH = 100;

    /** Maximum batch per message, matching the client's SyncEngine MAX_OPS_PER_MESSAGE. */
    public static final int MAX_OPS_PER_MESSAGE = 1_000;

    private static final int MAX_COLOR = 0xFF_FFFF;
    private static final int MATRIX_SIZE = 16;

    private final ObjectMapper objectMapper;

    /** Only the valid operations of the batch; an empty batch means "nothing usable". */
    public List<SessionOperationInput> validateBatch(JsonNode opsNode) {
        if (opsNode == null || !opsNode.isArray()) {
            return List.of();
        }

        List<SessionOperationInput> valid = new ArrayList<>();
        for (JsonNode node : opsNode) {
            if (valid.size() >= MAX_OPS_PER_MESSAGE) {
                break;
            }
            validate(node).ifPresent(valid::add);
        }
        return valid;
    }

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

        String siteId = shortString(id.get("siteId"));
        if (siteId == null) {
            return Optional.empty();
        }

        // The author must be the very replica that signed the operation.
        JsonNode author = node.get("author");
        if (author == null || !author.isTextual() || !author.asText().equals(siteId)) {
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
        String kind = kindNode.asText();
        if (!hasValidPayload(kind, node)) {
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

    /** The same types the client's DocumentState understands today. */
    private boolean hasValidPayload(String kind, JsonNode node) {
        return switch (kind) {
            case "add_object" -> shortString(node.get("objectId")) != null
                    && shortString(node.get("geometry")) != null
                    && isMatrix(node.get("transform"))
                    && isColor(node.get("color"));
            case "remove_object" -> shortString(node.get("objectId")) != null;
            case "set_transform" -> shortString(node.get("objectId")) != null
                    && isMatrix(node.get("matrix"));
            case "change_color" -> shortString(node.get("objectId")) != null
                    && isColor(node.get("color"));
            default -> false;
        };
    }

    private String shortString(JsonNode node) {
        if (node == null || !node.isTextual()) {
            return null;
        }
        String value = node.asText();
        return value.isEmpty() || value.length() > MAX_ID_LENGTH ? null : value;
    }

    private boolean isMatrix(JsonNode node) {
        if (node == null || !node.isArray() || node.size() != MATRIX_SIZE) {
            return false;
        }
        for (JsonNode value : node) {
            if (!value.isNumber() || !Double.isFinite(value.asDouble())) {
                return false;
            }
        }
        return true;
    }

    private boolean isColor(JsonNode node) {
        return node != null && node.isIntegralNumber() && node.asLong() >= 0 && node.asLong() <= MAX_COLOR;
    }
}
