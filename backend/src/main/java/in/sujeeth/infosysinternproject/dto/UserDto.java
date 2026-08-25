package in.sujeeth.infosysinternproject.dto;

import in.sujeeth.infosysinternproject.enums.Role;
import in.sujeeth.infosysinternproject.enums.UserStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String designation;
    private Role role;
    private UserStatus status;
    private DepartmentDto department;
}
