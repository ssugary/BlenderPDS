package dev;

import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.OperationFields;
import dev.collab3d.spi.OperationKindValidator;
import java.util.function.Predicate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.JsonNode;

/**
 * The operation kinds the starter's tests speak.
 *
 * <p>After P1.6 the framework registers no kind of its own, so the WebSocket tests would
 * have nothing to validate. These beans reproduce the design editor's contract (the four
 * shapes of {@code apps/design-editor/web/src/collab/validate.ts}) inside the test
 * scope; the real application declares its own copies in
 * {@code apps/design-editor/backend/.../kinds}.
 */
@Configuration(proxyBeanMethods = false)
public class TestKindsConfiguration {

    @Bean
    OperationKindValidator addObjectKind() {
        return kind("add_object", op -> OperationFields.shortString(op.get("objectId")) != null
                && OperationFields.shortString(op.get("geometry")) != null
                && OperationFields.isMatrix(op.get("transform"))
                && OperationFields.isColor(op.get("color")));
    }

    @Bean
    OperationKindValidator removeObjectKind() {
        return kind("remove_object", op -> OperationFields.shortString(op.get("objectId")) != null);
    }

    @Bean
    OperationKindValidator setTransformKind() {
        return kind("set_transform", op -> OperationFields.shortString(op.get("objectId")) != null
                && OperationFields.isMatrix(op.get("matrix")));
    }

    @Bean
    OperationKindValidator changeColorKind() {
        return kind("change_color", op -> OperationFields.shortString(op.get("objectId")) != null
                && OperationFields.isColor(op.get("color")));
    }

    private static OperationKindValidator kind(String kind, Predicate<JsonNode> valid) {
        return new OperationKindValidator() {
            @Override
            public String kind() {
                return kind;
            }

            @Override
            public void validate(JsonNode operation) {
                if (!valid.test(operation)) {
                    throw new InvalidOperationException(kind);
                }
            }
        };
    }
}
