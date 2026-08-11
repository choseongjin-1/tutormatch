package com.tutormatch.tutor;

import com.tutormatch.tutor.dto.TutorProfileRequest;
import com.tutormatch.user.Role;
import com.tutormatch.user.User;
import com.tutormatch.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TutorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User tutorUser;
    private User studentUser;

    @BeforeEach
    void setUp() {
        tutorUser = userRepository.save(User.of("tutor@test.com", passwordEncoder.encode("password123"), "Tutor Kim", Role.TUTOR, null));
        studentUser = userRepository.save(User.of("student@test.com", passwordEncoder.encode("password123"), "Student Lee", Role.STUDENT, null));
    }

    @Test
    void tutorCanCreateProfileAndItIsPubliclyVisible() throws Exception {
        TutorProfileRequest request = new TutorProfileRequest("Math", "Experienced math tutor", 30000, "5 years teaching");

        mockMvc.perform(post("/api/tutors/profile")
                        .with(user(new com.tutormatch.auth.CustomUserDetails(tutorUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subject").value("Math"))
                .andExpect(jsonPath("$.hourlyRate").value(30000));

        mockMvc.perform(get("/api/tutors").param("subject", "Math"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].subject").value("Math"));
    }

    @Test
    void studentCannotCreateTutorProfile() throws Exception {
        TutorProfileRequest request = new TutorProfileRequest("Math", "bio", 30000, "career");

        mockMvc.perform(post("/api/tutors/profile")
                        .with(user(new com.tutormatch.auth.CustomUserDetails(studentUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getMyProfileReturns404BeforeCreationAndProfileAfter() throws Exception {
        mockMvc.perform(get("/api/tutors/me")
                        .with(user(new com.tutormatch.auth.CustomUserDetails(tutorUser))))
                .andExpect(status().isNotFound());

        TutorProfileRequest request = new TutorProfileRequest("Physics", "bio", 25000, "career");
        mockMvc.perform(post("/api/tutors/profile")
                        .with(user(new com.tutormatch.auth.CustomUserDetails(tutorUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/tutors/me")
                        .with(user(new com.tutormatch.auth.CustomUserDetails(tutorUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value("Physics"));
    }
}
