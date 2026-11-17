package dev.collab3d.api;

import dev.collab3d.dto.FriendRequestCreateDto;
import dev.collab3d.dto.FriendRequestDto;
import dev.collab3d.dto.PublicUserDto;
import dev.collab3d.dto.UserDto;
import dev.collab3d.security.ActorResolver;
import dev.collab3d.user.UserService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * User REST API. Every access requires authentication, and the routes whose {id} is a
 * user only accept that same user ({@code @PreAuthorize}); ids never come from the body.
 *
 * <p>Another user is answered with {@link PublicUserDto} (id and nickname), never with
 * the e-mail address: reading a profile or the friend list must not expose contacts.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ActorResolver actorResolver;

    @PostMapping
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserDto body) {
        // Registration rules: password 8–128 characters (the DTO also enforces min 8)…
        if (body.getPassword() == null || body.getPassword().isBlank()
                || body.getPassword().length() < 8 || body.getPassword().length() > 128) {
            return ResponseEntity.badRequest().build();
        }
        // …and nickname 3–32 characters (a registration-only rule; PUT does not enforce it).
        if (body.getNickname() == null || body.getNickname().length() < 3
                || body.getNickname().length() > 32) {
            return ResponseEntity.badRequest().build();
        }
        if (userService.getByEmail(body.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        // the role is set by the service (USER): the client does not pick its own role.
        UserDto created = UserDto.from(userService.register(body.getNickname(), body.getEmail(), body.getPassword()));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<UserDto> list() {
        return userService.getAll().stream().map(UserDto::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return userService.getById(id)
                .map(user -> actorResolver.currentId() == user.getId()
                        ? UserDto.from(user)
                        : PublicUserDto.from(user))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@authz.isSelf(#id)")
    public ResponseEntity<UserDto> update(@PathVariable Long id, @Valid @RequestBody UserDto body) {
        var existing = userService.getById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        // role and emailVerified do not come from the client: the role changes by an admin
        // rule, e-mail verification only through the confirmation flow.
        existing.setNickname(body.getNickname());
        existing.setEmail(body.getEmail());
        UserDto updated = UserDto.from(userService.update(existing));
        if (body.getPassword() != null && !body.getPassword().isBlank()) {
            userService.changePassword(id, body.getPassword());
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authz.isSelf(#id)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (userService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Confirmation through the link sent by e-mail (GET, so it works as a clickable
     * link, with no CSRF). It requires no login — the user cannot even log in before
     * confirming.
     */
    @GetMapping("/confirm-email")
    public ResponseEntity<UserDto> confirmEmailByToken(@RequestParam(required = false) String token) {
        return userService.confirmEmailByToken(token)
                .map(UserDto::from)
                .map(ResponseEntity::ok)
                // unknown or expired token: 400 (it does not leak which one)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @PostMapping("/{id}/confirm-email")
    @PreAuthorize("@authz.isSelf(#id)")
    public ResponseEntity<UserDto> confirmEmail(@PathVariable Long id) {
        if (userService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        userService.confirmEmail(id);
        return userService.getById(id)
                .map(UserDto::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ---------------- Friend requests ----------------

    /**
     * Sends a friend request: {id} is the sender, the body carries the receiver.
     * 400 = request to oneself · 404 = unknown user/request ·
     * 409 = already friends, duplicate request or a pending inverse request.
     */
    @PostMapping("/{id}/friend-requests")
    @PreAuthorize("@authz.isSelf(#id)")
    public ResponseEntity<FriendRequestDto> sendFriendRequest(
            @PathVariable Long id, @Valid @RequestBody FriendRequestCreateDto body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FriendRequestDto.from(userService.sendFriendRequest(id, body.receiverId())));
    }

    /** Pending requests RECEIVED by {id} (to accept or reject). */
    @GetMapping("/{id}/friend-requests")
    @PreAuthorize("@authz.isSelf(#id)")
    public List<FriendRequestDto> pendingFriendRequests(@PathVariable Long id) {
        return userService.getPendingFriendRequests(id).stream()
                .map(FriendRequestDto::from)
                .toList();
    }

    /** Pending requests SENT by {id} (to follow up on or cancel). */
    @GetMapping("/{id}/friend-requests/sent")
    @PreAuthorize("@authz.isSelf(#id)")
    public List<FriendRequestDto> sentFriendRequests(@PathVariable Long id) {
        return userService.getSentFriendRequests(id).stream()
                .map(FriendRequestDto::from)
                .toList();
    }

    /**
     * Accepts request {requestId} on behalf of {id} (only the receiver may).
     * Returns the UserDto of the new friend.
     */
    @PostMapping("/{id}/friend-requests/{requestId}/accept")
    @PreAuthorize("@authz.isSelf(#id)")
    public ResponseEntity<PublicUserDto> acceptFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        var request = userService.acceptFriendRequest(requestId, id);
        return ResponseEntity.ok(PublicUserDto.from(request.getSender()));
    }

    /** Rejects request {requestId} on behalf of {id} (only the receiver may). */
    @PostMapping("/{id}/friend-requests/{requestId}/reject")
    @PreAuthorize("@authz.isSelf(#id)")
    public ResponseEntity<Void> rejectFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        userService.rejectFriendRequest(requestId, id);
        return ResponseEntity.noContent().build();
    }

    /** Cancels the sent request {requestId} on behalf of {id} (only the sender may). */
    @DeleteMapping("/{id}/friend-requests/{requestId}")
    @PreAuthorize("@authz.isSelf(#id)")
    public ResponseEntity<Void> cancelFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        userService.cancelFriendRequest(requestId, id);
        return ResponseEntity.noContent().build();
    }

    /** Confirmed friend list of {id}. */
    @GetMapping("/{id}/friends")
    @PreAuthorize("@authz.isSelf(#id)")
    public List<PublicUserDto> friends(@PathVariable Long id) {
        return userService.getFriendList(id).stream().map(PublicUserDto::from).toList();
    }

    /** Removes the friendship from both sides. */
    @DeleteMapping("/{id}/friends/{friendId}")
    @PreAuthorize("@authz.isSelf(#id)")
    public ResponseEntity<Void> removeFriend(@PathVariable Long id, @PathVariable Long friendId) {
        userService.removeFriend(id, friendId);
        return ResponseEntity.noContent().build();
    }
}
