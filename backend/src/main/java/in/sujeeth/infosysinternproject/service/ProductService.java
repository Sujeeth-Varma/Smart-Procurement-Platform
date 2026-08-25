package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.*;
import in.sujeeth.infosysinternproject.entity.Category;
import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.entity.Product;
import in.sujeeth.infosysinternproject.entity.RequestTracking;
import in.sujeeth.infosysinternproject.entity.Supplier;
import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import in.sujeeth.infosysinternproject.enums.RequestAction;
import in.sujeeth.infosysinternproject.enums.Role;
import in.sujeeth.infosysinternproject.exception.BadRequestException;
import in.sujeeth.infosysinternproject.exception.ResourceNotFoundException;
import in.sujeeth.infosysinternproject.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProcurementRequestRepository procurementRequestRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final RequestTrackingRepository requestTrackingRepository;
    private final SupplierRepository supplierRepository;
    private final AuthService authService;
    private final DepartmentService departmentService;
    private final CategoryService categoryService;
    private final EmailService emailService;

    @Transactional
    public ProcurementRequestResponseDto raiseProductRequest(RaiseProductRequestDto dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Product catalogItem = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product catalog item not found with ID: " + dto.getProductId()));

        if (dto.getNumberOfQuantities() == null || dto.getNumberOfQuantities() < 1) {
            throw new BadRequestException("Number of quantities must be at least 1");
        }

        String requestDesc = (dto.getDescription() != null && !dto.getDescription().trim().isEmpty())
                ? dto.getDescription()
                : catalogItem.getDescription();

        BigDecimal pricePerUnit = catalogItem.getPricePerProduct();
        BigDecimal totalPrice = pricePerUnit.multiply(BigDecimal.valueOf(dto.getNumberOfQuantities()));

        ProcurementRequest req = ProcurementRequest.builder()
                .product(catalogItem)
                .user(user)
                .department(user.getDepartment())
                .requestedQuantity(dto.getNumberOfQuantities())
                .pricePerUnit(pricePerUnit)
                .totalPrice(totalPrice)
                .description(requestDesc)
                .status(ProductStatus.PENDING_FOR_APPROVAL)
                .createdDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .build();

        ProcurementRequest saved = procurementRequestRepository.save(req);

        // Audit Trail Log
        createTrackingRecordForRequest(saved, user, ProductStatus.PENDING_FOR_APPROVAL, "Procurement request submitted");

        // Send Email Notifications to User and Admins
        List<User> adminUsers = userRepository.findByRole(Role.ADMIN);
        emailService.sendNewRequestNotification(saved, adminUsers);

        return mapProcurementRequestToDto(saved, "Procurement request raised successfully");
    }

    public ProcurementRequestResponseDto getRequestById(Long requestId) {
        ProcurementRequest req = procurementRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement request not found with ID: " + requestId));
        return mapProcurementRequestToDto(req, "Procurement request status fetched successfully");
    }

    public List<ProcurementRequestResponseDto> getPendingProducts() {
        return procurementRequestRepository.findByStatus(ProductStatus.PENDING_FOR_APPROVAL)
                .stream()
                .map(req -> mapProcurementRequestToDto(req, null))
                .collect(Collectors.toList());
    }

    public List<ProductDto> getActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE)
                .stream()
                .map(prod -> mapToActiveProductDto(prod, null))
                .collect(Collectors.toList());
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(prod -> mapToProductDto(prod, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProcurementRequestResponseDto updateRequestStatus(Long requestId, RequestAction action, String adminEmail) {
        if (action == null) {
            throw new BadRequestException("Status action is required (APPROVE/REJECT)");
        }
        if (action == RequestAction.APPROVE) {
            return approveProduct(requestId, adminEmail);
        } else if (action == RequestAction.REJECT) {
            return rejectProduct(requestId, adminEmail);
        } else {
            throw new BadRequestException("Invalid status action: " + action);
        }
    }

    @Transactional
    public ProcurementRequestResponseDto approveProduct(Long requestId, String adminEmail) {
        log.info("Processing procurement request approval: requestId={}, adminEmail={}", requestId, adminEmail);
        ProcurementRequest req = procurementRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement request not found with ID: " + requestId));

        if (req.getStatus() == ProductStatus.APPROVED || req.getStatus() == ProductStatus.PAYMENT_COMPLETED || req.getStatus() == ProductStatus.SHIPPED || req.getStatus() == ProductStatus.ACTIVE) {
            log.warn("Approval failed: Procurement request ID {} is already approved (status={})", requestId, req.getStatus());
            throw new BadRequestException("Product request is already approved");
        }
        if (req.getStatus() == ProductStatus.CLOSED) {
            log.warn("Approval failed: Procurement request ID {} is already CLOSED", requestId);
            throw new BadRequestException("Cannot approve a closed/rejected product request");
        }

        User adminUser = userRepository.findByEmail(adminEmail).orElse(null);
        req.setStatus(ProductStatus.APPROVED);
        ProcurementRequest updated = procurementRequestRepository.save(req);

        createTrackingRecordForRequest(updated, adminUser, ProductStatus.APPROVED,
                "Request approved by Admin. Pending payment processing.");

        log.info("Procurement request ID {} successfully approved by admin '{}'. Status updated to APPROVED (Pending Payment).",
                requestId, adminEmail);

        // Send Email Notification to User for Request Approval
        emailService.sendRequestApprovedNotification(updated);

        return mapProcurementRequestToDto(updated, "Request approved successfully. Pending payment to supplier.");
    }

    @Transactional
    public ProcurementRequestResponseDto rejectProduct(Long requestId, String adminEmail) {
        log.info("Processing procurement request rejection: requestId={}, adminEmail={}", requestId, adminEmail);
        ProcurementRequest req = procurementRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement request not found with ID: " + requestId));

        if (req.getStatus() == ProductStatus.CLOSED) {
            log.warn("Rejection failed: Procurement request ID {} is already CLOSED", requestId);
            throw new BadRequestException("Product request is already closed/rejected and cannot be rejected again");
        }
        if (req.getStatus() == ProductStatus.ACTIVE) {
            log.warn("Rejection failed: Procurement request ID {} is already ACTIVE", requestId);
            throw new BadRequestException("Cannot reject an already approved product request");
        }

        User adminUser = userRepository.findByEmail(adminEmail).orElse(null);
        req.setStatus(ProductStatus.CLOSED);
        ProcurementRequest updated = procurementRequestRepository.save(req);

        createTrackingRecordForRequest(updated, adminUser, ProductStatus.CLOSED, "Request rejected by Admin");

        log.info("Procurement request ID {} successfully rejected by admin '{}'", requestId, adminEmail);

        // Send Email Notification to User for Request Rejection
        emailService.sendRequestRejectedNotification(updated);

        return mapProcurementRequestToDto(updated, "Request rejected successfully");
    }

    @Transactional
    public ProductDto restockProductBySupplier(Long productId, RestockProductDto dto, String actionUserEmail) {
        log.info("Processing supplier product restock: productId={}, userEmail={}", productId, actionUserEmail);
        if (actionUserEmail == null) {
            throw new BadRequestException("Authenticated user email is required");
        }

        Supplier supplier = supplierRepository.findByEmail(actionUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found for logged in user: " + actionUserEmail));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (product.getStatus() == ProductStatus.CLOSED) {
            product.setStatus(ProductStatus.ACTIVE);
            log.info("Product ID {} ('{}') status changed from CLOSED to ACTIVE by supplier restock", productId, product.getName());
        }

        Product updated = productRepository.save(product);

        User actionUser = userRepository.findByEmail(actionUserEmail).orElse(null);
        String remarkText = "Product supply activated/replenished by Supplier '" + supplier.getName() + "'";
        if (dto.getRemarks() != null && !dto.getRemarks().trim().isEmpty()) {
            remarkText += ". Remarks: " + dto.getRemarks();
        }

        createTrackingRecord(updated, actionUser, updated.getStatus(), remarkText);
        log.info("Product ID {} restocked/activated successfully by supplier {}", productId, supplier.getName());

        return mapToActiveProductDto(updated, "Product activated/replenished successfully by supplier");
    }

    @Transactional
    public ApiResponse deleteProduct(Long requestId) {
        log.info("Processing delete request for ID {}", requestId);
        if (procurementRequestRepository.existsById(requestId)) {
            procurementRequestRepository.deleteById(requestId);
            log.info("Procurement request ID {} deleted successfully", requestId);
            return new ApiResponse("Request deleted successfully", true);
        }
        Product product = productRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request or Product not found with ID: " + requestId));

        // Soft-delete / deactivate product by updating status to CLOSED
        product.setStatus(ProductStatus.CLOSED);
        productRepository.save(product);
        log.info("Product ID {} ('{}') status updated to CLOSED (deleted from active catalog)",
                product.getProductId(), product.getName());
        return new ApiResponse("Product deleted successfully", true);
    }

    public List<RequestTrackingDto> getRequestTrackingHistory(Long requestId) {
        List<RequestTracking> trackingList = requestTrackingRepository.findByProcurementRequestRequestIdOrderByActionTimestampAsc(requestId);
        if (!trackingList.isEmpty()) {
            return trackingList.stream().map(this::mapToTrackingDto).collect(Collectors.toList());
        }

        if (!productRepository.existsById(requestId) && !procurementRequestRepository.existsById(requestId)) {
            throw new ResourceNotFoundException("Request not found with ID: " + requestId);
        }

        return requestTrackingRepository.findByProductProductIdOrderByActionTimestampAsc(requestId)
                .stream()
                .map(this::mapToTrackingDto)
                .collect(Collectors.toList());
    }

    private void createTrackingRecord(Product product, User actionBy, ProductStatus status, String remarks) {
        RequestTracking tracking = RequestTracking.builder()
                .product(product)
                .actionBy(actionBy)
                .status(status)
                .remarks(remarks)
                .actionTimestamp(LocalDateTime.now())
                .build();
        requestTrackingRepository.save(tracking);
    }

    private void createTrackingRecordForRequest(ProcurementRequest req, User actionBy, ProductStatus status, String remarks) {
        RequestTracking tracking = RequestTracking.builder()
                .procurementRequest(req)
                .product(req.getProduct())
                .actionBy(actionBy)
                .status(status)
                .remarks(remarks)
                .actionTimestamp(LocalDateTime.now())
                .build();
        requestTrackingRepository.save(tracking);
    }

    private RequestTrackingDto mapToTrackingDto(RequestTracking tracking) {
        Long prodId = tracking.getProduct() != null ? tracking.getProduct().getProductId()
                : (tracking.getProcurementRequest() != null ? tracking.getProcurementRequest().getProduct().getProductId() : null);
        String prodName = tracking.getProduct() != null ? tracking.getProduct().getName()
                : (tracking.getProcurementRequest() != null ? tracking.getProcurementRequest().getProduct().getName() : null);

        return RequestTrackingDto.builder()
                .trackingId(tracking.getTrackingId())
                .productId(prodId)
                .productName(prodName)
                .actionBy(tracking.getActionBy() != null ? authService.mapToUserDto(tracking.getActionBy()) : null)
                .status(tracking.getStatus())
                .remarks(tracking.getRemarks())
                .actionTimestamp(tracking.getActionTimestamp())
                .build();
    }

    public ProcurementRequestResponseDto mapProcurementRequestToDto(ProcurementRequest req, String message) {
        if (req == null) return null;

        String catName = (req.getProduct() != null && req.getProduct().getCategory() != null)
                ? req.getProduct().getCategory().getCategoryName() : null;

        return ProcurementRequestResponseDto.builder()
                .requestId(req.getRequestId())
                .productId(req.getProduct() != null ? req.getProduct().getProductId() : null)
                .productName(req.getProduct() != null ? req.getProduct().getName() : null)
                .userName(req.getUser() != null ? req.getUser().getName() : null)
                .userEmail(req.getUser() != null ? req.getUser().getEmail() : null)
                .departmentName(req.getDepartment() != null ? req.getDepartment().getDepartmentName() : null)
                .requestedQuantity(req.getRequestedQuantity())
                .pricePerUnit(req.getPricePerUnit())
                .totalPrice(req.getTotalPrice())
                .categoryName(catName)
                .description(req.getDescription())
                .status(req.getStatus())
                .createdDate(req.getCreatedDate())
                .updatedDate(req.getUpdatedDate())
                .message(message)
                .build();
    }

    public ProductDto mapToProductDto(Product product, String message) {
        if (product == null) return null;

        String catName = product.getCategory() != null ? product.getCategory().getCategoryName() : null;

        return ProductDto.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .pricePerProduct(product.getPricePerProduct())
                .categoryName(catName)
                .description(product.getDescription())
                .status(product.getStatus())
                .createdDate(product.getCreatedDate())
                .updatedDate(product.getUpdatedDate())
                .message(message)
                .build();
    }

    public ProductDto mapToActiveProductDto(Product product, String message) {
        if (product == null) return null;

        String catName = product.getCategory() != null ? product.getCategory().getCategoryName() : null;

        return ProductDto.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .pricePerProduct(product.getPricePerProduct())
                .categoryName(catName)
                .description(product.getDescription())
                .status(product.getStatus())
                .createdDate(product.getCreatedDate())
                .updatedDate(product.getUpdatedDate())
                .message(message)
                .build();
    }
}

