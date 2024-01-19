package com.eKarte.controllers;

import com.eKarte.models.User;
import com.eKarte.repository.UserRepository;
import com.eKarte.services.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class LoginController {

    private final UserService userService;

    private final UserRepository userRepository;

    public LoginController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/login")
    public String getLogin(Model model) {
        model.addAttribute("user", new User());
        return "Login.html";
    }

    @PostMapping("/login")
    public String loginUser(@ModelAttribute("user") User user, Model model, HttpSession session) {
        if (userService.authenticateUser(user.getEmail(), user.getPassword())) {
            User authenticatedUser = userRepository.findByEmail(user.getEmail()).orElseThrow();
            session.setAttribute("email", authenticatedUser.getEmail());
            session.setAttribute("firstName", authenticatedUser.getFirstName());
            session.setAttribute("lastName", authenticatedUser.getLastName());
            session.setAttribute("userid", authenticatedUser.getUserId());
            session.setAttribute("role", authenticatedUser.getRole());
            if (authenticatedUser.getRole().equals("admin")) {
                return "redirect:/admin/dashboard";
            }
            return "redirect:/home";
        } else {
            model.addAttribute("error", "Invalid email or password");
            return "login";
        }
    }

}
