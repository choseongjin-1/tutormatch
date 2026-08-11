package com.tutormatch.review;

import com.tutormatch.common.exception.BusinessException;
import com.tutormatch.common.exception.ErrorCode;
import com.tutormatch.reservation.Reservation;
import com.tutormatch.reservation.ReservationRepository;
import com.tutormatch.reservation.ReservationStatus;
import com.tutormatch.review.dto.ReviewRequest;
import com.tutormatch.review.dto.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public ReviewResponse createReview(Long userId, Long reservationId, ReviewRequest request) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));

        if (!reservation.getStudent().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.RESERVATION_NOT_OWNED);
        }
        if (reservation.getStatus() != ReservationStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.REVIEW_NOT_ALLOWED);
        }
        if (reviewRepository.existsByReservationId(reservationId)) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review review = Review.of(reservation, request.rating(), request.comment());
        reviewRepository.save(review);
        reservation.getTutor().addReview(request.rating());

        return ReviewResponse.from(review);
    }

    public Page<ReviewResponse> getReviews(Long tutorId, Pageable pageable) {
        return reviewRepository.findByReservationTutorIdOrderByCreatedAtDesc(tutorId, pageable)
                .map(ReviewResponse::from);
    }
}
