package dev.collab3d.ws;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.spi.AppendedOperation;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

/**
 * P3.0: a frame respects both the operation count and the encoded size.
 *
 * <p>Without the byte limit a single serialized mesh (or a chunk of large operations)
 * crosses the container's ~8 KB text-frame ceiling and the socket is closed with 1009.
 */
class FrameBatcherTest {

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final int MAX_BYTES = 1_200;

    @Test
    void largeOperationsAreSplitIntoFramesThatFitTheByteBudget() {
        List<AppendedOperation> operations = operations(40, 180);

        List<List<AppendedOperation>> frames = FrameBatcher.split(operations, 100, MAX_BYTES, this::render);

        assertThat(frames).hasSizeGreaterThan(1);
        for (List<AppendedOperation> frame : frames) {
            assertThat(render(frame).getBytes(StandardCharsets.UTF_8).length)
                    .as("um frame de %d operações", frame.size())
                    .isLessThanOrEqualTo(MAX_BYTES);
        }
        assertThat(frames.stream().flatMap(List::stream).toList())
                .extracting(AppendedOperation::seq)
                .containsExactlyElementsOf(operations.stream().map(AppendedOperation::seq).toList());
    }

    @Test
    void countLimitStillAppliesWhenTheOperationsAreSmall() {
        List<AppendedOperation> operations = operations(25, 10);

        List<List<AppendedOperation>> frames = FrameBatcher.split(operations, 10, MAX_BYTES, this::render);

        assertThat(frames).hasSize(3);
        assertThat(frames).allSatisfy(frame -> assertThat(frame.size()).isLessThanOrEqualTo(10));
    }

    @Test
    void aSingleOperationBiggerThanTheBudgetIsStillSentAlone() {
        List<AppendedOperation> operations = operations(1, 2_000);

        List<List<AppendedOperation>> frames = FrameBatcher.split(operations, 100, MAX_BYTES, this::render);

        assertThat(frames).hasSize(1);
        assertThat(frames.getFirst()).hasSize(1);
    }

    private List<AppendedOperation> operations(int count, int padding) {
        List<AppendedOperation> operations = new ArrayList<>(count);
        for (int i = 1; i <= count; i++) {
            ObjectNode payload = JSON.createObjectNode();
            payload.put("kind", "add_object");
            payload.put("padding", "x".repeat(padding));
            operations.add(new AppendedOperation(i, null, payload));
        }
        return operations;
    }

    /** Same shape the server sends, so the measured bytes are the frame's bytes. */
    private String render(List<AppendedOperation> operations) {
        ObjectNode root = JSON.createObjectNode();
        root.put("type", "sync_ops");
        var array = root.putArray("ops");
        operations.forEach(operation -> {
            ObjectNode payload = (ObjectNode) operation.operation();
            payload.put("seq", operation.seq());
            array.add(payload);
        });
        return root.toString();
    }
}
