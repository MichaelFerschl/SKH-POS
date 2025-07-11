import React from "react";

export type DepositItem = {
  name: string;
  price: number;
};

export const depositItems: DepositItem[] = [
  { name: "Messer", price: 2 },
  { name: "Gabel", price: 2 },
  { name: "Teller", price: 2 },
  { name: "Salatteller", price: 2 },
  { name: "Sonstiges", price: 2 },
];

export interface DepositListProps {
  onAdd: (item: DepositItem) => void;
}

export const DepositList: React.FC<DepositListProps> = ({ onAdd }) => (
  <div className="grid grid-cols-2 gap-4 justify-center mt-4">
    {depositItems.map((item) => (
      <button
        key={item.name}
        className="bg-yellow-500 text-black rounded-lg w-40 h-16 text-lg font-semibold shadow hover:bg-yellow-600 transition flex flex-col items-center justify-center"
        onClick={() => onAdd(item)}
      >
        {item.name} <br />
        <span className="text-base font-normal">{item.price.toFixed(2)} €</span>
      </button>
    ))}
  </div>
);
