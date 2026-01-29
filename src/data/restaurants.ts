export interface RestaurantDetail {
  slug: string
  name: string
  location: string
  rating: number
  reviews: number
  culinaryStyle: string
  description: string
  heroImages: string[]
  tags: string[]
  menuHighlights: {
    title: string
    price: string
    items: string[]
  }[]
  chefSpecials: {
    title: string
    description: string
  }[]
  hours: string
  address: string
  contact: {
    phone: string
    email: string
  }
}

export const restaurants: RestaurantDetail[] = [
  {
    slug: "serenity-bistro",
    name: "Serenity Bistro & Rooftop",
    location: "Stockholm, Sweden",
    rating: 4.9,
    reviews: 842,
    culinaryStyle: "Seasonal Nordic tasting menu",
    description:
      "A rooftop destination blending light-filled interiors with a chef-curated tasting menu inspired by Scandinavian markets and coastal produce.",
    heroImages: [
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=700&q=80",
    ],
    tags: ["Rooftop", "Fine dining", "Cocktail bar"],
    menuHighlights: [
      {
        title: "Nordic tasting menu",
        price: "$135",
        items: [
          "Seven exquisite courses",
          "Chef-selected wine pairing",
          "Artisanal bread cart",
        ],
      },
      {
        title: "Rooftop dinner for two",
        price: "$98",
        items: [
          "Grilled Amberjack with lemon emulsion",
          "Smoked beetroot risotto",
          "Copper-lined dessert trio",
        ],
      },
      {
        title: "Brunch spread",
        price: "$72",
        items: [
          "Market greens & citrus dressing",
          "Nordic smoked salmon platter",
          "Seasonal pastries with honey butter",
        ],
      },
    ],
    chefSpecials: [
      {
        title: "Copper Kettle Bisque",
        description:
          "Local shellfish simmered with fennel and orange peel finished tableside.",
      },
      {
        title: "Chanterelle & Truffle Toast",
        description:
          "Warm brioche with chanterelles, hand-peeled truffle, and whipped goat ricotta.",
      },
    ],
    hours: "Tue–Sun · 12:00 pm – 12:00 am",
    address: "Gate 9, Liljeholmen Strand, Stockholm",
    contact: {
      phone: "+46 8 123 456",
      email: "hello@serenitybistro.com",
    },
  },
  {
    slug: "apero-lounge",
    name: "Apero Lounge & Garden",
    location: "Barcelona, Spain",
    rating: 4.8,
    reviews: 614,
    culinaryStyle: "Mediterranean share plates",
    description:
      "Sun-drenched garden terrace serving Mediterranean share plates, natural wines, and craft cocktails with a focus on locality.",
    heroImages: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1481251011513-0d7d71158c40?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
    ],
    tags: ["Garden", "Wine bar", "Tapas"],
    menuHighlights: [
      {
        title: "Garden tasting flight",
        price: "$62",
        items: [
          "Charred octopus skewers",
          "Heirloom tomato carpaccio",
          "Smoky saffron aioli croquettes",
        ],
      },
      {
        title: "Wine flight",
        price: "$45",
        items: [
          "Local natural wine selection",
          "Sommelier pairing notes",
          "Seasonal cheese bites",
        ],
      },
    ],
    chefSpecials: [
      {
        title: "Paella Verde",
        description:
          "Market greens, artichoke, and bomba rice finished with lemon herb oil.",
      },
      {
        title: "Citrus Cured Sea Bass",
        description:
          "Thinly sliced sea bass with preserved citrus, pressed olive, and toasted almonds.",
      },
    ],
    hours: "Daily · 11:30 am – 1:00 am",
    address: "Passeig de la Marina, 18, Barcelona",
    contact: {
      phone: "+34 93 765 980",
      email: "reservas@aperolounge.com",
    },
  },
]
