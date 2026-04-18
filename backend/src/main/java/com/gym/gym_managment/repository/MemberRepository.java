package com.gym.gym_managment.repository;

import com.gym.gym_managment.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    // JpaRepository gives you save(), findById(), and delete() for free.
}