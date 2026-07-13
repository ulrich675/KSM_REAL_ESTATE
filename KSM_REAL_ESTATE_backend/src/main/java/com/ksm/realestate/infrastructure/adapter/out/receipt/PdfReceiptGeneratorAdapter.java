package com.ksm.realestate.infrastructure.adapter.out.receipt;

import com.ksm.realestate.application.port.out.PropertyRepositoryPort;
import com.ksm.realestate.application.port.out.ReceiptGeneratorPort;
import com.ksm.realestate.application.port.out.UserRepositoryPort;
import com.ksm.realestate.domain.exception.BusinessException;
import com.ksm.realestate.domain.model.Payment;
import com.ksm.realestate.domain.model.Property;
import com.ksm.realestate.domain.model.User;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Adapter implementing ReceiptGeneratorPort using OpenHTMLToPDF.
 * Generates a styled KSM Real Estate receipt PDF from an enriched HTML
 * template.
 *
 * @author ulrich675
 * @date 2026-07-13
 */
@Component
@RequiredArgsConstructor
public class PdfReceiptGeneratorAdapter implements ReceiptGeneratorPort {

    private static final String RECEIPTS_DIRECTORY = "receipts";
    private static final String RECEIPTS_URL_PREFIX = "/receipts/";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.of("Africa/Douala"));

    private final UserRepositoryPort userRepositoryPort;
    private final PropertyRepositoryPort propertyRepositoryPort;

    @Override
    public Mono<String> generateReceipt(Payment payment) {
        // Resolve client, property and owner before generating the PDF
        Mono<User> clientMono = userRepositoryPort.findById(payment.getUserId())
                .defaultIfEmpty(unknownUser(payment.getUserId()));
        Mono<Property> propertyMono = propertyRepositoryPort.findById(payment.getPropertyId())
                .defaultIfEmpty(unknownProperty(payment.getPropertyId()));

        return Mono.zip(clientMono, propertyMono)
                .flatMap(tuple -> {
                    User client = tuple.getT1();
                    Property property = tuple.getT2();
                    return userRepositoryPort.findById(property.getOwnerId())
                            .defaultIfEmpty(unknownUser(property.getOwnerId()))
                            .map(owner -> buildReceiptHtml(payment, client, property, owner));
                })
                .flatMap(html -> Mono.fromCallable(() -> saveAsPdf(payment, html))
                        .subscribeOn(Schedulers.boundedElastic()));
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private String saveAsPdf(Payment payment, String html) {
        try {
            Files.createDirectories(Path.of(RECEIPTS_DIRECTORY));
            String fileName = "receipt-" + payment.getPaymentId() + ".pdf";
            Path outputPath = Path.of(RECEIPTS_DIRECTORY, fileName);

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

    private String buildReceiptHtml(Payment payment, User client, Property property, User owner) {
        String date = payment.getPaidAt() != null ? FORMATTER.format(payment.getPaidAt()) : "—";
        String clientName = client.getFirstName() + " " + client.getLastName();
        String ownerName = owner.getFirstName() + " " + owner.getLastName();
        String propTitle = property.getTitle() != null ? property.getTitle() : "—";

        return "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'/><style>"
                + "* { box-sizing: border-box; margin: 0; padding: 0; }"
                + "body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; color: #1e293b; }"
                + ".header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; }"
                + ".logo { font-size: 26px; font-weight: 800; letter-spacing: 1px; }"
                + ".logo span { color: #f97316; }"
                + ".receipt-label { font-size: 13px; opacity: 0.7; font-weight: 400; margin-top: 4px; }"
                + ".badge { background: #6366f1; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }"
                + ".body { padding: 36px 40px; }"
                + "h2 { font-size: 17px; color: #6366f1; margin-bottom: 16px; text-transform: uppercase; letter-spacing: .5px; border-bottom: 2px solid #6366f1; padding-bottom: 6px; }"
                + "table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }"
                + "td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }"
                + "td:first-child { font-weight: 600; color: #475569; width: 40%; }"
                + "td:last-child { color: #0f172a; }"
                + ".amount-row td { background: #fff7ed; }"
                + ".amount-value { font-size: 20px; font-weight: 800; color: #f97316; }"
                + ".status-ok { display: inline-block; background: #dcfce7; color: #16a34a; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; }"
                + ".footer { background: #1e293b; color: #94a3b8; text-align: center; padding: 16px 40px; font-size: 12px; }"
                + "</style></head><body>"
                + "<div class='header'>"
                + "<div><div class='logo'>KSM<span>.</span>Real Estate</div><div class='receipt-label'>Reçu de Transaction Officiel</div></div>"
                + "<div class='badge'>Confirmé</div>"
                + "</div>"
                + "<div class='body'>"
                + "<h2>Informations de transaction</h2>"
                + "<table>"
                + "<tr><td>Référence paiement</td><td>#" + payment.getPaymentId() + "</td></tr>"
                + "<tr><td>Date du paiement</td><td>" + date + " (WAT)</td></tr>"
                + "<tr class='amount-row'><td>Montant réglé</td><td><span class='amount-value'>"
                + String.format("%,.0f", payment.getAmount().doubleValue()) + " " + payment.getCurrency()
                + "</span></td></tr>"
                + "<tr><td>Statut</td><td><span class='status-ok'>" + payment.getStatus() + "</span></td></tr>"
                + "</table>"
                + "<h2>Bien immobilier</h2>"
                + "<table>"
                + "<tr><td>Titre</td><td>" + propTitle + "</td></tr>"
                + "<tr><td>Référence bien</td><td>#" + property.getPropertyId() + "</td></tr>"
                + "</table>"
                + "<h2>Parties</h2>"
                + "<table>"
                + "<tr><td>Client (acheteur)</td><td>" + clientName + " <small style='color:#94a3b8'>(ID "
                + client.getUserId() + ")</small></td></tr>"
                + "<tr><td>Propriétaire</td><td>" + ownerName + " <small style='color:#94a3b8'>(ID " + owner.getUserId()
                + ")</small></td></tr>"
                + "</table>"
                + "</div>"
                + "<div class='footer'>KSM Real Estate — Plateforme immobilière de confiance | " + date + "</div>"
                + "</body></html>";
    }

    // ── default stubs when entity not found ────────────────────────────────

    private User unknownUser(Long id) {
        User u = new User();
        u.setUserId(id);
        u.setFirstName("Utilisateur");
        u.setLastName("#" + id);
        return u;
    }

    private Property unknownProperty(Long id) {
        Property p = new Property();
        p.setPropertyId(id);
        p.setTitle("Bien #" + id);
        p.setOwnerId(0L);
        return p;
    }
}