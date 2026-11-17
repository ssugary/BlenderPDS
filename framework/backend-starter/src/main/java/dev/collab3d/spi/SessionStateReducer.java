package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * HS1 (optional): folds the operation log into a domain state on the server, for
 * domains that are authoritative (whose turn it is, who won).
 *
 * <p>One reducer per room: the state is rebuilt from the log when the room is opened and
 * advanced operation by operation afterwards. Applications that are purely CRDT declare
 * none.
 *
 * @param <S> the domain state type
 */
public interface SessionStateReducer<S> {

    S initial(SessionContext ctx);

    S reduce(S current, JsonNode operation, long seq);

    Class<S> stateType();
}
