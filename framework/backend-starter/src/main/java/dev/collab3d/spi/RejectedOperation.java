package dev.collab3d.spi;

/** An operation that did not enter the log, with the reason the client will see. */
public record RejectedOperation(OpRef ref, RejectReason reason) {
}
