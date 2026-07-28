import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Fill these in manually before running the script.
const ADMIN_EMAIL = "";
const ADMIN_PASSWORD = "";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const hero = {
  eyebrow: "Uşaq və Yeniyetmə Psixoloqu",
  fullName: "Murad Akif oğlu Heydərov (Akifsoy)",
  bio: "Zaqatala Rayonunun Suvagil kəndində anadan olmuşam. 2010-2014-cü illərdə sosial-psixoloji xidmət üzrə bakalavr dərəcəmi Gəncə Dövlət Universitetində almışam.",
  ctaPrimaryText: "Xidmətlərə Bax",
  ctaSecondaryText: "Əlaqə",
  marqueeItems: [
    "Uşaq psixologiyası",
    "Psixoloji xidmət və etik prinsiplər",
    "Səyahət",
    "Oxuduğum kitablar",
  ],
  imageUrl: "/murad-a.png",
};

const contact = {
  phone: "+994 50 123 45 67",
  email: "info@muradakifsoy.az",
  address: "Bakı, Azərbaycan",
  workingHours: "Bazar ertəsi - Cümə, 09:00 - 18:00",
  instagramUrl: "#",
  facebookUrl: "#",
  linkedinUrl: "",
  tiktokUrl: "",
  whatsappUrl: "",
  youtubeUrl: "",
  homeCtaHeading: "Mənimlə Əlaqə Saxlayın",
  homeCtaText:
    "Sual və təkliflərinizi gözləyirəm. Görüş təyin etmək üçün mənə müraciət edin.",
  homeCtaButtonText: "Əlaqəyə Keç",
};

const about = {
  eyebrow: "Haqqımda",
  heading: "Murad Akifsoy ilə Tanış Olun",
  bio: "<p>Zaqatala Rayonunun Suvagil kəndində anadan olmuşam. 2010-2014-cü illərdə sosial-psixoloji xidmət üzrə bakalavr dərəcəmi Gəncə Dövlət Universitetində almışam. Bundan sonra uşaq və yeniyetmə psixologiyası sahəsində ixtisaslaşaraq, ailələrə və gənclərə peşəkar dəstək göstərmək üçün bir neçə beynəlxalq sertifikat proqramında iştirak etmişəm.</p><p>Hazırda fərdi və qrup məşğələləri vasitəsilə uşaqların emosional inkişafına, valideyn-övlad münasibətlərinin möhkəmləndirilməsinə və böhran vəziyyətlərinin idarə olunmasına dəstək olur, elmi əsaslara söykənən müasir metodlardan istifadə edirəm.</p>",
  imageUrl: "/murad-a.png",
  skills: [
    "Uşaq Psixologiyası",
    "Ailə Terapiyası",
    "Davranış Analizi",
    "Emosional Dəstək",
    "Yeniyetmə Psixologiyası",
    "Valideyn Məsləhətləşməsi",
    "Krizis İdarəetməsi",
    "Bilişsel Davranış Terapiyası",
  ],
};

async function seed() {
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

  console.log("Hero məzmunu əlavə olunur...");
  await setDoc(doc(db, "siteContent", "hero"), hero);

  console.log("Əlaqə məzmunu əlavə olunur...");
  await setDoc(doc(db, "siteContent", "contact"), contact);

  console.log("Haqqımda məzmunu əlavə olunur...");
  await setDoc(doc(db, "siteContent", "about"), about);

  console.log("Bütün sayt məzmunu uğurla əlavə olundu.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Xəta baş verdi:", error);
  process.exit(1);
});
