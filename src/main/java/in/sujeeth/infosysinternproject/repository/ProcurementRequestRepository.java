package in.sujeeth.infosysinternproject.repository;

import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcurementRequestRepository extends JpaRepository<ProcurementRequest, Long> {
    List<ProcurementRequest> findByStatus(ProductStatus status);
    List<ProcurementRequest> findByUserUserId(Long userId);
    List<ProcurementRequest> findByDepartmentDepartmentId(Long departmentId);
}
