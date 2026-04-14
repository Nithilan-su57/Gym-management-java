package com.gym.gym_managment.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "members")
//@Entity: This is the most important part. It tells Spring Boot: "This class isn't just a regular Java
// class; it's a database table."
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    //@Id and @GeneratedValue: This creates an
    // ID column that automatically increases (1, 2, 3...) so you don't have to assign IDs manually.
    private long id;

    @Column(nullable = false)
    //tells the database generation to create not null values , if it does it will throw sql exception.
    private String name;
    @Column(unique = true, nullable = false)
    //ensures no two rows in the database table can have the same values ,if it does it will throw an exception.
    private String email;
    private String phoneNumber;
    private String membershipPlan;
    private LocalDate joinDate;
    public Member() {
    }

    public Member(String name, String email, String phoneNumber, String membershipPlan) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.membershipPlan = membershipPlan;
        this.joinDate = LocalDate.now();
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getMembershipPlan() {
        return membershipPlan;
    }

    public void setMembershipPlan(String membershipPlan) {
        this.membershipPlan = membershipPlan;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDate joinDate) {
        this.joinDate = joinDate;
    }
}