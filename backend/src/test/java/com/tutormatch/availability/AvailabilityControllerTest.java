package com.tutormatch.availability;

import com.tutormatch.auth.CustomUserDetails;
import com.tutormatch.availability.dto.SlotRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AvailabilitySlotRepository slotRepository;

    private User tutorUser;
    private TutorProfile tutorProfile;

    @BeforeEach
    void setUp() {
        tutorUser = userRepository.save(User.of("slot-tutor@test.com", passwordEncoder.encode("password123"), "Tutor Park", Role.TUTOR, null));
        tutorProfile = tutorProfileRepository.save(TutorProfile.of(tutorUser, "English", "bio", 20000, "career"));
    }

    @Test
    void tutorCanRegisterSlotAndDuplicateIsRejected() throws Exception {
        SlotRequest request = new SlotRequest(LocalDate.of(2026, 9, 1), LocalTime.of(10, 0), LocalTime.of(11, 0));

        mockMvc.perform(post("/api/tutors/" + tutorProfile.getId() + "/availability")
                        .with(user(new CustomUserDetails(tutorUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.booked").value(false));

        mockMvc.perform(post("/api/tutors/" + tutorProfile.getId() + "/availability")
                        .with(user(new CustomUserDetails(tutorUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("S002"));

        mockMvc.perform(get("/api/tutors/" + tutorProfile.getId() + "/availability")
                        .param("from", "2026-09-01")
                        .param("to", "2026-09-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].startTime").value("10:00:00"));
    }

    @Test
    void otherTutorCannotRegisterSlotForSomeoneElsesProfile() throws Exception {
        User otherTutor = userRepository.save(User.of("other-tutor@test.com", passwordEncoder.encode("password123"), "Other Tutor", Role.TUTOR, null));
        SlotRequest request = new SlotRequest(LocalDate.of(2026, 9, 2), LocalTime.of(10, 0), LocalTime.of(11, 0));

        mockMvc.perform(post("/api/tutors/" + tutorProfile.getId() + "/availability")
                        .with(user(new CustomUserDetails(otherTutor)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void deletingUnbookedSlotSucceeds() throws Exception {
        AvailabilitySlot slot = slotRepository.save(
                AvailabilitySlot.of(tutorProfile, LocalDate.of(2026, 9, 5), LocalTime.of(9, 0), LocalTime.of(10, 0)));

        mockMvc.perform(delete("/api/availability/" + slot.getId())
                        .with(user(new CustomUserDetails(tutorUser))))
                .andExpect(status().isNoContent());
    }
}
