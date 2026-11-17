package dev.collab3d.sequencer;

import dev.collab3d.model.SessionOperation;
import dev.collab3d.session.SessionContextFactory;
import dev.collab3d.session.SessionOperationInput;
import dev.collab3d.session.SessionStateStore;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.AppendResult;
import dev.collab3d.spi.AppendedOperation;
import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.MessageRejectedException;
import dev.collab3d.spi.OperationAdmissionPolicy;
import dev.collab3d.spi.OpRef;
import dev.collab3d.spi.RejectReason;
import dev.collab3d.spi.RejectedOperation;
import dev.collab3d.spi.SessionContext;
import dev.collab3d.spi.SessionStateView;
import dev.collab3d.ws.OperationValidator;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

/**
 * The server-side door into the operation log, as the handlers see it: validate the
 * batch, ask the admission chain, append what was admitted under the session lock, and
 * hand back what entered and what was refused.
 *
 * <p>Admission is per operation (a batch can be partially accepted), while the envelope
 * and kind validation is atomic per batch and fails before this point (§11, decision 1).
 * All of it runs inside the dispatcher's session lock, so the policy sees the state left
 * by every operation that entered before, and the reducer advances in {@code seq} order.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OperationAppender {

    private final OperationSequencer sequencer;
    private final OperationValidator operationValidator;
    private final SessionContextFactory contextFactory;
    private final SessionStateStore stateStore;
    private final List<OperationAdmissionPolicy> admissionPolicies;
    private final ObjectMapper objectMapper;

    /**
     * @throws InvalidOperationException when the batch is unusable (nothing is written)
     * @throws MessageRejectedException  when the room refuses the whole write
     */
    public AppendResult append(Long sessionId, Actor actor, List<JsonNode> ops) {
        List<SessionOperationInput> inputs = operationValidator.validateBatch(toArray(ops));
        if (inputs.isEmpty()) {
            throw new InvalidOperationException("BATCH");
        }

        SessionContext ctx = contextFactory.sessionContext(sessionId);
        SessionStateView state = stateStore.view(ctx);

        List<SessionOperationInput> admitted = new ArrayList<>();
        List<RejectedOperation> rejected = new ArrayList<>();
        for (SessionOperationInput input : inputs) {
            JsonNode operation = objectMapper.readTree(input.payload());
            Optional<RejectReason> denial = admit(ctx, actor, operation, state);
            if (denial.isPresent()) {
                rejected.add(new RejectedOperation(new OpRef(input.siteId(), input.lamport()), denial.get()));
            } else {
                admitted.add(input);
            }
        }

        List<AppendedOperation> accepted = List.of();
        if (!admitted.isEmpty()) {
            List<SessionOperation> saved;
            try {
                saved = sequencer.append(sessionId, actor.userId(), admitted);
            } catch (EntityNotFoundException | AccessDeniedException | IllegalStateException ex) {
                throw new MessageRejectedException("OP_REJECTED", ex.getMessage());
            }
            accepted = toAccepted(saved);
            for (AppendedOperation operation : accepted) {
                stateStore.advance(ctx, operation.operation(), operation.seq());
            }
        }

        return new AppendResult(accepted, rejected);
    }

    /**
     * Operations the server itself emits (an authoritative {@code game_over}, for
     * instance). They need the {@code seq} they will get, which only the sequencer knows
     * before writing, so this entry point is completed together with the first
     * authoritative application (Fase 4): no application emits server operations yet.
     */
    public AppendResult appendSystem(Long sessionId, List<ObjectNode> ops) {
        throw new UnsupportedOperationException("appendSystem é completado na Fase 4");
    }

    /** The first denial wins; policies that do not serve this app type are skipped. */
    private Optional<RejectReason> admit(SessionContext ctx, Actor actor, JsonNode operation, SessionStateView state) {
        for (OperationAdmissionPolicy policy : admissionPolicies) {
            if (!policy.supports(ctx.appType())) {
                continue;
            }
            Optional<RejectReason> denial = policy.admit(ctx, actor, operation, state);
            if (denial.isPresent()) {
                return denial;
            }
        }
        return Optional.empty();
    }

    private JsonNode toArray(List<JsonNode> ops) {
        return ops == null ? null : objectMapper.createArrayNode().addAll(ops);
    }

    private List<AppendedOperation> toAccepted(List<SessionOperation> saved) {
        List<AppendedOperation> accepted = new ArrayList<>(saved.size());
        for (SessionOperation operation : saved) {
            Long authorId = operation.getAuthor() == null ? null : operation.getAuthor().getId();
            accepted.add(new AppendedOperation(operation.getSeq(), authorId,
                    objectMapper.readTree(operation.getPayload())));
        }
        return accepted;
    }
}
