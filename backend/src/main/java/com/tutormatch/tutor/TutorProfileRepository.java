package com.tutormatch.tutor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long> {

    Optional<TutorProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Query("""
            SELECT t FROM TutorProfile t
            WHERE (:subject IS NULL OR t.subject = :subject)
            AND (:minPrice IS NULL OR t.hourlyRate >= :minPrice)
            AND (:maxPrice IS NULL OR t.hourlyRate <= :maxPrice)
            """)
    Page<TutorProfile> search(@Param("subject") String subject,
                               @Param("minPrice") Integer minPrice,
                               @Param("maxPrice") Integer maxPrice,
                               Pageable pageable);
}
