package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.dto.SupplierDto;
import in.sujeeth.infosysinternproject.entity.Supplier;
import in.sujeeth.infosysinternproject.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll()
                .stream()
                .map(this::mapToSupplierDto)
                .collect(Collectors.toList());
    }

    public List<SupplierDto> getSuppliersByProductId(Long productId) {
        return supplierRepository.findByProductProductId(productId)
                .stream()
                .map(this::mapToSupplierDto)
                .collect(Collectors.toList());
    }

    public SupplierDto mapToSupplierDto(Supplier supplier) {
        if (supplier == null) return null;
        Long prodId = supplier.getProduct() != null ? supplier.getProduct().getProductId() : null;
        String prodName = supplier.getProduct() != null ? supplier.getProduct().getName() : null;
        Long uId = supplier.getUser() != null ? supplier.getUser().getUserId() : null;

        return SupplierDto.builder()
                .supplierId(supplier.getSupplierId())
                .userId(uId)
                .productId(prodId)
                .productName(prodName)
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .email(supplier.getEmail())
                .gstNumber(supplier.getGstNumber())
                .status(supplier.getStatus())
                .rating(supplier.getRating())
                .feedback(supplier.getFeedback())
                .build();
    }
}
