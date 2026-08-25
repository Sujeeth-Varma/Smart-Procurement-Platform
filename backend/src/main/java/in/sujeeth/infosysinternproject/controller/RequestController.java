package in.sujeeth.infosysinternproject.controller;

import in.sujeeth.infosysinternproject.dto.ApiResponse;
import in.sujeeth.infosysinternproject.dto.ProcurementRequestResponseDto;
import in.sujeeth.infosysinternproject.dto.RaiseProductRequestDto;
import in.sujeeth.infosysinternproject.dto.RequestTrackingDto;
import in.sujeeth.infosysinternproject.dto.RequestStatusUpdateDto;
import in.sujeeth.infosysinternproject.exception.BadRequestException;
import in.sujeeth.infosysinternproject.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
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
        log.info("REST request to raise procurement request by user: {}", email);
        ProcurementRequestResponseDto response = productService.raiseProductRequest(dto, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/request/pending")
    public ResponseEntity<List<ProcurementRequestResponseDto>> getPendingRequests() {
        log.info("REST request to get all pending procurement requests");
        return ResponseEntity.ok(productService.getPendingProducts());
    }

    @GetMapping("/request/status")
    public ResponseEntity<ProcurementRequestResponseDto> getRequestStatus(
            @RequestParam("requestId") Long requestId
    ) {
        log.info("REST request to get status for request ID: {}", requestId);
        return ResponseEntity.ok(productService.getRequestById(requestId));
    }

    @PostMapping("/request/status")
    public ResponseEntity<ProcurementRequestResponseDto> updateRequestStatus(
            @Valid @RequestBody RequestStatusUpdateDto dto,
            Authentication authentication
    ) {
        if (dto.getRequestId() == null) {
            log.warn("REST update request status failed: Request ID is missing");
            throw new BadRequestException("Request ID must be provided in request body");
        }
        String adminEmail = authentication.getName();
        log.info("REST request to update request status: requestId={}, status={}, adminEmail={}",
                dto.getRequestId(), dto.getStatus(), adminEmail);
        return ResponseEntity.ok(productService.updateRequestStatus(dto.getRequestId(), dto.getStatus(), adminEmail));
    }

    @DeleteMapping("/request/{id}")
    public ResponseEntity<ApiResponse> deleteRequest(@PathVariable("id") Long id) {
        log.info("REST request to delete request/product with ID: {}", id);
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @GetMapping("/request/{id}/tracking")
    public ResponseEntity<List<RequestTrackingDto>> getRequestTracking(@PathVariable("id") Long id) {
        log.info("REST request to get tracking history for request ID: {}", id);
        return ResponseEntity.ok(productService.getRequestTrackingHistory(id));
    }
}
