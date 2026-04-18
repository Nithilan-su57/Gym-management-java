package com.gym.gym_managment.controller;

import com.gym.gym_managment.model.Member;
import com.gym.gym_managment.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*") // Allows your team's frontend/FastAPI to access this
public class MemberController {

    @Autowired
    private MemberRepository memberRepository;

    // 1. Register a new member
    @PostMapping("/register")
    public Member registerMember(@RequestBody Member member) {
        // We call your logic method before saving!
        member.calculateExpiry();
        return memberRepository.save(member);
    }

    // 2. Get all members (Great for the Frontend Team)
    @GetMapping("/all")
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    // 3. Check access for a member
    @GetMapping("/{id}/access")
    public String checkAccess(@PathVariable Long id) {
        return memberRepository.findById(id)
                .map(m -> m.checkAccess() ? "Access Granted" : "Access Denied - Expired")
                .orElse("Member Not Found");
    }

    // 4. Renew Membership
    @PostMapping("/{id}/renew")
    public Member renew(@PathVariable Long id, @RequestParam int months) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        member.renewMembership(months);
        return memberRepository.save(member);
    }
}