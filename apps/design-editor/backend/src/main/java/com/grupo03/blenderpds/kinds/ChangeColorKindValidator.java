package com.grupo03.blenderpds.kinds;

import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.OperationFields;
import dev.collab3d.spi.OperationKindValidator;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/** The editor's {@code change_color}: the target id and the new {@code 0xRRGGBB} value. */
@Component
public class ChangeColorKindValidator implements OperationKindValidator {

    public static final String KIND = "change_color";

    @Override
    public String kind() {
        return KIND;
    }

    @Override
    public void validate(JsonNode operation) {
        if (OperationFields.shortString(operation.get("objectId")) == null
                || !OperationFields.isColor(operation.get("color"))) {
            throw new InvalidOperationException(KIND);
        }
    }
}
