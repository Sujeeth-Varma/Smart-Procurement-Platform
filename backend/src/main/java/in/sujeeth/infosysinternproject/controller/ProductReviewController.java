package in.sujeeth.infosysinternproject.controller;

import in.sujeeth.infosysinternproject.dto.ProductRatingSummaryDto;
import in.sujeeth.infosysinternproject.dto.ProductReviewRequestDto;
import in.sujeeth.infosysinternproject.dto.ProductReviewResponseDto;
import in.sujeeth.infosysinternproject.service.ProductReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    @PostMapping
    public ResponseEntity<ProductReviewResponseDto> submitReview(
            @Valid @RequestBody ProductReviewRequestDto dto,
            Authentication authentication
    ) {
        String email = authentication.getName();
        log.info("REST request to submit product review for requestId={}, user={}", dto.getRequestId(), email);
        ProductReviewResponseDto response = productReviewService.submitReview(dto, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<ProductReviewResponseDto> getReviewByRequestId(
            @PathVariable("requestId") Long requestId
    ) {
        log.info("REST request to get product review for request ID: {}", requestId);
        return ResponseEntity.ok(productReviewService.getReviewByRequestId(requestId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductReviewResponseDto>> getReviewsByProductId(
            @PathVariable("productId") Long productId
    ) {
        log.info("REST request to get all product reviews for product ID: {}", productId);
        return ResponseEntity.ok(productReviewService.getReviewsByProductId(productId));
    }

    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<ProductRatingSummaryDto> getProductRatingSummary(
            @PathVariable("productId") Long productId
    ) {
        log.info("REST request to get product rating summary for product ID: {}", productId);
        return ResponseEntity.ok(productReviewService.getProductRatingSummary(productId));
    }
}
