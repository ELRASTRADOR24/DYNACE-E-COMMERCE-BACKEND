import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDatabase, User, Product, Order } from './database.js';
import { seedProducts } from './seed.js';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

// Charge les variables d'environnement depuis le fichier .env
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
        if (key) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (err) {
  console.warn('Impossible de charger le fichier .env :', err.message);
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn("⚠️ Attention : La variable STRIPE_SECRET_KEY n'est pas définie dans votre fichier .env.");
}
const stripe = new Stripe(stripeSecretKey || 'sk_test_mock_placeholder_key');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'dynace_dev_jwt_secret_fallback';

app.use(cors());
app.use(express.json());

// Token Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé, jeton de session manquant.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Session expirée ou invalide.' });
    }
    req.userId = decoded.id;
    next();
  });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, password, address, postalCode, city } = req.body;

  if (!firstName || !lastName || !email || !password || !address || !postalCode || !city) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
  }

  try {
    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Cette adresse email est déjà utilisée.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      address,
      postal_code: postalCode,
      city
    });
    const result = await newUser.save();

    // Generate JWT
    const token = jwt.sign({ id: result._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: result._id,
        firstName,
        lastName,
        email,
        address,
        postalCode,
        city
      }
    });
  } catch (err) {
    console.error('Erreur inscription :', err.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de l\'inscription.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Veuillez renseigner votre email et votre mot de passe.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Adresse email ou mot de passe incorrect.' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(400).json({ error: 'Adresse email ou mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        address: user.address,
        postalCode: user.postal_code,
        city: user.city
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne lors de la connexion.' });
  }
});

// Get Current User Profile (Route protégée)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json({
      id: user._id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      address: user.address,
      postalCode: user.postal_code,
      city: user.city
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
  }
});

// --- PRODUCTS ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const rows = await Product.find({});
    const productsList = rows.map(row => ({
      id: row._id,
      name: row.name,
      price: row.price,
      category: row.category,
      image: row.image,
      images: row.images || [],
      summary: row.summary,
      description: row.description,
      benefits: row.benefits || [],
      usage: row.usage
    }));
    res.json(productsList);
  } catch (err) {
    console.error('Erreur chargement produits :', err.message);
    res.status(500).json({ error: 'Erreur lors du chargement du catalogue.' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const row = await Product.findById(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    res.json({
      id: row._id,
      name: row.name,
      price: row.price,
      category: row.category,
      image: row.image,
      images: row.images || [],
      summary: row.summary,
      description: row.description,
      benefits: row.benefits || [],
      usage: row.usage
    });
  } catch (err) {
    console.error('Erreur chargement produit id :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit.' });
  }
});

// --- ORDERS ROUTES ---

// Create Order (Public/Registered)
app.post('/api/orders', async (req, res) => {
  const { orderNumber, userId, firstName, lastName, email, address, postalCode, city, items, subtotal, shipping, total } = req.body;

  if (!orderNumber || !firstName || !lastName || !email || !address || !postalCode || !city || !items || !subtotal || !total) {
    return res.status(400).json({ error: 'Données de commande incomplètes.' });
  }

  try {
    const newOrder = new Order({
      order_number: orderNumber,
      user_id: userId || null,
      first_name: firstName,
      last_name: lastName,
      email,
      address,
      postal_code: postalCode,
      city,
      items,
      subtotal,
      shipping,
      total
    });
    await newOrder.save();

    res.status(201).json({ success: true, orderNumber });
  } catch (err) {
    console.error('Erreur création commande :', err.message);
    res.status(500).json({ error: 'Erreur de base de données lors de la création de la commande.' });
  }
});

// Get user orders (Route protégée)
app.get('/api/orders/user', authenticateToken, async (req, res) => {
  try {
    const rows = await Order.find({ user_id: req.userId }).sort({ created_at: -1 });
    const ordersList = rows.map(row => ({
      id: row._id,
      orderNumber: row.order_number,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      address: row.address,
      postalCode: row.postal_code,
      city: row.city,
      items: row.items || [],
      subtotal: row.subtotal,
      shipping: row.shipping,
      total: row.total,
      createdAt: row.created_at
    }));
    res.json(ordersList);
  } catch (err) {
    console.error('Erreur lecture commandes user :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes.' });
  }
});

// --- PAYMENT ROUTES ---

// 1. Create Checkout Session
app.post('/api/payment/create-checkout-session', async (req, res) => {
  const { items, email, firstName, lastName, address, postalCode, city } = req.body;

  if (!items || items.length === 0 || !email) {
    return res.status(400).json({ error: 'Panier ou email manquant.' });
  }

  try {
    const lineItems = [];

    // Récupérer et recalculer le prix réel des produits dans MongoDB
    for (const item of items) {
      const dbProduct = await Product.findById(item.id);
      if (!dbProduct) {
        return res.status(404).json({ error: `Produit ${item.name} non trouvé.` });
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: dbProduct.name,
            images: dbProduct.image ? [`http://localhost:5174${dbProduct.image}`] : [],
            description: dbProduct.summary
          },
          unit_amount: Math.round(dbProduct.price * 100), // Stripe attend des centimes
        },
        quantity: item.quantity
      });
    }

    // Calculer les frais de livraison (ex: gratuit dès 50 €)
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = subtotal >= 50 ? 0 : 4.90;

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison',
            description: 'Livraison standard à domicile'
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      });
    }

    const orderNumber = `CMD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      success_url: `http://localhost:5174/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5174/?payment=cancel`,
      metadata: {
        orderNumber,
        firstName,
        lastName,
        email,
        address,
        postalCode,
        city,
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
        total: (subtotal + shippingCost).toFixed(2),
        items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })))
      }
    });

    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Erreur création session Stripe :', err.message);
    res.status(500).json({ error: 'Impossible d\'initialiser le paiement sécurisé.' });
  }
});

// 2. Confirm Order (Verification of Stripe Session)
app.post('/api/payment/confirm-order', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'ID de session Stripe manquant.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session de paiement non trouvée.' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Le paiement n\'a pas été validé par Stripe.' });
    }

    const orderNumber = session.metadata.orderNumber;
    const existingOrder = await Order.findOne({ order_number: orderNumber });
    if (existingOrder) {
      return res.json({ success: true, orderNumber, alreadyProcessed: true });
    }

    const { firstName, lastName, email, address, postalCode, city, subtotal, shipping, total, items } = session.metadata;

    const user = await User.findOne({ email });
    const userId = user ? user._id : null;

    const newOrder = new Order({
      order_number: orderNumber,
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      address,
      postal_code: postalCode,
      city,
      items: JSON.parse(items),
      subtotal: parseFloat(subtotal),
      shipping: parseFloat(shipping),
      total: parseFloat(total)
    });

    await newOrder.save();
    console.log(`✅ Commande confirmée et enregistrée : ${orderNumber}`);

    res.status(201).json({ success: true, orderNumber });
  } catch (err) {
    console.error('Erreur confirmation commande Stripe :', err.message);
    res.status(500).json({ error: 'Erreur lors de la validation finale de la commande.' });
  }
});

// Start initialization
const startServer = async () => {
  try {
    await connectDatabase();
    await seedProducts();
    
    app.listen(PORT, () => {
      console.log(`Le serveur tourne sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erreur au démarrage du serveur Express :', err.message);
  }
};

startServer();
