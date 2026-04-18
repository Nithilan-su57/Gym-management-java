package com.gym.gym_managment.controller;
@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")
public class MembershipPlanController {
    @Autowired
    private MembershipPlanRepository planRepository;

    // Manager can create a new plan
    @PostMapping("/create")
    public MembershipPlan createPlan(@RequestBody MembershipPlan plan) {
        return planRepository.save(plan);
    }

    // Manager can update the discount for a specific plan
    @PutMapping("/{id}/set-discount")
    public MembershipPlan updateDiscount(@PathVariable Long id, @RequestParam double discount) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setDiscountPercentage(discount);
        return planRepository.save(plan);
    }

    // Members can see all plans and their discounted prices
    @GetMapping("/all")
    public List<MembershipPlan> getAllPlans() {
        return planRepository.findAll();
    }

}
