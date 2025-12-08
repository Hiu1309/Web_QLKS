package com.hotel.controller;

import com.hotel.model.User;
import com.hotel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserService userService;

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
