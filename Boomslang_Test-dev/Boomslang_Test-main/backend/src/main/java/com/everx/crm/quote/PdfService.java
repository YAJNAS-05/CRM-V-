package com.everx.crm.quote;

import com.everx.crm.quote.dto.QuoteDto;
import com.everx.crm.quote.dto.QuoteLineItemDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfService {

    public byte[] generateQuotePdf(QuoteDto quote) {
        log.info("Generating PDF for quote {}", quote.getQuoteNumber());
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try {
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html><head><style>");
            html.append("body { font-family: Arial, sans-serif; margin: 40px; }");
            html.append("h1 { color: #333; }");
            html.append("table { width: 100%; border-collapse: collapse; margin-top: 20px; }");
            html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
            html.append("th { background-color: #f2f2f2; }");
            html.append(".header { margin-bottom: 30px; }");
            html.append(".total { font-weight: bold; font-size: 1.2em; }");
            html.append("</style></head><body>");
            
            html.append("<div class='header'>");
            html.append("<h1>QUOTE</h1>");
            html.append("<p><strong>Quote Number:</strong> ").append(quote.getQuoteNumber()).append("</p>");
            html.append("<p><strong>Version:</strong> ").append(quote.getVersion()).append("</p>");
            html.append("<p><strong>Status:</strong> ").append(quote.getStatus()).append("</p>");
            
            if (quote.getIssuedDate() != null) {
                html.append("<p><strong>Issued Date:</strong> ")
                    .append(quote.getIssuedDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                    .append("</p>");
            }
            
            if (quote.getExpiryDate() != null) {
                html.append("<p><strong>Expiry Date:</strong> ")
                    .append(quote.getExpiryDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                    .append("</p>");
            }
            html.append("</div>");
            
            html.append("<h2>Line Items</h2>");
            html.append("<table>");
            html.append("<thead><tr>");
            html.append("<th>Description</th>");
            html.append("<th>Quantity</th>");
            html.append("<th>Unit Price</th>");
            html.append("<th>Discount %</th>");
            html.append("<th>Line Total</th>");
            html.append("</tr></thead><tbody>");
            
            for (QuoteLineItemDto item : quote.getLineItems()) {
                html.append("<tr>");
                html.append("<td>").append(item.getDescription()).append("</td>");
                html.append("<td>").append(item.getQuantity()).append("</td>");
                html.append("<td>").append(formatCurrency(item.getUnitPrice(), quote.getCurrency())).append("</td>");
                html.append("<td>").append(item.getDiscountPct() != null ? item.getDiscountPct() : 0).append("%</td>");
                html.append("<td>").append(formatCurrency(item.getLineTotal(), quote.getCurrency())).append("</td>");
                html.append("</tr>");
            }
            
            html.append("</tbody></table>");
            
            html.append("<div style='margin-top: 30px; text-align: right;'>");
            html.append("<p><strong>Subtotal:</strong> ").append(formatCurrency(quote.getSubtotal(), quote.getCurrency())).append("</p>");
            html.append("<p><strong>Tax:</strong> ").append(formatCurrency(quote.getTaxAmount(), quote.getCurrency())).append("</p>");
            html.append("<p class='total'><strong>Total:</strong> ").append(formatCurrency(quote.getTotalAmount(), quote.getCurrency())).append("</p>");
            html.append("</div>");
            
            if (quote.getNotes() != null && !quote.getNotes().isEmpty()) {
                html.append("<div style='margin-top: 30px;'>");
                html.append("<h3>Notes</h3>");
                html.append("<p>").append(quote.getNotes()).append("</p>");
                html.append("</div>");
            }
            
            if (quote.getTerms() != null && !quote.getTerms().isEmpty()) {
                html.append("<div style='margin-top: 20px;'>");
                html.append("<h3>Terms & Conditions</h3>");
                html.append("<p>").append(quote.getTerms()).append("</p>");
                html.append("</div>");
            }
            
            html.append("</body></html>");
            
            outputStream.write(html.toString().getBytes());
            
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            log.error("Error generating PDF for quote {}", quote.getQuoteNumber(), e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
    
    private String formatCurrency(BigDecimal amount, String currency) {
        if (amount == null) return "0.00";
        return String.format("%s %.2f", currency != null ? currency : "USD", amount);
    }
}
