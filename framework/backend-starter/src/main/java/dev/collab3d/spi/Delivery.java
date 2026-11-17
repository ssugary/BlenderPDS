package dev.collab3d.spi;

/** How a frame is delivered, which decides whether it runs under the session lock. */
public enum Delivery {

    /** Changes persisted state: runs inside {@code runLocked}, in {@code seq} order. */
    PERSISTED_OPS,

    /** Ephemeral (presence, pose): never stored, runs outside the lock. */
    RELAY_EPHEMERAL,

    /** One answer to one connection: no shared state, outside the lock. */
    UNICAST_REPLY
}
