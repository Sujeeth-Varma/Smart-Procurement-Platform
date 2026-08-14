package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.ProcurementRequestResponseDto;
import in.sujeeth.infosysinternproject.dto.ProductDto;
import in.sujeeth.infosysinternproject.dto.SupplierDto;
import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.entity.RequestTracking;
import in.sujeeth.infosysinternproject.entity.Supplier;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import in.sujeeth.infosysinternproject.exception.BadRequestException;
import in.sujeeth.infosysinternproject.exception.ResourceNotFoundException;
import in.sujeeth.infosysinternproject.repository.ProcurementRequestRepository;
import in.sujeeth.infosysinternproject.repository.RequestTrackingRepository;
import in.sujeeth.infosysinternproject.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProcurementRequestRepository procurementRequestRepository;
    private final RequestTrackingRepository requestTrackingRepository;
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
    public ProcurementRequestResponseDto shipOrder(Long requestId, String supplierEmail) {
        log.info("Processing order shipping by supplier: requestId={}, supplierEmail={}", requestId, supplierEmail);
        ProcurementRequest req = procurementRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement request not found with ID: " + requestId));

        if (req.getStatus() != ProductStatus.PAYMENT_COMPLETED) {
            log.warn("Shipping failed: Request ID {} is in status {}, expected PAYMENT_COMPLETED", requestId, req.getStatus());
            throw new BadRequestException("Order can only be shipped after payment has been completed by Admin");
        }

        Supplier supplier = null;
        if (supplierEmail != null && !supplierEmail.trim().isEmpty()) {
            supplier = supplierRepository.findByEmail(supplierEmail).orElse(null);
        }

        req.setStatus(ProductStatus.SHIPPED);
        ProcurementRequest updated = procurementRequestRepository.save(req);

        String remarkStr = supplier != null
                ? "Order approved and shipped by Supplier '" + supplier.getName() + "'"
                : "Order approved and shipped by Supplier";

        RequestTracking tracking = RequestTracking.builder()
                .procurementRequest(updated)
                .product(updated.getProduct())
                .actionBy(supplier != null ? supplier.getUser() : null)
                .status(ProductStatus.SHIPPED)
                .remarks(remarkStr)
                .actionTimestamp(LocalDateTime.now())
                .build();
        requestTrackingRepository.save(tracking);

        log.info("Order ID {} successfully marked as SHIPPED by supplier", requestId);

        // Notify user that order has shipped
        emailService.sendOrderShippedUserNotification(updated);

        return productService.mapProcurementRequestToDto(updated, "Order shipped successfully by supplier");
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
