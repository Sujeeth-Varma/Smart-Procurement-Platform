package in.sujeeth.infosysinternproject.controller;

import in.sujeeth.infosysinternproject.dto.ProductDto;
import in.sujeeth.infosysinternproject.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getActiveProducts() {
        log.info("REST request to fetch all active products");
        return ResponseEntity.ok(productService.getActiveProducts());
    }
}
