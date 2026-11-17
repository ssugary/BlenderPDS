package dev.collab3d.spi;

/**
 * HS5: who may enter a room. Called both by {@code SessionService.join} (REST) and by
 * {@code connectParticipant} (the WebSocket handshake), so the two doors cannot drift
 * apart.
 *
 * <p>The chain is a {@code List<SessionJoinPolicy>} and every element must approve; the
 * first denial wins. To REPLACE the default rule instead of adding to it, declare a
 * bean of this type — the default is registered with
 * {@code @ConditionalOnMissingBean(SessionJoinPolicy.class)}.
 */
public interface SessionJoinPolicy {

    JoinDecision decide(SessionContext ctx, Actor joiner, JoinRequest request);

    default boolean supports(String appType) {
        return true;
    }
}
