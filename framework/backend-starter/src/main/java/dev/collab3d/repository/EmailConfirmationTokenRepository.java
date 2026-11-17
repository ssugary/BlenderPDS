package dev.collab3d.repository;

import dev.collab3d.model.EmailConfirmationToken;
import dev.collab3d.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Persistence of the registration confirmation tokens: one per registration, looked up
 * by value on confirmation and consumed afterwards.
 */
public interface EmailConfirmationTokenRepository extends JpaRepository<EmailConfirmationToken, Long> {

    Optional<EmailConfirmationToken> findByToken(String token);

    /** Deletes the user's pending tokens (the FK blocks deleting a user with a token). */
    void deleteByUser(User user);
}
