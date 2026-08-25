package in.sujeeth.infosysinternproject.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRatingSummaryDto {

    private Long productId;
    private String productName;
    private Double averageRating;
    private Long totalReviews;
    private List<ProductReviewResponseDto> reviews;
}
