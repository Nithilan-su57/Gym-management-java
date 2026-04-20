package com.gym.gym_managment.model;

import com.gym.gym_managment.model.Member;
import com.gym.gym_managment.model.MembershipPlan;
import com.gym.gym_managment.repository.MemberRepository;
import com.gym.gym_managment.repository.MembershipPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
//
@Service // Tells Spring this is a business logic class
public class GymManagerService {

    @Autowired // Connects to the database repository
    private MemberRepository memberRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    /**
     * Registers a new member and automatically calculates their expiry.
     * This ensures no member is created without a valid end date.
     */
    public Member registerMember(Member member) {
        member.calculateExpiry(); // Logic from Member class
        return memberRepository.save(member);
    }

    public Member findMemberById(Long id) {
        //In some case where ID is not found the .orElse(null) will either return the member or nothing.
        return memberRepository.findById(id).orElse(null);
    }
    /**
     * Logic: Iterate through all members and sum up the 'basePrice'
     * of their chosen plans.
     */
    public String generateRevenueReport() {
        List<Member> allMembers = memberRepository.findAll();
        List<MembershipPlan> allPlans = planRepository.findAll();
        double totalRevenue = 0;
        // Loop through every member in the database
        for (Member member : allMembers) {
            // Find which plan this member is on by comparing names
            for (MembershipPlan plan : allPlans) {
                if (member.getMembershipPlan() != null && member.getMembershipPlan().equalsIgnoreCase(plan.getPlanName())) {
                    // Add the actual discounted price of that plan to our total
                    totalRevenue += plan.getDiscountedPrice();
                }
            }
        }

        return "Total Members: " + allMembers.size() + " | Total Revenue: ₹" + totalRevenue;
    }

    /**
     * Finds members whose expiryDate is before 'today' and removes them from the DB.
     * This is a "Cleanup" task restricted to Managers.
     */
    public void removeExpiredMembers() {
        List<Member> allMembers = memberRepository.findAll();
        LocalDate today = LocalDate.now();
        // We look at every member one by one
        for (Member member : allMembers) {
            // If they have an expiry date AND it is before today...
            if (member.getExpiryDate() != null && member.getExpiryDate().isBefore(today)) {
                // ...delete them from the database
                memberRepository.delete(member);
            }
        }
    }
}
