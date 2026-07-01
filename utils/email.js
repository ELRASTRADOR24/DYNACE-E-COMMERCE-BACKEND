import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter
// We use a safe fallback so that the server doesn't crash if EMAIL_USER is not set yet
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER || 'votre.email@gmail.com', // Will be set in .env
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || 'votre_mot_de_passe_application', // App password
  },
});

export const sendContactEmail = async ({ name, email, subject, message }) => {
  if (!process.env.EMAIL_USER) {
    console.log('Simulation Email Contact (Configurez EMAIL_USER dans .env) :', { name, email, subject, message });
    return true;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to the admin
    replyTo: email, // Reply goes to the customer
    subject: `Nouveau Message de Contact : ${subject}`,
    text: `Vous avez reçu un nouveau message de : ${name} (${email})\n\nSujet : ${subject}\n\nMessage :\n${message}`,
    html: `
      <h2>Nouveau Message de Contact</h2>
      <p><strong>De :</strong> ${name} (${email})</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <hr />
      <p style="white-space: pre-wrap;">${message}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de contact:", error);
    return false;
  }
};

export const sendOrderNotificationEmail = async ({ orderId, user, items, totalAmount, shippingAddress }) => {
  if (!process.env.EMAIL_USER) {
    console.log('Simulation Email Commande (Configurez EMAIL_USER dans .env) :', { orderId, totalAmount });
    return true;
  }

  const itemsHtml = items.map(item => 
    `<li>${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)} €</li>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to the admin
    subject: `Nouvelle Commande Reçue ! (${totalAmount.toFixed(2)} €) - Réf: ${orderId}`,
    html: `
      <h2>Félicitations, vous avez reçu une nouvelle commande !</h2>
      <p><strong>ID Commande :</strong> ${orderId}</p>
      <p><strong>Total Payé :</strong> ${totalAmount.toFixed(2)} €</p>
      
      <h3>Client :</h3>
      <p>
        Nom : ${user.firstName} ${user.lastName}<br />
        Email : ${user.email}
      </p>

      <h3>Adresse de Livraison :</h3>
      <p>
        ${shippingAddress.fullName}<br />
        ${shippingAddress.address}<br />
        ${shippingAddress.postalCode} ${shippingAddress.city}<br />
        ${shippingAddress.country}<br />
        <strong>Téléphone :</strong> ${shippingAddress.phone || 'Non renseigné'}
      </p>

      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #334155;">📦 Étiquette Colissimo</h3>
        <p style="margin-bottom: 5px;">Voici les informations prêtes à être copiées-collées pour créer votre étiquette d'expédition :</p>
        <pre style="background: #fff; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace;">
Prénom Nom : ${shippingAddress.fullName}
Adresse : ${shippingAddress.address}
Code Postal : ${shippingAddress.postalCode}
Ville : ${shippingAddress.city}
Pays : ${shippingAddress.country}
Téléphone : ${shippingAddress.phone || ''}
Email : ${user.email}
        </pre>
        <a href="https://www.laposte.fr/colissimo-en-ligne/votre-colis" target="_blank" style="display: inline-block; background-color: #00468b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
          Aller sur Colissimo En Ligne
        </a>
      </div>

      <h3>Produits à Expédier :</h3>
      <ul>
        ${itemsHtml}
      </ul>

      <br />
      <p>Veuillez préparer le colis et informer le client via le Dashboard dès qu'il est expédié.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de commande:", error);
    return false;
  }
};

export const sendCustomerOrderConfirmationEmail = async (order) => {
  if (!process.env.EMAIL_USER) {
    console.log('Simulation Email Client (Configurez EMAIL_USER dans .env) :', { orderId: order.order_number, email: order.email });
    return true;
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} €</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Dynace Global" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `Commande confirmée : ${order.order_number} - Dynace Global`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .email-wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background-color: #153A89; padding: 40px 20px; text-align: center; }
          .header img { height: 45px; margin-bottom: 20px; }
          .header h1 { color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: 0.5px; }
          .content { padding: 40px 30px; color: #334155; }
          .greeting { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #1e293b; }
          .intro-text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 30px; }
          
          .order-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px; }
          .order-card-header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px; }
          .order-number { font-size: 16px; font-weight: 700; color: #153A89; }
          
          .order-items { width: 100%; border-collapse: collapse; }
          .order-items th { font-size: 12px; text-transform: uppercase; color: #94a3b8; text-align: left; padding-bottom: 10px; }
          .order-items td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 15px; }
          .item-name { font-weight: 600; color: #334155; }
          .item-qty { color: #64748b; font-size: 14px; text-align: center; }
          .item-price { text-align: right; font-weight: 500; }
          
          .totals { margin-top: 20px; width: 100%; text-align: right; }
          .totals-row { padding: 5px 0; font-size: 14px; color: #64748b; }
          .grand-total { font-size: 18px; font-weight: 700; color: #153A89; padding-top: 10px; margin-top: 10px; border-top: 2px solid #e2e8f0; }
          
          .shipping-box { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px; }
          .shipping-title { font-size: 13px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 10px; letter-spacing: 0.5px; }
          .shipping-address { font-size: 15px; line-height: 1.5; color: #475569; }
          
          .cta-container { text-align: center; margin: 40px 0 20px; }
          .cta-button { display: inline-block; background-color: #153A89; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 15px 35px; border-radius: 30px; letter-spacing: 0.5px; }
          
          .footer { text-align: center; padding: 30px; background-color: #f1f5f9; font-size: 13px; color: #94a3b8; line-height: 1.5; }
          .footer a { color: #153A89; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          
          <!-- Header -->
          <div class="header">
            <img src="https://dynace-shop.vercel.app/images/logo.svg" alt="Dynace Global Logo" />
            <h1>Merci d'avoir acheté chez Dynace Global</h1>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">Bonjour ${order.first_name},</div>
            <div class="intro-text">
              Nous sommes ravis de vous confirmer que votre paiement a bien été reçu.<br/>
              <strong>Votre colis sera préparé et expédié sous peu.</strong> Nos équipes y accordent le plus grand soin.
            </div>
            
            <!-- Order Details -->
            <div class="order-card">
              <div class="order-card-header">
                <span class="order-number">Commande n° ${order.order_number}</span>
              </div>
              
              <table class="order-items">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th style="text-align: center;">Qté</th>
                    <th style="text-align: right;">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td class="item-name">${item.name}</td>
                      <td class="item-qty">x${item.quantity}</td>
                      <td class="item-price">${item.price.toFixed(2)} €</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="totals">
                <div class="totals-row">Sous-total : ${order.subtotal.toFixed(2)} €</div>
                <div class="totals-row">Frais de livraison : ${order.shipping === 0 ? 'Offerts' : `${order.shipping.toFixed(2)} €`}</div>
                <div class="grand-total">Total payé : ${order.total.toFixed(2)} €</div>
              </div>
            </div>
            
            <!-- Shipping Info -->
            <div class="shipping-box">
              <div class="shipping-title">Adresse de Livraison</div>
              <div class="shipping-address">
                <strong>${order.first_name} ${order.last_name}</strong><br/>
                ${order.address}<br/>
                ${order.postal_code} ${order.city}
              </div>
            </div>
            
            <!-- Action Button -->
            <div class="cta-container">
              <a href="https://dynace-shop.vercel.app/track?order=${order.order_number}&email=${encodeURIComponent(order.email)}" class="cta-button">
                Suivre ma commande en temps réel
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>
              Ceci est un e-mail automatique, merci de ne pas y répondre directement.<br/>
              Pour toute question, contactez notre support client via la page <a href="https://dynace-shop.vercel.app/contact">Contact</a> de notre site.
            </p>
            <p>&copy; ${new Date().getFullYear()} Dynace Global. Tous droits réservés.</p>
          </div>
          
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de confirmation client:", error);
    return false;
  }
};
