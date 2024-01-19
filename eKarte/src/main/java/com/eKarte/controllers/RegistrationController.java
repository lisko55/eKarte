package com.eKarte.controllers;

import com.eKarte.models.Registration;
import com.eKarte.models.User;
import com.eKarte.repository.UserRepository;
import com.eKarte.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class RegistrationController {

    @Autowired
    private UserRepository userRepository;
    private final UserService userService;

    public RegistrationController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("registration", new Registration());
        return "registration";
    }


    @PostMapping("/register")
    public String registerUser(@ModelAttribute("registration") @Valid Registration registration,
                               BindingResult bindingResult, Model model) {

        // Check for validation errors in the registration form
        if (bindingResult.hasErrors()) {
            return "registration";
        }

        // Check if passwords match
        if (!registration.getPassword().equals(registration.getConfirmPassword())) {
            // Add an error to the bindingResult for confirmPassword field
            bindingResult.rejectValue("confirmPassword", "error.registration", "Passwords do not match");
            return "registration";
        }

        // Create a User entity from the registration form
        User user = User.builder()
                .firstName(registration.getFirstName())
                .lastName(registration.getLastName())
                .email(registration.getEmail())
                .password(registration.getPassword())
                .confirmPassword(registration.getConfirmPassword()) // Set confirmPassword here
                .role("user")
                .build();

        if (user.getPassword().isEmpty() || !userService.registerUser(user)) {
            return "register";
        } else {
            return "redirect:/login";
        }
    }




}

