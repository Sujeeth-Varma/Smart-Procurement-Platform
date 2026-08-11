package in.sujeeth.infosysinternproject.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestockProductDto {

    @NotNull(message = "Quantity to add is required")
    @Min(value = 1, message = "Quantity to add must be at least 1")
    private Integer quantityToAdd;

    private String remarks;
}
