package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.ProductRatingSummaryDto;
import in.sujeeth.infosysinternproject.dto.ProductReviewRequestDto;
import in.sujeeth.infosysinternproject.dto.ProductReviewResponseDto;
import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.entity.Product;
import in.sujeeth.infosysinternproject.entity.ProductReview;
import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import in.sujeeth.infosysinternproject.exception.BadRequestException;
import in.sujeeth.infosysinternproject.exception.ResourceNotFoundException;
import in.sujeeth.infosysinternproject.repository.ProcurementRequestRepository;
import in.sujeeth.infosysinternproject.repository.ProductRepository;
import in.sujeeth.infosysinternproject.repository.ProductReviewRepository;
import in.sujeeth.infosysinternproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProcurementRequestRepository procurementRequestRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProductReviewResponseDto submitReview(ProductReviewRequestDto dto, String userEmail) {
        log.info("Processing product review submission for requestId={}, userEmail={}", dto.getRequestId(), userEmail);

        if (dto.getRequestId() == null) {
            throw new BadRequestException("Request ID is required to submit a review");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        ProcurementRequest req = procurementRequestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Procurement request not found with ID: " + dto.getRequestId()));

        // Verification 1: Ensure user rating their own raised request
        if (!req.getUser().getUserId().equals(user.getUserId())) {
            log.warn("Unauthorized review attempt: User '{}' (ID {}) attempted to rate request ID {}, owned by user ID {}",
                    userEmail, user.getUserId(), dto.getRequestId(), req.getUser().getUserId());
            throw new BadRequestException("Unauthorized: You can only submit a product review for your own procurement requests.");
        }

        // Verification 2: Ensure order status is DELIVERED
        if (req.getStatus() != ProductStatus.DELIVERED) {
            log.warn("Review submission rejected: Request ID {} current status is '{}' (must be DELIVERED)",
                    dto.getRequestId(), req.getStatus());
            throw new BadRequestException("Product review can only be submitted after the item has been DELIVERED. Current status: " + req.getStatus());
        }

        // Verification 3: Ensure single rating per request ID
        if (productReviewRepository.existsByProcurementRequestRequestId(dto.getRequestId())) {
            log.warn("Duplicate review attempt: Review already exists for request ID {}", dto.getRequestId());
            throw new BadRequestException("A review has already been submitted for procurement request ID: " + dto.getRequestId());
        }

        ProductReview review = ProductReview.builder()
                .procurementRequest(req)
                .product(req.getProduct())
                .user(user)
                .rating(dto.getRating())
                .feedback(dto.getFeedback() != null ? dto.getFeedback().trim() : null)
                .createdDate(LocalDateTime.now())
                .build();

        ProductReview saved = productReviewRepository.save(review);
        log.info("Product review ID {} successfully submitted for request ID {}", saved.getReviewId(), dto.getRequestId());

        return mapToResponseDto(saved, "Product review submitted successfully");
    }

    public ProductReviewResponseDto getReviewByRequestId(Long requestId) {
        log.info("Fetching review for procurement request ID: {}", requestId);
        ProductReview review = productReviewRepository.findByProcurementRequestRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("No review found for request ID: " + requestId));
        return mapToResponseDto(review, "Product review retrieved successfully");
    }

    public List<ProductReviewResponseDto> getReviewsByProductId(Long productId) {
        log.info("Fetching reviews for product ID: {}", productId);
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with ID: " + productId);
        }
        return productReviewRepository.findByProductProductIdOrderByCreatedDateDesc(productId)
                .stream()
                .map(r -> mapToResponseDto(r, null))
                .collect(Collectors.toList());
    }

    public ProductRatingSummaryDto getProductRatingSummary(Long productId) {
        log.info("Fetching rating summary for product ID: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        List<ProductReviewResponseDto> reviews = getReviewsByProductId(productId);
        Double rawAvg = productReviewRepository.findAverageRatingByProductId(productId);
        Double avgRating = rawAvg != null ? Math.round(rawAvg * 100.0) / 100.0 : 0.0;

        return ProductRatingSummaryDto.builder()
                .productId(product.getProductId())
                .productName(product.getName())
                .averageRating(avgRating)
                .totalReviews((long) reviews.size())
                .reviews(reviews)
                .build();
    }

    public ProductReviewResponseDto mapToResponseDto(ProductReview review, String message) {
        if (review == null) return null;

        return ProductReviewResponseDto.builder()
                .reviewId(review.getReviewId())
                .requestId(review.getProcurementRequest() != null ? review.getProcurementRequest().getRequestId() : null)
                .productId(review.getProduct() != null ? review.getProduct().getProductId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .userId(review.getUser() != null ? review.getUser().getUserId() : null)
                .userName(review.getUser() != null ? review.getUser().getName() : null)
                .rating(review.getRating())
                .feedback(review.getFeedback())
                .createdDate(review.getCreatedDate())
                .message(message)
                .build();
    }
}
