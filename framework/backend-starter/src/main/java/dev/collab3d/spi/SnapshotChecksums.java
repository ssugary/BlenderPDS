package dev.collab3d.spi;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import tools.jackson.databind.JsonNode;

/**
 * Canonical JSON and its SHA-256, shared by the snapshots of every application.
 *
 * <p>The canonical form is deterministic: object keys sorted, no insignificant
 * whitespace, arrays in order. The client computes the same string (sorted keys), so a
 * checksum produced in the browser validates here — and any truncation or edit of the
 * stored state is refused.
 */
public final class SnapshotChecksums {

    private SnapshotChecksums() {
    }

    /** Lowercase hex SHA-256 of the canonical form of {@code state}. */
    public static String ofState(JsonNode state) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(canonical(state).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponível", ex);
        }
    }

    /** Deterministic text: object keys sorted, arrays in order, scalars as JSON. */
    public static String canonical(JsonNode node) {
        StringBuilder out = new StringBuilder();
        append(node, out);
        return out.toString();
    }

    private static void append(JsonNode node, StringBuilder out) {
        if (node == null || node.isNull()) {
            out.append("null");
            return;
        }
        if (node.isObject()) {
            List<String> names = new ArrayList<>();
            node.properties().forEach(entry -> names.add(entry.getKey()));
            names.sort(String::compareTo);
            out.append('{');
            for (int i = 0; i < names.size(); i++) {
                if (i > 0) {
                    out.append(',');
                }
                out.append(quote(names.get(i))).append(':');
                append(node.get(names.get(i)), out);
            }
            out.append('}');
            return;
        }
        if (node.isArray()) {
            out.append('[');
            for (int i = 0; i < node.size(); i++) {
                if (i > 0) {
                    out.append(',');
                }
                append(node.get(i), out);
            }
            out.append(']');
            return;
        }
        out.append(node.toString());
    }

    private static String quote(String value) {
        StringBuilder out = new StringBuilder("\"");
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> {
                    if (c < 0x20) {
                        out.append(String.format("\\u%04x", (int) c));
                    } else {
                        out.append(c);
                    }
                }
            }
        }
        return out.append('"').toString();
    }
}
