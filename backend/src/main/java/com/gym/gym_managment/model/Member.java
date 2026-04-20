package com.gym.gym_managment.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "members")
//@Entity: This is the most important part. It tells Spring Boot: "This class isn't just a regular Java
// class; it's a database table."
public class Member extends Person{

    private String membershipPlan;
    private LocalDate joinDate;
    private LocalDate expiryDate;

    public Member() {
    }

    public Member(String name, String email, String phoneNumber, String membershipPlan) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.membershipPlan = membershipPlan;
        this.joinDate = LocalDate.now();
    }
    @Override
    public void displayProfile() {
        super.displayProfile(); // Call the parent method first
        System.out.println("Plan         : " + this.membershipPlan);
        System.out.println("Expiry Date  : " + this.expiryDate);
        System.out.println("-----------------------");
    }

    public void calculateExpiry(){
        if (this.membershipPlan == null ){
            return;
        }
        LocalDate today = LocalDate.now();
        switch (this.membershipPlan.toUpperCase()){
            case "MONTHLY" :
                this.expiryDate = today.plusMonths(1);
                break;
            case "QUARTERLY":
                this.expiryDate = today.plusMonths(3);
                break;
            case "YEARLY" :
                this.expiryDate = today.plusYears(1);
                break;
            default:
                this.expiryDate=today;
        }
    }

    public void renewMembership(int monthsToAdd) {
        if (this.expiryDate == null || this.expiryDate.isBefore(LocalDate.now())) {
            this.expiryDate = LocalDate.now().plusMonths(monthsToAdd);
        } else {
            this.expiryDate = this.expiryDate.plusMonths(monthsToAdd);
        }
    }

    public boolean checkAccess() {
        if (this.expiryDate == null){ return false;}
        return !this.expiryDate.isBefore(LocalDate.now());
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

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
}