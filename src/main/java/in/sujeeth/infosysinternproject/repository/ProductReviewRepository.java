package in.sujeeth.infosysinternproject.repository;

import in.sujeeth.infosysinternproject.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    Optional<ProductReview> findByProcurementRequestRequestId(Long requestId);

    boolean existsByProcurementRequestRequestId(Long requestId);

    List<ProductReview> findByProductProductIdOrderByCreatedDateDesc(Long productId);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.productId = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);
}
