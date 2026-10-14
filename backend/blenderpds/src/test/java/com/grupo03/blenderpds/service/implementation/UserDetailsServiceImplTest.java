package com.grupo03.blenderpds.service.implementation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.grupo03.blenderpds.model.Role;
import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.repository.UserRepository;
import com.grupo03.blenderpds.service.UserDetailsService;
import com.grupo03.blenderpds.service.UserService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class UserDetailsServiceImplTest {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PersistenceContext
    private EntityManager em;

    @Test
    void isHookedIntoSpringSecurity() {
        assertThat(userDetailsService)
                .isInstanceOf(org.springframework.security.core.userdetails.UserDetailsService.class);
        assertThat(authenticationManager).isNotNull();
    }

    @Test
    void loadsUserWithHashRoleAndDisabledUntilConfirmed() {
        User user = userService.register("ana", "ana@example.com", "senha123");
        em.flush();
        em.clear();

        UserDetails details = userDetailsService.loadUserByUsername("ana@example.com");
        assertThat(details.getUsername()).isEqualTo("ana@example.com");
        assertThat(details.getPassword()).isEqualTo(user.getPasswordHash());
        assertThat(details.getPassword()).startsWith("{bcrypt}");
        assertThat(details.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USER");
        assertThat(details.isEnabled()).isFalse();

        userService.confirmEmail(user.getId());
        em.flush();
        em.clear();

        assertThat(userDetailsService.loadUserByUsername("ana@example.com").isEnabled()).isTrue();
    }

    @Test
    void unknownEmailThrowsUsernameNotFound() {
        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("nao-existe@example.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void adminUserGetsAdminRole() {
        User admin = userService.register("root", "root@example.com", "senha123");
        admin.setRole(Role.ADMIN);
        userService.confirmEmail(admin.getId());
        em.flush();
        em.clear();

        assertThat(userDetailsService.loadUserByUsername("root@example.com").getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_ADMIN");
    }

    @Test
    void authenticatesWithPasswordWhenEmailConfirmed() {
        User user = userService.register("bia", "bia@example.com", "senha123");
        userService.confirmEmail(user.getId());
        em.flush();
        em.clear();

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("bia@example.com", "senha123"));

        assertThat(auth.isAuthenticated()).isTrue();
        // o Spring Security 7 soma autoridades de fator (ex.: FACTOR_PASSWORD) ao papel do usuário
        assertThat(auth.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .contains("ROLE_USER");
    }

    @Test
    void authenticationIsBlockedUntilEmailConfirmed() {
        User user = userService.register("caio", "caio@example.com", "senha123");
        em.flush();
        em.clear();

        assertThatThrownBy(() -> authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("caio@example.com", "senha123")))
                .isInstanceOf(DisabledException.class);

        userService.confirmEmail(user.getId());
        em.flush();
        em.clear();

        assertThat(authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("caio@example.com", "senha123"))
                .isAuthenticated()).isTrue();
    }

    @Test
    void authenticationFailsWithWrongPassword() {
        User user = userService.register("davi", "davi@example.com", "senha123");
        userService.confirmEmail(user.getId());
        em.flush();
        em.clear();

        assertThatThrownBy(() -> authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("davi@example.com", "senha-errada")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
