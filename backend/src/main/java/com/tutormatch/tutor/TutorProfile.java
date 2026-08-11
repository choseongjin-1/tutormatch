package com.tutormatch.tutor;

import com.tutormatch.common.entity.BaseCreatedAtEntity;
import com.tutormatch.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "tutor_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TutorProfile extends BaseCreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "hourly_rate", nullable = false)
    private Integer hourlyRate;

    @Column(columnDefinition = "TEXT")
    private String career;

    @Column(name = "avg_rating", nullable = false)
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    private TutorProfile(User user, String subject, String bio, Integer hourlyRate, String career) {
        this.user = user;
        this.subject = subject;
        this.bio = bio;
        this.hourlyRate = hourlyRate;
        this.career = career;
        this.avgRating = BigDecimal.ZERO;
        this.reviewCount = 0;
    }

    public static TutorProfile of(User user, String subject, String bio, Integer hourlyRate, String career) {
        return new TutorProfile(user, subject, bio, hourlyRate, career);
    }

    public void update(String subject, String bio, Integer hourlyRate, String career) {
        this.subject = subject;
        this.bio = bio;
        this.hourlyRate = hourlyRate;
        this.career = career;
    }

    public void addReview(int rating) {
        BigDecimal totalScore = this.avgRating.multiply(BigDecimal.valueOf(this.reviewCount)).add(BigDecimal.valueOf(rating));
        this.reviewCount += 1;
        this.avgRating = totalScore.divide(BigDecimal.valueOf(this.reviewCount), 2, java.math.RoundingMode.HALF_UP);
    }
}
