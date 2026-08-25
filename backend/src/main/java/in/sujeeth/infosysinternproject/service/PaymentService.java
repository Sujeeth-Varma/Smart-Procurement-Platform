package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.PaymentResponseDto;
import in.sujeeth.infosysinternproject.dto.ProcessPaymentDto;
import in.sujeeth.infosysinternproject.entity.Payment;
import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.entity.RequestTracking;
import in.sujeeth.infosysinternproject.entity.Supplier;
import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import in.sujeeth.infosysinternproject.exception.BadRequestException;
import in.sujeeth.infosysinternproject.exception.ResourceNotFoundException;
import in.sujeeth.infosysinternproject.repository.PaymentRepository;
import in.sujeeth.infosysinternproject.repository.ProcurementRequestRepository;
import in.sujeeth.infosysinternproject.repository.RequestTrackingRepository;
import in.sujeeth.infosysinternproject.repository.SupplierRepository;
import in.sujeeth.infosysinternproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ProcurementRequestRepository procurementRequestRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final RequestTrackingRepository requestTrackingRepository;
    private final EmailService emailService;

    @Transactional
    public PaymentResponseDto processPayment(ProcessPaymentDto dto, String adminEmail) {
        log.info("Processing payment: requestId={}, supplierId={}, adminEmail={}",
                dto.getRequestId(), dto.getSupplierId(), adminEmail);

        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with email: " + adminEmail));

        ProcurementRequest req = procurementRequestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Procurement request not found with ID: " + dto.getRequestId()));

        if (req.getStatus() != ProductStatus.APPROVED && req.getStatus() != ProductStatus.ACTIVE) {
            log.warn("Payment failed: Procurement request ID {} is not in APPROVED status (current status: {})",
                    dto.getRequestId(), req.getStatus());
            throw new BadRequestException("Payment can only be processed for requests with APPROVED status");
        }

        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + dto.getSupplierId()));

        // Calculate amount to pay
        BigDecimal totalAmount = req.getTotalPrice() != null
                ? req.getTotalPrice()
                : (req.getPricePerUnit() != null ? req.getPricePerUnit().multiply(BigDecimal.valueOf(req.getRequestedQuantity())) : BigDecimal.ZERO);

        String supplierAccount = (supplier.getAccountNumber() != null && !supplier.getAccountNumber().trim().isEmpty())
                ? supplier.getAccountNumber().trim()
                : "ACC-DEFAULT-SUPPLIER-" + supplier.getSupplierId();

        // Create Payment record storing full card details as requested
        Payment payment = Payment.builder()
                .procurementRequest(req)
                .adminUser(adminUser)
                .requestUser(req.getUser())
                .supplier(supplier)
                .amount(totalAmount)
                .accountNumber(supplierAccount)
                .cardNumber(dto.getCardNumber().trim())
                .cardHolderName(dto.getCardHolderName().trim())
                .paymentStatus("SUCCESS")
                .transactionDate(LocalDateTime.now())
                .remarks(dto.getRemarks() != null ? dto.getRemarks() : "Payment completed by Admin to Supplier " + supplier.getName())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Update procurement request status to PAYMENT_COMPLETED
        req.setStatus(ProductStatus.PAYMENT_COMPLETED);
        ProcurementRequest updatedReq = procurementRequestRepository.save(req);

        // Create Audit tracking record
        RequestTracking tracking = RequestTracking.builder()
                .procurementRequest(updatedReq)
                .product(updatedReq.getProduct())
                .actionBy(adminUser)
                .status(ProductStatus.PAYMENT_COMPLETED)
                .remarks("Payment of ₹" + totalAmount + " successfully transferred to Supplier '" + supplier.getName()
                        + "' (Account: " + supplierAccount + "). Awaiting supplier shipping.")
                .actionTimestamp(LocalDateTime.now())
                .build();
        requestTrackingRepository.save(tracking);

        log.info("Payment ID {} successfully completed for request ID {}. Amount ₹{} credited to supplier account {}",
                savedPayment.getPaymentId(), req.getRequestId(), totalAmount, supplierAccount);

        // Trigger email notification to Supplier
        emailService.sendPaymentCompletedSupplierNotification(updatedReq, savedPayment);

        return mapToPaymentResponseDto(savedPayment, "Payment processed successfully. Supplier notified via email.");
    }

    public List<PaymentResponseDto> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(p -> mapToPaymentResponseDto(p, null))
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDto> getPaymentsForUser(String userEmail) {
        return paymentRepository.findByRequestUserEmailOrderByTransactionDateDesc(userEmail)
                .stream()
                .map(p -> mapToPaymentResponseDto(p, null))
                .collect(Collectors.toList());
    }

    public PaymentResponseDto getPaymentByRequestId(Long requestId) {
        Payment payment = paymentRepository.findByProcurementRequestRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment record found for procurement request ID: " + requestId));
        return mapToPaymentResponseDto(payment, "Payment details fetched successfully");
    }

    public PaymentResponseDto mapToPaymentResponseDto(Payment payment, String message) {
        if (payment == null) return null;

        ProcurementRequest req = payment.getProcurementRequest();
        String prodName = req != null && req.getProduct() != null ? req.getProduct().getName() : null;

        return PaymentResponseDto.builder()
                .paymentId(payment.getPaymentId())
                .requestId(req != null ? req.getRequestId() : null)
                .productName(prodName)
                .adminUserId(payment.getAdminUser() != null ? payment.getAdminUser().getUserId() : null)
                .adminEmail(payment.getAdminUser() != null ? payment.getAdminUser().getEmail() : null)
                .adminName(payment.getAdminUser() != null ? payment.getAdminUser().getName() : null)
                .requestUserId(payment.getRequestUser() != null ? payment.getRequestUser().getUserId() : null)
                .requestUserEmail(payment.getRequestUser() != null ? payment.getRequestUser().getEmail() : null)
                .requestUserName(payment.getRequestUser() != null ? payment.getRequestUser().getName() : null)
                .supplierId(payment.getSupplier() != null ? payment.getSupplier().getSupplierId() : null)
                .supplierName(payment.getSupplier() != null ? payment.getSupplier().getName() : null)
                .supplierAccountNumber(payment.getAccountNumber())
                .amount(payment.getAmount())
                .cardNumber(payment.getCardNumber())
                .cardHolderName(payment.getCardHolderName())
                .paymentStatus(payment.getPaymentStatus())
                .transactionDate(payment.getTransactionDate())
                .remarks(payment.getRemarks())
                .message(message)
                .build();
    }
}
