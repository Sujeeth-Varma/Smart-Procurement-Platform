package in.sujeeth.infosysinternproject.util;

import in.sujeeth.infosysinternproject.dto.PaymentResponseDto;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class PaymentCsvUtil {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] generatePaymentCsv(List<PaymentResponseDto> payments) {
        StringBuilder csv = new StringBuilder();

        // Header line
        csv.append("Payment ID,Request ID,Product Name,Admin ID,Admin Email,Admin Name,")
           .append("Request User ID,Request User Email,Request User Name,Supplier ID,Supplier Name,")
           .append("Supplier Account Number,Amount,Card Number,Card Holder Name,Payment Status,Transaction Date,Remarks,Message\n");

        if (payments != null) {
            for (PaymentResponseDto dto : payments) {
                csv.append(escape(dto.getPaymentId())).append(",")
                   .append(escape(dto.getRequestId())).append(",")
                   .append(escape(dto.getProductName())).append(",")
                   .append(escape(dto.getAdminUserId())).append(",")
                   .append(escape(dto.getAdminEmail())).append(",")
                   .append(escape(dto.getAdminName())).append(",")
                   .append(escape(dto.getRequestUserId())).append(",")
                   .append(escape(dto.getRequestUserEmail())).append(",")
                   .append(escape(dto.getRequestUserName())).append(",")
                   .append(escape(dto.getSupplierId())).append(",")
                   .append(escape(dto.getSupplierName())).append(",")
                   .append(escape(dto.getSupplierAccountNumber())).append(",")
                   .append(escape(dto.getAmount())).append(",")
                   .append(escape(dto.getCardNumber())).append(",")
                   .append(escape(dto.getCardHolderName())).append(",")
                   .append(escape(dto.getPaymentStatus())).append(",")
                   .append(escape(dto.getTransactionDate() != null ? DATE_FORMATTER.format(dto.getTransactionDate()) : null)).append(",")
                   .append(escape(dto.getRemarks())).append(",")
                   .append(escape(dto.getMessage()))
                   .append("\n");
            }
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escape(Object value) {
        if (value == null) {
            return "";
        }
        String str = value.toString();
        if (str.contains(",") || str.contains("\"") || str.contains("\n") || str.contains("\r")) {
            str = str.replace("\"", "\"\"");
            return "\"" + str + "\"";
        }
        return str;
    }
}
