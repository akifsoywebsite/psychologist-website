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

const services = [
  {
    title: "Uşaqlarla Fərdi Məsləhətləşmə",
    slug: "usaqlarla-ferdi-meslehetlesme",
    summary: "Uşaqların emosional və davranış çətinliklərinə dəstək.",
    description:
      "Uşaqların böyümə prosesində qarşılaşdığı emosional, davranış və sosial çətinliklərin həlli üçün fərdi seanslar.",
    icon: "child",
    order: 1,
  },
  {
    title: "Yeniyetmələrlə İşləmə",
    slug: "yeniyetmelerle-isleme",
    summary: "Yeniyetmələrin özünüdərk və özünə inam problemləri üzərində iş.",
    description:
      "Yeniyetməlik dövründə yaranan kimlik axtarışı, özünə inam və sosial uyğunlaşma məsələlərində dəstək.",
    icon: "teen",
    order: 2,
  },
  {
    title: "Valideynlərlə Məsləhətləşmə",
    slug: "valideynlerle-meslehetlesme",
    summary: "Valideynlərə uşaq tərbiyəsi mövzusunda peşəkar dəstək.",
    description:
      "Valideynlərin uşaqları ilə münasibətlərini gücləndirmək və tərbiyə çətinliklərini aşmaq üçün məsləhətləşmə.",
    icon: "parent",
    order: 3,
  },
  {
    title: "Ailə Terapiyası",
    slug: "aile-terapiyasi",
    summary: "Ailə daxilində ünsiyyət və münasibətlərin yaxşılaşdırılması.",
    description:
      "Ailə üzvləri arasında ünsiyyəti gücləndirmək və münaqişələri həll etmək üçün birgə seanslar.",
    icon: "family",
    order: 4,
  },
  {
    title: "Məktəb Adaptasiyası",
    slug: "mekteb-adaptasiyasi",
    summary: "Uşaqların məktəb mühitinə uyğunlaşmasında dəstək.",
    description:
      "Yeni məktəb mühitinə uyğunlaşma, akademik təzyiq və sosial çətinliklərlə bağlı dəstək proqramı.",
    icon: "school",
    order: 5,
  },
];

const categories = [
  { name: "Valideynlik", slug: "valideynlik" },
  { name: "Yeniyetməlik", slug: "yeniyetmelik" },
  { name: "Emosional Sağlamlıq", slug: "emosional-saglamliq" },
];

const blogPlaceholderContent =
  "Bura tam blog məzmunu gələcək. Hələlik nümunə mətndir.";

const blogs = [
  {
    title: "Uşağınızla Necə Effektiv Ünsiyyət Qurmaq Olar",
    slug: "usaginizla-nece-effektiv-unsiyyet-qurmaq-olar",
    excerpt: "Uşağınızla effektiv ünsiyyət qurmağın yolları.",
    content: blogPlaceholderContent,
    category: "valideynlik",
    coverImage: "",
    createdAt: new Date("2026-06-01"),
  },
  {
    title: "Yeniyetmələrdə Özünə İnam Problemi",
    slug: "yeniyetmelerde-ozune-inam-problemi",
    excerpt: "Yeniyetmələrdə özünə inam problemlərinin səbəbləri və həlli.",
    content: blogPlaceholderContent,
    category: "yeniyetmelik",
    coverImage: "",
    createdAt: new Date("2026-06-05"),
  },
  {
    title: "Ekran Vaxtı və Uşaqların Zehni Sağlamlığı",
    slug: "ekran-vaxti-ve-usaqlarin-zehni-saglamligi",
    excerpt: "Ekran vaxtının uşaqların zehni sağlamlığına təsiri.",
    content: blogPlaceholderContent,
    category: "emosional-saglamliq",
    coverImage: "",
    createdAt: new Date("2026-06-10"),
  },
  {
    title: "Məktəbə Qayıdış Stresini Necə Azaltmaq Olar",
    slug: "mektebe-qayidis-stresini-nece-azaltmaq-olar",
    excerpt: "Məktəbə qayıdış dövründə stresi azaltmaq üçün tövsiyələr.",
    content: blogPlaceholderContent,
    category: "valideynlik",
    coverImage: "",
    createdAt: new Date("2026-06-15"),
  },
  {
    title: "Yeniyetmələrdə Narahatlıq Əlamətləri",
    slug: "yeniyetmelerde-narahatliq-elametleri",
    excerpt: "Yeniyetmələrdə narahatlığın əlamətləri və dəstək yolları.",
    content: blogPlaceholderContent,
    category: "yeniyetmelik",
    coverImage: "",
    createdAt: new Date("2026-06-20"),
  },
  {
    title: "Uşaqlarda Yuxu Rejiminin Əhəmiyyəti",
    slug: "usaqlarda-yuxu-reziminin-ehemiyyeti",
    excerpt: "Sağlam yuxu rejiminin uşaqların inkişafına təsiri.",
    content: blogPlaceholderContent,
    category: "emosional-saglamliq",
    coverImage: "",
    createdAt: new Date("2026-06-25"),
  },
  {
    title: "Boşanma Prosesində Uşağa Necə Dəstək Olmaq Olar",
    slug: "bosanma-prosesinde-usaga-nece-destek-olmaq-olar",
    excerpt: "Boşanma prosesində uşağa psixoloji dəstək göstərmək.",
    content: blogPlaceholderContent,
    category: "valideynlik",
    coverImage: "",
    createdAt: new Date("2026-06-30"),
  },
];

async function seed() {
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

  console.log("Xidmətlər əlavə olunur...");
  for (const service of services) {
    await setDoc(doc(db, "services", service.slug), service);
  }

  console.log("Kateqoriyalar əlavə olunur...");
  for (const category of categories) {
    await setDoc(doc(db, "categories", category.slug), category);
  }

  console.log("Bloqlar əlavə olunur...");
  for (const blog of blogs) {
    await setDoc(doc(db, "blogs", blog.slug), blog);
  }

  console.log("Bütün məlumatlar uğurla əlavə olundu.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Xəta baş verdi:", error);
  process.exit(1);
});
