package com.grupo03.blenderpds.service;

import com.grupo03.blenderpds.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {

    User register(String nickname, String email, String rawPassword);

    User create(User user, String rawPassword);

    Optional<User> getById(Long id);

    Optional<User> getByEmail(String email);

    List<User> getAll();

    User update(User user);

    void changePassword(Long id, String rawPassword);

    void confirmEmail(Long id);

    void delete(Long id);
}
