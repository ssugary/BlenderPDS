package dev.collab3d.security;

import dev.collab3d.model.Role;
import dev.collab3d.model.User;
import dev.collab3d.spi.Actor;
import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * The authenticated principal, with the domain id attached.
 *
 * <p>Spring's default {@code User} carries only the username, which forced the API to
 * trust ids that arrived in the payload. Carrying the id here means every authorization
 * decision and every write can use the identity that the session actually proved,
 * without another database lookup.
 */
public class AppUserDetails implements UserDetails, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final long id;
    private final String email;
    private final String nickname;
    private final String passwordHash;
    private final Role role;
    private final boolean enabled;

    public AppUserDetails(long id, String email, String nickname, String passwordHash, Role role,
                          boolean enabled) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.passwordHash = passwordHash;
        this.role = role;
        this.enabled = enabled;
    }

    public static AppUserDetails from(User user) {
        return new AppUserDetails(user.getId(), user.getEmail(), user.getNickname(),
                user.getPasswordHash(), user.getRole(), user.isEmailVerified());
    }

    public long id() {
        return id;
    }

    public Role role() {
        return role;
    }

    /** The acting user, as the services and the SPI expect it. */
    public Actor toActor() {
        return new Actor(id, nickname, role);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
