package in.sujeeth.infosysinternproject.controller;

import in.sujeeth.infosysinternproject.dto.ProductDto;
import in.sujeeth.infosysinternproject.dto.RestockProductDto;
import in.sujeeth.infosysinternproject.dto.SupplierDto;
import in.sujeeth.infosysinternproject.service.ProductService;
import in.sujeeth.infosysinternproject.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final ProductService productService;

    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierDto>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/suppliers/product/{productId}")
    public ResponseEntity<List<SupplierDto>> getSuppliersByProductId(@PathVariable("productId") Long productId) {
        return ResponseEntity.ok(supplierService.getSuppliersByProductId(productId));
    }

    @PostMapping("/suppliers/products/{productId}/restock")
    public ResponseEntity<ProductDto> restockProduct(
            @PathVariable("productId") Long productId,
            @Valid @RequestBody RestockProductDto dto,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : null;
        ProductDto response = productService.restockProductBySupplier(productId, dto, email);
        return ResponseEntity.ok(response);
    }
}

