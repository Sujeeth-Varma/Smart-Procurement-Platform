package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.*;
import in.sujeeth.infosysinternproject.entity.Department;
import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.enums.Role;
import in.sujeeth.infosysinternproject.enums.UserStatus;
import in.sujeeth.infosysinternproject.exception.BadRequestException;
import in.sujeeth.infosysinternproject.exception.ResourceNotFoundException;
import in.sujeeth.infosysinternproject.exception.UserAlreadyExistsException;
import in.sujeeth.infosysinternproject.repository.DepartmentRepository;
import in.sujeeth.infosysinternproject.repository.UserRepository;
import in.sujeeth.infosysinternproject.security.CustomUserDetailsService;
import in.sujeeth.infosysinternproject.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional
    public UserDto register(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .designation(request.getDesignation())
                .role(Role.USER) // Server assigns USER role
                .status(UserStatus.ACTIVE) // Server assigns ACTIVE status
                .department(department)
                .build();

        User savedUser = userRepository.save(user);
        return mapToUserDto(savedUser);
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Account is not active");
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, user.getRole().name());

        return LoginResponse.builder()
                .message("Login successful")
                .token(token)
                .role(user.getRole().name())
                .build();
    }

    public LoginResponse adminLogin(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with email: " + request.getEmail()));

        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException("User does not have ADMIN privileges");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Admin account is not active");
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, user.getRole().name());

        return LoginResponse.builder()
                .message("Admin Login Successful")
                .token(token)
                .role("ADMIN")
                .build();
    }

    public UserDto mapToUserDto(User user) {
        DepartmentDto deptDto = null;
        if (user.getDepartment() != null) {
            deptDto = DepartmentDto.builder()
                    .departmentId(user.getDepartment().getDepartmentId())
                    .departmentName(user.getDepartment().getDepartmentName())
                    .build();
        }

        return UserDto.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .designation(user.getDesignation())
                .role(user.getRole())
                .status(user.getStatus())
                .department(deptDto)
                .build();
    }
}
