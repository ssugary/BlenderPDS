package com.grupo03.blenderpds.service;

import com.grupo03.blenderpds.model.FriendRequest;
import com.grupo03.blenderpds.model.User;
import java.util.List;
import java.util.Optional;

/**
 * Accounts and friendships: registration with e-mail confirmation, profile reads and
 * the request → accept/reject → unfriend flow.
 *
 * <p>Errors keep the meaning the HTTP layer maps: {@code EntityNotFoundException}
 * (404), {@code IllegalArgumentException} (400) and {@code IllegalStateException}
 * (409). A friendship only exists after the receiver accepts, and is written to both
 * sides — {@link User#getFriendList()} is the single source of that list.
 */
public interface UserService {

    /**
     * Creates the user (emailVerified=false), stores the confirmation token and sends
     * the e-mail with the link. If the sending fails, the transaction is rolled back
     * (no user is left behind with a pending e-mail).
     */
    User register(String nickname, String email, String rawPassword);

    /**
     * Consumes the token and marks the e-mail as verified.
     *
     * @return the confirmed user, or empty if the token is unknown/expired
     */
    Optional<User> confirmEmailByToken(String token);

    User create(User user, String rawPassword);

    Optional<User> getById(Long id);

    Optional<User> getByEmail(String email);

    List<User> getAll();

    User update(User user);

    void changePassword(Long id, String rawPassword);

    void confirmEmail(Long id);

    void delete(Long id);

    /**
     * Sends a friend request from senderId to receiverId.
     *
     * @throws EntityNotFoundException if either of the two users does not exist
     * @throws IllegalArgumentException if senderId == receiverId (a request to oneself)
     * @throws IllegalStateException if they are already friends, a request is already
     *                                 open, or the other side already sent one
     */
    FriendRequest sendFriendRequest(Long senderId, Long receiverId);

    /**
     * Accepts the request: creates the friendship on BOTH friendList sides and deletes
     * the request.
     *
     * @throws EntityNotFoundException if the request does not exist or was not received by receiverId
     */
    FriendRequest acceptFriendRequest(Long requestId, Long receiverId);

    /**
     * Rejects the request (only the receiver may). No friendship is created; the row
     * goes away.
     *
     * @throws EntityNotFoundException if the request does not exist or was not received by receiverId
     */
    FriendRequest rejectFriendRequest(Long requestId, Long receiverId);

    /**
     * Cancels a sent request (only the sender may).
     *
     * @throws EntityNotFoundException if the request does not exist or was not sent by senderId
     */
    FriendRequest cancelFriendRequest(Long requestId, Long senderId);

    /** Pending requests RECEIVED by userId, newest first. */
    List<FriendRequest> getPendingFriendRequests(Long userId);

    /** Pending requests SENT by userId (so they can be cancelled). */
    List<FriendRequest> getSentFriendRequests(Long userId);

    /** Confirmed friend list of userId. */
    List<User> getFriendList(Long userId);

    /**
     * Removes the friendship from BOTH sides.
     *
     * @throws EntityNotFoundException if either user does not exist
     * @throws IllegalStateException if they are not friends
     */
    void removeFriend(Long userId, Long friendId);
}
