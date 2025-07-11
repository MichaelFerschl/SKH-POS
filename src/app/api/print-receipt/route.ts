import type { NextRequest } from "next/server";

// Beispiel: Epson ePOS-Print XML generieren
type ReceiptItem = { name: string; price: number; type: "dish" | "deposit" };
interface PrintReceiptBody {
  items: ReceiptItem[];
  given: number;
  change: number;
}
function buildEpsonReceiptXML({ items, given, change }: PrintReceiptBody) {
  // Epson ePOS-Print XML ohne Formatierungstags, Beträge immer rechtsbündig
  const BON_WIDTH = 32; // Zeichen pro Zeile
  const pfandItems = items.filter((i) => i.type === "deposit");
  const pfandSummary: Record<string, { count: number; price: number }> = {};
  pfandItems.forEach((p) => {
    if (!pfandSummary[p.name])
      pfandSummary[p.name] = { count: 0, price: p.price };
    pfandSummary[p.name].count++;
  });
  let xml = `<epos-print xmlns=\"http://www.epson-pos.com/schemas/2011/03/epos-print\">\n`;
  // Titel mittig, 2 Zeilen, dann Leerzeile
  const title1 = "SK-Heuchling 2025";
  const title2 = "Sommerfest 2025 Mittagstisch";
  const title1Spaces = " ".repeat(Math.floor((BON_WIDTH - title1.length) / 2));
  const title2Spaces = " ".repeat(Math.floor((BON_WIDTH - title2.length) / 2));
  xml += `<text>${title1Spaces}${title1}&#10;</text>\n`;
  xml += `<text>${title2Spaces}${title2}&#10;</text>\n`;
  xml += `<text>&#10;</text>\n`;
  xml += `<text>------------------------------&#10;</text>\n`;
  // Gerichte und zugehörige Pfandpositionen (Pfand eingerückt unter Gericht)
  // Positionen in Bestellreihenfolge drucken: Gericht normal, Pfand eingerückt
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type === "dish") {
      const price = `${item.price.toFixed(2)} €`;
      const name = item.name;
      const spaces = " ".repeat(
        Math.max(1, BON_WIDTH - name.length - price.length)
      );
      xml += `<text>${name}${spaces}${price}&#10;</text>\n`;
    } else if (item.type === "deposit") {
      const price = `${item.price.toFixed(2)} €`;
      const name = item.name;
      const indent = "  ";
      const spaces = " ".repeat(
        Math.max(1, BON_WIDTH - indent.length - name.length - price.length)
      );
      xml += `<text>${indent}${name}${spaces}${price}&#10;</text>\n`;
    }
  }
  xml += `<text>------------------------------&#10;</text>\n`;
  // Gesamt
  const total = items.reduce((sum, i) => sum + i.price, 0);
  const totalLine = `Gesamt:`;
  const totalAmount = `${total.toFixed(2)} €`;
  xml += `<text>${totalLine}${" ".repeat(
    Math.max(1, BON_WIDTH - totalLine.length - totalAmount.length)
  )}${totalAmount}&#10;</text>\n`;
  // Gegeben
  const givenLine = `Gegeben:`;
  const givenAmount = `${given.toFixed(2)} €`;
  xml += `<text>${givenLine}${" ".repeat(
    Math.max(1, BON_WIDTH - givenLine.length - givenAmount.length)
  )}${givenAmount}&#10;</text>\n`;
  // Rückgeld
  const changeLine = `Rückgeld:`;
  const changeAmount = `${change.toFixed(2)} €`;
  xml += `<text>${changeLine}${" ".repeat(
    Math.max(1, BON_WIDTH - changeLine.length - changeAmount.length)
  )}${changeAmount}&#10;</text>\n`;
  // Abstand von ca. 2 Zeilen
  for (let i = 0; i < 2; i++) {
    xml += `<text>&#10;</text>\n`;
  }
  // Pfandübersicht
  xml += `<text>Pfandübersicht:&#10;</text>\n`;
  xml += `<text>------------------------------&#10;</text>\n`;
  let pfandSum = 0;
  Object.entries(pfandSummary).forEach(([name, { count, price }]) => {
    const sum = count * price;
    pfandSum += sum;
    const sumStr = `${sum.toFixed(2)} €`;
    const left = `${name}  x${count} =`;
    const spaces = " ".repeat(
      Math.max(1, BON_WIDTH - left.length - sumStr.length)
    );
    xml += `<text>${left}${spaces}${sumStr}&#10;</text>\n`;
  });
  // Linie vor Pfand-Gesamtsumme
  if (pfandSum > 0) {
    xml += `<text>------------------------------&#10;</text>\n`;
    const pfandSumLabel = `Pfand gesamt:`;
    const pfandSumStr = `${pfandSum.toFixed(2)} €`;
    const spaces = " ".repeat(
      Math.max(1, BON_WIDTH - pfandSumLabel.length - pfandSumStr.length)
    );
    xml += `<text>${pfandSumLabel}${spaces}${pfandSumStr}&#10;</text>\n`;
  }
  // Schnitt zwischen Pfandübersicht und Bestellübersicht
  xml += `<cut type=\"feed\"/>\n`;
  // Bestellübersicht groß drucken, weniger Leerzeichen und kürzere Linie
  xml += `<text dh="true" dw="true">Bestellübersicht:&#10;</text>\n`;
  xml += `<text dh="true" dw="true">------------------&#10;</text>\n`;
  // Zähle alle Speisen
  const dishCount: Record<string, number> = {};
  items
    .filter((i) => i.type === "dish")
    .forEach((dish) => {
      dishCount[dish.name] = (dishCount[dish.name] || 0) + 1;
    });
  Object.entries(dishCount).forEach(([name, count]) => {
    const left = `${name}`;
    const right = `x${count}`;
    const spaces = " ".repeat(2); // nur 2 Leerzeichen
    xml += `<text dh="true" dw="true">${left}${spaces}${right}&#10;</text>\n`;
  });
  // Schnitt
  xml += `<cut type=\"feed\"/>\n`;
  xml += `</epos-print>`;
  return xml;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Drucker-IP aus body oder Default
  const printerIp = body.printerIp || "192.168.2.102";
  const printerUrl = `http://${printerIp}/cgi-bin/epos/service.cgi`;
  // SOAP-Envelope mit ePOS-Print XML im Body
  const printjobid = `job${Date.now()}`;
  const soap =
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">\n` +
    `  <s:Header>\n` +
    `    <parameter xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">\n` +
    `      <devid>local_printer</devid>\n` +
    `      <timeout>60000</timeout>\n` +
    `      <printjobid>${printjobid}</printjobid>\n` +
    `    </parameter>\n` +
    `  </s:Header>\n` +
    `  <s:Body>\n` +
    buildEpsonReceiptXML(body) +
    `  </s:Body>\n` +
    `</s:Envelope>`;

  try {
    const res = await fetch(printerUrl, {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: soap,
    });
    const resText = await res.text();
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, error: resText }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify({ ok: true, response: resText }), {
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
    });
  }
}
