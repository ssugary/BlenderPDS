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
 * API REST de usuários. Todo acesso passa pela segurança padrão do Spring Security
 * (exige autenticação), pois ainda não há regras de papel configuradas.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserDto body) {
        // Regras do cadastro: senha 8–128 caracteres (o DTO também valida min 8)…
        if (body.getPassword() == null || body.getPassword().isBlank()
                || body.getPassword().length() < 8 || body.getPassword().length() > 128) {
            return ResponseEntity.badRequest().build();
        }
        // …e nickname 3–32 caracteres (regra só do registro; o PUT não a impõe).
        if (body.getNickname() == null || body.getNickname().length() < 3
                || body.getNickname().length() > 32) {
            return ResponseEntity.badRequest().build();
        }
        if (userService.getByEmail(body.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        // o papel é definido pelo serviço (USER): o cliente não escolhe o próprio papel.
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
        // role e emailVerified não vêm do cliente: papel muda por regra de admin,
        // verificação de e-mail só pelo fluxo de confirmação.
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
     * Confirmação pelo link enviado por e-mail (GET para funcionar como link
     * clicável, sem CSRF). Não exige login — o usuário ainda nem consegue logar
     * antes de confirmar.
     */
    @GetMapping("/confirm-email")
    public ResponseEntity<UserDto> confirmEmailByToken(@RequestParam(required = false) String token) {
        return userService.confirmEmailByToken(token)
                .map(UserDto::from)
                .map(ResponseEntity::ok)
                // token desconhecido ou expirado: 400 (não vaza qual dos dois)
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

    /** E-mail duplicado (corrida entre o pré-checagem e o insert) vira 409 em vez de 500. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Void> duplicateEmail(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    // ---------------- Pedidos de amizade ----------------

    /**
     * Envia pedido de amizade: {id} é o remetente, o corpo traz o destinatário.
     * 400 = pedido para si mesmo · 404 = usuário/pedido inexistente ·
     * 409 = já são amigos, pedido duplicado ou pedido inverso pendente.
     */
    @PostMapping("/{id}/friend-requests")
    public ResponseEntity<FriendRequestDto> sendFriendRequest(
            @PathVariable Long id, @Valid @RequestBody FriendRequestCreateDto body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FriendRequestDto.from(userService.sendFriendRequest(id, body.receiverId())));
    }

    /** Pedidos pendentes RECEBIDOS por {id} (para aceitar ou recusar). */
    @GetMapping("/{id}/friend-requests")
    public List<FriendRequestDto> pendingFriendRequests(@PathVariable Long id) {
        return userService.getPendingFriendRequests(id).stream()
                .map(FriendRequestDto::from)
                .toList();
    }

    /** Pedidos pendentes ENVIADOS por {id} (para acompanhar/cancelar). */
    @GetMapping("/{id}/friend-requests/sent")
    public List<FriendRequestDto> sentFriendRequests(@PathVariable Long id) {
        return userService.getSentFriendRequests(id).stream()
                .map(FriendRequestDto::from)
                .toList();
    }

    /**
     * Aceita o pedido {requestId} em nome de {id} (só o destinatário pode).
     * Devolve o UserDto do novo amigo.
     */
    @PostMapping("/{id}/friend-requests/{requestId}/accept")
    public ResponseEntity<UserDto> acceptFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        var request = userService.acceptFriendRequest(requestId, id);
        return ResponseEntity.ok(UserDto.from(request.getSender()));
    }

    /** Recusa o pedido {requestId} em nome de {id} (só o destinatário pode). */
    @PostMapping("/{id}/friend-requests/{requestId}/reject")
    public ResponseEntity<Void> rejectFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        userService.rejectFriendRequest(requestId, id);
        return ResponseEntity.noContent().build();
    }

    /** Cancela o pedido enviado {requestId} em nome de {id} (só o remetente pode). */
    @DeleteMapping("/{id}/friend-requests/{requestId}")
    public ResponseEntity<Void> cancelFriendRequest(
            @PathVariable Long id, @PathVariable Long requestId) {
        userService.cancelFriendRequest(requestId, id);
        return ResponseEntity.noContent().build();
    }

    /** Lista de amigos confirmados de {id}. */
    @GetMapping("/{id}/friends")
    public List<UserDto> friends(@PathVariable Long id) {
        return userService.getFriendList(id).stream().map(UserDto::from).toList();
    }

    /** Remove a amizade dos dois lados. */
    @DeleteMapping("/{id}/friends/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long id, @PathVariable Long friendId) {
        userService.removeFriend(id, friendId);
        return ResponseEntity.noContent().build();
    }

    /** Usuário ou pedido inexistente (vindo do serviço) → 404. */
    @ExceptionHandler(EntityNotFoundException.class)
    ResponseEntity<Void> notFound(EntityNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    /** Regra inválida (ex.: pedido de amizade para si mesmo) → 400. */
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Void> badRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().build();
    }

    /** Conflito de amizade (já são amigos / pedido duplicado) → 409. */
    @ExceptionHandler(IllegalStateException.class)
    ResponseEntity<Void> friendshipConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
}
