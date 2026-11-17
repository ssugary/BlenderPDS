package com.grupo03.blenderpds.dto;

import com.grupo03.blenderpds.model.FriendRequest;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Friend request payload (output). The creation input uses
 * {@link FriendRequestCreateDto}; here only data goes out so the client can list
 * the pending ones and decide what to do.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestDto {

    private Long id;
    private Long senderId;
    private String senderNickname;
    private Long receiverId;
    private String receiverNickname;
    private Instant createdAt;

    public static FriendRequestDto from(FriendRequest entity) {
        FriendRequestDto dto = new FriendRequestDto();
        dto.setId(entity.getId());
        dto.setSenderId(entity.getSender().getId());
        dto.setSenderNickname(entity.getSender().getNickname());
        dto.setReceiverId(entity.getReceiver().getId());
        dto.setReceiverNickname(entity.getReceiver().getNickname());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
