package in.sujeeth.infosysinternproject.dto;

import in.sujeeth.infosysinternproject.enums.ProductStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestTrackingDto {

    private Long trackingId;
    private Long productId;
    private String productName;
    private UserDto actionBy;
    private ProductStatus status;
    private String remarks;
    private LocalDateTime actionTimestamp;
}
