package in.sujeeth.infosysinternproject.config;

import in.sujeeth.infosysinternproject.entity.*;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import in.sujeeth.infosysinternproject.enums.Role;
import in.sujeeth.infosysinternproject.enums.UserStatus;
import in.sujeeth.infosysinternproject.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ApprovalHierarchyRepository approvalHierarchyRepository;
    private final ProductRepository productRepository;
    private final ProcurementRequestRepository procurementRequestRepository;
    private final SupplierRepository supplierRepository;
    private final RequestTrackingRepository requestTrackingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedDepartments();
        seedCategories();
        User admin = seedSingleAdminUser();
        seedApprovalHierarchy();
        seedDemoProductsAndSuppliers(admin);
    }

    private void seedDepartments() {
        List<Department> defaultDepartments = Arrays.asList(
                Department.builder().departmentName("IT").managerOfDepartment("Aditya").build(),
                Department.builder().departmentName("HR").managerOfDepartment("Priya").build(),
                Department.builder().departmentName("Testing").managerOfDepartment("Rohan").build(),
                Department.builder().departmentName("Procurement").managerOfDepartment("Suresh").build());

        for (Department dept : defaultDepartments) {
            if (departmentRepository.findByDepartmentName(dept.getDepartmentName()).isEmpty()) {
                departmentRepository.save(dept);
            }
        }
    }

    private void seedCategories() {
        List<Category> defaultCategories = Arrays.asList(
                Category.builder().categoryName("Electronics").build(),
                Category.builder().categoryName("Office Supplies").build(),
                Category.builder().categoryName("Peripherals").build(),
                Category.builder().categoryName("Furniture").build());

        for (Category cat : defaultCategories) {
            if (categoryRepository.findByCategoryName(cat.getCategoryName()).isEmpty()) {
                categoryRepository.save(cat);
            }
        }
    }

    private User seedSingleAdminUser() {
        String adminEmail = "infosys.procurement.project.admin@gmail.com";
        return userRepository.findByEmail(adminEmail).orElseGet(() -> {
            Department procurementDept = departmentRepository.findByDepartmentName("Procurement").orElse(null);

            User admin = User.builder()
                    .name("Single System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .phoneNumber("9999999999")
                    .designation("Head of Procurement")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .department(procurementDept)
                    .build();

            return userRepository.save(admin);
        });
    }

    private void seedApprovalHierarchy() {
        if (approvalHierarchyRepository.count() == 0) {
            List<Department> depts = departmentRepository.findAll();
            for (Department dept : depts) {
                ApprovalHierarchy level1 = ApprovalHierarchy.builder()
                        .department(dept)
                        .level(1)
                        .build();
                approvalHierarchyRepository.save(level1);
            }
        }
    }

    private void seedDemoProductsAndSuppliers(User admin) {
        if (productRepository.count() == 0) {
            Department itDept = departmentRepository.findByDepartmentName("IT").orElse(null);
            Category peripheralsCat = categoryRepository.findByCategoryName("Peripherals").orElse(null);
            Category electronicsCat = categoryRepository.findByCategoryName("Electronics").orElse(null);
            Category furnitureCat = categoryRepository.findByCategoryName("Furniture").orElse(null);

            // Active Catalog Inventory Items (Products)
            Product mouse = Product.builder()
                    .name("Wireless Mouse")
                    .pricePerProduct(new BigDecimal("800.00"))
                    .numberOfQuantities(10) // Available inventory stock
                    .category(peripheralsCat)
                    .description("Ergonomic wireless mouse for engineering team")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build();
            Product savedMouse = productRepository.save(mouse);

            Product monitor = Product.builder()
                    .name("4K Monitor 27-inch")
                    .pricePerProduct(new BigDecimal("22000.00"))
                    .numberOfQuantities(5) // Available inventory stock
                    .category(electronicsCat)
                    .description("High-resolution IPS monitor for design and development")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build();
            Product savedMonitor = productRepository.save(monitor);

            Product chair = Product.builder()
                    .name("Ergonomic Office Chair")
                    .pricePerProduct(new BigDecimal("12500.00"))
                    .numberOfQuantities(8) // Available inventory stock
                    .category(furnitureCat)
                    .description("Lumbar support mesh chair")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build();
            Product savedChair = productRepository.save(chair);

            // Seed Demo Procurement Requests (User Orders)
            if (procurementRequestRepository.count() == 0) {
                // Pending Request Demo
                ProcurementRequest pendingReq = ProcurementRequest.builder()
                        .product(savedMonitor)
                        .user(admin)
                        .department(itDept)
                        .requestedQuantity(2)
                        .pricePerUnit(savedMonitor.getPricePerProduct())
                        .totalPrice(savedMonitor.getPricePerProduct().multiply(new BigDecimal("2")))
                        .description("Requesting 2 units of 4K Monitor for new engineers")
                        .status(ProductStatus.PENDING_FOR_APPROVAL)
                        .createdDate(LocalDateTime.now())
                        .updatedDate(LocalDateTime.now())
                        .build();
                ProcurementRequest savedPending = procurementRequestRepository.save(pendingReq);

                requestTrackingRepository.save(RequestTracking.builder()
                        .procurementRequest(savedPending)
                        .product(savedMonitor)
                        .actionBy(admin)
                        .status(ProductStatus.PENDING_FOR_APPROVAL)
                        .remarks("Procurement request submitted")
                        .actionTimestamp(LocalDateTime.now())
                        .build());

                // Approved Request Demo
                ProcurementRequest activeReq = ProcurementRequest.builder()
                        .product(savedMouse)
                        .user(admin)
                        .department(itDept)
                        .requestedQuantity(2)
                        .pricePerUnit(savedMouse.getPricePerProduct())
                        .totalPrice(savedMouse.getPricePerProduct().multiply(new BigDecimal("2")))
                        .description("Wireless mouse request for onboarding")
                        .status(ProductStatus.ACTIVE)
                        .createdDate(LocalDateTime.now().minusDays(2))
                        .updatedDate(LocalDateTime.now().minusDays(1))
                        .build();
                ProcurementRequest savedActive = procurementRequestRepository.save(activeReq);

                requestTrackingRepository.save(RequestTracking.builder()
                        .procurementRequest(savedActive)
                        .product(savedMouse)
                        .actionBy(admin)
                        .status(ProductStatus.PENDING_FOR_APPROVAL)
                        .remarks("Procurement request submitted")
                        .actionTimestamp(LocalDateTime.now().minusDays(2))
                        .build());
                requestTrackingRepository.save(RequestTracking.builder()
                        .procurementRequest(savedActive)
                        .product(savedMouse)
                        .actionBy(admin)
                        .status(ProductStatus.ACTIVE)
                        .remarks("Request approved by Admin (Deducted 2 units from inventory stock)")
                        .actionTimestamp(LocalDateTime.now().minusDays(1))
                        .build());
            }
        }

        if (supplierRepository.count() == 0) {
            Department procurementDept = departmentRepository.findByDepartmentName("Procurement").orElse(null);
            Product savedMouse = productRepository
                    .findFirstByNameIgnoreCaseAndStatus("Wireless Mouse", ProductStatus.ACTIVE).orElse(null);
            Product savedChair = productRepository
                    .findFirstByNameIgnoreCaseAndStatus("Ergonomic Office Chair", ProductStatus.ACTIVE).orElse(null);

            User supplierUser1 = userRepository.findByEmail("sales@logitech.in")
                    .orElseGet(() -> userRepository.save(User.builder()
                            .name("Logitech India Pvt Ltd")
                            .email("sales@logitech.in")
                            .password(passwordEncoder.encode("Supplier@123"))
                            .phoneNumber("1800-123-4567")
                            .designation("Supplier Account")
                            .role(Role.SUPPLIER)
                            .status(UserStatus.ACTIVE)
                            .department(procurementDept)
                            .build()));

            User supplierUser2 = userRepository.findByEmail("contact@steelcase.in")
                    .orElseGet(() -> userRepository.save(User.builder()
                            .name("Steelcase Furniture India")
                            .email("contact@steelcase.in")
                            .password(passwordEncoder.encode("Supplier@123"))
                            .phoneNumber("1800-987-6543")
                            .designation("Supplier Account")
                            .role(Role.SUPPLIER)
                            .status(UserStatus.ACTIVE)
                            .department(procurementDept)
                            .build()));

            // Seed Dummy Suppliers for Active Products
            Supplier supplier1 = Supplier.builder()
                    .product(savedMouse)
                    .user(supplierUser1)
                    .name("Logitech India Pvt Ltd")
                    .phone("1800-123-4567")
                    .address("Bengaluru, Karnataka, India")
                    .email("sales@logitech.in")
                    .gstNumber("29AAAAA0000A1Z5")
                    .status("PREFERRED_VENDOR")
                    .rating(4.8)
                    .feedback("High quality products and fast delivery")
                    .build();
            supplierRepository.save(supplier1);

            Supplier supplier2 = Supplier.builder()
                    .product(savedChair)
                    .user(supplierUser2)
                    .name("Steelcase Furniture India")
                    .phone("1800-987-6543")
                    .address("Mumbai, Maharashtra, India")
                    .email("contact@steelcase.in")
                    .gstNumber("27BBBBB1111B2Z8")
                    .status("VERIFIED")
                    .rating(4.6)
                    .feedback("Durable ergonomic office furniture provider")
                    .build();
            supplierRepository.save(supplier2);
        }
    }
}
