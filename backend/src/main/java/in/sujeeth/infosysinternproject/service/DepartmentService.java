package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.DepartmentDto;
import in.sujeeth.infosysinternproject.entity.Department;
import in.sujeeth.infosysinternproject.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToDepartmentDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto mapToDepartmentDto(Department department) {
        if (department == null) return null;
        return DepartmentDto.builder()
                .departmentId(department.getDepartmentId())
                .departmentName(department.getDepartmentName())
                .managerOfDepartment(department.getManagerOfDepartment())
                .build();
    }
}
