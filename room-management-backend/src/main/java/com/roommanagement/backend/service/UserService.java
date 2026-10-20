package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.AuthRequest;
import com.roommanagement.backend.dto.AuthResponse;
import com.roommanagement.backend.dto.RegisterRequest;
import com.roommanagement.backend.dto.UserDto;

public interface UserService {
    AuthResponse login(AuthRequest authRequest);
    UserDto register(RegisterRequest registerRequest);
    UserDto getUserProfile(String username);
}
