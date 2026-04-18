package com.gym.gym_managment.model;
import jakarta.persistence.*;
//
@Entity
@Table(name = "membership_plans")
public class MembershipPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String planName;
    private double basePrice;
    private double discountPercentage;
    private String features;

    public MembershipPlan() {}
    //Calculates the final price after applying the discount set by the manager.
    public double getDiscountedPrice() {
        return basePrice - (basePrice * (discountPercentage / 100));
    }

    //  Returns a formatted string of the plan details for the frontend.

    public String getPlanDetails() {
        return "Plan: " + planName +
                " | Base Price: " + basePrice +
                " | Current Discount: " + discountPercentage + "%" +
                " | Final Price: " + getDiscountedPrice();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(double basePrice) {
        this.basePrice = basePrice;
    }

    public double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }
}
