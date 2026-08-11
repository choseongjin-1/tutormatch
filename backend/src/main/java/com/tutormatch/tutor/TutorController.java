package com.tutormatch.tutor;

import com.tutormatch.auth.CustomUserDetails;
import com.tutormatch.tutor.dto.TutorProfileRequest;
import com.tutormatch.tutor.dto.TutorProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tutors")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;

    @GetMapping
    public ResponseEntity<Page<TutorProfileResponse>> search(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(tutorService.search(subject, minPrice, maxPrice, pageable));
    }

    @GetMapping("/{tutorId}")
    public ResponseEntity<TutorProfileResponse> getDetail(@PathVariable Long tutorId) {
        return ResponseEntity.ok(tutorService.getDetail(tutorId));
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<TutorProfileResponse> createProfile(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody TutorProfileRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tutorService.createProfile(principal.getUserId(), request));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<TutorProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody TutorProfileRequest request
    ) {
        return ResponseEntity.ok(tutorService.updateProfile(principal.getUserId(), request));
    }
}
