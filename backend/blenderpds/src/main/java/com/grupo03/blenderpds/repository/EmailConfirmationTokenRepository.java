package com.grupo03.blenderpds.repository;

import com.grupo03.blenderpds.model.EmailConfirmationToken;
import com.grupo03.blenderpds.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailConfirmationTokenRepository extends JpaRepository<EmailConfirmationToken, Long> {

    Optional<EmailConfirmationToken> findByToken(String token);

    /** Apaga os tokens pendentes do usuário (FK impede apagar o usuário com token). */
    void deleteByUser(User user);
}
