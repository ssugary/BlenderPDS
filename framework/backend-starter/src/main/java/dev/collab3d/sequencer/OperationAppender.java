package dev.collab3d.sequencer;

import dev.collab3d.model.SessionOperation;
import dev.collab3d.session.SessionOperationInput;
import dev.collab3d.session.SessionService;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.AppendedOperation;
import dev.collab3d.spi.AppendResult;
import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.MessageRejectedException;
import dev.collab3d.ws.OperationValidator;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

/**
 * The server-side door into the operation log, as the handlers see it: validate the
 * batch, append it under the session lock, hand back what entered.
 *
 * <p>It is deliberately thin today — {@code SessionService.appendOperations} still owns
 * the sequencing SQL. P1.7 moves that into {@code OperationSequencer}, P1.8 adds the
 * admission chain, and the handlers do not change: they already talk to this interface.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OperationAppender {

    private final SessionService sessionService;
    private final OperationValidator operationValidator;
    private final ObjectMapper objectMapper;

    /**
     * @throws InvalidOperationException when the batch is unusable (nothing is written)
     * @throws MessageRejectedException  when the room refuses the write ({@code OP_REJECTED})
     */
    public AppendResult append(Long sessionId, Actor actor, List<JsonNode> ops) {
        List<SessionOperationInput> inputs = operationValidator.validateBatch(toArray(ops));
        if (inputs.isEmpty()) {
            throw new InvalidOperationException("BATCH");
        }

        List<SessionOperation> saved;
        try {
            saved = sessionService.appendOperations(sessionId, actor.userId(), inputs);
        } catch (EntityNotFoundException | AccessDeniedException | IllegalStateException ex) {
            throw new MessageRejectedException("OP_REJECTED", ex.getMessage());
        }

        return toResult(saved);
    }

    /**
     * Operations the server itself emits (an authoritative {@code game_over}, for
     * instance). They need the {@code seq} they will get, which only the sequencer knows
     * before writing, so this entry point is completed together with it (P1.7): no
     * application emits server operations before Fase 4.
     */
    public AppendResult appendSystem(Long sessionId, List<ObjectNode> ops) {
        throw new UnsupportedOperationException("appendSystem é completado pelo sequencer (P1.7)");
    }

    private JsonNode toArray(List<JsonNode> ops) {
        return ops == null ? null : objectMapper.createArrayNode().addAll(ops);
    }

    private AppendResult toResult(List<SessionOperation> saved) {
        List<AppendedOperation> accepted = new ArrayList<>(saved.size());
        for (SessionOperation operation : saved) {
            Long authorId = operation.getAuthor() == null ? null : operation.getAuthor().getId();
            accepted.add(new AppendedOperation(operation.getSeq(), authorId,
                    objectMapper.readTree(operation.getPayload())));
        }
        return new AppendResult(accepted, List.of());
    }
}
