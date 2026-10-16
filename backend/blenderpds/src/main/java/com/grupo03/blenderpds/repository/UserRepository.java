package com.grupo03.blenderpds.repository;

import com.grupo03.blenderpds.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Confirmed friendship between two users. In JPQL rather than
     * {@code user.getFriendList().contains(...)} on purpose: the list is LAZY and
     * loading it outside a transaction blows up with {@code LazyInitializationException}
     * (and inside a loop it would be N+1). The friendship is stored on both sides,
     * so looking at one side is enough.
     */
    @Query("select count(u) > 0 from User u join u.friendList f where u.id = :ownerId and f.id = :friendId")
    boolean areFriends(@Param("ownerId") Long ownerId, @Param("friendId") Long friendId);
}
