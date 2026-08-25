package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.ProductReviewRequestDto;
import in.sujeeth.infosysinternproject.dto.ProductReviewResponseDto;
import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.entity.Product;
import in.sujeeth.infosysinternproject.entity.ProductReview;
import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import in.sujeeth.infosysinternproject.exception.BadRequestException;
import in.sujeeth.infosysinternproject.exception.ResourceNotFoundException;
import in.sujeeth.infosysinternproject.repository.ProcurementRequestRepository;
import in.sujeeth.infosysinternproject.repository.ProductRepository;
import in.sujeeth.infosysinternproject.repository.ProductReviewRepository;
import in.sujeeth.infosysinternproject.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductReviewServiceTest {

    @Mock
    private ProductReviewRepository productReviewRepository;

    @Mock
    private ProcurementRequestRepository procurementRequestRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProductReviewService productReviewService;

    private User user;
    private Product product;
    private ProcurementRequest request;
    private ProductReviewRequestDto dto;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .userId(1L)
                .email("user@example.com")
                .name("John Doe")
                .build();

        product = Product.builder()
                .productId(10L)
                .name("Laptop")
                .build();

        request = ProcurementRequest.builder()
                .requestId(100L)
                .user(user)
                .product(product)
                .status(ProductStatus.DELIVERED)
                .build();

        dto = ProductReviewRequestDto.builder()
                .requestId(100L)
                .rating(5)
                .feedback("Great laptop!")
                .build();
    }

    @Test
    void submitReview_Success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(procurementRequestRepository.findById(100L)).thenReturn(Optional.of(request));
        when(productReviewRepository.existsByProcurementRequestRequestId(100L)).thenReturn(false);

        ProductReview savedReview = ProductReview.builder()
                .reviewId(1L)
                .procurementRequest(request)
                .product(product)
                .user(user)
                .rating(5)
                .feedback("Great laptop!")
                .build();

        when(productReviewRepository.save(any(ProductReview.class))).thenReturn(savedReview);

        ProductReviewResponseDto response = productReviewService.submitReview(dto, "user@example.com");

        assertNotNull(response);
        assertEquals(1L, response.getReviewId());
        assertEquals(100L, response.getRequestId());
        assertEquals(10L, response.getProductId());
        assertEquals(5, response.getRating());
        assertEquals("Great laptop!", response.getFeedback());
        verify(productReviewRepository, times(1)).save(any(ProductReview.class));
    }

    @Test
    void submitReview_ThrowsException_WhenNotDelivered() {
        request.setStatus(ProductStatus.SHIPPED);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(procurementRequestRepository.findById(100L)).thenReturn(Optional.of(request));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                productReviewService.submitReview(dto, "user@example.com")
        );

        assertTrue(ex.getMessage().contains("only be submitted after the item has been DELIVERED"));
        verify(productReviewRepository, never()).save(any());
    }

    @Test
    void submitReview_ThrowsException_WhenUserNotOwner() {
        User otherUser = User.builder().userId(2L).email("other@example.com").build();
        request.setUser(otherUser);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(procurementRequestRepository.findById(100L)).thenReturn(Optional.of(request));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                productReviewService.submitReview(dto, "user@example.com")
        );

        assertTrue(ex.getMessage().contains("only submit a product review for your own procurement requests"));
        verify(productReviewRepository, never()).save(any());
    }

    @Test
    void submitReview_ThrowsException_WhenAlreadyReviewed() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(procurementRequestRepository.findById(100L)).thenReturn(Optional.of(request));
        when(productReviewRepository.existsByProcurementRequestRequestId(100L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                productReviewService.submitReview(dto, "user@example.com")
        );

        assertTrue(ex.getMessage().contains("already been submitted"));
        verify(productReviewRepository, never()).save(any());
    }
}
