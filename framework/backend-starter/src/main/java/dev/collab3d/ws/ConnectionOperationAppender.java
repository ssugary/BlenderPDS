package dev.collab3d.ws;

import dev.collab3d.sequencer.OperationAppender;
import dev.collab3d.spi.Actor;
import dev.collab3d.spi.AppendResult;
import dev.collab3d.spi.SessionOperationAppender;
import java.util.List;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * Binds the SPI's {@link SessionOperationAppender} to one connection: the room and the
 * actor come from the handshake, never from the payload, so a handler cannot append on
 * behalf of somebody else by accident.
 */
public class ConnectionOperationAppender implements SessionOperationAppender {

    private final OperationAppender delegate;
    private final Long sessionId;
    private final Actor actor;

    public ConnectionOperationAppender(OperationAppender delegate, Long sessionId, Actor actor) {
        this.delegate = delegate;
        this.sessionId = sessionId;
        this.actor = actor;
    }

    @Override
    public AppendResult append(List<JsonNode> ops) {
        return delegate.append(sessionId, actor, ops);
    }

    @Override
    public AppendResult appendSystem(List<ObjectNode> ops) {
        return delegate.appendSystem(sessionId, ops);
    }
}
