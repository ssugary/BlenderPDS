package dev.collab3d.spi;

/** A frame the room refuses (not a participant, policy denial): {@code error{code}}. */
public class MessageRejectedException extends RuntimeException {

    private final String code;

    public MessageRejectedException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
