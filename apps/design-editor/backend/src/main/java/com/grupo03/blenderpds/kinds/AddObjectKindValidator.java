package com.grupo03.blenderpds.kinds;

import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.OperationFields;
import dev.collab3d.spi.OperationKindValidator;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/**
 * The editor's {@code add_object}: a primitive name, a transform and a color.
 *
 * <p>It used to be a {@code case} inside the starter's validator; it now lives with the
 * application that owns the kind, which is what lets the framework host other domains
 * without a single literal of theirs.
 */
@Component
public class AddObjectKindValidator implements OperationKindValidator {

    public static final String KIND = "add_object";

    @Override
    public String kind() {
        return KIND;
    }

    @Override
    public void validate(JsonNode operation) {
        if (OperationFields.shortString(operation.get("objectId")) == null
                || OperationFields.shortString(operation.get("geometry")) == null
                || !OperationFields.isMatrix(operation.get("transform"))
                || !OperationFields.isColor(operation.get("color"))) {
            throw new InvalidOperationException(KIND);
        }
    }
}
