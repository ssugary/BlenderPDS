package dev.collab3d.ws;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.collab3d.spi.OperationKindValidator;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;

/** The kind table: lookup, duplicates and the empty application (no kind at all). */
class OperationKindRegistryTest {

    @Test
    void findsTheValidatorRegisteredForTheKind() {
        OperationKindRegistry registry = new OperationKindRegistry(List.of(new FakeKind("turn_end")));

        assertThat(registry.find("turn_end")).isPresent();
        assertThat(registry.kinds()).containsExactly("turn_end");
    }

    @Test
    void anUnknownKindHasNoValidator() {
        OperationKindRegistry registry = new OperationKindRegistry(List.of(new FakeKind("turn_end")));

        assertThat(registry.find("add_object")).isEmpty();
        assertThat(registry.find(null)).isEmpty();
        assertThat(registry.find("")).isEmpty();
    }

    @Test
    void anApplicationWithoutKindsBootsWithAnEmptyTable() {
        OperationKindRegistry registry = new OperationKindRegistry(List.of());

        assertThat(registry.kinds()).isEmpty();
    }

    @Test
    void aDuplicatedKindFailsInsteadOfShadowingTheFirstOne() {
        assertThatThrownBy(() -> new OperationKindRegistry(
                List.of(new FakeKind("turn_end"), new FakeKind("turn_end"))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Duplicate operation kind: turn_end");
    }

    @Test
    void aValidatorWithoutAKindFailsAtBoot() {
        assertThatThrownBy(() -> new OperationKindRegistry(List.of(new FakeKind(""))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("without a kind");
    }

    private record FakeKind(String kind) implements OperationKindValidator {

        @Override
        public void validate(JsonNode operation) {
            // nothing to check in this test fixture
        }
    }
}
