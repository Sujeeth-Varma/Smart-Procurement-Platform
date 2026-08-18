package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.entity.User;
import in.sujeeth.infosysinternproject.enums.ProductStatus;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@procurement.com}")
    private String fromEmail;

    @Value("classpath:templates/email/new_request.html")
    private Resource newRequestTemplateResource;

    @Value("classpath:templates/email/request_approved.html")
    private Resource requestApprovedTemplateResource;

    @Value("classpath:templates/email/request_rejected.html")
    private Resource requestRejectedTemplateResource;

    @Value("classpath:templates/email/payment_completed_supplier.html")
    private Resource paymentCompletedSupplierTemplateResource;

    @Value("classpath:templates/email/order_shipped.html")
    private Resource orderShippedUserTemplateResource;

    @Value("classpath:templates/email/order_received.html")
    private Resource orderReceivedTemplateResource;

    @Value("classpath:templates/email/order_packed.html")
    private Resource orderPackedTemplateResource;

    @Value("classpath:templates/email/order_dispatched.html")
    private Resource orderDispatchedTemplateResource;

    @Value("classpath:templates/email/out_for_delivery.html")
    private Resource outForDeliveryTemplateResource;

    @Value("classpath:templates/email/order_delivered.html")
    private Resource orderDeliveredTemplateResource;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy - hh:mm a");

    /**
     * Send HTML email to both requesting user and all admins when a new request is raised.
     */
    public void sendNewRequestNotification(ProcurementRequest request, List<User> adminUsers) {
        try {
            String subject = "New Product Request Raised - Request #" + request.getRequestId();
            String htmlBody = buildNewRequestHtmlBody(request);

            Set<String> recipients = new HashSet<>();
            if (request.getUser() != null && request.getUser().getEmail() != null && !request.getUser().getEmail().trim().isEmpty()) {
                recipients.add(request.getUser().getEmail().trim());
            }

            if (adminUsers != null) {
                for (User admin : adminUsers) {
                    if (admin.getEmail() != null && !admin.getEmail().trim().isEmpty()) {
                        recipients.add(admin.getEmail().trim());
                    }
                }
            }

            for (String recipient : recipients) {
                sendHtmlEmail(recipient, subject, htmlBody);
            }
        } catch (Exception e) {
            log.error("Failed to process new request HTML email for request ID {}: {}", request.getRequestId(), e.getMessage(), e);
        }
    }

    /**
     * Send HTML email to the requesting user after admin approval.
     */
    public void sendRequestApprovedNotification(ProcurementRequest request) {
        try {
            if (request.getUser() == null || request.getUser().getEmail() == null || request.getUser().getEmail().trim().isEmpty()) {
                log.warn("Cannot send request approval email: Requesting user email is missing for request ID {}", request.getRequestId());
                return;
            }

            String recipient = request.getUser().getEmail().trim();
            String subject = "Procurement Request Approved - Request #" + request.getRequestId();
            String htmlBody = buildApprovedRequestHtmlBody(request);

            sendHtmlEmail(recipient, subject, htmlBody);
        } catch (Exception e) {
            log.error("Failed to send request approval HTML email for request ID {}: {}", request.getRequestId(), e.getMessage(), e);
        }
    }

    /**
     * Send HTML email to the requesting user after admin rejection.
     */
    public void sendRequestRejectedNotification(ProcurementRequest request) {
        try {
            if (request.getUser() == null || request.getUser().getEmail() == null || request.getUser().getEmail().trim().isEmpty()) {
                log.warn("Cannot send request rejection email: Requesting user email is missing for request ID {}", request.getRequestId());
                return;
            }

            String recipient = request.getUser().getEmail().trim();
            String subject = "Procurement Request Rejected - Request #" + request.getRequestId();
            String htmlBody = buildRejectedRequestHtmlBody(request);

            sendHtmlEmail(recipient, subject, htmlBody);
        } catch (Exception e) {
            log.error("Failed to send request rejection HTML email for request ID {}: {}", request.getRequestId(), e.getMessage(), e);
        }
    }

    /**
     * Send HTML email notification to Supplier when payment is completed by Admin.
     */
    public void sendPaymentCompletedSupplierNotification(ProcurementRequest request, in.sujeeth.infosysinternproject.entity.Payment payment) {
        try {
            if (payment.getSupplier() == null || payment.getSupplier().getEmail() == null || payment.getSupplier().getEmail().trim().isEmpty()) {
                log.warn("Cannot send supplier payment email: Supplier email missing for payment ID {}", payment.getPaymentId());
                return;
            }

            String recipient = payment.getSupplier().getEmail().trim();
            String subject = "Payment Received for Procurement Request #" + request.getRequestId() + " - Ready for Fulfillment";
            String htmlBody = buildPaymentCompletedSupplierHtmlBody(request, payment);

            sendHtmlEmail(recipient, subject, htmlBody);
            log.info("Payment notification email sent to supplier '{}' for request ID {}", recipient, request.getRequestId());
        } catch (Exception e) {
            log.error("Failed to send supplier payment email for request ID {}: {}", request.getRequestId(), e.getMessage(), e);
        }
    }

    /**
     * Send HTML email notification to requesting user when supplier ships order.
     */
    public void sendOrderShippedUserNotification(ProcurementRequest request) {
        try {
            if (request.getUser() == null || request.getUser().getEmail() == null || request.getUser().getEmail().trim().isEmpty()) {
                log.warn("Cannot send order shipped email: User email missing for request ID {}", request.getRequestId());
                return;
            }

            String recipient = request.getUser().getEmail().trim();
            String subject = "Your Order Has Been Shipped! - Procurement Request #" + request.getRequestId();
            String htmlBody = buildOrderShippedUserHtmlBody(request);

            sendHtmlEmail(recipient, subject, htmlBody);
            log.info("Order shipped email sent to user '{}' for request ID {}", recipient, request.getRequestId());
        } catch (Exception e) {
            log.error("Failed to send order shipped email for request ID {}: {}", request.getRequestId(), e.getMessage(), e);
        }
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = isHtml

            mailSender.send(message);
            log.info("HTML email successfully sent to {} with subject '{}'", toEmail, subject);
        } catch (Exception e) {
            log.error("Error sending HTML email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildNewRequestHtmlBody(ProcurementRequest req) {
        String template = loadTemplate(newRequestTemplateResource);
        String userName = req.getUser() != null ? req.getUser().getName() : "N/A";
        String userEmail = req.getUser() != null ? req.getUser().getEmail() : "N/A";
        String productName = req.getProduct() != null ? req.getProduct().getName() : "N/A";
        String deptName = req.getDepartment() != null ? req.getDepartment().getDepartmentName() : "N/A";
        String formattedDate = req.getCreatedDate() != null ? req.getCreatedDate().format(DATE_FORMATTER) : "N/A";
        String pricePerUnit = req.getPricePerUnit() != null ? "₹" + req.getPricePerUnit().toString() : "N/A";
        String totalPrice = req.getTotalPrice() != null ? "₹" + req.getTotalPrice().toString() : "N/A";
        String description = (req.getDescription() != null && !req.getDescription().trim().isEmpty()) 
                ? req.getDescription() : "No additional remarks provided.";
        String quantity = req.getRequestedQuantity() != null ? req.getRequestedQuantity().toString() : "1";

        return template
                .replace("{{REQUEST_ID}}", req.getRequestId() != null ? req.getRequestId().toString() : "")
                .replace("{{USER_NAME}}", userName)
                .replace("{{USER_EMAIL}}", userEmail)
                .replace("{{DEPT_NAME}}", deptName)
                .replace("{{PRODUCT_NAME}}", productName)
                .replace("{{QUANTITY}}", quantity)
                .replace("{{PRICE_PER_UNIT}}", pricePerUnit)
                .replace("{{TOTAL_PRICE}}", totalPrice)
                .replace("{{SUBMISSION_DATE}}", formattedDate)
                .replace("{{DESCRIPTION}}", description);
    }

    private String buildApprovedRequestHtmlBody(ProcurementRequest req) {
        String template = loadTemplate(requestApprovedTemplateResource);
        String userName = req.getUser() != null ? req.getUser().getName() : "User";
        String productName = req.getProduct() != null ? req.getProduct().getName() : "N/A";
        String formattedDate = req.getUpdatedDate() != null ? req.getUpdatedDate().format(DATE_FORMATTER) : "N/A";
        String totalPrice = req.getTotalPrice() != null ? "₹" + req.getTotalPrice().toString() : "N/A";
        String quantity = req.getRequestedQuantity() != null ? req.getRequestedQuantity().toString() : "1";

        return template
                .replace("{{USER_NAME}}", userName)
                .replace("{{REQUEST_ID}}", req.getRequestId() != null ? req.getRequestId().toString() : "")
                .replace("{{PRODUCT_NAME}}", productName)
                .replace("{{QUANTITY}}", quantity)
                .replace("{{TOTAL_PRICE}}", totalPrice)
                .replace("{{APPROVAL_DATE}}", formattedDate);
    }

    private String buildRejectedRequestHtmlBody(ProcurementRequest req) {
        String template = loadTemplate(requestRejectedTemplateResource);
        String userName = req.getUser() != null ? req.getUser().getName() : "User";
        String productName = req.getProduct() != null ? req.getProduct().getName() : "N/A";
        String formattedDate = req.getUpdatedDate() != null ? req.getUpdatedDate().format(DATE_FORMATTER) : "N/A";
        String totalPrice = req.getTotalPrice() != null ? "₹" + req.getTotalPrice().toString() : "N/A";
        String quantity = req.getRequestedQuantity() != null ? req.getRequestedQuantity().toString() : "1";

        return template
                .replace("{{USER_NAME}}", userName)
                .replace("{{REQUEST_ID}}", req.getRequestId() != null ? req.getRequestId().toString() : "")
                .replace("{{PRODUCT_NAME}}", productName)
                .replace("{{QUANTITY}}", quantity)
                .replace("{{TOTAL_PRICE}}", totalPrice)
                .replace("{{REJECTION_DATE}}", formattedDate);
    }

    private String buildPaymentCompletedSupplierHtmlBody(ProcurementRequest req, in.sujeeth.infosysinternproject.entity.Payment payment) {
        String template = loadTemplate(paymentCompletedSupplierTemplateResource);
        String supplierName = payment.getSupplier() != null ? payment.getSupplier().getName() : "Supplier";
        String productName = req.getProduct() != null ? req.getProduct().getName() : "N/A";
        String quantity = req.getRequestedQuantity() != null ? req.getRequestedQuantity().toString() : "1";
        String amountPaid = payment.getAmount() != null ? "₹" + payment.getAmount().toString() : "N/A";
        String accountNumber = payment.getAccountNumber() != null ? payment.getAccountNumber() : "N/A";
        String userName = req.getUser() != null ? req.getUser().getName() : "N/A";
        String userEmail = req.getUser() != null ? req.getUser().getEmail() : "N/A";
        String formattedDate = payment.getTransactionDate() != null ? payment.getTransactionDate().format(DATE_FORMATTER) : "N/A";

        return template
                .replace("{{SUPPLIER_NAME}}", supplierName)
                .replace("{{REQUEST_ID}}", req.getRequestId() != null ? req.getRequestId().toString() : "")
                .replace("{{PRODUCT_NAME}}", productName)
                .replace("{{QUANTITY}}", quantity)
                .replace("{{AMOUNT_PAID}}", amountPaid)
                .replace("{{ACCOUNT_NUMBER}}", accountNumber)
                .replace("{{USER_NAME}}", userName)
                .replace("{{USER_EMAIL}}", userEmail)
                .replace("{{PAYMENT_DATE}}", formattedDate);
    }

    private String buildOrderShippedUserHtmlBody(ProcurementRequest req) {
        String template = loadTemplate(orderShippedUserTemplateResource);
        String userName = req.getUser() != null ? req.getUser().getName() : "User";
        String productName = req.getProduct() != null ? req.getProduct().getName() : "N/A";
        String quantity = req.getRequestedQuantity() != null ? req.getRequestedQuantity().toString() : "1";
        String formattedDate = req.getUpdatedDate() != null ? req.getUpdatedDate().format(DATE_FORMATTER) : "N/A";

        return template
                .replace("{{USER_NAME}}", userName)
                .replace("{{REQUEST_ID}}", req.getRequestId() != null ? req.getRequestId().toString() : "")
                .replace("{{PRODUCT_NAME}}", productName)
                .replace("{{QUANTITY}}", quantity)
                .replace("{{SHIPPED_DATE}}", formattedDate);
    }

    /**
     * Send HTML email notification to requesting User and all Admins when supplier updates delivery status.
     */
    public void sendOrderStatusUpdateNotification(ProcurementRequest request, ProductStatus status, String remarks, List<User> adminUsers) {
        try {
            Set<String> recipients = new HashSet<>();
            if (request.getUser() != null && request.getUser().getEmail() != null && !request.getUser().getEmail().trim().isEmpty()) {
                recipients.add(request.getUser().getEmail().trim());
            }
            if (adminUsers != null) {
                for (User admin : adminUsers) {
                    if (admin.getEmail() != null && !admin.getEmail().trim().isEmpty()) {
                        recipients.add(admin.getEmail().trim());
                    }
                }
            }

            String subject = "Order Status Update: " + status.name() + " - Request #" + request.getRequestId();

            for (String recipientEmail : recipients) {
                String recipientName = "User/Admin";
                if (request.getUser() != null && recipientEmail.equalsIgnoreCase(request.getUser().getEmail())) {
                    recipientName = request.getUser().getName();
                }
                String htmlBody = buildOrderStatusUpdateHtmlBody(request, status, remarks, recipientName);
                sendHtmlEmail(recipientEmail, subject, htmlBody);
            }
            log.info("Order status update notification emails sent to {} recipients for request ID {} (Status: {})",
                    recipients.size(), request.getRequestId(), status);
        } catch (Exception e) {
            log.error("Failed to send order status update email for request ID {}: {}", request.getRequestId(), e.getMessage(), e);
        }
    }

    private String buildOrderStatusUpdateHtmlBody(ProcurementRequest req, ProductStatus status, String remarks, String recipientName) {
        Resource templateResource;
        switch (status) {
            case ORDER_RECEIVED:
                templateResource = orderReceivedTemplateResource;
                break;
            case ORDER_PACKED:
                templateResource = orderPackedTemplateResource;
                break;
            case ORDER_DISPATCHED:
            case SHIPPED:
                templateResource = orderDispatchedTemplateResource;
                break;
            case OUT_FOR_DELIVERY:
                templateResource = outForDeliveryTemplateResource;
                break;
            case DELIVERED:
                templateResource = orderDeliveredTemplateResource;
                break;
            default:
                templateResource = orderDispatchedTemplateResource;
                break;
        }

        String template = loadTemplate(templateResource);
        String productName = req.getProduct() != null ? req.getProduct().getName() : "N/A";
        String quantity = req.getRequestedQuantity() != null ? req.getRequestedQuantity().toString() : "1";
        String formattedDate = req.getUpdatedDate() != null ? req.getUpdatedDate().format(DATE_FORMATTER) : "N/A";
        String remarksText = (remarks != null && !remarks.trim().isEmpty()) ? remarks.trim() : "No additional remarks.";

        return template
                .replace("{{RECIPIENT_NAME}}", recipientName != null ? recipientName : "User")
                .replace("{{REQUEST_ID}}", req.getRequestId() != null ? req.getRequestId().toString() : "")
                .replace("{{PRODUCT_NAME}}", productName)
                .replace("{{QUANTITY}}", quantity)
                .replace("{{REMARKS}}", remarksText)
                .replace("{{UPDATED_DATE}}", formattedDate);
    }

    private String loadTemplate(Resource resource) {
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load HTML email template resource {}: {}", resource.getFilename(), e.getMessage());
            return "";
        }
    }
}
