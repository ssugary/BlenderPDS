package dev.collab3d.spi;

/**
 * An operation that failed envelope or kind validation. It always reaches the client as
 * {@code error{code:"INVALID_OP", detail:"..."}} — {@code detail} is additive and short,
 * for whoever is debugging a client.
 */
public class InvalidOperationException extends RuntimeException {

    private final String detail;

    public InvalidOperationException(String detail) {
        super(detail);
        this.detail = detail;
    }

    public String code() {
        return "INVALID_OP";
    }

    public String detail() {
        return detail;
    }
}
