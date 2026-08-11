package com.tutormatch.reservation;

import com.tutormatch.auth.CustomUserDetails;
import com.tutormatch.reservation.dto.ReservationCreateRequest;
import com.tutormatch.reservation.dto.ReservationResponse;
import com.tutormatch.reservation.dto.StatusUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ReservationResponse> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ReservationCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createReservation(principal.getUserId(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false, defaultValue = "STUDENT") String role,
            @RequestParam(required = false) ReservationStatus status
    ) {
        return ResponseEntity.ok(reservationService.getMyReservations(principal.getUserId(), role, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getDetail(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(reservationService.getDetail(principal.getUserId(), id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReservationResponse> updateStatus(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(reservationService.updateStatus(principal.getUserId(), id, request.status()));
    }
}
