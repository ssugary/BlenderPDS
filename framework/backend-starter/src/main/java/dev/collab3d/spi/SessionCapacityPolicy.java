package dev.collab3d.spi;

/**
 * HS5: how many people fit in a room. Configurable through
 * {@code collab3d.session.max-participants} (default 4).
 */
public interface SessionCapacityPolicy {

    int maxParticipants(SessionContext ctx);

    default boolean supports(String appType) {
        return true;
    }
}
