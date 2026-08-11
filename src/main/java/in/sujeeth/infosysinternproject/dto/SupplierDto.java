package in.sujeeth.infosysinternproject.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDto {

    private Long supplierId;
    private Long userId;
    private Long productId;
    private String productName;
    private String name;
    private String phone;
    private String address;
    private String email;
    private String gstNumber;
    private String status;
    private Double rating;
    private String feedback;
}
