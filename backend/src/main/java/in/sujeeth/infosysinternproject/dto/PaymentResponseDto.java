package in.sujeeth.infosysinternproject.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDto {

    private Long paymentId;
    private Long requestId;
    private String productName;
    private Long adminUserId;
    private String adminEmail;
    private String adminName;
    private Long requestUserId;
    private String requestUserEmail;
    private String requestUserName;
    private Long supplierId;
    private String supplierName;
    private String supplierAccountNumber;
    private BigDecimal amount;
    private String cardNumber;
    private String cardHolderName;
    private String paymentStatus;
    private LocalDateTime transactionDate;
    private String remarks;
    private String message;
}
