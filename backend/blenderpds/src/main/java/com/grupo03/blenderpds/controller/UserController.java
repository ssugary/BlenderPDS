package com.grupo03.blenderpds.controller;

import com.grupo03.blenderpds.dto.UserDto;
import com.grupo03.blenderpds.service.UserService;
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
        if (body.getPassword() == null || body.getPassword().isBlank()) {
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
}
