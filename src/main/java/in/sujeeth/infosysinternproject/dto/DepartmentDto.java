package in.sujeeth.infosysinternproject.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentDto {

    private Long departmentId;
    private String departmentName;
    private String managerOfDepartment;
}
