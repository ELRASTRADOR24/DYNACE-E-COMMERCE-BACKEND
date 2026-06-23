import { Product, User } from './database.js';
import bcrypt from 'bcryptjs';

const initialProducts = [
  {
    id: "rocenta",
    name: "Dynace Rocenta",
    price: 49.90,
    category: "vitalite",
    image: "/images/rocenta.png",
    images: ["/images/rocenta.png", "/images/rocenta_2.png", "/images/rocenta_3.png"],
    summary: "Phytothérapie cellulaire de pointe à base de cellules souches de melon de Bulgarie.",
    description: "Dynace Rocenta est le summum de l'innovation en nutraceutique. Formulé à partir de cellules souches végétales de melon de Bulgarie de haute pureté, enrichi en coenzyme Q10, extrait d'ashwagandha et nutriments essentiels, il active le renouvellement cellulaire de l'organisme, booste le système immunitaire et combat le vieillissement.",
    benefits: [
      "Régénération et protection cellulaire",
      "Puissant effet antioxydant et anti-âge",
      "Soutien du système immunitaire",
      "Améliore la clarté mentale et la vitalité"
    ],
    usage: "Prendre un sachet par jour sous la langue le matin avant le petit-déjeuner."
  },
  {
    id: "dynafuel",
    name: "Dynace Dynafuel",
    price: 39.90,
    category: "energie",
    image: "/images/dynafuel.png",
    images: ["/images/dynafuel.png", "/images/dynafuel_2.png", "/images/dynafuel_3.png"],
    summary: "Supplément d'énergie naturelle et de vigueur pour hommes actifs.",
    description: "Dynace Dynafuel est une formule stimulante exclusive élaborée pour optimiser l'énergie masculine, l'endurance et les performances physiques. Composé de Tongkat Ali, de racine de Maca noire et d'extraits d'herbes naturelles, il combat la fatigue physique et mentale pour une vitalité prolongée.",
    benefits: [
      "Booste l'énergie physique et la force",
      "Améliore l'endurance et la performance",
      "Soutient la gestion du stress",
      "Ingrédients naturels de première qualité"
    ],
    usage: "Diluer un sachet dans 100ml d'eau tiède. À consommer en milieu de journée."
  },
  {
    id: "urbanism",
    name: "Dynace Urbanism",
    price: 42.90,
    category: "vitalite",
    image: "/images/urbanism.png",
    images: ["/images/urbanism.png", "/images/urbanism_2.png", "/images/urbanism_3.png"],
    summary: "Solution bien-être pour l'équilibre hormonal et la sérénité féminine.",
    description: "Dynace Urbanism est spécialement conçu pour soutenir le bien-être général de la femme moderne. Sa synergie de plantes adaptogènes et de vitamines aide à stabiliser l'humeur, réguler le système hormonal, atténuer les douleurs menstruelles et revitaliser la peau.",
    benefits: [
      "Régulation naturelle de l'équilibre hormonal",
      "Réduit l'irritabilité et le stress quotidien",
      "Améliore la santé et la beauté de la peau",
      "Soutient l'énergie globale féminine"
    ],
    usage: "Un sachet par jour à diluer dans 150ml d'eau, de préférence le soir au coucher."
  },
  {
    id: "acebrew",
    name: "Dynace Ace Brew",
    price: 24.90,
    category: "minceur",
    image: "/images/acebrew.png",
    images: ["/images/acebrew.png", "/images/acebrew_2.png", "/images/acebrew_3.png"],
    summary: "Café détox minceur enrichi en thé vert et garcinia cambogia.",
    description: "Dynace Ace Brew réunit la richesse d'un café arabica de spécialité et des extraits de plantes reconnus pour stimuler la perte de poids (thé vert, extrait de Garcinia Cambogia). Il active la thermogenèse, favorise la détoxification de l'organisme et régule naturellement l'appétit.",
    benefits: [
      "Active la combustion des graisses",
      "Détoxifie et draine le corps",
      "Contrôle les fringales et l'appétit",
      "Goût exquis de café premium"
    ],
    usage: "Prendre une tasse le matin au réveil ou 30 minutes avant le sport."
  },
  {
    id: "fitmax",
    name: "Dynace FitMax",
    price: 35.90,
    category: "minceur",
    image: "", // Pas de visuel disponible pour le moment
    images: [],
    summary: "Formule thermogénique avancée pour optimiser le contrôle du poids.",
    description: "Dynace FitMax est un complexe minceur puissant conçu pour accélérer la perte de masse grasse. Il stimule le métabolisme de base, favorise la libération des lipides stockés et réduit l'absorption des glucides tout en fournissant une énergie propre.",
    benefits: [
      "Accélère la perte de poids globale",
      "Action coupe-faim et satiété de longue durée",
      "Booste l'énergie et la concentration",
      "Soutient la gestion saine du sucre dans le sang"
    ],
    usage: "Prendre un sachet dilué dans un verre d'eau 30 minutes avant le repas principal."
  },
  {
    id: "aceguard",
    name: "Dynace AceGuard",
    price: 38.90,
    category: "vitalite",
    image: "/images/aceguard.png",
    images: ["/images/aceguard.png", "/images/aceguard_2.png", "/images/aceguard_3.png"],
    summary: "Complexe probiotique premium pour la santé digestive et intestinale.",
    description: "Dynace AceGuard protège votre microbiote intestinal. En combinant des probiotiques de haute qualité, des prébiotiques et des antioxydants, il régule le transit, réduit l'inconfort intestinal, favorise un ventre plat et renforce l'immunité à sa source.",
    benefits: [
      "Équilibre et protège la flore intestinale",
      "Réduit les ballonnements et gaz après les repas",
      "Améliore l'immunité et la vitalité générale",
      "Soutient une digestion fluide et légère"
    ],
    usage: "Un sachet par jour dilué dans un verre d'eau tempérée le matin à jeun."
  },
  {
    id: "tripleroot",
    name: "Dynace Triple Root Coffee",
    price: 27.90,
    category: "energie",
    image: "/images/tripleroot.png",
    images: ["/images/tripleroot.png", "/images/tripleroot_2.png", "/images/tripleroot_3.png"],
    summary: "Café énergisant aux trois racines adaptogènes (Ginseng, Maca, Tongkat Ali).",
    description: "Dynace Triple Root Coffee est une boisson tonifiante d'exception. En associant du café arabica de premier choix aux extraits concentrés de Ginseng, de Maca et de Tongkat Ali, il offre une stimulation physique et intellectuelle durable sans palpitations ni crash.",
    benefits: [
      "Énergie physique intense et clarté d'esprit",
      "Lutte activement contre la fatigue chronique",
      "Améliore la concentration et la mémoire",
      "Soutien adaptogène antistress"
    ],
    usage: "Une tasse le matin pour démarrer la journée avec vigueur."
  },
  {
    id: "lyftmax",
    name: "Dynace LyftMax",
    price: 44.90,
    category: "vitalite",
    image: "/images/lyftmax.png",
    images: ["/images/lyftmax.png", "/images/lyftmax_2.png", "/images/lyftmax_3.png"],
    summary: "Boisson anti-âge et de soutien pour les performances cardiovasculaires.",
    description: "Dynace LyftMax est une formule avancée pour le soutien cardiovasculaire, l'endurance et l'anti-âge. Enrichi en acides aminés essentiels (L-Arginine) et en antioxydants, il améliore la circulation sanguine, optimise l'oxygénation musculaire et favorise une récupération musculaire rapide.",
    benefits: [
      "Soutient la santé du cœur et des artères",
      "Améliore la performance physique et l'endurance",
      "Favorise une récupération rapide après l'effort",
      "Puissante protection anti-âge cellulaire"
    ],
    usage: "Un sachet dilué dans 200ml d'eau avant l'entraînement ou en cours de journée."
  },
  {
    id: "collagene",
    name: "Dynace Collagène Beauté",
    price: 46.90,
    category: "beaute",
    image: "/images/collagene.png",
    images: ["/images/collagene.png", "/images/collagene_2.png", "/images/collagene_3.png"],
    summary: "Élixir de collagène marin hydrolysé pour une peau ferme et lumineuse.",
    description: "Dynace Collagène nourrit votre éclat de l'intérieur. Cette boisson de beauté réunit du collagène marin de type I hautement bio-disponible, de l'acide hyaluronique et de la coenzyme Q10 pour repulper la peau, lisser les rides, fortifier les ongles et les cheveux, et soutenir les articulations.",
    benefits: [
      "Raffermit la peau et estompe les ridules",
      "Hydratation profonde (acide hyaluronique)",
      "Renforce les cheveux et les ongles cassants",
      "Soutient la souplesse articulaire"
    ],
    usage: "Mélanger un sachet dans un verre d'eau fraîche le soir au coucher."
  },
  {
    id: "toothpaste",
    name: "Dynace Duo Toothpaste",
    price: 19.90,
    category: "beaute",
    image: "/images/toothpaste.png",
    images: ["/images/toothpaste.png", "/images/toothpaste_2.png", "/images/toothpaste_3.png"],
    summary: "Duo de dentifrices Jour & Nuit pour une protection bucco-dentaire 24h.",
    description: "Le Dynace Duo Toothpaste réinvente l'hygiène bucco-dentaire. Le dentifrice 'MorningShield' protège contre les bactéries diurnes, blanchit et rafraîchit l'haleine. Le dentifrice 'NightRestore' répare l'émail, apaise les gencives sensibles et assainit la bouche pendant votre sommeil.",
    benefits: [
      "Protection bucco-dentaire continue 24h/24",
      "Effet blancheur doux et élimination du tartre",
      "Renforce l'émail et protège les gencives",
      "Haleine ultra-fraîche au réveil"
    ],
    usage: "Utiliser MorningShield (tube vert) le matin et NightRestore (tube bleu) le soir."
  }
];

