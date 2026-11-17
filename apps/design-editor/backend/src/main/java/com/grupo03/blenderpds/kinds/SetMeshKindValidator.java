package com.grupo03.blenderpds.kinds;

import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.OperationFields;
import dev.collab3d.spi.OperationKindValidator;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/**
 * The editor's {@code set_mesh}: the target id and the whole serialized geometry buffer.
 *
 * <p>The buffer is bounded by {@code design.max-mesh-bytes} (UTF-8 bytes), the same
 * ceiling the client enforces before building the operation. Without it one connection
 * could push a multi-megabyte string into every participant and into the log.
 */
@Component
public class SetMeshKindValidator implements OperationKindValidator {

    public static final String KIND = "set_mesh";

    private final int maxBytes;

    public SetMeshKindValidator(@Value("${design.max-mesh-bytes:262144}") int maxBytes) {
        if (maxBytes <= 0) {
            throw new IllegalArgumentException("design.max-mesh-bytes precisa ser positivo");
        }
        this.maxBytes = maxBytes;
    }

    @Override
    public String kind() {
        return KIND;
    }

    @Override
    public void validate(JsonNode operation) {
        if (OperationFields.shortString(operation.get("objectId")) == null
                || !isBoundedGeometry(operation.get("geometry"))) {
            throw new InvalidOperationException(KIND);
        }
    }

    public int maxBytes() {
        return maxBytes;
    }

    private boolean isBoundedGeometry(JsonNode node) {
        if (node == null || !node.isString()) {
            return false;
        }
        String value = node.asString();
        return !value.isEmpty() && value.getBytes(StandardCharsets.UTF_8).length <= maxBytes;
    }
}
