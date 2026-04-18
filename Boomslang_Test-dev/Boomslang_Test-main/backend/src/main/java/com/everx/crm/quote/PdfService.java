package com.everx.crm.quote;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.everx.crm.quote.dto.QuoteDto;
import com.everx.crm.quote.dto.QuoteLineItemDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfService {

    public byte[] generateQuotePdf(QuoteDto quote) {
        log.info("Generating PDF for quote {}", quote.getQuoteNumber());
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Font bodyFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
            Font totalFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD);

            document.add(new Paragraph("QUOTE", titleFont));
            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("Quote Number: " + safe(quote.getQuoteNumber()), bodyFont));
            document.add(new Paragraph("Version: " + safe(quote.getVersion()), bodyFont));
            document.add(new Paragraph("Status: " + safe(quote.getStatus()), bodyFont));

            if (quote.getIssuedDate() != null) {
                document.add(new Paragraph(
                        "Issued Date: " + quote.getIssuedDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        bodyFont
                ));
            }
            if (quote.getExpiryDate() != null) {
                document.add(new Paragraph(
                        "Expiry Date: " + quote.getExpiryDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        bodyFont
                ));
            }

            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("Line Items", sectionFont));

            PdfPTable table = new PdfPTable(new float[]{4f, 1.2f, 2f, 1.5f, 2f});
            table.setWidthPercentage(100);

            addHeaderCell(table, "Description");
            addHeaderCell(table, "Qty");
            addHeaderCell(table, "Unit Price");
            addHeaderCell(table, "Discount %");
            addHeaderCell(table, "Line Total");

            if (quote.getLineItems() != null) {
                for (QuoteLineItemDto item : quote.getLineItems()) {
                    addBodyCell(table, safe(item.getDescription()));
                    addBodyCell(table, String.valueOf(item.getQuantity() != null ? item.getQuantity() : 0));
                    addBodyCell(table, formatCurrency(item.getUnitPrice(), quote.getCurrency()));
                    addBodyCell(table, String.valueOf(item.getDiscountPct() != null ? item.getDiscountPct() : 0));
                    addBodyCell(table, formatCurrency(item.getLineTotal(), quote.getCurrency()));
                }
            }

            document.add(table);
            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("Subtotal: " + formatCurrency(quote.getSubtotal(), quote.getCurrency()), bodyFont));
            document.add(new Paragraph("Tax: " + formatCurrency(quote.getTaxAmount(), quote.getCurrency()), bodyFont));
            document.add(new Paragraph("Total: " + formatCurrency(quote.getTotalAmount(), quote.getCurrency()), totalFont));

            if (quote.getNotes() != null && !quote.getNotes().isBlank()) {
                document.add(Chunk.NEWLINE);
                document.add(new Paragraph("Notes", sectionFont));
                document.add(new Paragraph(quote.getNotes(), bodyFont));
            }

            if (quote.getTerms() != null && !quote.getTerms().isBlank()) {
                document.add(Chunk.NEWLINE);
                document.add(new Paragraph("Terms & Conditions", sectionFont));
                document.add(new Paragraph(quote.getTerms(), bodyFont));
            }

            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException | IOException | RuntimeException e) {
            log.error("Error generating PDF for quote {}", quote.getQuoteNumber(), e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setBackgroundColor(new BaseColor(235, 235, 235));
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private String safe(Object value) {
        return value == null ? "-" : value.toString();
    }
    
    private String formatCurrency(BigDecimal amount, String currency) {
        if (amount == null) return "0.00";
        return String.format("%s %.2f", currency != null ? currency : "USD", amount);
    }
}
