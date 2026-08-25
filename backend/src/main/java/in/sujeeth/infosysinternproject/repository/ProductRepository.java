package in.sujeeth.infosysinternproject.repository;

import in.sujeeth.infosysinternproject.entity.Product;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(ProductStatus status);
    Optional<Product> findFirstByNameIgnoreCaseAndStatus(String name, ProductStatus status);
}

