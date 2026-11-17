package dev.collab3d.spi;

/**
 * Why a decision said no. {@code code} is what the client sees in the
 * {@code error{code}} frame, so it stays short and stable ({@code OP_REJECTED},
 * {@code NOT_FRIEND}...); {@code message} is for logs and for humans reading a response.
 */
public record RejectReason(String code, String message) {

    public static RejectReason of(String code, String message) {
        return new RejectReason(code, message);
    }
}
