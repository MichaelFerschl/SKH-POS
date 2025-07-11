import React from "react";

export interface TotalDisplayProps {
  total: number;
}

export const TotalDisplay: React.FC<TotalDisplayProps> = ({ total }) => (
  <div className="text-4xl font-extrabold text-center text-green-700 my-6">
    Gesamt: {total.toFixed(2)} €
  </div>
);
