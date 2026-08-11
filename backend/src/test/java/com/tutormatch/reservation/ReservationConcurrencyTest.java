package com.tutormatch.reservation;

import com.tutormatch.availability.AvailabilitySlot;
import com.tutormatch.availability.AvailabilitySlotRepository;
import com.tutormatch.common.exception.BusinessException;
import com.tutormatch.common.exception.ErrorCode;
import com.tutormatch.reservation.dto.ReservationCreateRequest;
import com.tutormatch.tutor.TutorProfile;
import com.tutormatch.tutor.TutorProfileRepository;
import com.tutormatch.user.Role;
import com.tutormatch.user.User;
import com.tutormatch.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies that concurrent booking attempts on the same slot are serialized by the
 * PESSIMISTIC_WRITE lock in {@link AvailabilitySlotRepository#findByIdForUpdate}, so that
 * exactly one of N simultaneous requests succeeds and the rest are rejected as already booked.
 */
@SpringBootTest
class ReservationConcurrencyTest {

    private static final int CONCURRENT_REQUESTS = 20;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private AvailabilitySlotRepository slotRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void onlyOneReservationSucceedsWhenManyStudentsBookTheSameSlotConcurrently() throws InterruptedException {
        User tutorUser = userRepository.save(User.of("concurrency-tutor@test.com", passwordEncoder.encode("password123"), "Tutor", Role.TUTOR, null));
        TutorProfile tutorProfile = tutorProfileRepository.save(TutorProfile.of(tutorUser, "Math", "bio", 10000, "career"));
        AvailabilitySlot slot = slotRepository.save(AvailabilitySlot.of(tutorProfile, LocalDate.of(2026, 10, 1), LocalTime.of(9, 0), LocalTime.of(10, 0)));

        List<Long> studentIds = IntStream.range(0, CONCURRENT_REQUESTS)
                .mapToObj(i -> userRepository.save(User.of("concurrency-student" + i + "@test.com", passwordEncoder.encode("password123"), "Student" + i, Role.STUDENT, null)))
                .map(User::getId)
                .toList();

        ExecutorService executor = Executors.newFixedThreadPool(CONCURRENT_REQUESTS);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(CONCURRENT_REQUESTS);
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger conflictCount = new AtomicInteger();

        for (Long studentId : studentIds) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    reservationService.createReservation(studentId, new ReservationCreateRequest(slot.getId(), "please teach me"));
                    successCount.incrementAndGet();
                } catch (BusinessException e) {
                    if (e.getErrorCode() == ErrorCode.SLOT_ALREADY_BOOKED) {
                        conflictCount.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean finished = doneLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(finished).isTrue();
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(conflictCount.get()).isEqualTo(CONCURRENT_REQUESTS - 1);
        assertThat(reservationRepository.count()).isEqualTo(1);
        assertThat(slotRepository.findById(slot.getId()).orElseThrow().isBooked()).isTrue();
    }
}
