package com.grupo03.blenderpds.kinds;

import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.OperationFields;
import dev.collab3d.spi.OperationKindValidator;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/** The editor's {@code set_transform}: the target id and the full replacement matrix. */
@Component
public class SetTransformKindValidator implements OperationKindValidator {

    public static final String KIND = "set_transform";

    @Override
    public String kind() {
        return KIND;
    }

    @Override
    public void validate(JsonNode operation) {
        if (OperationFields.shortString(operation.get("objectId")) == null
                || !OperationFields.isMatrix(operation.get("matrix"))) {
            throw new InvalidOperationException(KIND);
        }
    }
}
