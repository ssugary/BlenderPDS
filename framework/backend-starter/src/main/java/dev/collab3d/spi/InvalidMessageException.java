package dev.collab3d.spi;

/**
 * A frame that does not match the protocol. It becomes an {@code error{code}} frame for
 * the sender; the connection stays open.
 */
public class InvalidMessageException extends RuntimeException {

    private final String code;

    public InvalidMessageException(String code, String message) {
        super(message);
        this.code = code;
    }

    public InvalidMessageException(String code) {
        this(code, code);
    }

    public String code() {
        return code;
    }
}
