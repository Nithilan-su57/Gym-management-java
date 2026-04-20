package com.gym.gym_managment.model;

import jakarta.persistence.*;

@MappedSuperclass // This tells JPA to include these fields in the child tables
public abstract class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    //@Id and @GeneratedValue: This creates an
    // ID column that automatically increases (1, 2, 3...) so you don't have to assign IDs manually.
    protected long id;

    @Column(nullable = false)
    //tells the database generation to create not null values , if it does it will throw SQL exception.
    protected String name;
    @Column(unique = true, nullable = false)
    //ensures no two rows in the database table can have the same values ,if it does it will throw an exception.
    protected String email;
    protected String phoneNumber;

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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}