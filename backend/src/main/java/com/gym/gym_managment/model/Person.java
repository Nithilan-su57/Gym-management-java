package com.gym.gym_managment.model;

import jakarta.persistence.*;

@MappedSuperclass // This tells JPA to include these fields in the child tables
public abstract class Person {

    private String name;
    private String email;
    private String phoneNumber;

    public Person() {}

    public Person(String name, String email, String phoneNumber) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    // This is the method you asked for
    public void displayProfile() {
        System.out.println("--- Profile Details ---");
        System.out.println("Name         : " + this.name);
        System.out.println("Email        : " + this.email);
        System.out.println("Phone Number : " + this.phoneNumber);
    }

    // Getters and Setters (standard boilerplate)
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}