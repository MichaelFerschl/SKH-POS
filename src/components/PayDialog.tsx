import React, { useState } from "react";

export interface PayDialogProps {
  open: boolean;
  total: number;
  onClose: () => void;
  onPay: (given: number, change: number) => void;
}

const amounts = [10, 20, 30, 40, 50, 100];

export const PayDialog: React.FC<PayDialogProps> = ({
  open,
  total,
  onClose,
  onPay,
}) => {
  const [given, setGiven] = useState<number | null>(null);
  const [manual, setManual] = useState<string>("");

  // Reset state when Dialog geöffnet wird
  React.useEffect(() => {
    if (open) {
      setGiven(null);
      setManual("");
    }
  }, [open]);

  const handleAmount = (amt: number) => {
    setGiven(amt);
    setManual("");
  };

  const handleManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManual(e.target.value);
    setGiven(null);
  };

  const parsedManual = parseFloat(manual.replace(",", "."));
  const effectiveGiven = given ?? (isNaN(parsedManual) ? 0 : parsedManual);
  const change = effectiveGiven - total;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-black">Bezahlen</h2>
        <div className="text-xl mb-4 text-black">
          <span className="font-bold">Zu zahlen:</span>{" "}
          <span className="font-bold">{total.toFixed(2)} €</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-xs mx-auto">
          {amounts.map((amt) => (
            <button
              key={amt}
              className={`h-16 w-full rounded font-extrabold text-2xl border shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                given === amt
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-white text-black border-gray-300 hover:bg-blue-100"
              }`}
              onClick={() => handleAmount(amt)}
            >
              {amt} €
            </button>
          ))}
        </div>
        <input
          type="number"
          min={0}
          step={0.01}
          placeholder="Manueller Betrag"
          value={manual}
          onChange={handleManual}
          className="border-2 border-blue-600 rounded-lg px-4 py-4 w-full mb-6 text-center text-2xl font-bold bg-blue-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 placeholder:text-blue-400"
        />
        <div className="text-xl mb-4 text-black">
          <span className="font-bold">Gegeben:</span>{" "}
          <span className="font-bold">{effectiveGiven.toFixed(2)} €</span>
        </div>
        <div className="text-2xl font-bold mb-4 text-green-700">
          Rückgeld: {change >= 0 ? change.toFixed(2) : "-"} €
        </div>
        <div className="flex gap-4">
          <button
            className="bg-green-600 text-white px-6 py-2 rounded font-bold text-lg"
            disabled={effectiveGiven < total}
            onClick={() => {
              onPay(effectiveGiven, change);
              setGiven(null);
              setManual("");
            }}
          >
            OK
          </button>
          <button
            className="bg-gray-400 text-white px-6 py-2 rounded font-bold text-lg"
            onClick={onClose}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};
