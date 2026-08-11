package com.tutormatch.review;

import com.tutormatch.auth.CustomUserDetails;
import com.tutormatch.availability.AvailabilitySlot;
import com.tutormatch.availability.AvailabilitySlotRepository;
import com.tutormatch.reservation.Reservation;
import com.tutormatch.reservation.ReservationRepository;
import com.tutormatch.reservation.ReservationStatus;
import com.tutormatch.review.dto.ReviewRequest;
import com.tutormatch.tutor.TutorProfile;
import com.tutormatch.tutor.TutorProfileRepository;
import com.tutormatch.user.Role;
import com.tutormatch.user.User;
import com.tutormatch.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private AvailabilitySlotRepository slotRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User tutorUser;
    private User studentUser;
    private TutorProfile tutorProfile;

    @BeforeEach
    void setUp() {
        tutorUser = userRepository.save(User.of("review-tutor@test.com", passwordEncoder.encode("password123"), "Tutor", Role.TUTOR, null));
        studentUser = userRepository.save(User.of("review-student@test.com", passwordEncoder.encode("password123"), "Student", Role.STUDENT, null));
        tutorProfile = tutorProfileRepository.save(TutorProfile.of(tutorUser, "History", "bio", 12000, "career"));
    }

    private Reservation createReservationWithStatus(ReservationStatus status) {
        AvailabilitySlot slot = slotRepository.save(AvailabilitySlot.of(tutorProfile, LocalDate.of(2026, 12, 1), LocalTime.of(10, 0), LocalTime.of(11, 0)));
        slot.markBooked();
        Reservation reservation = Reservation.of(studentUser, tutorProfile, slot, "msg");
        reservation.changeStatus(status);
        return reservationRepository.save(reservation);
    }

    @Test
    void studentCanReviewCompletedReservationAndTutorRatingUpdates() throws Exception {
        Reservation reservation = createReservationWithStatus(ReservationStatus.COMPLETED);
        ReviewRequest request = new ReviewRequest(5, "Great tutor!");

        mockMvc.perform(post("/api/reservations/" + reservation.getId() + "/review")
                        .with(user(new CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(5));

        // duplicate review on the same reservation is rejected
        mockMvc.perform(post("/api/reservations/" + reservation.getId() + "/review")
                        .with(user(new CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/tutors/" + tutorProfile.getId() + "/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].rating").value(5));

        mockMvc.perform(get("/api/tutors/" + tutorProfile.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avgRating").value(5.0))
                .andExpect(jsonPath("$.reviewCount").value(1));
    }

    @Test
    void cannotReviewNonCompletedReservation() throws Exception {
        Reservation reservation = createReservationWithStatus(ReservationStatus.CONFIRMED);
        ReviewRequest request = new ReviewRequest(4, "Not done yet");

        mockMvc.perform(post("/api/reservations/" + reservation.getId() + "/review")
                        .with(user(new CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("V001"));
    }
}
