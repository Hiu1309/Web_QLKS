package com.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private UserData user;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserData {
        private Integer userId;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String roleName;
    }
}
