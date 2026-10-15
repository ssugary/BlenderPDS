package com.grupo03.blenderpds.dto;

import com.grupo03.blenderpds.model.FriendRequest;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload de pedido de amizade (saída). A entrada de criação usa
 * {@link FriendRequestCreateDto}; aqui só saem dados para o cliente
 * listar pendentes e decidir o que fazer.
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
