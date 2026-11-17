package dev.collab3d.spi;

/**
 * What the joiner brings to the decision: the invite/short code they typed, and whether
 * they got in through an invite at all (a game may require one, an open room may not).
 */
public record JoinRequest(String codeUsed, boolean viaInvite) {

    public static JoinRequest none() {
        return new JoinRequest(null, false);
    }

    public static JoinRequest withCode(String code) {
        return new JoinRequest(code, true);
    }
}
