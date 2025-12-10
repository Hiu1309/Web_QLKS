package com.hotel.service;

import com.hotel.model.User;
import com.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() { return userRepository.findAll(); }
    public Optional<User> getUserById(Integer id) { return userRepository.findById(id); }
    public Optional<User> getUserByUsername(String username) { return userRepository.findByUsername(username); }
    public User addUser(User user) { return userRepository.save(user); }
    public User updateUser(Integer id, User updated) {
        User existing = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setRole(updated.getRole());
        if (updated.getDob() != null) {
            existing.setDob(updated.getDob());
        }
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(updated.getPassword());
        }
        return userRepository.save(existing);
    }
    public void deleteUser(Integer id) { userRepository.deleteById(id); }
}
