package com.grupo03.blenderpds.repository;

import com.grupo03.blenderpds.model.FriendRequest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    /** Pedido pendente exato entre um par (usado para bloquear duplicados). */
    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    /** Pendentes recebidos por um usuário (mais recentes primeiro). */
    List<FriendRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    /** Pendentes enviados por um usuário (mais recentes primeiro). */
    List<FriendRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    /** Antes de apagar um usuário: remove pedidos enviados/recebidos (FK). */
    void deleteBySenderId(Long senderId);

    void deleteByReceiverId(Long receiverId);
}
