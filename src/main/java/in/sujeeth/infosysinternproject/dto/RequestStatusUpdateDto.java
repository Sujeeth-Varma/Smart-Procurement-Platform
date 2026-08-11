package in.sujeeth.infosysinternproject.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestStatusUpdateDto {

    private Long requestId;

    @NotBlank(message = "Status is required (approve/reject)")
    private String status;
}
