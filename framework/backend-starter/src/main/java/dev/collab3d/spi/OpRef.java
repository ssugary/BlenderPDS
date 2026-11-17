package dev.collab3d.spi;

/** Identifies a client operation: the replica and its Lamport counter. */
public record OpRef(String siteId, long lamport) {
}
