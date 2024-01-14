package com.eKarte.services.implementation;

import com.eKarte.dto.UserDto;
import com.eKarte.models.User;
import com.eKarte.repository.UserRepository;
import com.eKarte.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Override
    public List<UserDto> findAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map((user) -> mapToUserDto(user)).collect(Collectors.toList());
    }

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }


    private UserDto mapToUserDto(User user) {
        UserDto userDto = UserDto.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .password(user.getPassword())
                .confirmPassword(user.getConfirmPassword())
                .role(user.getRole())
                .build();

        return userDto;
    }


}
