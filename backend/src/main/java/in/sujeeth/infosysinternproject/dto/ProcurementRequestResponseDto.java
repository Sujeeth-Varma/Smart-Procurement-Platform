package in.sujeeth.infosysinternproject.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProcurementRequestResponseDto {

    private Long requestId;
    private Long productId;
    private String productName;
    private String userName;
    private String userEmail;
    private String departmentName;
    private Integer requestedQuantity;
    private BigDecimal pricePerUnit;
    private BigDecimal totalPrice;
    private String categoryName;
    private String description;
    private ProductStatus status;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String message;
}
