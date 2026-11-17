package com.grupo03.blenderpds.repository;

import com.grupo03.blenderpds.model.FriendRequest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Persistence of pending friend requests: at most one open row per ordered pair,
 * deleted as soon as it is accepted, rejected or cancelled.
 */
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    /** The exact pending request between a pair (used to block duplicates). */
    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    /** Pending requests received by a user (newest first). */
    List<FriendRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    /** Pending requests sent by a user (newest first). */
    List<FriendRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    /** Before deleting a user: removes the requests they sent/received (FK). */
    void deleteBySenderId(Long senderId);

    void deleteByReceiverId(Long receiverId);
}
