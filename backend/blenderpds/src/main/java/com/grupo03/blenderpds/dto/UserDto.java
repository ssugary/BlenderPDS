package com.grupo03.blenderpds.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.grupo03.blenderpds.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload de usuário: entrada (registro/atualização) e saída (leitura).
 * A senha só é aceita na entrada e nunca devolvida na resposta.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;

    @NotBlank
    @Size(max = 50)
    private String nickname;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 8, max = 100)
    private String password;

    private Role role;

    private Boolean emailVerified;

    private Instant createdAt;

    public static UserDto from(com.grupo03.blenderpds.model.User entity) {
        UserDto dto = new UserDto();
        dto.setId(entity.getId());
        dto.setNickname(entity.getNickname());
        dto.setEmail(entity.getEmail());
        dto.setRole(entity.getRole());
        dto.setEmailVerified(entity.isEmailVerified());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
