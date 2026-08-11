package in.sujeeth.infosysinternproject.repository;

import in.sujeeth.infosysinternproject.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByProductProductId(Long productId);
    Optional<Supplier> findByEmail(String email);
    Optional<Supplier> findByUserUserId(Long userId);
}

