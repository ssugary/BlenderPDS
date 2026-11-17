package com.grupo03.blenderpds.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Input of POST /users/{id}/friend-requests: the sender comes in the path, the
 * receiver in the body. Unknown JSON fields are ignored.
 */
public record FriendRequestCreateDto(@NotNull Long receiverId) {}
