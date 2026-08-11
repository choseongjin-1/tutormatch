package com.tutormatch.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByReservationId(Long reservationId);

    Page<Review> findByReservationTutorIdOrderByCreatedAtDesc(Long tutorId, Pageable pageable);
}
