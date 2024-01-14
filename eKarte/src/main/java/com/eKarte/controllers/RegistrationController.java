package com.eKarte.controllers;

import com.eKarte.models.Registration;
import com.eKarte.models.User;
import com.eKarte.repository.UserRepository;
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

    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("registration", new Registration());
        return "registration";
    }


    @PostMapping("/register")
    public String registerUser(@ModelAttribute("registration") @Valid Registration registration,
                               BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return "registration";
        }

        if (!registration.getPassword().equals(registration.getConfirmPassword())) {
            // Add an error to the bindingResult for confirmPassword field
            bindingResult.rejectValue("confirmPassword", "error.registration", "Passwords do not match");
            return "registration";
        }

        // Create a User entity and save it to the database
        User user = User.builder()
                .firstName(registration.getFirstName())
                .lastName(registration.getLastName())
                .email(registration.getEmail())
                .password(registration.getPassword())
                .confirmPassword(registration.getConfirmPassword())
                .role("user")
                .build();

        userRepository.save(user);

        return "redirect:/home";
    }
}

