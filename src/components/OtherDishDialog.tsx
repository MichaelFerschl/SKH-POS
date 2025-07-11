import React from "react";

export interface OtherDishDialogProps {
  open: boolean;
  onSelect: (price: number) => void;
  onClose: () => void;
}

const options = [1, 2, 4, 5];

export const OtherDishDialog: React.FC<OtherDishDialogProps> = ({
  open,
  onSelect,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Sonstiges Gericht</h2>
        <div className="flex gap-3 mb-4 flex-wrap justify-center">
          {options.map((amt) => (
            <button
              key={amt}
              className="px-4 py-2 rounded font-bold text-lg border bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={() => onSelect(amt)}
            >
              {amt} €
            </button>
          ))}
        </div>
        <button
          className="bg-gray-400 text-white px-6 py-2 rounded font-bold text-lg mt-2"
          onClick={onClose}
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
};
