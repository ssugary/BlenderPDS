package com.grupo03.blenderpds.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Entrada de POST /users/{id}/friend-requests: o remetente vem no path,
 * o destinatário no corpo. Campos desconhecidos do JSON são ignorados.
 */
public record FriendRequestCreateDto(@NotNull Long receiverId) {}
