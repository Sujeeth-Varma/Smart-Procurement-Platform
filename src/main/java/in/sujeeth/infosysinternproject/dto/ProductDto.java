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
public class ProductDto {

    private Long productId;
    private String name;
    private BigDecimal pricePerProduct;
    private BigDecimal totalPrice;
    private String categoryName;
    private CategoryDto category;
    private String description;
    private ProductStatus status;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String message;
}
