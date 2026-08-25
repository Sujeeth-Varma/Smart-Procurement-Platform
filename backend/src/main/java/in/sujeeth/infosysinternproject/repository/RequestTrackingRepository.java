package in.sujeeth.infosysinternproject.repository;

import in.sujeeth.infosysinternproject.entity.RequestTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestTrackingRepository extends JpaRepository<RequestTracking, Long> {
    List<RequestTracking> findByProductProductIdOrderByActionTimestampAsc(Long productId);
    List<RequestTracking> findByProcurementRequestRequestIdOrderByActionTimestampAsc(Long requestId);
}

