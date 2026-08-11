package in.sujeeth.infosysinternproject.controller;

import in.sujeeth.infosysinternproject.dto.LoginRequest;
import in.sujeeth.infosysinternproject.dto.LoginResponse;
import in.sujeeth.infosysinternproject.dto.SignupRequest;
import in.sujeeth.infosysinternproject.dto.UserDto;
import in.sujeeth.infosysinternproject.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody SignupRequest request) {
        UserDto createdUser = authService.register(request);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> adminLogin(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.adminLogin(request);
        return ResponseEntity.ok(response);
    }
}
