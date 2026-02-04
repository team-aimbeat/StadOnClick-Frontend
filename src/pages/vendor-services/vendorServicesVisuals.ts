import eventImage from "@/assets/Images/optimized/well-sm.jpg";
import wellnessImage from "@/assets/Images/optimized/wellness-sm.jpg";
import familyImage from "@/assets/Images/optimized/family-sm.jpg";
import learnImage from "@/assets/Images/optimized/learn-sm.jpg";
import homeImage from "@/assets/Images/optimized/wash-sm.jpg";
import travelImage from "@/assets/Images/optimized/travel-sm.jpg";
import foodImage from "@/assets/Images/optimized/food-sm.jpg";
import hotelImage from "@/assets/Images/optimized/home-sm.jpg";

export type Visual = { src: string; alt: string };

export const masterServiceVisuals: Record<string, Visual> = {
  "experiences-activities": {
    src: eventImage,
    alt: "Experiences & activities",
  },
  "health-wellness": { src: wellnessImage, alt: "Health & wellness" },
  "kids-family": { src: familyImage, alt: "Kids & family" },
  "learning-skill-development": {
    src: learnImage,
    alt: "Learning & skill development",
  },
  "home-personal-services": { src: homeImage, alt: "Home & personal services" },
  "travel-transportation": { src: travelImage, alt: "Travel & transportation" },
  "food-leisure": { src: foodImage, alt: "Food & leisure" },
  "real-estate-local-support": {
    src: hotelImage,
    alt: "Real estate & local support",
  },
};

export const categoryVisuals: Record<string, Visual> = {
  "events-around-the-city": {
    src: eventImage,
    alt: "Events around the city",
  },
  "concerts-live-shows": {
    src: eventImage,
    alt: "Concerts & live shows",
  },
  "movie-bookings": {
    src: homeImage,
    alt: "Movie bookings",
  },
  "museums-exhibitions": {
    src: learnImage,
    alt: "Museums & exhibitions",
  },
  "tourist-buses-boat-tours": {
    src: travelImage,
    alt: "Tourist buses & boat tours",
  },
  "tourist-activities-attractions": {
    src: familyImage,
    alt: "Tourist activities & attractions",
  },
  "places-to-visit-near-city": {
    src: travelImage,
    alt: "Places to visit near the city",
  },
};

