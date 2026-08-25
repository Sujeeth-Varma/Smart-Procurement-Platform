package in.sujeeth.infosysinternproject.config;

import in.sujeeth.infosysinternproject.entity.*;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import in.sujeeth.infosysinternproject.enums.Role;
import in.sujeeth.infosysinternproject.enums.UserStatus;
import in.sujeeth.infosysinternproject.repository.*;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
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
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        fixStatusColumnLengths();
        seedDepartments();
        seedCategories();
        User admin = seedSingleAdminUser();
        seedApprovalHierarchy();
        seedDemoProductsAndSuppliers(admin);
    }

    private void fixStatusColumnLengths() {
        try {
            jdbcTemplate.execute("ALTER TABLE procurement_requests MODIFY COLUMN status VARCHAR(50) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE request_tracking MODIFY COLUMN status VARCHAR(50) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE products MODIFY COLUMN status VARCHAR(50) NOT NULL");
            log.info("Successfully resized database 'status' columns to VARCHAR(50)");
        } catch (Exception e) {
            log.warn("Notice during column resize execution: {}", e.getMessage());
        }
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
        Department itDept = departmentRepository.findByDepartmentName("IT").orElse(null);
        Department procurementDept = departmentRepository.findByDepartmentName("Procurement").orElse(null);
        Category peripheralsCat = categoryRepository.findByCategoryName("Peripherals").orElse(null);
        Category electronicsCat = categoryRepository.findByCategoryName("Electronics").orElse(null);
        Category furnitureCat = categoryRepository.findByCategoryName("Furniture").orElse(null);
        Category officeCat = categoryRepository.findByCategoryName("Office Supplies").orElse(null);

        if (productRepository.count() == 0) {
            Product mouse = productRepository.save(Product.builder()
                    .name("Wireless Mouse")
                    .pricePerProduct(new BigDecimal("800.00"))
                    .category(peripheralsCat)
                    .description("Ergonomic wireless optical mouse")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build());

            Product monitor = productRepository.save(Product.builder()
                    .name("4K Monitor 27-inch")
                    .pricePerProduct(new BigDecimal("22000.00"))
                    .category(electronicsCat)
                    .description("High-resolution IPS monitor for design and development")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build());

            Product keyboard = productRepository.save(Product.builder()
                    .name("Mechanical Keyboard")
                    .pricePerProduct(new BigDecimal("3500.00"))
                    .category(peripheralsCat)
                    .description("RGB backlit mechanical keyboard")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build());

            Product chair = productRepository.save(Product.builder()
                    .name("Ergonomic Office Chair")
                    .pricePerProduct(new BigDecimal("12500.00"))
                    .category(furnitureCat)
                    .description("Lumbar support mesh chair")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build());

            Product desk = productRepository.save(Product.builder()
                    .name("Standing Desk")
                    .pricePerProduct(new BigDecimal("18500.00"))
                    .category(furnitureCat)
                    .description("Dual-motor electric height adjustable standing desk")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build());

            Product paper = productRepository.save(Product.builder()
                    .name("A4 Printing Paper Bundle")
                    .pricePerProduct(new BigDecimal("450.00"))
                    .category(officeCat)
                    .description("75 GSM 500 sheets ream printing paper")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build());

            Product webcam = productRepository.save(Product.builder()
                    .name("HD 1080p Webcam")
                    .pricePerProduct(new BigDecimal("4200.00"))
                    .category(electronicsCat)
                    .description("Full HD video webcam with noise-cancelling mic")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build());

            Product hub = productRepository.save(Product.builder()
                    .name("USB-C Multiport Hub")
                    .pricePerProduct(new BigDecimal("2800.00"))
                    .category(peripheralsCat)
                    .description("7-in-1 USB-C adapter hub with HDMI and Power Delivery")
                    .status(ProductStatus.ACTIVE)
                    .createdDate(LocalDateTime.now())
                    .updatedDate(LocalDateTime.now())
                    .build());

            // Demo procurement request
            if (procurementRequestRepository.count() == 0) {
                ProcurementRequest pendingReq = ProcurementRequest.builder()
                        .product(monitor)
                        .user(admin)
                        .department(itDept)
                        .requestedQuantity(2)
                        .pricePerUnit(monitor.getPricePerProduct())
                        .totalPrice(monitor.getPricePerProduct().multiply(new BigDecimal("2")))
                        .description("Requesting 2 units of 4K Monitor for team onboarding")
                        .status(ProductStatus.PENDING_FOR_APPROVAL)
                        .createdDate(LocalDateTime.now())
                        .updatedDate(LocalDateTime.now())
                        .build();
                ProcurementRequest savedPending = procurementRequestRepository.save(pendingReq);

                requestTrackingRepository.save(RequestTracking.builder()
                        .procurementRequest(savedPending)
                        .product(monitor)
                        .actionBy(admin)
                        .status(ProductStatus.PENDING_FOR_APPROVAL)
                        .remarks("Procurement request submitted")
                        .actionTimestamp(LocalDateTime.now())
                        .build());
            }
        }

        if (supplierRepository.count() == 0) {
            Product mouse = productRepository.findFirstByNameIgnoreCaseAndStatus("Wireless Mouse", ProductStatus.ACTIVE).orElse(null);
            Product monitor = productRepository.findFirstByNameIgnoreCaseAndStatus("4K Monitor 27-inch", ProductStatus.ACTIVE).orElse(null);
            Product keyboard = productRepository.findFirstByNameIgnoreCaseAndStatus("Mechanical Keyboard", ProductStatus.ACTIVE).orElse(null);
            Product chair = productRepository.findFirstByNameIgnoreCaseAndStatus("Ergonomic Office Chair", ProductStatus.ACTIVE).orElse(null);
            Product desk = productRepository.findFirstByNameIgnoreCaseAndStatus("Standing Desk", ProductStatus.ACTIVE).orElse(null);
            Product paper = productRepository.findFirstByNameIgnoreCaseAndStatus("A4 Printing Paper Bundle", ProductStatus.ACTIVE).orElse(null);
            Product webcam = productRepository.findFirstByNameIgnoreCaseAndStatus("HD 1080p Webcam", ProductStatus.ACTIVE).orElse(null);
            Product hub = productRepository.findFirstByNameIgnoreCaseAndStatus("USB-C Multiport Hub", ProductStatus.ACTIVE).orElse(null);

            // Supplier 1: TechSource Electronics
            User sup1User = userRepository.findByEmail("sujeethvarma27@gmail.com").orElseGet(() -> userRepository.save(User.builder()
                    .name("TechSource Electronics Pvt Ltd")
                    .email("sujeethvarma27@gmail.com")
                    .password(passwordEncoder.encode("Supplier@123"))
                    .phoneNumber("1800-111-2222")
                    .designation("Authorized Vendor Account")
                    .role(Role.SUPPLIER)
                    .status(UserStatus.ACTIVE)
                    .department(procurementDept)
                    .build()));

            Supplier supplier1 = Supplier.builder()
                    .products(Arrays.asList(mouse, monitor, keyboard))
                    .user(sup1User)
                    .name("TechSource Electronics Pvt Ltd")
                    .phone("1800-111-2222")
                    .address("Bengaluru Tech Park, Karnataka, India")
                    .email("sujeethvarma27@gmail.com")
                    .accountNumber("ACC-1001-TECH")
                    .bankName("HDFC Bank")
                    .gstNumber("29TECHSRC1001Z1")
                    .status("PREFERRED_VENDOR")
                    .rating(4.9)
                    .feedback("Leading hardware supplier with fast dispatch")
                    .build();
            supplierRepository.save(supplier1);

            // Supplier 2: ErgoComfort Furniture
            User sup2User = userRepository.findByEmail("contact@ergocomfort.in").orElseGet(() -> userRepository.save(User.builder()
                    .name("ErgoComfort Furniture Ltd")
                    .email("contact@ergocomfort.in")
                    .password(passwordEncoder.encode("Supplier@123"))
                    .phoneNumber("1800-333-4444")
                    .designation("Furniture Vendor Account")
                    .role(Role.SUPPLIER)
                    .status(UserStatus.ACTIVE)
                    .department(procurementDept)
                    .build()));

            Supplier supplier2 = Supplier.builder()
                    .products(Arrays.asList(chair, desk))
                    .user(sup2User)
                    .name("ErgoComfort Furniture Ltd")
                    .phone("1800-333-4444")
                    .address("Mumbai Industrial Area, Maharashtra, India")
                    .email("contact@ergocomfort.in")
                    .accountNumber("ACC-2002-ERGO")
                    .bankName("ICICI Bank")
                    .gstNumber("27ERGOCMF2002Z2")
                    .status("VERIFIED")
                    .rating(4.7)
                    .feedback("High quality commercial ergonomic furniture")
                    .build();
            supplierRepository.save(supplier2);

            // Supplier 3: OfficeDepot Stationeries
            User sup3User = userRepository.findByEmail("support@officedepot.in").orElseGet(() -> userRepository.save(User.builder()
                    .name("OfficeDepot Stationeries")
                    .email("support@officedepot.in")
                    .password(passwordEncoder.encode("Supplier@123"))
                    .phoneNumber("1800-555-6666")
                    .designation("Office Supplies Vendor Account")
                    .role(Role.SUPPLIER)
                    .status(UserStatus.ACTIVE)
                    .department(procurementDept)
                    .build()));

            Supplier supplier3 = Supplier.builder()
                    .products(Arrays.asList(paper))
                    .user(sup3User)
                    .name("OfficeDepot Stationeries")
                    .phone("1800-555-6666")
                    .address("New Delhi Commercial Hub, India")
                    .email("support@officedepot.in")
                    .accountNumber("ACC-3003-OFF")
                    .bankName("State Bank of India")
                    .gstNumber("07OFFDPT3003Z3")
                    .status("VERIFIED")
                    .rating(4.6)
                    .feedback("Bulk stationery and office paper supplier")
                    .build();
            supplierRepository.save(supplier3);

            // Supplier 4: CloudTech Peripherals
            User sup4User = userRepository.findByEmail("info@cloudtech.in").orElseGet(() -> userRepository.save(User.builder()
                    .name("CloudTech Peripherals Ltd")
                    .email("info@cloudtech.in")
                    .password(passwordEncoder.encode("Supplier@123"))
                    .phoneNumber("1800-777-8888")
                    .designation("Peripherals Vendor Account")
                    .role(Role.SUPPLIER)
                    .status(UserStatus.ACTIVE)
                    .department(procurementDept)
                    .build()));

            Supplier supplier4 = Supplier.builder()
                    .products(Arrays.asList(webcam, hub))
                    .user(sup4User)
                    .name("CloudTech Peripherals Ltd")
                    .phone("1800-777-8888")
                    .address("Hyderabad IT Hub, Telangana, India")
                    .email("info@cloudtech.in")
                    .accountNumber("ACC-4004-CLD")
                    .bankName("Axis Bank")
                    .gstNumber("36CLDTECH4004Z4")
                    .status("PREFERRED_VENDOR")
                    .rating(4.8)
                    .feedback("High quality AV accessories and connectivity hubs")
                    .build();
            supplierRepository.save(supplier4);
        }
    }
}
