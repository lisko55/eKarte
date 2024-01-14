package com.eKarte.controllers;

import com.eKarte.dto.UserDto;

import com.eKarte.models.User;
import com.eKarte.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@CrossOrigin("*")
@RequestMapping("")

public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/")
    public String helloUserController(){
        return "User dio";
    }

    @GetMapping("/users")
    public String listUsers(Model model){
        List<UserDto> users = userService.findAllUsers();
        model.addAttribute("users", users);

        return "usersList";
    }

    @GetMapping("/users/new")
    public String createUser(Model model){
        User user = new User();
        model.addAttribute("user", user);

        return "Registration";
    }
}
