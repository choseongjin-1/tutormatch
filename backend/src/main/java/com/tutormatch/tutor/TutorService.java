package com.tutormatch.tutor;

import com.tutormatch.common.exception.BusinessException;
import com.tutormatch.common.exception.ErrorCode;
import com.tutormatch.tutor.dto.TutorProfileRequest;
import com.tutormatch.tutor.dto.TutorProfileResponse;
import com.tutormatch.user.Role;
import com.tutormatch.user.User;
import com.tutormatch.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TutorService {

    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;

    public Page<TutorProfileResponse> search(String subject, Integer minPrice, Integer maxPrice, Pageable pageable) {
        return tutorProfileRepository.search(subject, minPrice, maxPrice, pageable)
                .map(TutorProfileResponse::from);
    }

    public TutorProfileResponse getDetail(Long tutorId) {
        return TutorProfileResponse.from(getProfileOrThrow(tutorId));
    }

    public TutorProfileResponse getMyProfile(Long userId) {
        TutorProfile profile = tutorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TUTOR_PROFILE_NOT_FOUND));
        return TutorProfileResponse.from(profile);
    }

    @Transactional
    public TutorProfileResponse createProfile(Long userId, TutorProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() != Role.TUTOR) {
            throw new BusinessException(ErrorCode.NOT_A_TUTOR);
        }
        if (tutorProfileRepository.existsByUserId(userId)) {
            throw new BusinessException(ErrorCode.TUTOR_PROFILE_ALREADY_EXISTS);
        }

        TutorProfile profile = TutorProfile.of(user, request.subject(), request.bio(), request.hourlyRate(), request.career());
        tutorProfileRepository.save(profile);
        return TutorProfileResponse.from(profile);
    }

    @Transactional
    public TutorProfileResponse updateProfile(Long userId, TutorProfileRequest request) {
        TutorProfile profile = tutorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TUTOR_PROFILE_NOT_FOUND));

        profile.update(request.subject(), request.bio(), request.hourlyRate(), request.career());
        return TutorProfileResponse.from(profile);
    }

    TutorProfile getProfileOrThrow(Long tutorId) {
        return tutorProfileRepository.findById(tutorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TUTOR_PROFILE_NOT_FOUND));
    }
}
