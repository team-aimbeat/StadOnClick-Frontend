import eventImageLarge from "@/assets/Images/well.jpg";
import wellnessImageLarge from "@/assets/Images/wellness.jpg";
import familyImageLarge from "@/assets/Images/family.jpg";
import learnImageLarge from "@/assets/Images/learn.jpg";
import homeImageLarge from "@/assets/Images/wash.jpg";
import travelImageLarge from "@/assets/Images/travel.jpg";
import foodImageLarge from "@/assets/Images/food.jpg";
import hotelImageLarge from "@/assets/Images/home.jpg";
import eventImageSmall from "@/assets/Images/optimized/well-sm.jpg";
import wellnessImageSmall from "@/assets/Images/optimized/wellness-sm.jpg";
import familyImageSmall from "@/assets/Images/optimized/family-sm.jpg";
import learnImageSmall from "@/assets/Images/optimized/learn-sm.jpg";
import homeImageSmall from "@/assets/Images/optimized/wash-sm.jpg";
import travelImageSmall from "@/assets/Images/optimized/travel-sm.jpg";
import foodImageSmall from "@/assets/Images/optimized/food-sm.jpg";
import hotelImageSmall from "@/assets/Images/optimized/home-sm.jpg";

export type Visual = { src: string; alt: string; srcSet?: string };

const buildResponsiveVisual = (desktop: string, mobile: string, alt: string): Visual => ({
  src: desktop,
  alt,
  srcSet: `${mobile} 480w, ${desktop} 1200w`,
});

export const masterServiceVisuals: Record<string, Visual> = {
  "experiences-activities": buildResponsiveVisual(
    eventImageLarge,
    eventImageSmall,
    "Experiences & activities",
  ),
  "health-wellness": buildResponsiveVisual(
    wellnessImageLarge,
    wellnessImageSmall,
    "Health & wellness",
  ),
  "kids-family": buildResponsiveVisual(
    familyImageLarge,
    familyImageSmall,
    "Kids & family",
  ),
  "learning-skill-development": buildResponsiveVisual(
    learnImageLarge,
    learnImageSmall,
    "Learning & skill development",
  ),
  "home-personal-services": buildResponsiveVisual(
    homeImageLarge,
    homeImageSmall,
    "Home & personal services",
  ),
  "travel-transportation": buildResponsiveVisual(
    travelImageLarge,
    travelImageSmall,
    "Travel & transportation",
  ),
  "food-leisure": buildResponsiveVisual(foodImageLarge, foodImageSmall, "Food & leisure"),
  "real-estate-local-support": buildResponsiveVisual(
    hotelImageLarge,
    hotelImageSmall,
    "Real estate & local support",
  ),
};

export const categoryVisuals: Record<string, Visual> = {
  "events-around-the-city": buildResponsiveVisual(
    eventImageLarge,
    eventImageSmall,
    "Events around the city",
  ),
  "concerts-live-shows": buildResponsiveVisual(
    eventImageLarge,
    eventImageSmall,
    "Concerts & live shows",
  ),
  "movie-bookings": buildResponsiveVisual(
    homeImageLarge,
    homeImageSmall,
    "Movie bookings",
  ),
  "museums-exhibitions": buildResponsiveVisual(
    learnImageLarge,
    learnImageSmall,
    "Museums & exhibitions",
  ),
  "tourist-buses-boat-tours": buildResponsiveVisual(
    travelImageLarge,
    travelImageSmall,
    "Tourist buses & boat tours",
  ),
  "tourist-activities-attractions": buildResponsiveVisual(
    familyImageLarge,
    familyImageSmall,
    "Tourist activities & attractions",
  ),
  "places-to-visit-near-city": buildResponsiveVisual(
    travelImageLarge,
    travelImageSmall,
    "Places to visit near the city",
  ),
};
