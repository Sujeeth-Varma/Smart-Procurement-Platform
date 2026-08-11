package in.sujeeth.infosysinternproject.repository;

import in.sujeeth.infosysinternproject.entity.ApprovalHierarchy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalHierarchyRepository extends JpaRepository<ApprovalHierarchy, Long> {
    List<ApprovalHierarchy> findByDepartmentDepartmentId(Long departmentId);
}
