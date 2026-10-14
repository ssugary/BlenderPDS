package com.grupo03.blenderpds.service.implementation;

import com.grupo03.blenderpds.model.Role;
import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.repository.UserRepository;
import com.grupo03.blenderpds.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User register(String nickname, String email, String rawPassword) {
        User user = new User();
        user.setNickname(nickname);
        user.setEmail(email);
        user.setRole(Role.USER);
        user.setEmailVerified(false);
        return create(user, rawPassword);
    }

    @Override
    @Transactional
    public User create(User user, String rawPassword) {
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User update(User user) {
        User existing = findOrThrow(user.getId());
        existing.setNickname(user.getNickname());
        existing.setEmail(user.getEmail());
        if (user.getRole() != null) {
            existing.setRole(user.getRole());
        }

        return userRepository.save(existing);
    }

    @Override
    @Transactional
    public void changePassword(Long id, String rawPassword) {
        User user = findOrThrow(id);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void confirmEmail(Long id) {
        User user = findOrThrow(id);
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = findOrThrow(id);
        userRepository.delete(user);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + id));
    }
}
