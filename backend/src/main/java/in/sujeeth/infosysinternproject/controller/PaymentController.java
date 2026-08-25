package in.sujeeth.infosysinternproject.controller;

import in.sujeeth.infosysinternproject.dto.PaymentResponseDto;
import in.sujeeth.infosysinternproject.dto.ProcessPaymentDto;
import in.sujeeth.infosysinternproject.service.PaymentService;
import in.sujeeth.infosysinternproject.util.PaymentCsvUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentCsvUtil paymentCsvUtil;

    @PostMapping("/payment/process")
    public ResponseEntity<PaymentResponseDto> processPayment(
            @Valid @RequestBody ProcessPaymentDto dto,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        log.info("REST request by admin '{}' to process dummy payment for procurement request ID {}",
                adminEmail, dto.getRequestId());
        PaymentResponseDto response = paymentService.processPayment(dto, adminEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment/history")
    public ResponseEntity<?> getAllPaymentHistory(
            @RequestParam(name = "exportCsv", required = false, defaultValue = "false") boolean exportCsv
    ) {
        log.info("REST request to fetch overall payment history (exportCsv={})", exportCsv);
        List<PaymentResponseDto> payments = paymentService.getAllPayments();

        if (exportCsv) {
            byte[] csvBytes = paymentCsvUtil.generatePaymentCsv(payments);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payment_history.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        }

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/payment/user")
    public ResponseEntity<?> getUserPaymentHistory(
            Authentication authentication,
            @RequestParam(name = "exportCsv", required = false, defaultValue = "false") boolean exportCsv
    ) {
        String userEmail = authentication.getName();
        log.info("REST request to fetch payment history for user: {} (exportCsv={})", userEmail, exportCsv);
        List<PaymentResponseDto> payments = paymentService.getPaymentsForUser(userEmail);

        if (exportCsv) {
            byte[] csvBytes = paymentCsvUtil.generatePaymentCsv(payments);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"user_payment_history.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        }

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/payment/request/{requestId}")
    public ResponseEntity<PaymentResponseDto> getPaymentByRequestId(@PathVariable("requestId") Long requestId) {
        log.info("REST request to fetch payment details for request ID {}", requestId);
        return ResponseEntity.ok(paymentService.getPaymentByRequestId(requestId));
    }
}
