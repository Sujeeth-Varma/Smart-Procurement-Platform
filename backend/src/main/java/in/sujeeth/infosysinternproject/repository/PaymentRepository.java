package in.sujeeth.infosysinternproject.repository;

import in.sujeeth.infosysinternproject.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByRequestUserUserIdOrderByTransactionDateDesc(Long userId);

    List<Payment> findByRequestUserEmailOrderByTransactionDateDesc(String email);

    List<Payment> findByAdminUserUserIdOrderByTransactionDateDesc(Long adminId);

    Optional<Payment> findByProcurementRequestRequestId(Long requestId);
}
