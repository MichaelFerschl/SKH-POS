"use client";
import React, { useState } from "react";
import { DishList, Dish } from "../components/DishList";
import { OtherDishDialog } from "../components/OtherDishDialog";
import {
  DepositList,
  DepositItem,
  depositItems,
} from "../components/DepositList";
import { Receipt, ReceiptItem } from "../components/Receipt";
import { TotalDisplay } from "../components/TotalDisplay";
import { PayDialog } from "../components/PayDialog";

export default function Home() {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState<{
    given: number;
    change: number;
  } | null>(null);
  const [otherOpen, setOtherOpen] = useState(false);
  const [printerIp, setPrinterIp] = useState<string>("192.168.2.102");

  // Automatisch Pfand zu Speise hinzufügen (ohne Sonstiges)
  const handleAddDish = (dish: Dish) => {
    setItems((prev) => {
      // Für "Kloß Extra" KEIN Pfand hinzufügen
      if (dish.name === "Kloß Extra") {
        return [...prev, { name: dish.name, price: dish.price, type: "dish" }];
      }
      // Für alle anderen Speisen wie gehabt
      return [
        ...prev,
        { name: dish.name, price: dish.price, type: "dish" },
        ...depositItems
          .filter((d) => d.name !== "Sonstiges")
          .map((d) => ({
            name: d.name,
            price: d.price,
            type: "deposit" as const,
          })),
      ];
    });
  };

  // Sonstiges Gericht hinzufügen (ohne Pfand)
  const handleOtherDish = (price: number) => {
    setItems((prev) => [...prev, { name: "Sonstiges", price, type: "dish" }]);
    setOtherOpen(false);
  };

  // Pfand separat hinzufügen
  const handleAddDeposit = (item: DepositItem) => {
    setItems((prev) => [
      ...prev,
      { name: item.name, price: item.price, type: "deposit" },
    ]);
  };

  // Entfernt eine Speise und alle direkt folgenden zugehörigen Pfandpositionen
  const handleRemove = (idx: number) => {
    setItems((prev) => {
      // Wenn keine Speise: normal entfernen
      if (prev[idx].type !== "dish") return prev.filter((_, i) => i !== idx);
      // Sonst: alle Pfandpositionen nach der Speise mitlöschen
      let end = idx + 1;
      while (
        end < prev.length &&
        prev[end].type === "deposit" &&
        // Nur Standardpfand, nicht "Sonstiges" als Gericht
        ["Messer", "Gabel", "Teller"].includes(prev[end].name)
      ) {
        end++;
      }
      return prev.filter((_, i) => i < idx || i >= end);
    });
  };

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const handlePay = async (given: number, change: number) => {
    setLastPayment({ given, change });
    setPayOpen(false);
    // Bondruck anstoßen
    try {
      await fetch("/api/print-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, given, change, printerIp }),
      });
    } catch (e) {
      // Fehlerbehandlung (optional Toast)
      // eslint-disable-next-line no-console
      console.error("Druckfehler", e);
    }
    setItems([]); // Bon leeren nach Zahlung
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-extrabold mb-4 text-center text-black">
        SK-Heuchling Sommerfest Kasse
      </h1>
      <div className="flex flex-row items-start justify-center gap-8 w-full max-w-6xl mx-auto">
        {/* Linke Spalte: Buttons */}
        <div className="flex flex-col gap-6 w-80">
          <DishList onAdd={handleAddDish} onOther={() => setOtherOpen(true)} />
          <OtherDishDialog
            open={otherOpen}
            onSelect={handleOtherDish}
            onClose={() => setOtherOpen(false)}
          />
          <DepositList onAdd={handleAddDeposit} />
          <div className="mt-2">
            <label
              htmlFor="printerIp"
              className="block text-sm font-bold mb-1 text-black"
            >
              Drucker-IP:
            </label>
            <input
              id="printerIp"
              type="text"
              value={printerIp}
              onChange={(e) => setPrinterIp(e.target.value)}
              className="border rounded px-3 py-2 w-full text-black bg-white"
              placeholder="192.168.2.102"
            />
          </div>
        </div>
        {/* Rechte Spalte: Kassenbon und Gesamtpreis */}
        <div className="flex flex-col items-start w-full max-w-md">
          <Receipt items={items} onRemove={handleRemove} />
          <TotalDisplay total={total} />
          <button
            className="mt-6 bg-green-600 text-white px-8 py-4 rounded font-bold text-2xl shadow hover:bg-green-700 transition"
            onClick={() => setPayOpen(true)}
            disabled={items.length === 0}
          >
            Bezahlen
          </button>
          {lastPayment && (
            <div className="mt-4 text-left text-lg text-green-700">
              Zahlung erhalten: {lastPayment.given.toFixed(2)} €<br />
              Rückgeld: {lastPayment.change.toFixed(2)} €
            </div>
          )}
        </div>
      </div>
      <PayDialog
        open={payOpen}
        total={total}
        onClose={() => setPayOpen(false)}
        onPay={handlePay}
      />
    </div>
  );
}
