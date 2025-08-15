<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

// Configuration SMTP depuis tes credentials
const SMTP_CONFIG = [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'username' => 'seckmoustapha238@gmail.com',
    'password' => 'ovae hedy rpot hmwd', 
    'from_email' => 'seckmoustapha238@gmail.com',
    'from_name' => 'GP du Monde'
];

function sendEmail($to, $subject, $htmlBody) {
    $mail = new PHPMailer(true);

    try {
        // Configuration du serveur SMTP
        $mail->isSMTP();
        $mail->Host = SMTP_CONFIG['host'];
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_CONFIG['username'];
        $mail->Password = SMTP_CONFIG['password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_CONFIG['port'];
        
        $mail->SMTPDebug = 0; // Mettre à 2 pour debug complet
        $mail->Debugoutput = 'error_log';
        
        // Configuration de l'encodage
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        // Expéditeur
        $mail->setFrom(SMTP_CONFIG['from_email'], SMTP_CONFIG['from_name']);
        $mail->addReplyTo(SMTP_CONFIG['from_email'], SMTP_CONFIG['from_name']);

        // Destinataire
        $mail->addAddress($to);

        // Contenu de l'email
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $htmlBody;
        
        // Version texte alternative
        $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $htmlBody));

        // Envoi
        $mail->send();
        
        return [
            'success' => true,
            'message' => 'Email envoyé avec succès',
            'to' => $to,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        error_log("Erreur PHPMailer: " . $e->getMessage() . " - " . date('Y-m-d H:i:s'));
        error_log("SMTP Error Info: " . $mail->ErrorInfo);
        
        return [
            'success' => false,
            'message' => "Erreur lors de l'envoi: {$mail->ErrorInfo}",
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
}

// Traitement de la requête POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    error_log("Données reçues: " . $rawInput);
    
    $input = json_decode($rawInput, true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Données JSON invalides',
            'received' => $rawInput
        ]);
        exit;
    }
    
    // Validation des données
    if (!isset($input['to']) || !isset($input['subject']) || !isset($input['html'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Paramètres manquants: to, subject, html requis',
            'received_keys' => array_keys($input)
        ]);
        exit;
    }
    
    // Validation de l'email
    if (!filter_var($input['to'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Adresse email invalide: ' . $input['to']
        ]);
        exit;
    }
    
    error_log("Tentative d'envoi email à: " . $input['to'] . " - " . date('Y-m-d H:i:s'));
    
    // Envoi de l'email
    $result = sendEmail($input['to'], $input['subject'], $input['html']);
    
    if ($result['success']) {
        http_response_code(200);
        error_log("Email envoyé avec succès à: " . $input['to'] . " - " . date('Y-m-d H:i:s'));
    } else {
        http_response_code(500);
        error_log("Erreur envoi email: " . $result['message'] . " - " . date('Y-m-d H:i:s'));
    }
    
    echo json_encode($result);
    
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée. Utiliser POST.'
    ]);
}
?>