package com.eKarte.services.implementation;

import com.eKarte.dto.UserDto;
import com.eKarte.models.User;
import com.eKarte.repository.UserRepository;
import com.eKarte.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

    @Override
    public User findUserById(Integer userId) {
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
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

    public boolean registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return false;
        } else {
            String confirmPassword = user.getConfirmPassword();

            // Logging statements for debugging
            System.out.println("Before encoding - rawPassword: " + confirmPassword);

            // Null check for confirmPassword
            if (confirmPassword != null) {
                user.setConfirmPassword(passwordEncoder.encode(confirmPassword));

                // Logging statements for debugging
                System.out.println("After encoding - encodedPassword: " + user.getConfirmPassword());
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRole("user");
            userRepository.save(user);
            return true;
        }
    }



    public boolean authenticateUser(String username, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(username);
        return optionalUser.map(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElse(false);
    }

    public User findUserbyId(Integer id){
        return userRepository.findById(id).orElseThrow(() -> new NoSuchElementException("User not found with ID: " + id));
    }
}
