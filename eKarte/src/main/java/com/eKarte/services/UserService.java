package com.eKarte.services;

import com.eKarte.dto.UserDto;
import com.eKarte.models.User;

import java.util.List;

public interface UserService {

    List<UserDto> findAllUsers();
    User saveUser(User user);

    User findUserById(Integer userId);
    boolean authenticateUser(String email, String password);
    boolean registerUser(User user);
}
