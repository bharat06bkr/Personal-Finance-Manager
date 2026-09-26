package com.finance.service;

import com.finance.entity.Transaction;
import com.finance.entity.User;
import com.finance.repository.TransactionRepository;
import com.opencsv.CSVWriter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    @Autowired
    public ExportService(TransactionRepository transactionRepository, AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    public byte[] exportCsv(LocalDate startDate, LocalDate endDate) throws Exception {
        User currentUser = authService.getAuthenticatedUser();
        List<Transaction> transactions = getTransactionsForPeriod(currentUser, startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            writer.writeNext(new String[]{"ID", "Date", "Type", "Category", "Account", "Description", "Amount (INR)"});

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            for (Transaction t : transactions) {
                writer.writeNext(new String[]{
                        String.valueOf(t.getId()),
                        t.getTransactionDate().format(formatter),
                        t.getType().name(),
                        t.getCategory().getName(),
                        t.getAccount().getName(),
                        t.getDescription() != null ? t.getDescription() : "",
                        t.getAmount().toString()
                });
            }
        }
        return baos.toByteArray();
    }

    public byte[] exportPdf(LocalDate startDate, LocalDate endDate) throws Exception {
        User currentUser = authService.getAuthenticatedUser();
        List<Transaction> transactions = getTransactionsForPeriod(currentUser, startDate, endDate);

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("Personal Finance Statement - " + currentUser.getName());
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 10);
                contentStream.newLineAtOffset(50, 730);
                contentStream.showText("Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) + " | Email: " + currentUser.getEmail());
                contentStream.endText();

                int y = 690;
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
                contentStream.newLineAtOffset(50, y);
                contentStream.showText("Date         Type        Category          Account          Amount");
                contentStream.endText();

                contentStream.moveTo(50, y - 5);
                contentStream.lineTo(550, y - 5);
                contentStream.stroke();

                y -= 25;

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yy");
                contentStream.setFont(PDType1Font.HELVETICA, 9);
                for (Transaction t : transactions) {
                    if (y < 50) {
                        break;
                    }
                    contentStream.beginText();
                    contentStream.newLineAtOffset(50, y);
                    String line = String.format("%-12s %-10s %-16s %-16s Rs %s",
                            t.getTransactionDate().format(formatter),
                            t.getType().name(),
                            truncate(t.getCategory().getName(), 14),
                            truncate(t.getAccount().getName(), 14),
                            t.getAmount().toString());
                    contentStream.showText(line);
                    contentStream.endText();

                    y -= 18;
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private List<Transaction> getTransactionsForPeriod(User user, LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return transactionRepository.findByUserAndTransactionDateBetween(user, startDate, endDate);
        } else {
            return transactionRepository.findByUserOrderByTransactionDateDesc(user);
        }
    }

    private String truncate(String value, int length) {
        if (value == null) return "";
        return value.length() <= length ? value : value.substring(0, length - 2) + "..";
    }
}
