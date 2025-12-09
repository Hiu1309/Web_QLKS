package com.hotel.controller;

import com.hotel.dto.LoginRequest;
import com.hotel.dto.LoginResponse;
import com.hotel.model.User;
import com.hotel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userService.getUserByUsername(loginRequest.getUsername());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(new LoginResponse(false, "Tên đăng nhập không tồn tại", null));
        }
        
        User user = userOpt.get();
        
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.ok(new LoginResponse(false, "Mật khẩu không đúng", null));
        }
        
        // Login successful
        LoginResponse.UserData userData = new LoginResponse.UserData(
            user.getUserId(),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole().getRoleName()
        );
        
        return ResponseEntity.ok(new LoginResponse(true, "Đăng nhập thành công", userData));
    }

    @GetMapping
    public List<User> getAll() { return userService.getAllUsers(); }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Integer id) { return userService.getUserById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }

    @PostMapping
    public User create(@RequestBody User u) { return userService.addUser(u); }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Integer id, @RequestBody User u) { try { return ResponseEntity.ok(userService.updateUser(id, u)); } catch (RuntimeException e) { return ResponseEntity.notFound().build(); } }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) { userService.deleteUser(id); return ResponseEntity.noContent().build(); }
}
