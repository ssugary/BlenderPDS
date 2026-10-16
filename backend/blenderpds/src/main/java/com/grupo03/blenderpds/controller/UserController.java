package com.grupo03.blenderpds.controller;

import com.grupo03.blenderpds.dto.FriendRequestCreateDto;
import com.grupo03.blenderpds.dto.FriendRequestDto;
import com.grupo03.blenderpds.dto.UserDto;
import com.grupo03.blenderpds.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * User REST API. Every access goes through Spring Security's default protection
 * (authentication required), since no role rules are configured yet.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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
    public ResponseEntity<UserDto> get(@PathVariable Long id) {
        return userService.getById(id)
                .map(UserDto::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
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

    /** A duplicate e-mail (a race between the pre-check and the insert) becomes 409 instead of 500. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Void> duplicateEmail(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    // ---------------- Friend requests ----------------

    /**
     * Sends a friend request: {id} is the sender, the body carries the receiver.
     * 400 = request to oneself · 404 = unknown user/request ·
     * 409 = already friends, duplicate request or a pending inverse request.
     */
    @PostMapping("/{id}/friend-requests")
    public ResponseEntity<FriendRequestDto> sendFriendRequest(
            @PathVariable Long id, @Valid @RequestBody FriendRequestCreateDto body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FriendRequestDto.from(userService.sendFriendRequest(id, body.receiverId())));
    }

    /** Pending requests RECEIVED by {id} (to accept or reject). */
    @GetMapping("/{id}/friend-requests")
    public List<FriendRequestDto> pendingFriendRequests(@PathVariable Long id) {
        return userService.getPendingFriendRequests(id).stream()
                .map(FriendRequestDto::from)
                .toList();
    }

    /** Pending requests SENT by {id} (to follow up on or cancel). */
    @GetMapping("/{id}/friend-requests/sent")
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
    public ResponseEntity<UserDto> acceptFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        var request = userService.acceptFriendRequest(requestId, id);
        return ResponseEntity.ok(UserDto.from(request.getSender()));
    }

    /** Rejects request {requestId} on behalf of {id} (only the receiver may). */
    @PostMapping("/{id}/friend-requests/{requestId}/reject")
    public ResponseEntity<Void> rejectFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        userService.rejectFriendRequest(requestId, id);
        return ResponseEntity.noContent().build();
    }

    /** Cancels the sent request {requestId} on behalf of {id} (only the sender may). */
    @DeleteMapping("/{id}/friend-requests/{requestId}")
    public ResponseEntity<Void> cancelFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        userService.cancelFriendRequest(requestId, id);
        return ResponseEntity.noContent().build();
    }

    /** Confirmed friend list of {id}. */
    @GetMapping("/{id}/friends")
    public List<UserDto> friends(@PathVariable Long id) {
        return userService.getFriendList(id).stream().map(UserDto::from).toList();
    }

    /** Removes the friendship from both sides. */
    @DeleteMapping("/{id}/friends/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long id, @PathVariable Long friendId) {
        userService.removeFriend(id, friendId);
        return ResponseEntity.noContent().build();
    }

    /** Missing user or request (raised by the service) → 404. */
    @ExceptionHandler(EntityNotFoundException.class)
    ResponseEntity<Void> notFound(EntityNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    /** Invalid rule (e.g. a friend request to oneself) → 400. */
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Void> badRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().build();
    }

    /** Friendship conflict (already friends / duplicate request) → 409. */
    @ExceptionHandler(IllegalStateException.class)
    ResponseEntity<Void> friendshipConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
}
