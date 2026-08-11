package com.tutormatch.availability;

import com.tutormatch.availability.dto.SlotRequest;
import com.tutormatch.availability.dto.SlotResponse;
import com.tutormatch.common.exception.BusinessException;
import com.tutormatch.common.exception.ErrorCode;
import com.tutormatch.tutor.TutorProfile;
import com.tutormatch.tutor.TutorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AvailabilityService {

    private final AvailabilitySlotRepository slotRepository;
    private final TutorProfileRepository tutorProfileRepository;

    public List<SlotResponse> getAvailability(Long tutorId, LocalDate from, LocalDate to) {
        return slotRepository.findByTutorIdAndSlotDateBetweenOrderBySlotDateAscStartTimeAsc(tutorId, from, to).stream()
                .map(SlotResponse::from)
                .toList();
    }

    @Transactional
    public SlotResponse createSlot(Long userId, Long tutorId, SlotRequest request) {
        TutorProfile tutor = tutorProfileRepository.findById(tutorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TUTOR_PROFILE_NOT_FOUND));

        if (!tutor.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        if (slotRepository.existsByTutorIdAndSlotDateAndStartTime(tutorId, request.slotDate(), request.startTime())) {
            throw new BusinessException(ErrorCode.SLOT_ALREADY_EXISTS);
        }

        AvailabilitySlot slot = AvailabilitySlot.of(tutor, request.slotDate(), request.startTime(), request.endTime());
        slotRepository.save(slot);
        return SlotResponse.from(slot);
    }

    @Transactional
    public void deleteSlot(Long userId, Long slotId) {
        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SLOT_NOT_FOUND));

        if (!slot.getTutor().getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.SLOT_NOT_OWNED);
        }
        if (slot.isBooked()) {
            throw new BusinessException(ErrorCode.SLOT_ALREADY_BOOKED, "Cannot delete a booked slot");
        }

        slotRepository.delete(slot);
    }
}
