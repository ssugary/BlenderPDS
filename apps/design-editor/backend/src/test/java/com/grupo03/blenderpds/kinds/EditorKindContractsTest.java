package com.grupo03.blenderpds.kinds;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import dev.collab3d.spi.InvalidOperationException;
import dev.collab3d.spi.OperationKindValidator;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * The server half of the shared contract: this test and the client's
 * {@code src/kinds/contracts.test.ts} read the SAME {@code contracts/design-editor/*.cases.json}
 * files. A kind the browser accepts but the server rejects (or the reverse) fails here.
 */
class EditorKindContractsTest {

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final Path CONTRACTS = Path.of(System.getProperty("user.dir"), "../../../contracts/design-editor");

    private final Map<String, OperationKindValidator> validators = Map.of(
            AddObjectKindValidator.KIND, new AddObjectKindValidator(262_144),
            RemoveObjectKindValidator.KIND, new RemoveObjectKindValidator(),
            SetTransformKindValidator.KIND, new SetTransformKindValidator(),
            ChangeColorKindValidator.KIND, new ChangeColorKindValidator(),
            SetMeshKindValidator.KIND, new SetMeshKindValidator(262_144));

    @Test
    void everyRegisteredKindHasAContractFile() throws IOException {
        List<String> files;
        try (Stream<Path> stream = Files.list(CONTRACTS)) {
            files = stream.map(path -> path.getFileName().toString())
                    .filter(name -> name.endsWith(".cases.json"))
                    .sorted()
                    .toList();
        }

        assertTrue(files.size() == validators.size(),
                "esperava um arquivo .cases.json por kind, encontrei " + files);
    }

    @Test
    void serverAcceptsEveryValidCase() throws IOException {
        for (Map.Entry<String, JsonNode> contract : contracts().entrySet()) {
            OperationKindValidator validator = validatorFor(contract.getKey());
            for (JsonNode entry : contract.getValue().get("valid")) {
                JsonNode operation = entry.get("operation");
                assertEnvelope(operation);
                assertDoesNotThrow(() -> validator.validate(operation),
                        contract.getKey() + " deveria aceitar: " + entry.path("description").asString(""));
            }
        }
    }

    @Test
    void serverRejectsEveryInvalidCase() throws IOException {
        for (Map.Entry<String, JsonNode> contract : contracts().entrySet()) {
            OperationKindValidator validator = validatorFor(contract.getKey());
            for (JsonNode entry : contract.getValue().get("invalid")) {
                JsonNode operation = entry.get("operation");
                assertEnvelope(operation);
                assertThrows(InvalidOperationException.class, () -> validator.validate(operation),
                        contract.getKey() + " deveria recusar: " + entry.path("reason").asString(""));
            }
        }
    }

    private OperationKindValidator validatorFor(String kind) {
        OperationKindValidator validator = validators.get(kind);
        assertTrue(validator != null, "kind sem validador no servidor: " + kind);
        return validator;
    }

    /** The envelope is part of the file too, so the server checks the client is sending one. */
    private static void assertEnvelope(JsonNode operation) {
        assertTrue(operation.path("id").path("lamport").isNumber(), "op sem id.lamport: " + operation);
        assertTrue(operation.path("id").path("siteId").isString(), "op sem id.siteId: " + operation);
        assertTrue(operation.path("author").isString(), "op sem author: " + operation);
        assertTrue(operation.path("deps").isArray(), "op sem deps: " + operation);
    }

    /** kind -> parsed file, so a broken file fails once with its name in the message. */
    private static Map<String, JsonNode> contracts() throws IOException {
        Map<String, JsonNode> byKind = new LinkedHashMap<>();
        try (Stream<Path> stream = Files.list(CONTRACTS)) {
            for (Path file : stream.filter(path -> path.getFileName().toString().endsWith(".cases.json")).sorted().toList()) {
                JsonNode contract = JSON.readTree(Files.readString(file));
                JsonNode kind = contract.get("kind");
                assertTrue(kind != null && kind.isString(), file + " sem campo kind");
                byKind.put(kind.asString(), contract);
            }
        }
        return byKind;
    }
}
