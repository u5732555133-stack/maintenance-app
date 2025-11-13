const { Resend } = require('resend');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

/**
 * Service générique d'envoi d'emails supportant 3 providers:
 * - Resend (recommandé - 3000 emails/mois gratuit)
 * - SendGrid (100 emails/jour gratuit)
 * - SMTP (Gmail, Outlook, etc.)
 */

/**
 * Envoie un email via le provider configuré
 * @param {Object} emailConfig - Configuration email de l'établissement
 * @param {string} toEmail - Email du destinataire
 * @param {string} toName - Nom du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} htmlContent - Contenu HTML de l'email
 * @returns {Promise<boolean>} - true si envoyé, false sinon
 */
async function sendEmail(emailConfig, toEmail, toName, subject, htmlContent) {
  if (!emailConfig || !emailConfig.configured) {
    console.error('❌ Email non configuré pour cet établissement');
    return false;
  }

  const provider = emailConfig.provider;

  try {
    switch (provider) {
      case 'resend':
        return await sendViaResend(emailConfig, toEmail, toName, subject, htmlContent);

      case 'sendgrid':
        return await sendViaSendGrid(emailConfig, toEmail, toName, subject, htmlContent);

      case 'smtp':
        return await sendViaSMTP(emailConfig, toEmail, toName, subject, htmlContent);

      default:
        console.error(`❌ Provider inconnu: ${provider}`);
        return false;
    }
  } catch (error) {
    console.error(`❌ Erreur envoi email via ${provider}:`, error);
    return false;
  }
}

/**
 * Envoi via Resend
 */
async function sendViaResend(emailConfig, toEmail, toName, subject, htmlContent) {
  const resend = new Resend(emailConfig.resendApiKey);

  const result = await resend.emails.send({
    from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
    to: `${toName} <${toEmail}>`,
    subject: subject,
    html: htmlContent,
  });

  if (result.error) {
    console.error('❌ Erreur Resend:', result.error);
    return false;
  }

  console.log(`✉️ Email envoyé via Resend à: ${toEmail}`);
  return true;
}

/**
 * Envoi via SendGrid
 */
async function sendViaSendGrid(emailConfig, toEmail, toName, subject, htmlContent) {
  sgMail.setApiKey(emailConfig.sendgridApiKey);

  const msg = {
    to: {
      email: toEmail,
      name: toName,
    },
    from: {
      email: emailConfig.fromEmail,
      name: emailConfig.fromName,
    },
    subject: subject,
    html: htmlContent,
  };

  await sgMail.send(msg);
  console.log(`✉️ Email envoyé via SendGrid à: ${toEmail}`);
  return true;
}

/**
 * Envoi via SMTP (Gmail, Outlook, etc.)
 */
async function sendViaSMTP(emailConfig, toEmail, toName, subject, htmlContent) {
  const transporter = nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: parseInt(emailConfig.smtpPort) || 587,
    secure: parseInt(emailConfig.smtpPort) === 465, // true pour port 465, false pour autres
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPassword,
    },
  });

  const mailOptions = {
    from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
    to: `"${toName}" <${toEmail}>`,
    subject: subject,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✉️ Email envoyé via SMTP à: ${toEmail} - MessageId: ${info.messageId}`);
  return true;
}

/**
 * Génère le template HTML pour les emails de maintenance
 * @param {Object} data - Données pour le template
 * @returns {string} - HTML de l'email
 */
function generateMaintenanceEmailTemplate(data) {
  const {
    contactNom,
    nomTache,
    urlPdf,
    responsableNom,
    responsableEmail,
    responsableAdjointNom,
    responsableAdjointEmail,
    confirmUrl,
    etablissementNom,
  } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel Maintenance</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #3b82f6;
    }
    .header h1 {
      color: #3b82f6;
      font-size: 24px;
      margin: 0 0 8px 0;
    }
    .header p {
      color: #6b7280;
      margin: 0;
      font-size: 14px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 24px;
    }
    .task-card {
      background-color: #f9fafb;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .task-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 16px 0;
    }
    .task-detail {
      margin: 12px 0;
      display: flex;
      align-items: flex-start;
    }
    .task-icon {
      margin-right: 8px;
      font-size: 18px;
    }
    .task-label {
      font-weight: 600;
      color: #4b5563;
    }
    .task-value {
      color: #6b7280;
    }
    .contacts-section {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .contacts-title {
      font-size: 16px;
      font-weight: 600;
      color: #92400e;
      margin: 0 0 12px 0;
    }
    .contact-item {
      margin: 8px 0;
      color: #78350f;
    }
    .cta-button {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
      transition: background-color 0.3s;
    }
    .cta-button:hover {
      background-color: #059669;
    }
    .cta-container {
      text-align: center;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .footer-note {
      margin-top: 16px;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🛠️ Rappel de Maintenance</h1>
      <p>${etablissementNom}</p>
    </div>

    <div class="greeting">
      Bonjour <strong>${contactNom}</strong>,
    </div>

    <p>
      C'est le moment d'effectuer la maintenance suivante. Merci de réaliser cette tâche dans les meilleurs délais.
    </p>

    <div class="task-card">
      <div class="task-title">📌 ${nomTache}</div>

      ${urlPdf ? `
      <div class="task-detail">
        <span class="task-icon">📄</span>
        <div>
          <span class="task-label">Fiche technique :</span><br>
          <a href="${urlPdf}" target="_blank" style="color: #3b82f6;">${urlPdf}</a>
        </div>
      </div>
      ` : ''}
    </div>

    ${(responsableNom || responsableAdjointNom) ? `
    <div class="contacts-section">
      <div class="contacts-title">📞 Besoin d'aide ?</div>

      ${responsableNom ? `
      <div class="contact-item">
        <strong>Responsable :</strong> ${responsableNom}
        ${responsableEmail ? `<br><a href="mailto:${responsableEmail}" style="color: #78350f;">${responsableEmail}</a>` : ''}
      </div>
      ` : ''}

      ${responsableAdjointNom ? `
      <div class="contact-item">
        <strong>Responsable adjoint :</strong> ${responsableAdjointNom}
        ${responsableAdjointEmail ? `<br><a href="mailto:${responsableAdjointEmail}" style="color: #78350f;">${responsableAdjointEmail}</a>` : ''}
      </div>
      ` : ''}
    </div>
    ` : ''}

    <div class="cta-container">
      <a href="${confirmUrl}" class="cta-button">
        ✅ Confirmer la réalisation
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
      Une fois la maintenance effectuée, cliquez sur le bouton ci-dessus pour confirmer et indiquer la date de réalisation.
    </p>

    <div class="footer">
      <p>Merci pour votre collaboration !</p>
      <div class="footer-note">
        Cet email a été envoyé automatiquement par le système de gestion de maintenance.<br>
        Pour toute question, contactez votre administrateur.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

module.exports = {
  sendEmail,
  generateMaintenanceEmailTemplate,
};
