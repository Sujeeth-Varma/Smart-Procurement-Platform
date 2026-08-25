package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.ProcurementRequestResponseDto;
import in.sujeeth.infosysinternproject.dto.ProductDto;
import in.sujeeth.infosysinternproject.dto.SupplierDto;
import in.sujeeth.infosysinternproject.dto.SupplierOrderStatusUpdateDto;
import in.sujeeth.infosysinternproject.entity.Payment;
import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.entity.RequestTracking;
import in.sujeeth.infosysinternproject.entity.Supplier;
import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import in.sujeeth.infosysinternproject.enums.Role;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProcurementRequestRepository procurementRequestRepository;
    private final RequestTrackingRepository requestTrackingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ProductService productService;

    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll()
                .stream()
                .map(this::mapToSupplierDto)
                .collect(Collectors.toList());
    }

    public List<SupplierDto> getSuppliersByProductId(Long productId) {
        return supplierRepository.findByProductsProductId(productId).stream()
                .map(this::mapToSupplierDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProcurementRequestResponseDto updateOrderStatus(Long requestId, SupplierOrderStatusUpdateDto dto, String supplierEmail) {
        log.info("Processing order status update by supplier: requestId={}, newStatus={}, supplierEmail={}",
                requestId, dto != null ? dto.getStatus() : null, supplierEmail);

        if (dto == null || dto.getStatus() == null) {
            throw new BadRequestException("Target status is required");
        }

        ProductStatus targetStatus = dto.getStatus();
        if (targetStatus != ProductStatus.ORDER_RECEIVED &&
            targetStatus != ProductStatus.ORDER_PACKED &&
            targetStatus != ProductStatus.ORDER_DISPATCHED &&
            targetStatus != ProductStatus.SHIPPED &&
            targetStatus != ProductStatus.OUT_FOR_DELIVERY &&
            targetStatus != ProductStatus.DELIVERED) {
            throw new BadRequestException("Invalid delivery status: " + targetStatus + ". Allowed statuses: ORDER_RECEIVED, ORDER_PACKED, ORDER_DISPATCHED, OUT_FOR_DELIVERY, DELIVERED");
        }

        ProcurementRequest req = procurementRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement request not found with ID: " + requestId));

        if (req.getStatus() == ProductStatus.PENDING_FOR_APPROVAL || req.getStatus() == ProductStatus.APPROVED || req.getStatus() == ProductStatus.CLOSED) {
            throw new BadRequestException("Order status cannot be updated before payment is completed by Admin");
        }

        if (req.getStatus() == ProductStatus.DELIVERED) {
            throw new BadRequestException("Order #" + requestId + " is already DELIVERED and finalized. No further status updates are allowed.");
        }

        if (req.getStatus() == targetStatus) {
            throw new BadRequestException("Order #" + requestId + " is already in status '" + targetStatus.name() + "'. Duplicate status update not allowed.");
        }

        Supplier supplier = null;
        if (supplierEmail != null && !supplierEmail.trim().isEmpty()) {
            supplier = supplierRepository.findByEmail(supplierEmail)
                    .orElseGet(() -> {
                        User u = userRepository.findByEmail(supplierEmail).orElse(null);
                        return u != null ? supplierRepository.findByUserUserId(u.getUserId()).orElse(null) : null;
                    });
        }

        if (supplier == null) {
            User actionUser = userRepository.findByEmail(supplierEmail).orElse(null);
            if (actionUser == null || actionUser.getRole() != Role.ADMIN) {
                throw new ResourceNotFoundException("Supplier account not found for authenticated email: " + supplierEmail);
            }
        }

        // Supplier Authorization Check: Ensure ONLY the designated supplier of this product/order can update status
        if (supplier != null) {
            Optional<Payment> paymentOpt = paymentRepository.findByProcurementRequestRequestId(requestId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                if (payment.getSupplier() != null && !payment.getSupplier().getSupplierId().equals(supplier.getSupplierId())) {
                    log.warn("Unauthorized order status update: Supplier '{}' (ID {}) attempted to update order ID {}, which is assigned to supplier '{}' (ID {})",
                            supplier.getName(), supplier.getSupplierId(), requestId, payment.getSupplier().getName(), payment.getSupplier().getSupplierId());
                    throw new BadRequestException("Unauthorized: Order #" + requestId + " is assigned to supplier '"
                            + payment.getSupplier().getName() + "'. You are not authorized to update this order.");
                }
            } else {
                boolean suppliesProduct = supplier.getProducts() != null && supplier.getProducts().stream()
                        .anyMatch(p -> p.getProductId().equals(req.getProduct().getProductId()));
                if (!suppliesProduct) {
                    log.warn("Unauthorized order status update: Supplier '{}' does not supply product '{}' for order ID {}",
                            supplier.getName(), req.getProduct().getName(), requestId);
                    throw new BadRequestException("Unauthorized: Supplier '" + supplier.getName()
                            + "' does not supply product '" + req.getProduct().getName() + "' for this order.");
                }
            }
        }

        req.setStatus(targetStatus);
        ProcurementRequest updated = procurementRequestRepository.save(req);

        String supplierNameStr = supplier != null ? supplier.getName() : "Supplier";
        String remarkText = "Order status updated to '" + targetStatus.name() + "' by Supplier '" + supplierNameStr + "'";
        if (dto.getRemarks() != null && !dto.getRemarks().trim().isEmpty()) {
            remarkText += ". Remarks: " + dto.getRemarks().trim();
        }

        RequestTracking tracking = RequestTracking.builder()
                .procurementRequest(updated)
                .product(updated.getProduct())
                .actionBy(supplier != null ? supplier.getUser() : null)
                .status(targetStatus)
                .remarks(remarkText)
                .actionTimestamp(LocalDateTime.now())
                .build();
        requestTrackingRepository.save(tracking);

        log.info("Order ID {} status successfully updated to {} by supplier {}", requestId, targetStatus, supplierEmail);

        // Broadcast notification email to both requesting User and all Admins
        List<User> adminUsers = userRepository.findByRole(Role.ADMIN);
        emailService.sendOrderStatusUpdateNotification(updated, targetStatus, dto.getRemarks(), adminUsers);

        return productService.mapProcurementRequestToDto(updated, "Order status updated to " + targetStatus + " successfully");
    }

    @Transactional
    public ProcurementRequestResponseDto shipOrder(Long requestId, String supplierEmail) {
        SupplierOrderStatusUpdateDto dto = SupplierOrderStatusUpdateDto.builder()
                .status(ProductStatus.ORDER_DISPATCHED)
                .remarks("Order shipped by Supplier")
                .build();
        return updateOrderStatus(requestId, dto, supplierEmail);
    }

    public List<ProcurementRequestResponseDto> getOrdersForSupplier(String supplierEmail) {
        log.info("Fetching orders for supplier email: {}", supplierEmail);
        Supplier supplier = null;
        if (supplierEmail != null && !supplierEmail.trim().isEmpty()) {
            supplier = supplierRepository.findByEmail(supplierEmail)
                    .orElseGet(() -> {
                        User u = userRepository.findByEmail(supplierEmail).orElse(null);
                        return u != null ? supplierRepository.findByUserUserId(u.getUserId()).orElse(null) : null;
                    });
        }

        List<Payment> payments;
        if (supplier != null) {
            payments = paymentRepository.findBySupplierSupplierIdOrderByTransactionDateDesc(supplier.getSupplierId());
        } else {
            payments = paymentRepository.findAll();
        }

        return payments.stream()
                .filter(p -> p.getProcurementRequest() != null)
                .map(p -> productService.mapProcurementRequestToDto(p.getProcurementRequest(), null))
                .collect(Collectors.toList());
    }

    public SupplierDto mapToSupplierDto(Supplier supplier) {
        if (supplier == null) return null;
        Long uId = supplier.getUser() != null ? supplier.getUser().getUserId() : null;

        List<ProductDto> mappedProducts = new ArrayList<>();
        if (supplier.getProducts() != null && !supplier.getProducts().isEmpty()) {
            mappedProducts = supplier.getProducts().stream()
                    .map(p -> productService.mapToProductDto(p, null))
                    .collect(Collectors.toList());
        }

        Long prodId = !mappedProducts.isEmpty() ? mappedProducts.get(0).getProductId() : null;
        String prodName = !mappedProducts.isEmpty() ? mappedProducts.get(0).getName() : null;

        return SupplierDto.builder()
                .supplierId(supplier.getSupplierId())
                .userId(uId)
                .productId(prodId)
                .productName(prodName)
                .products(mappedProducts)
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .email(supplier.getEmail())
                .accountNumber(supplier.getAccountNumber())
                .bankName(supplier.getBankName())
                .gstNumber(supplier.getGstNumber())
                .status(supplier.getStatus())
                .rating(supplier.getRating())
                .feedback(supplier.getFeedback())
                .build();
    }
}
