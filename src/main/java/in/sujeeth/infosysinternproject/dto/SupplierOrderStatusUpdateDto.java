package in.sujeeth.infosysinternproject.dto;

import in.sujeeth.infosysinternproject.enums.ProductStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierOrderStatusUpdateDto {

    @NotNull(message = "Status is required (ORDER_PACKED, ORDER_DISPATCHED, OUT_FOR_DELIVERY, or DELIVERED)")
    private ProductStatus status;

    private String remarks;
}
