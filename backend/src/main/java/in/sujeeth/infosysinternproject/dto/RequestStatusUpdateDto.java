package in.sujeeth.infosysinternproject.dto;

import in.sujeeth.infosysinternproject.enums.RequestAction;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestStatusUpdateDto {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotNull(message = "Status action is required (APPROVE or REJECT)")
    private RequestAction status;
}
