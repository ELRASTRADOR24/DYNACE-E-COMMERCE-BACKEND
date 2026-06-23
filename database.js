import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("⚠️ Erreur : La variable MONGODB_URI n'est pas définie dans le fichier .env.");
  }
  try {
    await mongoose.connect(mongoUri || "mongodb://localhost:27017/mvp");
    console.log("Connecté avec succès à MongoDB (base de données sécurisée)");
  } catch (err) {
    console.error("Erreur de connexion à MongoDB :", err.message);
    throw err;
  }
};

// Schéma Utilisateur (User)
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  postal_code: { type: String, required: true },
  city: { type: String, required: true }
});

export const User = mongoose.model('User', userSchema);

// Schéma Produit (Product)
const productSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom string ID (ex: "rocenta", "dynafuel")
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  images: [{ type: String }],
  summary: { type: String, required: true },
  description: { type: String, required: true },
  benefits: [{ type: String }],
  usage: { type: String, required: true }
});

export const Product = mongoose.model('Product', productSchema);

// Schéma Commande (Order)
const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  postal_code: { type: String, required: true },
  city: { type: String, required: true },
  items: { type: Array, required: true }, // Array of product items
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', orderSchema);
