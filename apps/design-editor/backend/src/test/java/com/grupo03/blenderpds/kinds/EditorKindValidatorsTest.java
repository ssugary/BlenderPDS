package com.grupo03.blenderpds.kinds;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import dev.collab3d.spi.InvalidOperationException;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * The four editor kinds, exactly as the client's {@code validate.ts} accepts them.
 * These are the rules that used to live in the starter's {@code OperationValidator}
 * (P1.6): same fields, same limits.
 */
class EditorKindValidatorsTest {

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final String MATRIX = "[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]";

    private final AddObjectKindValidator addObject = new AddObjectKindValidator(512);
    private final RemoveObjectKindValidator removeObject = new RemoveObjectKindValidator();
    private final SetTransformKindValidator setTransform = new SetTransformKindValidator();
    private final ChangeColorKindValidator changeColor = new ChangeColorKindValidator();
    /** A small ceiling so the boundary can be tested without a 256 KB string. */
    private final SetMeshKindValidator setMesh = new SetMeshKindValidator(512);

    @Test
    void addObjectNeedsGeometryTransformAndColor() {
        assertDoesNotThrow(() -> addObject.validate(json(
                "{\"objectId\":\"obj-1\",\"geometry\":\"cube\",\"transform\":" + MATRIX + ",\"color\":16711680}")));

        assertThrows(InvalidOperationException.class, () -> addObject.validate(json(
                "{\"objectId\":\"obj-1\",\"transform\":" + MATRIX + ",\"color\":16711680}")));
        assertThrows(InvalidOperationException.class, () -> addObject.validate(json(
                "{\"objectId\":\"obj-1\",\"geometry\":\"cube\",\"transform\":[1,2],\"color\":1}")));
        assertThrows(InvalidOperationException.class, () -> addObject.validate(json(
                "{\"objectId\":\"obj-1\",\"geometry\":\"cube\",\"transform\":" + MATRIX + ",\"color\":16777216}")));
    }

    @Test
    void removeObjectNeedsOnlyTheTargetId() {
        assertDoesNotThrow(() -> removeObject.validate(json("{\"objectId\":\"obj-1\"}")));

        assertThrows(InvalidOperationException.class, () -> removeObject.validate(json("{}")));
        assertThrows(InvalidOperationException.class, () -> removeObject.validate(json(
                "{\"objectId\":\"" + "x".repeat(101) + "\"}")));
    }

    @Test
    void setTransformNeedsTheMatrix() {
        assertDoesNotThrow(() -> setTransform.validate(json(
                "{\"objectId\":\"obj-1\",\"matrix\":" + MATRIX + "}")));

        assertThrows(InvalidOperationException.class, () -> setTransform.validate(json(
                "{\"objectId\":\"obj-1\"}")));
    }

    @Test
    void changeColorNeedsAValidColor() {
        assertDoesNotThrow(() -> changeColor.validate(json("{\"objectId\":\"obj-1\",\"color\":0}")));

        assertThrows(InvalidOperationException.class, () -> changeColor.validate(json(
                "{\"objectId\":\"obj-1\",\"color\":-1}")));
        assertThrows(InvalidOperationException.class, () -> changeColor.validate(json(
                "{\"objectId\":\"obj-1\",\"color\":\"#ff0000\"}")));
    }

    @Test
    void setMeshNeedsABoundedGeometryBuffer() {
        assertDoesNotThrow(() -> setMesh.validate(json(
                "{\"objectId\":\"obj-1\",\"geometry\":\"v 0 0 0\\\\nf 1 2 3\"}")));

        assertThrows(InvalidOperationException.class, () -> setMesh.validate(json(
                "{\"objectId\":\"obj-1\",\"geometry\":\"\"}")));
        assertThrows(InvalidOperationException.class, () -> setMesh.validate(json(
                "{\"objectId\":\"obj-1\",\"geometry\":" + 42 + "}")));
        assertThrows(InvalidOperationException.class, () -> setMesh.validate(json(
                "{\"objectId\":\"obj-1\",\"geometry\":\"" + "x".repeat(513) + "\"}")));
        assertDoesNotThrow(() -> setMesh.validate(json(
                "{\"objectId\":\"obj-1\",\"geometry\":\"" + "x".repeat(512) + "\"}")));
    }

    @Test
    void everyKindDeclaresTheWireNameTheClientUses() {
        List<String> kinds = List.of(addObject.kind(), removeObject.kind(), setTransform.kind(),
                changeColor.kind(), setMesh.kind());

        org.junit.jupiter.api.Assertions.assertEquals(
                List.of("add_object", "remove_object", "set_transform", "change_color", "set_mesh"), kinds);
    }

    private static JsonNode json(String raw) {
        return JSON.readTree(raw);
    }
}
