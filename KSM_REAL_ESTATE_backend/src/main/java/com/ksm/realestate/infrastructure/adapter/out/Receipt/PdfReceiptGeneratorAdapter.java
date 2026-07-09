package com.ksm.realestate.infrastructure.adapter.out.receipt;

import com.ksm.realestate.application.port.out.ReceiptGeneratorPort;
import com.ksm.realestate.domain.exception.BusinessException;
import com.ksm.realestate.domain.model.Payment;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Adapter implementing ReceiptGeneratorPort using OpenHTMLToPDF.
 * Generates a receipt PDF from an HTML template and stores it on local disk.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Component
public class PdfReceiptGeneratorAdapter implements ReceiptGeneratorPort {

    private static final String RECEIPTS_DIRECTORY = "receipts";
    private static final String RECEIPTS_URL_PREFIX = "/receipts/";

    @Override
    public Mono<String> generateReceipt(Payment payment) {
        return Mono.fromCallable(() -> buildAndSaveReceipt(payment))
                .subscribeOn(Schedulers.boundedElastic());
    }

    private String buildAndSaveReceipt(Payment payment) {
        try {
            Files.createDirectories(Path.of(RECEIPTS_DIRECTORY));
            String fileName = "receipt-" + payment.getPaymentId() + ".pdf";
            Path outputPath = Path.of(RECEIPTS_DIRECTORY, fileName);

            String html = buildReceiptHtml(payment);

            try (FileOutputStream outputStream = new FileOutputStream(outputPath.toFile())) {
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.useFastMode();
                builder.withHtmlContent(html, null);
                builder.toStream(outputStream);
                builder.run();
            }

            return RECEIPTS_URL_PREFIX + fileName;
        } catch (IOException e) {
            throw new BusinessException("RECEIPT_GENERATION_FAILED",
                    "Failed to generate receipt for payment " + payment.getPaymentId());
        }
    }

    private String buildReceiptHtml(Payment payment) {
        return "<html><body>"
                + "<h1>Payment Receipt</h1>"
                + "<p>Payment ID: " + payment.getPaymentId() + "</p>"
                + "<p>Property ID: " + payment.getPropertyId() + "</p>"
                + "<p>User ID: " + payment.getUserId() + "</p>"
                + "<p>Amount: " + payment.getAmount() + " " + payment.getCurrency() + "</p>"
                + "<p>Status: " + payment.getStatus() + "</p>"
                + "<p>Paid at: " + payment.getPaidAt() + "</p>"
                + "</body></html>";
    }
}