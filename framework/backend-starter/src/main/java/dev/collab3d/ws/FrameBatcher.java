package dev.collab3d.ws;

import dev.collab3d.spi.AppendedOperation;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 * Splits a list of operations into frames that respect BOTH limits: the operation count
 * and the encoded size.
 *
 * <p>The text-frame ceiling of the servlet container (~8 KB) closes the connection with
 * 1009 when it is crossed, so counting operations was never enough: one operation with a
 * serialized mesh is bigger than a hundred primitive creates. The batcher renders the
 * candidate frame and cuts before it crosses {@code maxBytes}; a single operation that
 * does not fit on its own is still sent alone (the kind validator is what refuses it, so
 * the connection is not dropped without an answer).
 */
public final class FrameBatcher {

    private FrameBatcher() {
    }

    public static List<List<AppendedOperation>> split(List<AppendedOperation> operations,
                                                       int maxOps,
                                                       int maxBytes,
                                                       Function<List<AppendedOperation>, String> render) {
        List<List<AppendedOperation>> frames = new ArrayList<>();
        if (operations == null || operations.isEmpty()) {
            return frames;
        }

        int opLimit = Math.max(1, maxOps);
        int byteLimit = Math.max(1, maxBytes);
        List<AppendedOperation> current = new ArrayList<>();

        for (AppendedOperation operation : operations) {
            current.add(operation);

            boolean overCount = current.size() > opLimit;
            boolean overBytes = bytes(render.apply(current)) > byteLimit;

            if (overCount || overBytes) {
                // Take the newcomer out: it starts the next frame, unless it cannot fit alone.
                current.removeLast();
                if (!current.isEmpty()) {
                    frames.add(List.copyOf(current));
                    current = new ArrayList<>();
                }
                current.add(operation);
            }
        }

        if (!current.isEmpty()) {
            frames.add(List.copyOf(current));
        }
        return frames;
    }

    private static int bytes(String frame) {
        return frame.getBytes(StandardCharsets.UTF_8).length;
    }
}
