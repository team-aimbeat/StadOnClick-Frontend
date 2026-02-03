export interface ServiceDetailEntry {
  title: string
  subtitle: string
  duration: string
  price: string
}

export interface Service {
  id: string
  title: string
  location: string
  rating: number
  reviews: number
  image: string
  slug: string
  details: ServiceDetailEntry[]
  about?: string
  tags?: string[]
  heroHighlights?: string[]
}

export const services: Service[] = [
  {
    id: "service-1",
    title: "Your hair salon",
    location: "Stockholms",
    rating: 4.4,
    reviews: 312,
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80",
    slug: "salon-deals",
    heroHighlights: ["Haircare", "Styling", "Luxury treatments"],
    tags: ["Salon", "Styling"],
    about:
      "A full-service salon specializing in bespoke cuts, creative color, and nurturing treatments.",
    details: [
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-2",
    title: "Saloooon",
    location: "Stockholms",
    rating: 4.4,
    reviews: 248,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    slug: "new-deals",
    heroHighlights: ["Precision cuts", "Extensions"],
    tags: ["Salon", "Treatments"],
    about: "Modern salon with a focus on technique-driven transformations.",
    details: [
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-3",
    title: "Salon now",
    location: "Stockholms",
    rating: 4.4,
    reviews: 201,
    image:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80",
    slug: "buffet-deals",
    heroHighlights: ["Relaxing atmosphere", "Color bar"],
    tags: ["Salon", "Color"],
    about: "Bright salon that blends luxury styling with a friendly vibe.",
    details: [
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-4",
    title: "Your hair salon",
    location: "Stockholms",
    rating: 4.4,
    reviews: 219,
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    slug: "games-outings",
    heroHighlights: ["Trend-focused", "Expert stylists"],
    tags: ["Salon", "Modern"],
    about: "An elevated salon where the styling team creates runway-ready looks.",
    details: [
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-5",
    title: "Saloooon",
    location: "Stockholms",
    rating: 4.4,
    reviews: 186,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    slug: "events-deals",
    heroHighlights: ["Curated treatments", "Signature blowouts"],
    tags: ["Salon", "Events"],
    about: "Signature stylists delivering glossy finishes for every occasion.",
    details: [
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-6",
    title: "Salon now",
    location: "Stockholms",
    rating: 4.4,
    reviews: 195,
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    slug: "salon-deals-premium",
    heroHighlights: ["Seasonal rituals", "Clean beauty"],
    tags: ["Salon", "Wellness"],
    about: "Modern salon focused on healthy hair and mindful beauty.",
    details: [
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-7",
    title: "Serenity Bistro & Rooftop",
    location: "Stockholm, Sweden",
    rating: 4.9,
    reviews: 842,
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1000&q=80",
    slug: "restaurant-deals",
    heroHighlights: ["Rooftop dining", "Nordic tasting menu", "Seasonal cocktails"],
    tags: ["Restaurant", "Rooftop", "Fine dining"],
    about:
      "A sweeping rooftop restaurant serving seasonal Nordic dishes alongside curated cocktails beneath Stockholm skies.",
    details: [
      {
        title: "Nordic tasting menu",
        subtitle: "Seven courses, chef-led multi-course menu",
        duration: "2 hr",
        price: "$135",
      },
      {
        title: "Rooftop dinner for two",
        subtitle: "Shared entrée and dessert with sparkling wine",
        duration: "1.5 hr",
        price: "$98",
      },
      {
        title: "Seasonal brunch spread",
        subtitle: "Bottomless pastries, market greens, and mimosas",
        duration: "1.5 hr",
        price: "$72",
      },
    ],
  },
]
