package in.sujeeth.infosysinternproject.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewResponseDto {

    private Long reviewId;
    private Long requestId;
    private Long productId;
    private String productName;
    private Long userId;
    private String userName;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdDate;
    private String message;
}
