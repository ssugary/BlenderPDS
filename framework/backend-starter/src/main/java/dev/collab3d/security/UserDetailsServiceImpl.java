package dev.collab3d.security;

import dev.collab3d.model.User;
import dev.collab3d.repository.UserRepository;
import dev.collab3d.security.UserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Bridge between the domain's accounts and Spring Security.
 *
 * <p>The e-mail is the username (the same key {@code UserService.getByEmail} uses),
 * the stored hash is what the password encoder checks, and the role becomes the
 * {@code ROLE_*} authority. An account whose e-mail is not confirmed is built as
 * disabled, so the login fails even with the right password.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));

        // The principal carries the domain id: every route and every operation can use
        // the identity the session proved, with no id coming from the payload.
        return AppUserDetails.from(u);
    }
}
