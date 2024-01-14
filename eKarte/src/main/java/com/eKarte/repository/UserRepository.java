package com.eKarte.repository;

import com.eKarte.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail (String url);
    Optional<User> findByUserId (Integer url);

}