export const seedProducts = async () => {
  try {
    // Vider la collection products dans MongoDB
    await Product.deleteMany({});
    console.log('Remplissage de la table products (MongoDB) avec le catalogue Dynace Global...');
    
    const productsToSeed = initialProducts.map(prod => ({
      _id: prod.id, // ID textuel customisé mappé sur _id
      name: prod.name,
      price: prod.price,
      category: prod.category,
      image: prod.image,
      images: prod.images,
      summary: prod.summary,
      description: prod.description,
      benefits: prod.benefits,
      usage: prod.usage,
      stock: 50 // Stock initial par défaut
    }));
    
    await Product.insertMany(productsToSeed);
    console.log('Catalogue Dynace Global inséré dans MongoDB avec succès.');

    // Seeding de l'utilisateur Administrateur par défaut
    const adminEmail = 'admin@dynace.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin12345', 10);
      const newAdmin = new User({
        first_name: 'Admin',
        last_name: 'Dynace',
        email: adminEmail,
        password: hashedPassword,
        address: 'Boutique Dynace Global',
        postal_code: '75001',
        city: 'Paris',
        is_admin: true
      });
      await newAdmin.save();
      console.log('✅ Utilisateur Administrateur par défaut créé : admin@dynace.com / admin12345');
    }
  } catch (err) {
    console.error('Erreur lors du seeding de la base de données MongoDB :', err.message);
  }
};
