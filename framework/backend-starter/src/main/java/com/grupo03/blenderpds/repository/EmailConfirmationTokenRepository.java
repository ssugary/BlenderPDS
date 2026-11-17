package com.grupo03.blenderpds.repository;

import com.grupo03.blenderpds.model.EmailConfirmationToken;
import com.grupo03.blenderpds.model.User;
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
