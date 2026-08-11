package com.tutormatch.auth;

import com.tutormatch.auth.dto.LoginRequest;
import com.tutormatch.auth.dto.SignupRequest;
import com.tutormatch.auth.dto.TokenResponse;
import com.tutormatch.common.exception.BusinessException;
import com.tutormatch.common.exception.ErrorCode;
import com.tutormatch.user.User;
import com.tutormatch.user.UserRepository;
import com.tutormatch.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        User user = User.of(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.name(),
                request.role(),
                request.phone()
        );
        userRepository.save(user);
        return UserResponse.from(user);
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        return issueTokens(user);
    }

    public TokenResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.isValid(refreshToken) || !jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        User user = userRepository.findByEmail(jwtTokenProvider.getEmail(refreshToken))
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        return issueTokens(user);
    }

    private TokenResponse issueTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());
        return TokenResponse.of(accessToken, refreshToken, UserResponse.from(user));
    }
}
