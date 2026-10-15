package com.grupo03.blenderpds.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Pedido de amizade PENDENTE. A tabela guarda apenas o estado pendente: ao ser
 * aceito (ou recusado/cancelado) a linha é apagada e a amizade passa a viver em
 * {@code users.friendList} — fonte única da lista de amigos. Um único par
 * (sender, receiver) pode ter no máximo um pedido aberto, garantido pela
 * constraint única abaixo.
 */
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "friend_requests", uniqueConstraints = @UniqueConstraint(
        name = "uk_friend_request_pair", columnNames = {"sender_id", "receiver_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"sender", "receiver"})
public class FriendRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Quem enviou o pedido. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    /** Quem precisa aceitar (único que pode aceitar/recusar). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    /** Preenchido pela auditoria na criação — usado para ordenar a lista pendente. */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
