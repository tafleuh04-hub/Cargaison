export class InvoiceEmailService {
    static getInstance() {
        if (!InvoiceEmailService.instance) {
            InvoiceEmailService.instance = new InvoiceEmailService();
        }
        return InvoiceEmailService.instance;
    }
    // Générer le numéro de facture
    generateInvoiceNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
        return `FAC-${year}${month}${day}-${random}`;
    }
    // Calculer le montant basé sur le type de cargaison
    calculateAmount(poids, distance, typeCargaison) {
        let frais = 0;
        const FRAIS_MINIMUM = 10000; // 10,000 FCFA minimum
        switch (typeCargaison.toUpperCase()) {
            case "AERIEN":
                frais = poids * distance * 300;
                break;
            case "MARITIME":
                frais = poids * distance * 90 + 5000;
                break;
            case "ROUTIER":
                frais = poids * distance * 100;
                break;
            default:
                frais = poids * distance * 200;
        }
        return Math.max(FRAIS_MINIMUM, frais);
    }
    // Générer le HTML de la facture
    generateInvoiceHTML(data) {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${data.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .invoice { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #0891b2; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { color: #0891b2; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .invoice-title { font-size: 24px; color: #333; margin-bottom: 5px; }
        .invoice-number { color: #666; font-size: 16px; }
        .section { margin-bottom: 25px; }
        .section-title { background: #0891b2; color: white; padding: 8px 15px; margin-bottom: 15px; font-weight: bold; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .info-title { font-weight: bold; color: #0891b2; margin-bottom: 10px; }
        .colis-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .colis-table th, .colis-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .colis-table th { background: #0891b2; color: white; }
        .total-section { background: #f8f9fa; padding: 20px; border-radius: 5px; text-align: right; margin-top: 30px; }
        .total-amount { font-size: 24px; font-weight: bold; color: #0891b2; }
        .tracking-code { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .tracking-code strong { font-size: 20px; color: #d97706; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        @media print { body { background: white; } .invoice { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="invoice">
        <!-- En-tête -->
        <div class="header">
            <div class="company-name"> CARGO EXPRESS SÉNÉGAL</div>
            <div class="invoice-title">FACTURE / REÇU</div>
            <div class="invoice-number">N° ${data.invoiceNumber} - ${data.date}</div>
        </div>

        <!-- Informations principales -->
        <div class="info-grid">
            <div class="info-box">
                <div class="info-title"> EXPÉDITEUR</div>
                <p><strong>Nom:</strong> ${data.expediteur?.nom || "[Client Expéditeur]"}</p>
                <p><strong>Email:</strong> ${data.expediteur?.email || "[Email expéditeur]"}</p>
                <p><strong>Adresse:</strong> ${data.expediteur?.adresse || "Dakar, Sénégal"}</p>
            </div>
            
            <div class="info-box">
                <div class="info-title"> DESTINATAIRE</div>
                <p><strong>Nom:</strong> ${data.destinataire.prenom} ${data.destinataire.nom}</p>
                <p><strong>Email:</strong> ${data.destinataire.email}</p>
                <p><strong>Téléphone:</strong> ${data.destinataire.telephone}</p>
                <p><strong>Adresse:</strong> ${data.destinataire.adresse}</p>
            </div>
        </div>

        <!-- Détails du colis -->
        <div class="section">
            <div class="section-title"> DÉTAILS DU COLIS</div>
            <table class="colis-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Poids</th>
                        <th>Code de suivi</th>
                        <th>Montant</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${data.colis.libelle}</td>
                        <td><span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${data.colis.type}</span></td>
                        <td>${data.colis.poids} kg</td>
                        <td><code>${data.colis.codeSuivi}</code></td>
                        <td><strong>${data.montant.toLocaleString()} FCFA</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Transport -->
        <div class="section">
            <div class="section-title"> INFORMATIONS TRANSPORT</div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; background: #f0f9ff; padding: 15px; border-radius: 5px;">
                <div><strong>Cargaison:</strong><br>${data.cargaison.numero}</div>
                <div><strong>Type:</strong><br>${data.cargaison.type}</div>
                <div><strong>Trajet:</strong><br>${data.cargaison.lieuDepart} → ${data.cargaison.lieuArrivee}</div>
                <div><strong>Distance:</strong><br>${data.cargaison.distance.toLocaleString()} km</div>
            </div>
        </div>

        <!-- Code de suivi important -->
        <div class="tracking-code">
            <p style="margin: 0; font-size: 16px;">📱 <strong>CODE DE SUIVI IMPORTANT</strong></p>
            <p style="margin: 10px 0 0 0;"><strong>${data.colis.codeSuivi}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #7c2d12;">
                ⚠️ Conservez ce code ! Vous recevrez un nouveau code par email/SMS à l'arrivée.
            </p>
        </div>

        <!-- Total -->
        <div class="total-section">
            <div style="margin-bottom: 10px; font-size: 18px;">
                <strong>MONTANT TOTAL À PAYER</strong>
            </div>
            <div class="total-amount">${data.montant.toLocaleString()} FCFA</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
                (Tarif minimum: 10,000 FCFA appliqué)
            </div>
        </div>

        <!-- Pied de page -->
        <div class="footer">
            <p><strong>Cargo Express Sénégal</strong> - Dakar, Sénégal</p>
            <p>📞 +221 33 XXX XX XX | 📧 contact@cargoexpress.sn</p>
            <p style="font-size: 12px; margin-top: 15px;">
                Facture générée automatiquement le ${new Date().toLocaleString("fr-FR")}
            </p>
        </div>
    </div>
</body>
</html>`;
    }
    // Préparer les données de facture depuis les données du colis
    async prepareInvoiceData(colisData, cargaisonData) {
        const invoiceNumber = this.generateInvoiceNumber();
        const montant = this.calculateAmount(colisData.poids, cargaisonData.distance, cargaisonData.type);
        return {
            invoiceNumber,
            date: new Date().toLocaleDateString("fr-FR"),
            colis: {
                id: colisData.id || "N/A",
                libelle: colisData.libelle,
                poids: colisData.poids,
                type: colisData.type,
                codeSuivi: colisData.codeDeSuivi || "N/A",
                codeSs: colisData.codeSs || 0,
                typeuivi: colisData.typeuivi || "standard",
            },
            destinataire: colisData.destinataire,
            cargaison: {
                numero: cargaisonData.numero,
                type: cargaisonData.type,
                lieuDepart: cargaisonData.lieuDepart.pays,
                lieuArrivee: cargaisonData.lieuArrivee.pays,
                distance: cargaisonData.distance,
            },
            montant,
        };
    }
    // Afficher la facture dans un modal
    showInvoiceModal(invoiceData) {
        const modal = document.createElement("div");
        modal.id = "invoice-modal";
        modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4";
        modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 class="text-xl font-bold">Facture générée</h3>
          <div>
            <button onclick="printInvoice()" class="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600">
              <i class="fas fa-print mr-2"></i>Imprimer
            </button>
            <button onclick="closeInvoiceModal()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              <i class="fas fa-times mr-2"></i>Fermer
            </button>
          </div>
        </div>
        <div id="invoice-content">
          ${this.generateInvoiceHTML(invoiceData)}
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        // Fonctions globales pour les boutons
        window.closeInvoiceModal = () => {
            document.getElementById("invoice-modal")?.remove();
        };
        window.printInvoice = () => {
            const content = document.getElementById("invoice-content")?.innerHTML;
            if (content) {
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                    printWindow.document.write(content);
                    printWindow.document.close();
                    printWindow.print();
                }
            }
        };
    }
    // Envoyer l'email avec le code de suivi
    async sendTrackingEmail(invoiceData) {
        try {
            console.log("[v0] Début envoi email...");
            const emailData = {
                to: invoiceData.destinataire.email,
                subject: `Colis enregistré - Code de suivi: ${invoiceData.colis.codeSuivi}`,
                html: this.generateEmailHTML(invoiceData),
            };
            console.log("[v0] Données email préparées:", {
                to: emailData.to,
                subject: emailData.subject,
                htmlLength: emailData.html.length,
            });
            const response = await fetch("./api/send-email.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailData),
            });
            console.log("[v0] Statut de la réponse:", response.status);
            const result = await response.json();
            console.log("[v0] Réponse du serveur:", result);
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}: ${result.message || "Erreur inconnue"}`);
            }
            if (!result.success) {
                throw new Error(`Erreur d'envoi: ${result.message || "Échec de l'envoi"}`);
            }
            console.log("[v0] Email envoyé avec succès!");
            return true;
        }
        catch (error) {
            console.error("[v0] Erreur détaillée lors de l'envoi:", error);
            if (error instanceof TypeError && error.message.includes("fetch")) {
                throw new Error("Impossible de contacter le serveur PHP. Vérifiez que le serveur web est démarré.");
            }
            throw error;
        }
    }
    // Générer le HTML de l'email
    generateEmailHTML(data) {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation d'enregistrement de colis</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0891b2, #0e7490); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;"> Cargo Express Sénégal</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Confirmation d'enregistrement de colis</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #0891b2; margin-top: 0;">Bonjour ${data.destinataire.prenom} ${data.destinataire.nom},</h2>
        <p>Votre colis a été enregistré avec succès dans notre système !</p>
    </div>

    <div style="border: 2px solid #fbbf24; background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h3 style="color: #d97706; margin-top: 0;">📱 Code de Suivi Important</h3>
        <div style="font-size: 20px; font-weight: bold; color: #92400e; font-family: monospace;">
            ${data.colis.codeSuivi}
        </div>
        <p style="margin-bottom: 0; font-size: 14px; color: #7c2d12;">
            ⚠️ Conservez précieusement ce code !
        </p>
    </div>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #0891b2; margin-top: 0;"> Détails de votre colis</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Libellé:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.colis.libelle}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Poids:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.colis.poids} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Type:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.colis.type}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Facture N°:</strong></td>
                <td style="padding: 8px 0;">${data.invoiceNumber}</td>
            </tr>
        </table>
    </div>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #0891b2; margin-top: 0;"> Informations de transport</h3>
        <p><strong>Cargaison:</strong> ${data.cargaison.numero}</p>
        <p><strong>Type de transport:</strong> ${data.cargaison.type}</p>
        <p><strong>Trajet:</strong> ${data.cargaison.lieuDepart} → ${data.cargaison.lieuArrivee}</p>
        <p><strong>Distance:</strong> ${data.cargaison.distance.toLocaleString()} km</p>
    </div>

    <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h3 style="color: #166534; margin-top: 0;"> Montant total</h3>
        <div style="font-size: 24px; font-weight: bold; color: #166534;">
            ${data.montant.toLocaleString()} FCFA
        </div>
    </div>

    <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h3 style="color: #1d4ed8; margin-top: 0;"> Prochaines étapes</h3>
        <ul style="margin: 0; padding-left: 20px;">
            <li>Votre colis est en cours de traitement</li>
            <li>Vous recevrez un <strong>nouveau code par email/SMS</strong> une fois le colis arrivé à destination</li>
            <li>Présentez ce nouveau code pour récupérer votre colis</li>
        </ul>
    </div>

    <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280;">
        <p><strong>Cargo Express Sénégal</strong></p>
        <p>📞 +221 33 XXX XX XX | 📧 contact@cargoexpress.sn</p>
        <p style="font-size: 12px;">Merci de votre confiance !</p>
    </div>
</body>
</html>`;
    }
}
