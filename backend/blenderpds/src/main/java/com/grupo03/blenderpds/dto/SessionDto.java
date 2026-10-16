package com.grupo03.blenderpds.dto;

import com.grupo03.blenderpds.model.Session;
import com.grupo03.blenderpds.model.SessionStatus;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Output payload of a session. The {@code sceneSnapshot} does not go out here: it can
 * be megabytes and is fetched at {@code GET /sessions/{id}/state} when needed.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SessionDto {

    private Long id;
    private String code;
    private SessionStatus status;
    private Long hostId;
    private String hostNickname;
    private long participantCount;
    private int maxParticipants;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant endedAt;

    public static SessionDto from(Session entity, long participantCount, int maxParticipants) {
        SessionDto dto = new SessionDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setStatus(entity.getStatus());
        dto.setHostId(entity.getHost().getId());
        dto.setHostNickname(entity.getHost().getNickname());
        dto.setParticipantCount(participantCount);
        dto.setMaxParticipants(maxParticipants);
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setEndedAt(entity.getEndedAt());
        return dto;
    }
}
