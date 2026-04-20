package com.gym.gym_managment.controller;

import com.gym.gym_managment.model.Member;
import com.gym.gym_managment.model.GymManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/manager")
@CrossOrigin(origins = "*")
public class GymManagerController {

    @Autowired
    private GymManagerService managerService;

    // Triggered by the Manager to clean the database
    @DeleteMapping("/cleanup")
    public String cleanup() {
        managerService.removeExpiredMembers();
        return "Expired members removed successfully.";
    }

    // Displays the financial status
    @GetMapping("/report")
    public String getReport() {
        return managerService.generateRevenueReport();
    }

    // Manager's version of registration
    @PostMapping("/register")
    public Member addMember(@RequestBody Member member) {
        return managerService.registerMember(member);
    }
}