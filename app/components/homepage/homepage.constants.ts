import type { ScenarioTemplate } from "../../routes/_index";

export const languages = [
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Portugués" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
];

export const initialSuggestions: ScenarioTemplate[] = [
  {
    title: "At the Café",
    description: "Practice ordering drinks and food at a coffee shop",
    icon: "☕",
  },
  {
    title: "Getting Directions",
    description: "Learn to ask for and understand directions in the city",
    icon: "🗺️",
  },
  {
    title: "Making Friends",
    description: "Basic introductions and small talk with new people",
    icon: "👋",
  },
  {
    title: "Shopping",
    description: "Asking about prices, sizes, and making purchases",
    icon: "🛍️",
  },
  {
    title: "Restaurant",
    description: "Ordering food and making reservations at restaurants",
    icon: "🍽️",
  },
];

export const extraSuggestions: ScenarioTemplate[] = [
  // Healthcare
  {
    title: "At the Doctor",
    description: "Describing symptoms and understanding medical advice",
    icon: "🏥",
  },
  {
    title: "At the Pharmacy",
    description: "Getting medicine and explaining prescriptions",
    icon: "💊",
  },
  {
    title: "Dental Visit",
    description: "Discussing dental problems and procedures",
    icon: "🦷",
  },

  // Professional
  {
    title: "Job Interview",
    description: "Professional conversations and career discussions",
    icon: "💼",
  },
  {
    title: "Office Meeting",
    description: "Participating in work meetings and presentations",
    icon: "📊",
  },
  {
    title: "Networking Event",
    description: "Making professional connections and small talk",
    icon: "🤝",
  },

  // Travel & Transportation
  {
    title: "Travel Planning",
    description: "Booking accommodations and planning activities",
    icon: "✈️",
  },
  {
    title: "At the Airport",
    description: "Navigating check-in, security, and boarding",
    icon: "🛫",
  },
  {
    title: "Hotel Check-in",
    description: "Booking rooms and requesting services",
    icon: "🏨",
  },
  {
    title: "Public Transportation",
    description: "Navigating buses, trains, and subway systems",
    icon: "🚇",
  },
  {
    title: "Taxi or Rideshare",
    description: "Getting around town and giving directions",
    icon: "🚕",
  },

  // Emergency & Services
  {
    title: "Emergency Situations",
    description: "Getting help and explaining urgent needs",
    icon: "🆘",
  },
  {
    title: "Police Assistance",
    description: "Reporting incidents and getting help",
    icon: "👮",
  },
  {
    title: "Car Problems",
    description: "Explaining issues to a mechanic",
    icon: "🚗",
  },

  // Social & Casual
  {
    title: "Weather Small Talk",
    description: "Discussing weather and seasonal changes",
    icon: "🌤️",
  },
  {
    title: "Family Gatherings",
    description: "Talking about family and relationships",
    icon: "👨‍👩‍👧‍👦",
  },
  {
    title: "Making Plans",
    description: "Arranging meetings and social activities",
    icon: "📅",
  },
  {
    title: "Birthday Party",
    description: "Celebrating and giving congratulations",
    icon: "🎂",
  },

  // Entertainment & Hobbies
  {
    title: "Sports & Hobbies",
    description: "Discussing interests and leisure activities",
    icon: "⚽",
  },
  {
    title: "Movies & Entertainment",
    description: "Sharing opinions about films and shows",
    icon: "🎬",
  },
  {
    title: "Music Concert",
    description: "Discussing music and live performances",
    icon: "🎵",
  },
  {
    title: "Art Gallery",
    description: "Talking about art and exhibitions",
    icon: "🎨",
  },

  // Shopping & Services
  {
    title: "Grocery Shopping",
    description: "Finding items and asking about products",
    icon: "🛒",
  },
  {
    title: "Clothes Shopping",
    description: "Finding sizes and styles in fashion stores",
    icon: "👕",
  },
  {
    title: "At the Bank",
    description: "Managing accounts and financial transactions",
    icon: "🏦",
  },
  {
    title: "Post Office",
    description: "Sending packages and buying stamps",
    icon: "📬",
  },

  // Home & Living
  {
    title: "House Hunting",
    description: "Viewing apartments and discussing rentals",
    icon: "🏠",
  },
  {
    title: "Maintenance Issues",
    description: "Reporting problems to a landlord",
    icon: "🔧",
  },
  {
    title: "Hiring Services",
    description: "Getting quotes for repairs or cleaning",
    icon: "🧹",
  },

  // Fitness & Health
  {
    title: "At the Gym",
    description: "Fitness discussions and equipment use",
    icon: "💪",
  },
  {
    title: "Yoga Class",
    description: "Following instructions in exercise classes",
    icon: "🧘",
  },
  {
    title: "Nutrition Advice",
    description: "Discussing diet and healthy eating",
    icon: "🥗",
  },

  // Education
  {
    title: "Study Group",
    description: "Participating in academic discussions",
    icon: "📚",
  },
  {
    title: "Language Exchange",
    description: "Practicing with native speakers",
    icon: "💭",
  },
  {
    title: "Library Visit",
    description: "Finding resources and asking for help",
    icon: "📖",
  },

  // Technology
  {
    title: "Tech Support",
    description: "Explaining technical issues and solutions",
    icon: "💻",
  },
  {
    title: "Phone Store",
    description: "Buying devices and service plans",
    icon: "📱",
  },
  {
    title: "Online Shopping",
    description: "Making purchases and returns online",
    icon: "🛍️",
  },
]; 