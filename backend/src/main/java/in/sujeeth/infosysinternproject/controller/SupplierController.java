package in.sujeeth.infosysinternproject.controller;

import in.sujeeth.infosysinternproject.dto.ProcurementRequestResponseDto;
import in.sujeeth.infosysinternproject.dto.ProductDto;
import in.sujeeth.infosysinternproject.dto.RestockProductDto;
import in.sujeeth.infosysinternproject.dto.SupplierOrderStatusUpdateDto;
import in.sujeeth.infosysinternproject.dto.SupplierDto;
import in.sujeeth.infosysinternproject.service.ProductService;
import in.sujeeth.infosysinternproject.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final ProductService productService;

    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierDto>> getAllSuppliers() {
        log.info("REST request to get all suppliers");
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/suppliers/product/{productId}")
    public ResponseEntity<List<SupplierDto>> getSuppliersByProductId(@PathVariable("productId") Long productId) {
        log.info("REST request to get suppliers for product ID: {}", productId);
        return ResponseEntity.ok(supplierService.getSuppliersByProductId(productId));
    }

    @PostMapping("/suppliers/products/{productId}/restock")
    public ResponseEntity<ProductDto> restockProduct(
            @PathVariable("productId") Long productId,
            @Valid @RequestBody RestockProductDto dto,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("REST request to restock product ID: {}, by user: {}", productId, email);
        ProductDto response = productService.restockProductBySupplier(productId, dto, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suppliers/orders")
    public ResponseEntity<List<ProcurementRequestResponseDto>> getSupplierOrders(Authentication authentication) {
        String supplierEmail = authentication != null ? authentication.getName() : null;
        log.info("REST request to get assigned orders for supplier: {}", supplierEmail);
        return ResponseEntity.ok(supplierService.getOrdersForSupplier(supplierEmail));
    }

    @PostMapping("/suppliers/orders/{requestId}/status")
    public ResponseEntity<ProcurementRequestResponseDto> updateOrderStatus(
            @PathVariable("requestId") Long requestId,
            @Valid @RequestBody SupplierOrderStatusUpdateDto dto,
            Authentication authentication
    ) {
        String supplierEmail = authentication != null ? authentication.getName() : null;
        log.info("REST request by supplier '{}' to update status of order ID {} to {}",
                supplierEmail, requestId, dto != null ? dto.getStatus() : null);
        ProcurementRequestResponseDto response = supplierService.updateOrderStatus(requestId, dto, supplierEmail);
        return ResponseEntity.ok(response);
    }
}

