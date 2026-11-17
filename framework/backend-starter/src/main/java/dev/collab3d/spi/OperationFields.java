package dev.collab3d.spi;

import tools.jackson.databind.JsonNode;

/**
 * Shape predicates shared by the operation kinds an application registers.
 *
 * <p>They live in the SPI, not in the starter's validator, because the kinds moved to
 * the application (P1.6): an app must be able to check the same field shapes the
 * envelope already uses without importing the framework's internals. The limits match
 * the client's {@code apps/design-editor/web/src/collab/validate.ts}.
 */
public final class OperationFields {

    /** Longest id/name accepted on the wire (object ids, geometry names, site ids). */
    public static final int MAX_ID_LENGTH = 100;

    /** A transform is a 4x4 matrix flattened column-major (three.js convention). */
    public static final int MATRIX_SIZE = 16;

    /** Colors travel as {@code 0x000000..0xFFFFFF} integers, not as CSS strings. */
    public static final int MAX_COLOR = 0xFF_FFFF;

    private OperationFields() {
    }

    /** A non-empty string within the id limit, or {@code null} when the node is not one. */
    public static String shortString(JsonNode node) {
        if (node == null || !node.isTextual()) {
            return null;
        }
        String value = node.asString();
        return value.isEmpty() || value.length() > MAX_ID_LENGTH ? null : value;
    }

    /** Whether the node is a 4x4 matrix of finite numbers. */
    public static boolean isMatrix(JsonNode node) {
        if (node == null || !node.isArray() || node.size() != MATRIX_SIZE) {
            return false;
        }
        for (JsonNode value : node) {
            if (!value.isNumber() || !Double.isFinite(value.asDouble())) {
                return false;
            }
        }
        return true;
    }

    /** Whether the node is an integral color inside {@code 0x000000..0xFFFFFF}. */
    public static boolean isColor(JsonNode node) {
        return node != null && node.isIntegralNumber() && node.asLong() >= 0 && node.asLong() <= MAX_COLOR;
    }
}
