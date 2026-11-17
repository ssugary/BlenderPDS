package dev.support;

import dev.collab3d.model.Role;
import dev.collab3d.security.ActorResolver;
import dev.collab3d.security.AppUserDetails;
import dev.collab3d.spi.Actor;
import jakarta.servlet.http.HttpServletRequest;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

/**
 * Identity harness for the controller tests written before P3.1.
 *
 * <p>Those tests authenticate with {@code @WithMockUser}, whose principal is not an
 * {@link AppUserDetails}, and they still send the legacy ids in the body. This test-only
 * resolver keeps them focused on the lifecycle they were written for: when the security
 * context carries the real principal it behaves exactly like production; otherwise it
 * derives the actor from the legacy id the test itself sent (body, or the {@code {id}}
 * of the user session routes).
 *
 * <p>It lives in {@code dev.support} (not component-scanned) and is imported only by the
 * legacy controller tests. {@code IdentitySpoofingTest} deliberately does not import it,
 * so it exercises the production resolver. Nothing here ships in the framework jar.
 */
@TestConfiguration(proxyBeanMethods = false)
public class LegacyIdentityConfiguration {

    private static final Pattern BODY_ID =
            Pattern.compile("\"(?:hostId|userId)\"\\s*:\\s*(\\d+)");
    private static final Pattern USER_PATH =
            Pattern.compile("^/(?:users|sessions/(?:open|friends))/(\\d+)");

    /**
     * Caches the body before the chain: by the time the controller asks who is acting,
     * the message converter has already consumed the stream, and the mock request is
     * wrapped by Boot's form-content filter.
     */
    @Bean
    FilterRegistrationBean<jakarta.servlet.Filter> legacyBodyCacheFilter() {
        FilterRegistrationBean<jakarta.servlet.Filter> registration =
                new FilterRegistrationBean<>(new OncePerRequestFilter() {
                    @Override
                    protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request,
                                                    jakarta.servlet.http.HttpServletResponse response,
                                                    jakarta.servlet.FilterChain chain)
                            throws jakarta.servlet.ServletException, java.io.IOException {
                        chain.doFilter(new ContentCachingRequestWrapper(request, 0), response);
                    }
                });
        registration.setOrder(0);
        registration.addUrlPatterns("/*");
        return registration;
    }

    @Bean
    @Primary
    ActorResolver legacyIdentityResolver() {
        return new ActorResolver() {

            @Override
            public Actor current() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null
                        && authentication.isAuthenticated()
                        && !(authentication instanceof AnonymousAuthenticationToken)
                        && authentication.getPrincipal() instanceof AppUserDetails details) {
                    return details.toActor();
                }

                Long id = legacyId();
                if (id == null) {
                    throw new AuthenticationCredentialsNotFoundException("Not authenticated");
                }
                return new Actor(id, "legacy-" + id, Role.USER);
            }
        };
    }

    private String pathOf() {
        RequestAttributes a = RequestContextHolder.getRequestAttributes();
        return a instanceof ServletRequestAttributes s ? s.getRequest().getRequestURI() : "?";
    }

    private String bodyOf() {
        RequestAttributes a = RequestContextHolder.getRequestAttributes();
        if (!(a instanceof ServletRequestAttributes s)) return "?";
        HttpServletRequest r = s.getRequest();
        return (r instanceof ContentCachingRequestWrapper c ? new String(c.getContentAsByteArray()) : r.getClass().getSimpleName());
    }

    private Long legacyId() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (!(attributes instanceof ServletRequestAttributes servlet)) {
            return null;
        }

        HttpServletRequest request = servlet.getRequest();
        String body = "";
        if (request instanceof ContentCachingRequestWrapper cached) {
            body = new String(cached.getContentAsByteArray(), java.nio.charset.StandardCharsets.UTF_8);
        }
        if (body != null && !body.isEmpty()) {
            Matcher matcher = BODY_ID.matcher(body);
            if (matcher.find()) {
                return Long.valueOf(matcher.group(1));
            }
        }

        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }
        Matcher matcher = USER_PATH.matcher(path);
        return matcher.find() ? Long.valueOf(matcher.group(1)) : null;
    }
}
