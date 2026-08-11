package com.tutormatch.reservation;

import com.tutormatch.availability.AvailabilitySlot;
import com.tutormatch.availability.AvailabilitySlotRepository;
import com.tutormatch.common.exception.BusinessException;
import com.tutormatch.common.exception.ErrorCode;
import com.tutormatch.reservation.dto.ReservationCreateRequest;
import com.tutormatch.reservation.dto.ReservationResponse;
import com.tutormatch.user.User;
import com.tutormatch.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReservationResponse createReservation(Long studentId, ReservationCreateRequest request) {
        AvailabilitySlot slot = slotRepository.findByIdForUpdate(request.slotId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SLOT_NOT_FOUND));

        if (slot.isBooked()) {
            throw new BusinessException(ErrorCode.SLOT_ALREADY_BOOKED);
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        slot.markBooked();

        Reservation reservation = Reservation.of(student, slot.getTutor(), slot, request.message());
        reservationRepository.save(reservation);
        return ReservationResponse.from(reservation);
    }

    public List<ReservationResponse> getMyReservations(Long userId, String role, ReservationStatus status) {
        List<Reservation> reservations = "TUTOR".equalsIgnoreCase(role)
                ? reservationRepository.findAsTutor(userId, status)
                : reservationRepository.findAsStudent(userId, status);
        return reservations.stream().map(ReservationResponse::from).toList();
    }

    public ReservationResponse getDetail(Long userId, Long reservationId) {
        Reservation reservation = findOrThrow(reservationId);
        ensureParticipant(userId, reservation);
        return ReservationResponse.from(reservation);
    }

    @Transactional
    public ReservationResponse updateStatus(Long userId, Long reservationId, ReservationStatus target) {
        Reservation reservation = findOrThrow(reservationId);
        boolean isStudent = reservation.getStudent().getId().equals(userId);
        boolean isTutor = reservation.getTutor().getUser().getId().equals(userId);

        if (!isStudent && !isTutor) {
            throw new BusinessException(ErrorCode.RESERVATION_NOT_OWNED);
        }

        applyTransition(reservation, target, isStudent, isTutor);
        return ReservationResponse.from(reservation);
    }

    private void applyTransition(Reservation reservation, ReservationStatus target, boolean isStudent, boolean isTutor) {
        ReservationStatus current = reservation.getStatus();

        switch (target) {
            case CONFIRMED -> {
                requireRole(isTutor);
                requireCurrentStatus(current, ReservationStatus.PENDING);
            }
            case REJECTED -> {
                requireRole(isTutor);
                requireCurrentStatus(current, ReservationStatus.PENDING);
            }
            case CANCELLED -> {
                requireRole(isStudent || isTutor);
                requireCurrentStatus(current, ReservationStatus.PENDING, ReservationStatus.CONFIRMED);
            }
            case COMPLETED -> {
                requireRole(isTutor);
                requireCurrentStatus(current, ReservationStatus.CONFIRMED);
            }
            case PENDING -> throw new BusinessException(ErrorCode.INVALID_RESERVATION_STATUS_TRANSITION);
        }

        reservation.changeStatus(target);
    }

    private void requireRole(boolean allowed) {
        if (!allowed) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void requireCurrentStatus(ReservationStatus current, ReservationStatus... allowed) {
        for (ReservationStatus status : allowed) {
            if (current == status) {
                return;
            }
        }
        throw new BusinessException(ErrorCode.INVALID_RESERVATION_STATUS_TRANSITION);
    }

    private Reservation findOrThrow(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
    }

    private void ensureParticipant(Long userId, Reservation reservation) {
        boolean isStudent = reservation.getStudent().getId().equals(userId);
        boolean isTutor = reservation.getTutor().getUser().getId().equals(userId);
        if (!isStudent && !isTutor) {
            throw new BusinessException(ErrorCode.RESERVATION_NOT_OWNED);
        }
    }
}
