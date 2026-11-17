package com.grupo03.blenderpds.kinds;

import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.OperationFields;
import dev.collab3d.spi.OperationKindValidator;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/** The editor's {@code remove_object}: only the target id, the tombstone carries the rest. */
@Component
public class RemoveObjectKindValidator implements OperationKindValidator {

    public static final String KIND = "remove_object";

    @Override
    public String kind() {
        return KIND;
    }

    @Override
    public void validate(JsonNode operation) {
        if (OperationFields.shortString(operation.get("objectId")) == null) {
            throw new InvalidOperationException(KIND);
        }
    }
}
