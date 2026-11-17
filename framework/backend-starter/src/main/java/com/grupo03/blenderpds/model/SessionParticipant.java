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
 * Who is (or has been) in a session. It is an entity rather than a
 * {@code @ManyToMany} because presence has state of its own: {@code active} and
 * {@code lastSeenAt} change on every WebSocket connection.
 *
 * <p>Joining twice reactivates the SAME row (unique constraint on the
 * session+user pair): leaving frees a seat, coming back does not duplicate a
 * participant.
 */
@Entity
@Table(name = "session_participants", uniqueConstraints = @UniqueConstraint(
        name = "uk_session_participant", columnNames = {"session_id", "user_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"session", "user"})
public class SessionParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** true while the participant's WebSocket is open. */
    @Column(name = "active", nullable = false)
    private boolean active = true;

    @CreatedDate
    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    /** Last time this participant connected/disconnected. */
    @Column(name = "last_seen_at")
    private Instant lastSeenAt;
}
