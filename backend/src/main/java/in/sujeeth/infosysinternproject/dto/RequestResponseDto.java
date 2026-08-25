package in.sujeeth.infosysinternproject.dto;

import in.sujeeth.infosysinternproject.enums.RequestStatus;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestResponseDto {

    private Long requestId;
    private UserDto employee;
    private ProductDto product;
    private String departmentName;
    private Integer quantity;
    private BigDecimal totalPrice;
    private RequestStatus status;
    private String message;
}
