package in.sujeeth.infosysinternproject.service;

import in.sujeeth.infosysinternproject.entity.ProcurementRequest;
import in.sujeeth.infosysinternproject.entity.User;
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

    private String loadTemplate(Resource resource) {
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load HTML email template resource {}: {}", resource.getFilename(), e.getMessage());
            return "";
        }
    }
}
