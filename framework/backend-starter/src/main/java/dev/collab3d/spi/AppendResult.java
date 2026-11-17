package dev.collab3d.spi;

import java.util.List;

/**
 * Outcome of a batch: what entered the log (with its {@code seq}) and what was refused.
 * Admission is per operation, so a batch can be partially accepted; envelope/kind
 * validation is atomic per batch and fails before this point.
 */
public record AppendResult(List<AppendedOperation> accepted, List<RejectedOperation> rejected) {

    public AppendResult {
        accepted = List.copyOf(accepted);
        rejected = List.copyOf(rejected);
    }

    public static AppendResult empty() {
        return new AppendResult(List.of(), List.of());
    }

    public boolean isEmpty() {
        return accepted.isEmpty() && rejected.isEmpty();
    }
}
