import React from "react";
import { Dish } from "./DishList";
import { DepositItem } from "./DepositList";

export type ReceiptItem = {
  name: string;
  price: number;
  type: "dish" | "deposit";
};

export interface ReceiptProps {
  items: ReceiptItem[];
  onRemove?: (index: number) => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ items, onRemove }) => {
  // Finde die Indizes, an denen ein Gericht steht
  const dishIndices = items
    .map((item, idx) => (item.type === "dish" ? idx : null))
    .filter((idx): idx is number => idx !== null);

  // Finde die Indizes, an denen ein Gericht endet (letzte Pfandposition nach Gericht)
  const separatorIndices = dishIndices.map((dishIdx) => {
    let lastDeposit = dishIdx;
    for (let i = dishIdx + 1; i < items.length; i++) {
      if (items[i].type === "deposit") {
        lastDeposit = i;
      } else {
        break;
      }
    }
    return lastDeposit;
  });

  return (
    <div className="bg-white rounded-lg shadow p-2 w-full max-w-md mt-2 text-black">
      <h2 className="text-lg font-bold mb-1">Kassenbon</h2>
      <ul>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <li className="grid grid-cols-[1fr_auto_auto] items-center py-1 text-sm gap-2">
              <span
                className={
                  item.type === "dish"
                    ? "truncate max-w-[8rem] font-bold"
                    : "truncate max-w-[8rem] text-xs text-gray-700"
                }
              >
                {item.name}
                {item.type === "deposit" && (
                  <span className="ml-1 text-[10px] text-gray-500">Pfand</span>
                )}
              </span>
              <span
                className={
                  item.type === "dish"
                    ? "text-right font-bold min-w-[60px]"
                    : "text-right text-xs text-gray-700 min-w-[60px]"
                }
              >
                {item.price.toFixed(2)} €
              </span>
              {onRemove && (
                <button
                  className="ml-1 text-red-400 hover:underline text-xs"
                  onClick={() => onRemove(idx)}
                >
                  ✕
                </button>
              )}
            </li>
            {separatorIndices.includes(idx) && (
              <li className="border-b-2 border-black my-1" aria-hidden />
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};
