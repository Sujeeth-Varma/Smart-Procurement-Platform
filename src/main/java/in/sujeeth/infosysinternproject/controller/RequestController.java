package in.sujeeth.infosysinternproject.controller;

import in.sujeeth.infosysinternproject.dto.ApiResponse;
import in.sujeeth.infosysinternproject.dto.ProcurementRequestResponseDto;
import in.sujeeth.infosysinternproject.dto.RaiseProductRequestDto;
import in.sujeeth.infosysinternproject.dto.RequestTrackingDto;
import in.sujeeth.infosysinternproject.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import in.sujeeth.infosysinternproject.dto.RequestStatusUpdateDto;
import in.sujeeth.infosysinternproject.exception.BadRequestException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RequestController {

    private final ProductService productService;

    @PostMapping("/raise-req")
    public ResponseEntity<ProcurementRequestResponseDto> raiseRequest(
            @Valid @RequestBody RaiseProductRequestDto dto,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ProcurementRequestResponseDto response = productService.raiseProductRequest(dto, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/request/pending")
    public ResponseEntity<List<ProcurementRequestResponseDto>> getPendingRequests() {
        return ResponseEntity.ok(productService.getPendingProducts());
    }

    @PostMapping({"/request/{id}/status", "/request/{id}/action"})
    public ResponseEntity<ProcurementRequestResponseDto> updateRequestStatusWithId(
            @PathVariable("id") Long id,
            @Valid @RequestBody RequestStatusUpdateDto dto,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(productService.updateRequestStatus(id, dto.getStatus(), adminEmail));
    }

    @PostMapping("/request/status")
    public ResponseEntity<ProcurementRequestResponseDto> updateRequestStatusInBody(
            @Valid @RequestBody RequestStatusUpdateDto dto,
            Authentication authentication
    ) {
        Long targetId = dto.getRequestId();
        if (targetId == null) {
            throw new BadRequestException("Request ID must be provided in URL path or request body");
        }
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(productService.updateRequestStatus(targetId, dto.getStatus(), adminEmail));
    }

    @DeleteMapping("/request/{id}")
    public ResponseEntity<ApiResponse> deleteRequest(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @GetMapping("/request/{id}/tracking")
    public ResponseEntity<List<RequestTrackingDto>> getRequestTracking(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productService.getRequestTrackingHistory(id));
    }
}
