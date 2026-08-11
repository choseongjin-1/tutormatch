package com.tutormatch.user.dto;

import com.tutormatch.user.Role;
import com.tutormatch.user.User;

public record UserResponse(
        Long id,
        String email,
        String name,
        Role role,
        String phone
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getPhone());
    }
}
