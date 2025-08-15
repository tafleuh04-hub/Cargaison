// Déclaration des types globaux pour Window
declare global {
  interface Window {
    closeInvoiceModal: () => void
    printInvoice: () => void
  }
}

export interface InvoiceData {
  invoiceNumber: string
  date: string
  colis: {
    id: string
    libelle: string
    poids: string
    codeSs: number
    typeuivi: string
    codeSuivi: string
    type: string
    emailDestinataire?: string
  }
  destinataire: {
    nom: string
    prenom: string
    email: string
    telephone: string
    adresse: string
  }
  expediteur?: {
    nom: string
    email: string
    adresse: string
  }
  cargaison: {
    numero: string
    type: string
    lieuDepart: string
    lieuArrivee: string
    distance: number
  }
  montant: number
}

export class InvoiceEmailService {
  private static instance: InvoiceEmailService

  public static getInstance(): InvoiceEmailService {
    if (!InvoiceEmailService.instance) {
      InvoiceEmailService.instance = new InvoiceEmailService()
    }
    return InvoiceEmailService.instance
  }

  // Générer le numéro de facture
  private generateInvoiceNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `FAC-${year}${month}${day}-${random}`
  }

  // Calculer le montant basé sur le type de cargaison
  private calculateAmount(poids: number, distance: number, typeCargaison: string): number {
    let frais = 0
    const FRAIS_MINIMUM = 10000 // 10,000 FCFA minimum

    switch (typeCargaison.toUpperCase()) {
      case "AERIEN":
        frais = poids * distance * 300
        break
      case "MARITIME":
        frais = poids * distance * 90 + 5000
        break
      case "ROUTIER":
        frais = poids * distance * 100
        break
      default:
        frais = poids * distance * 200
    }

    return Math.max(FRAIS_MINIMUM, frais)
  }

  // Générer le HTML de la facture
  public generateInvoiceHTML(data: InvoiceData): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${data.invoiceNumber}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #f8fafc; 
            color: #1a202c;
            line-height: 1.5;
        }
        .invoice { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
            max-width: 800px; 
            margin: 0 auto; 
            border: 1px solid #e2e8f0;
        }
        .header { 
            text-align: center; 
            border-bottom: 4px solid #0891b2; 
            padding-bottom: 25px; 
            margin-bottom: 35px; 
        }
        .company-name { 
            color: #0891b2; 
            font-size: 32px; 
            font-weight: 900; 
            margin-bottom: 12px; 
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .invoice-title { 
            font-size: 26px; 
            color: #2d3748; 
            margin-bottom: 8px; 
            font-weight: 700;
        }
        .invoice-number { 
            color: #4a5568; 
            font-size: 18px; 
            font-weight: 600;
        }
        .section { 
            margin-bottom: 30px; 
        }
        .section-title { 
            background: linear-gradient(135deg, #0891b2, #0e7490); 
            color: white; 
            padding: 12px 20px; 
            margin-bottom: 20px; 
            font-weight: 700; 
            font-size: 16px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 25px; 
            margin-bottom: 25px; 
        }
        .info-box { 
            background: #f7fafc; 
            padding: 20px; 
            border-radius: 8px; 
            border: 2px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .info-title { 
            font-weight: 800; 
            color: #0891b2; 
            margin-bottom: 15px; 
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-box p {
            margin: 8px 0;
            color: #2d3748;
            font-weight: 500;
        }
        .info-box strong {
            color: #1a202c;
            font-weight: 700;
        }
        .colis-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .colis-table th, .colis-table td { 
            border: 1px solid #cbd5e0; 
            padding: 16px; 
            text-align: left; 
            font-weight: 500;
        }
        .colis-table th { 
            background: linear-gradient(135deg, #0891b2, #0e7490); 
            color: white; 
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .colis-table td {
            background: white;
            color: #2d3748;
            font-weight: 600;
        }
        .colis-table tr:nth-child(even) td {
            background: #f7fafc;
        }
        .total-section { 
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe); 
            padding: 25px; 
            border-radius: 8px; 
            text-align: right; 
            margin-top: 35px; 
            border: 2px solid #0891b2;
        }
        .total-amount { 
            font-size: 28px; 
            font-weight: 900; 
            color: #0891b2; 
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .tracking-code { 
            background: linear-gradient(135deg, #fef3c7, #fde68a); 
            border: 3px solid #f59e0b; 
            padding: 20px; 
            border-radius: 12px; 
            text-align: center; 
            margin: 25px 0; 
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
        }
        .tracking-code strong { 
            font-size: 24px; 
            color: #92400e; 
            font-weight: 900;
            font-family: 'Courier New', monospace;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .transport-grid {
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe); 
            padding: 20px; 
            border-radius: 8px;
            border: 2px solid #0891b2;
        }
        .transport-item {
            text-align: center;
            color: #1e40af;
            font-weight: 600;
        }
        .transport-item strong {
            display: block;
            color: #0891b2;
            font-size: 14px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 25px; 
            border-top: 2px solid #e2e8f0; 
            color: #4a5568; 
            font-weight: 500;
        }
        .footer strong {
            color: #0891b2;
            font-size: 18px;
        }
        @media print { 
            body { 
                background: white !important; 
                padding: 0 !important; 
                font-size: 12px !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            .invoice { 
                box-shadow: none !important; 
                border: 1px solid #000 !important; 
                padding: 20px !important;
                margin: 0 !important;
                max-width: none !important;
                page-break-inside: avoid;
            }
            .header {
                padding-bottom: 15px !important;
                margin-bottom: 20px !important;
            }
            .company-name { 
                font-size: 24px !important; 
                margin-bottom: 8px !important;
                text-shadow: none !important;
            }
            .invoice-title { 
                font-size: 18px !important; 
                margin-bottom: 5px !important;
            }
            .invoice-number { 
                font-size: 14px !important;
            }
            .section { 
                margin-bottom: 20px !important; 
                page-break-inside: avoid;
            }
            .section-title { 
                background: #0891b2 !important; 
                color: white !important;
                padding: 8px 15px !important;
                margin-bottom: 15px !important;
                font-size: 14px !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            .info-grid { 
                gap: 15px !important; 
                margin-bottom: 20px !important;
            }
            .info-box { 
                background: #f9f9f9 !important; 
                padding: 15px !important;
                border: 1px solid #ccc !important;
                box-shadow: none !important;
            }
            .info-title { 
                font-size: 14px !important;
                margin-bottom: 10px !important;
            }
            .info-box p {
                margin: 5px 0 !important;
                font-size: 12px !important;
            }
            .colis-table { 
                margin-top: 15px !important;
                box-shadow: none !important;
                font-size: 11px !important;
            }
            .colis-table th, .colis-table td { 
                padding: 8px !important;
                border: 1px solid #000 !important;
            }
            .colis-table th { 
                background: #0891b2 !important; 
                color: white !important;
                font-size: 11px !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            .colis-table td {
                background: white !important;
                font-size: 11px !important;
            }
            .total-section { 
                background: #f9f9f9 !important; 
                padding: 15px !important;
                margin-top: 20px !important;
                border: 2px solid #000 !important;
            }
            .total-amount { 
                font-size: 20px !important;
                text-shadow: none !important;
            }
            .tracking-code { 
                background: #fff9c4 !important; 
                border: 2px solid #000 !important;
                padding: 15px !important;
                margin: 15px 0 !important;
                box-shadow: none !important;
            }
            .tracking-code strong { 
                font-size: 18px !important;
                text-shadow: none !important;
            }
            .transport-grid {
                gap: 10px !important;
                background: #f9f9f9 !important;
                padding: 15px !important;
                border: 1px solid #000 !important;
            }
            .transport-item {
                font-size: 11px !important;
            }
            .transport-item strong {
                font-size: 10px !important;
                margin-bottom: 3px !important;
            }
            .footer { 
                margin-top: 20px !important;
                padding-top: 15px !important;
                font-size: 10px !important;
            }
            .footer strong {
                font-size: 12px !important;
            }
            /* Masquer les éléments décoratifs à l'impression */
            .company-name::before,
            .info-title::before,
            .section-title::before {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="invoice">
        <!-- En-tête -->
        <div class="header">
            <div class="company-name">CARGO EXPRESS SÉNÉGAL</div>
            <div class="invoice-title">FACTURE / REÇU</div>
            <div class="invoice-number">N° ${data.invoiceNumber} - ${data.date}</div>
        </div>

        <!-- Informations principales -->
        <div class="info-grid">
            <div class="info-box">
                <div class="info-title"> EXPÉDITEUR</div>
                <p><strong>Nom:</strong> ${data.destinataire?.nom || "Cargo Express"}</p>
                <p><strong>Prenom:</strong> ${data.destinataire?.prenom || "Senegal"}</p>
                <p><strong>Telephone:</strong> ${data.destinataire?.telephone || "+221 77 786 77 40"}</p>
                <p><strong>Adresse:</strong> ${data.destinataire?.adresse || "Dakar, Sénégal"}</p>
            </div>
            
            <div class="info-box">
                <div class="info-title">DESTINATAIRE</div>
                <p><strong>Email du destinataire:</strong> ${data.colis.emailDestinataire || data.destinataire.email}</p>
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
                        <td><strong>${data.colis.libelle}</strong></td>
                        <td><span style="background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase;">${data.colis.type}</span></td>
                        <td><strong>${data.colis.poids} kg</strong></td>
                        <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-weight: 700; color: #0f172a;">${data.colis.codeSuivi}</code></td>
                        <td><strong style="color: #0891b2; font-size: 16px;">${data.montant.toLocaleString()} FCFA</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Transport -->
        <div class="section">
            <div class="section-title"> INFORMATIONS TRANSPORT</div>
            <div class="transport-grid">
                <div class="transport-item">
                    <strong>Cargaison</strong>
                    <div>${data.cargaison.numero}</div>
                </div>
                <div class="transport-item">
                    <strong>Type</strong>
                    <div>${data.cargaison.type}</div>
                </div>
                <div class="transport-item">
                    <strong>Trajet</strong>
                    <div>${data.cargaison.lieuDepart} → ${data.cargaison.lieuArrivee}</div>
                </div>
                <div class="transport-item">
                    <strong>Distance</strong>
                    <div>${data.cargaison.distance.toLocaleString()} km</div>
                </div>
            </div>
        </div>

        <!-- Code de suivi important -->
        <div class="tracking-code">
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #92400e;"> CODE DE SUIVI IMPORTANT</p>
            <p style="margin: 15px 0; font-size: 12px;"><strong>${data.colis.codeSuivi}</strong></p>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #7c2d12; font-weight: 600;">
                 Conservez ce code ! Vous recevrez un nouveau code par email/SMS à l'arrivée.
            </p>
        </div>

        <!-- Total -->
        <div class="total-section">
            <div style="margin-bottom: 15px; font-size: 20px; color: #1a202c; font-weight: 700;">
                 MONTANT TOTAL À PAYER
            </div>
            <div class="total-amount">${data.montant.toLocaleString()} FCFA</div>
            <div style="font-size: 14px; color: #4a5568; margin-top: 8px; font-weight: 600;">
                (Tarif minimum: 10,000 FCFA appliqué)
            </div>
        </div>

        <!-- Pied de page -->
        <div class="footer">
            <p><strong> Cargo Express Sénégal</strong> - Dakar, Sénégal</p>
            <p style="font-size: 16px; color: #0891b2; font-weight: 600;"> +221 33 XXX XX XX |  contact@cargoexpress.sn</p>
            <p style="font-size: 12px; margin-top: 20px; color: #718096;">
                Facture générée automatiquement le ${new Date().toLocaleString("fr-FR")}
            </p>
        </div>
    </div>
</body>
</html>`
  }

  // Préparer les données de facture depuis les données du colis
  public async prepareInvoiceData(colisData: any, cargaisonData: any): Promise<InvoiceData> {
    const invoiceNumber = this.generateInvoiceNumber()
    const montant = this.calculateAmount(colisData.poids, cargaisonData.distance, cargaisonData.type)

    const codeSuivi =
      colisData.codeSuivi ||
      colisData.codeDeSuivi ||
      `CS-${Date.now()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`

    return {
      invoiceNumber,
      date: new Date().toLocaleDateString("fr-FR"),
      colis: {
        id: colisData.id || "",
        libelle: colisData.libelle,
        poids: colisData.poids,
        type: colisData.type,
        codeSuivi: codeSuivi, // Utilisation du code généré
        codeSs: colisData.codeSs || 0,
        typeuivi: colisData.typeuivi || "standard",
        emailDestinataire: colisData.emailDestinataire,
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
    }
  }

  // Afficher la facture dans un modal
  public showInvoiceModal(invoiceData: InvoiceData): void {
    const modal = document.createElement("div")
    modal.id = "invoice-modal"
    modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"

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
    `

    document.body.appendChild(modal)

    // Fonctions globales pour les boutons
    window.closeInvoiceModal = () => {
      document.getElementById("invoice-modal")?.remove()
    }

    window.printInvoice = () => {
      const content = document.getElementById("invoice-content")?.innerHTML
      if (content) {
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(content)
          printWindow.document.close()
          printWindow.print()
        }
      }
    }
  }

  // Envoyer l'email avec le code de suivi
  public async sendTrackingEmail(invoiceData: InvoiceData): Promise<boolean> {
    try {
      console.log(" Début envoi email...")
      const emailData = {
        to: invoiceData.colis.emailDestinataire || invoiceData.destinataire.email,
        subject: `Colis enregistré - Code de suivi: ${invoiceData.colis.codeSuivi}`,
        html: this.generateEmailHTML(invoiceData),
      }

      console.log(" Données email préparées:", {
        to: emailData.to,
        subject: emailData.subject,
        htmlLength: emailData.html.length,
      })

      const response = await fetch("./api/send-email.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      })

      console.log(" Statut de la réponse:", response.status)

      const result = await response.json()
      console.log(" Réponse du serveur:", result)

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${result.message || "Erreur inconnue"}`)
      }

      if (!result.success) {
        throw new Error(`Erreur d'envoi: ${result.message || "Échec de l'envoi"}`)
      }

      console.log(" Email envoyé avec succès!")
      return true
    } catch (error) {
      console.error("[v0] Erreur détaillée lors de l'envoi:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Impossible de contacter le serveur PHP. Vérifiez que le serveur web est démarré.")
      }

      throw error
    }
  }

  // Générer le HTML de l'email
  private generateEmailHTML(data: InvoiceData): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de suivi - Cargo Express Sénégal</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0891b2, #0e7490); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;"> Cargo Express Sénégal</h1>
        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Votre colis est enregistré</p>
    </div>

    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
        <h2 style="color: #0891b2; margin-top: 0; font-size: 22px;"> Votre colis est en cours de traitement</h2>
        <p style="font-size: 16px; margin-bottom: 0;">Nous vous tiendrons informé de son avancement.</p>
    </div>

    <div style="border: 3px solid #fbbf24; background: #fef3c7; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
        <h3 style="color: #d97706; margin-top: 0; font-size: 20px;">Votre Code de Suivi</h3>
        <div style="font-size: 32px; font-weight: bold; color: #92400e; font-family: 'Courier New', monospace; background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #f59e0b;">
            ${data.colis.codeSuivi}
        </div>
        <p style="margin-bottom: 0; font-size: 16px; color: #7c2d12; font-weight: 600;">
            Conservez précieusement ce code !
        </p>
    </div>

    <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #1d4ed8; margin-top: 0; font-size: 20px;"> Instructions importantes</h3>
        <div style="font-size: 16px; line-height: 1.8;">
            <p style="margin: 0 0 15px 0;"> <strong>Vous recevrez un nouveau code par email/SMS</strong> une fois le colis arrivé à destination</p>
            <p style="margin: 0 0 15px 0;"> <strong>Présentez ce nouveau code pour récupérer votre colis</strong></p>
            <p style="margin: 0; color: #1e40af; font-weight: 600;"> Restez attentif à vos notifications !</p>
        </div>
    </div>

    <div style="text-align: center; padding: 25px; border-top: 2px solid #e5e7eb; color: #6b7280;">
        <p style="font-size: 18px; margin-bottom: 10px;"><strong style="color: #0891b2;"> Cargo Express Sénégal</strong></p>
        <p style="font-size: 16px; margin-bottom: 15px;">📞 +221 33 XXX XX XX | 📧 contact@cargoexpress.sn</p>
        <p style="font-size: 14px; color: #16a34a; font-weight: 600;">Merci de votre confiance ! </p>
    </div>
</body>
</html>`
  }
}
