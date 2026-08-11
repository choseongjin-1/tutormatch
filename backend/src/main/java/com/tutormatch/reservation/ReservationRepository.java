package com.tutormatch.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.student.id = :userId AND (:status IS NULL OR r.status = :status)
            ORDER BY r.createdAt DESC
            """)
    List<Reservation> findAsStudent(@Param("userId") Long userId, @Param("status") ReservationStatus status);

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.tutor.user.id = :userId AND (:status IS NULL OR r.status = :status)
            ORDER BY r.createdAt DESC
            """)
    List<Reservation> findAsTutor(@Param("userId") Long userId, @Param("status") ReservationStatus status);
}
