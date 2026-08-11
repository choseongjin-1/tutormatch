package com.tutormatch.reservation;

import com.tutormatch.auth.CustomUserDetails;
import com.tutormatch.availability.AvailabilitySlot;
import com.tutormatch.availability.AvailabilitySlotRepository;
import com.tutormatch.reservation.dto.ReservationCreateRequest;
import com.tutormatch.reservation.dto.StatusUpdateRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReservationControllerTest {

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
    private PasswordEncoder passwordEncoder;

    private User tutorUser;
    private User studentUser;
    private AvailabilitySlot slot;

    @BeforeEach
    void setUp() {
        tutorUser = userRepository.save(User.of("res-tutor@test.com", passwordEncoder.encode("password123"), "Tutor", Role.TUTOR, null));
        studentUser = userRepository.save(User.of("res-student@test.com", passwordEncoder.encode("password123"), "Student", Role.STUDENT, null));
        TutorProfile tutorProfile = tutorProfileRepository.save(TutorProfile.of(tutorUser, "Science", "bio", 15000, "career"));
        slot = slotRepository.save(AvailabilitySlot.of(tutorProfile, LocalDate.of(2026, 11, 1), LocalTime.of(14, 0), LocalTime.of(15, 0)));
    }

    @Test
    void fullReservationLifecycleFromPendingToCompleted() throws Exception {
        ReservationCreateRequest createRequest = new ReservationCreateRequest(slot.getId(), "Please help me with physics");

        String response = mockMvc.perform(post("/api/reservations")
                        .with(user(new CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();

        Long reservationId = objectMapper.readTree(response).get("id").asLong();

        // second booking attempt on the same (now booked) slot must be rejected
        mockMvc.perform(post("/api/reservations")
                        .with(user(new CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isConflict());

        // student cannot confirm their own reservation
        mockMvc.perform(patch("/api/reservations/" + reservationId + "/status")
                        .with(user(new CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StatusUpdateRequest(ReservationStatus.CONFIRMED))))
                .andExpect(status().isForbidden());

        // tutor confirms
        mockMvc.perform(patch("/api/reservations/" + reservationId + "/status")
                        .with(user(new CustomUserDetails(tutorUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StatusUpdateRequest(ReservationStatus.CONFIRMED))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        // tutor completes
        mockMvc.perform(patch("/api/reservations/" + reservationId + "/status")
                        .with(user(new CustomUserDetails(tutorUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StatusUpdateRequest(ReservationStatus.COMPLETED))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // cannot cancel a completed reservation
        mockMvc.perform(patch("/api/reservations/" + reservationId + "/status")
                        .with(user(new CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StatusUpdateRequest(ReservationStatus.CANCELLED))))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/reservations/me")
                        .with(user(new CustomUserDetails(tutorUser)))
                        .param("role", "TUTOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("COMPLETED"));
    }

    @Test
    void rejectedSlotStaysConsumedAndCannotBeRebooked() throws Exception {
        // slot_id is UNIQUE on reservations, so once a slot has been reserved it is a
        // one-time-use resource: rejection/cancellation does not reopen it for new bookings.
        ReservationCreateRequest createRequest = new ReservationCreateRequest(slot.getId(), "message");

        String response = mockMvc.perform(post("/api/reservations")
                        .with(user(new CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long reservationId = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(patch("/api/reservations/" + reservationId + "/status")
                        .with(user(new CustomUserDetails(tutorUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StatusUpdateRequest(ReservationStatus.REJECTED))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        User anotherStudent = userRepository.save(User.of("res-student2@test.com", passwordEncoder.encode("password123"), "Student2", Role.STUDENT, null));
        mockMvc.perform(post("/api/reservations")
                        .with(user(new CustomUserDetails(anotherStudent)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isConflict());
    }
}
