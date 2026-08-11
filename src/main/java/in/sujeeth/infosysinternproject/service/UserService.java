package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.UserDto;
import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.exception.ResourceNotFoundException;
import in.sujeeth.infosysinternproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(authService::mapToUserDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return authService.mapToUserDto(user);
    }
}
