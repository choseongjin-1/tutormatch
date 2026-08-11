package com.tutormatch.common.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String code,
        String message,
        List<FieldError> errors
) {

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(LocalDateTime.now(), errorCode.getStatus().value(), errorCode.getCode(), errorCode.getMessage(), List.of());
    }

    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return new ErrorResponse(LocalDateTime.now(), errorCode.getStatus().value(), errorCode.getCode(), message, List.of());
    }

    public static ErrorResponse of(ErrorCode errorCode, List<FieldError> errors) {
        return new ErrorResponse(LocalDateTime.now(), errorCode.getStatus().value(), errorCode.getCode(), errorCode.getMessage(), errors);
    }

    public record FieldError(String field, String value, String reason) {
    }
}
