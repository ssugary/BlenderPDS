package dev.collab3d.dto;

import dev.collab3d.model.SessionParticipant;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Who is in a session, with the current presence (feeds the WebSocket roster). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SessionParticipantDto {

    private Long userId;
    private String nickname;
    private boolean active;
    private Instant joinedAt;
    private Instant lastSeenAt;

    public static SessionParticipantDto from(SessionParticipant entity) {
        SessionParticipantDto dto = new SessionParticipantDto();
        dto.setUserId(entity.getUser().getId());
        dto.setNickname(entity.getUser().getNickname());
        dto.setActive(entity.isActive());
        dto.setJoinedAt(entity.getJoinedAt());
        dto.setLastSeenAt(entity.getLastSeenAt());
        return dto;
    }
}
