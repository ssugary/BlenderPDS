package dev.collab3d.ws;

/**
 * Wire-level limits that are not tunable per application: they protect the server from
 * ids that are too long to be useful and from a version vector that would cost more to
 * read than the catch-up it saves. Sizes that an application may want to change live in
 * {@code Collab3dProperties}.
 */
public final class ProtocolLimits {

    /** Longest id accepted on the wire: object ids, replica ({@code siteId}) and nickname-sized fields. */
    public static final int MAX_ID_LENGTH = 100;

    private ProtocolLimits() {
    }
}
