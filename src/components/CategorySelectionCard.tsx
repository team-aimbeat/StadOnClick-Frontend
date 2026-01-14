import React from "react";
import spa from "@/assets/Images/spa.png";
import leafs from "@/assets/Images/Leaf.png";
import gym from "@/assets/Images/gym.png";
import yoga from "@/assets/Images/yoga.png";
import dish from "@/assets/Images/dishs.png";
import clinic from "@/assets/Images/Clinic.png";
import bakery from "@/assets/Images/bakery.png";
import cafe from "@/assets/Images/Cafe.png";


type CategorySelectionCardProps = {
  selected: string[];
  onToggle: (category: string) => void;
  error?: string;
};

const categories: { name: string; img: string }[] = [
  { name: "Cafe", img: cafe },
  { name: "Clinic", img: clinic },
  { name: "Yoga", img: yoga },
  { name: "Restaurants", img: dish },
  { name: "Spa", img: spa },
  { name: "Gym", img: gym },
  { name: "Events", img: leafs },
  { name: "Bakery", img: bakery },
];

const CategorySelectionCard: React.FC<CategorySelectionCardProps> = ({
  selected,
  onToggle,
  error,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="text-center text-slate-700">
      
        <h3 className="text-2xl font-semibold text-slate-900">Choose your category</h3>
        <p className="text-sm text-slate-500">This helps customers find your business.</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map((category) => {
          const isActive = selected.includes(category.name);
          const img = category.img;
          return (
            <button
              type="button"
              key={category.name}
              onClick={() => onToggle(category.name)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-sm font-semibold tracking-wide transition ${
                isActive
                  ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              <img src={img} alt={category.name} className="h-6 w-6 object-contain" />
              {category.name}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default CategorySelectionCard;
