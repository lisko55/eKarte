package com.eKarte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Builder
@Data
public class UserDto { //
    private Integer userId;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String confirmPassword;
    private String role;
}
