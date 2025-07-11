import React from "react";

export type Dish = {
  name: string;
  price: number;
};

const dishes: Dish[] = [
  { name: "Schweinebraten", price: 14 },
  { name: "Spanferkel", price: 15 },
  { name: "Ente", price: 15 },
  { name: "Haxe", price: 15 },
  { name: "Kloß Extra", price: 2 },
];

export interface DishListProps {
  onAdd: (dish: Dish) => void;
  onOther?: () => void;
}

export const DishList: React.FC<DishListProps> = ({ onAdd, onOther }) => (
  <div className="grid grid-cols-2 gap-4 justify-center">
    {dishes.map((dish) => (
      <button
        key={dish.name}
        className="bg-blue-600 text-white rounded-lg w-40 h-16 text-xl font-bold shadow hover:bg-blue-700 transition flex flex-col items-center justify-center"
        onClick={() => onAdd(dish)}
      >
        {dish.name} <br />
        <span className="text-lg font-normal">{dish.price.toFixed(2)} €</span>
      </button>
    ))}
    <button
      className="bg-blue-500 text-white rounded-lg w-40 h-16 text-xl font-bold shadow hover:bg-blue-700 transition flex flex-col items-center justify-center border-2 border-dashed border-blue-300"
      onClick={onOther}
    >
      Sonstiges
    </button>
  </div>
);
