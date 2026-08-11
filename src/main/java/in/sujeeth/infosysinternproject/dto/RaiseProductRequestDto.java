package in.sujeeth.infosysinternproject.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaiseProductRequestDto {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Number of quantities is required")
    @Min(value = 1, message = "Quantities must be at least 1")
    private Integer numberOfQuantities;

    private String description;
}

