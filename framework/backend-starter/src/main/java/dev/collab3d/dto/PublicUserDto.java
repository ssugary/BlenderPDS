package dev.collab3d.dto;

import dev.collab3d.model.User;

/**
 * What one user may see about another: the nickname and the id, never the e-mail.
 *
 * <p>Listing friends and reading a profile used to return {@link UserDto}, which
 * carried the e-mail address of everybody in the list.
 */
public record PublicUserDto(Long id, String nickname) {

    public static PublicUserDto from(User user) {
        return new PublicUserDto(user.getId(), user.getNickname());
    }
}
