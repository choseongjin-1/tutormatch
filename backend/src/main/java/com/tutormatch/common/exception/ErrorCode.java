package com.tutormatch.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "Invalid input value"),
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "C002", "Entity not found"),
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "C003", "Resource already exists"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C004", "Internal server error"),

    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "A001", "Invalid email or password"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "A002", "Email already in use"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A003", "Invalid or expired token"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "A004", "Access is denied"),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "User not found"),

    TUTOR_PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "Tutor profile not found"),
    TUTOR_PROFILE_ALREADY_EXISTS(HttpStatus.CONFLICT, "T002", "Tutor profile already exists"),
    NOT_A_TUTOR(HttpStatus.FORBIDDEN, "T003", "User is not a tutor"),

    SLOT_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "Availability slot not found"),
    SLOT_ALREADY_EXISTS(HttpStatus.CONFLICT, "S002", "Availability slot already exists for this time"),
    SLOT_ALREADY_BOOKED(HttpStatus.CONFLICT, "S003", "Availability slot is already booked"),
    SLOT_NOT_OWNED(HttpStatus.FORBIDDEN, "S004", "Slot does not belong to this tutor"),

    RESERVATION_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "Reservation not found"),
    RESERVATION_NOT_OWNED(HttpStatus.FORBIDDEN, "R002", "Reservation does not belong to this user"),
    INVALID_RESERVATION_STATUS_TRANSITION(HttpStatus.CONFLICT, "R003", "Invalid reservation status transition"),

    REVIEW_NOT_ALLOWED(HttpStatus.CONFLICT, "V001", "Review is only allowed for completed reservations"),
    REVIEW_ALREADY_EXISTS(HttpStatus.CONFLICT, "V002", "Review already exists for this reservation");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
