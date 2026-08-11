package com.tutormatch.availability;

import com.tutormatch.auth.CustomUserDetails;
import com.tutormatch.availability.dto.SlotRequest;
import com.tutormatch.availability.dto.SlotResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/api/tutors/{tutorId}/availability")
    public ResponseEntity<List<SlotResponse>> getAvailability(
            @PathVariable Long tutorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(availabilityService.getAvailability(tutorId, from, to));
    }

    @PostMapping("/api/tutors/{tutorId}/availability")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<SlotResponse> createSlot(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long tutorId,
            @Valid @RequestBody SlotRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(availabilityService.createSlot(principal.getUserId(), tutorId, request));
    }

    @DeleteMapping("/api/availability/{slotId}")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Void> deleteSlot(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long slotId
    ) {
        availabilityService.deleteSlot(principal.getUserId(), slotId);
        return ResponseEntity.noContent().build();
    }
}
