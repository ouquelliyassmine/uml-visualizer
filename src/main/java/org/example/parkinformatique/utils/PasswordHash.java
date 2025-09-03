package org.example.parkinformatique.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;



public class PasswordHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashed = encoder.encode("adminpass");
        System.out.println("🔐 Hashed password: " + hashed);
    }
}

