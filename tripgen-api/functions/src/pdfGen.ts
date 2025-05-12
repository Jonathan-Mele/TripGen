// functions/src/pdf.ts
import PDFDocument from "pdfkit";
import {SummaryItinerary, SummaryVisit} from "./itinerary"; // adjust the path as needed
import {PassThrough} from "stream";

/**
 * Turn your summary data into a simple PDF.
 * @return a Buffer containing the PDF file.
 */
export async function renderItineraryPdf(
  locationName: string,
  summary: SummaryItinerary
): Promise<Buffer> {
  const doc = new PDFDocument({margin: 50});
  const stream = new PassThrough();
  const chunks: Buffer[] = [];

  // collect the PDF data as it’s generated
  doc.pipe(stream);
  stream.on("data", (chunk) => chunks.push(chunk));

  // 1) Title
  doc
    .fontSize(20)
    .text(`Trip to ${locationName}`, {align: "center"})
    .moveDown(1.5);

  // 2) Hotel section
  doc.fontSize(16).text("Hotel:", {underline: true});
  writeVisit(doc, summary.hotel);
  doc.moveDown(1);

  // 3) Activities
  doc.fontSize(16).text("Activities:", {underline: true});
  for (const [category, visits] of Object.entries(summary.poiGroups)) {
    doc
      .fontSize(14)
      .text(category.charAt(0).toUpperCase() + category.slice(1), {
        continued: false,
      })
      .moveDown(0.5);

    visits.forEach((v) => {
      writeVisit(doc, v);
      doc.moveDown(0.5);
    });

    doc.moveDown(1);
  }

  // finalize
  doc.end();

  // wait for stream to finish
  await new Promise<void>((resolve) => stream.on("end", () => resolve()));

  return Buffer.concat(chunks);
}

/** Helper: write one place’s details in a small block */
function writeVisit(doc: PDFKit.PDFDocument, v: SummaryVisit) {
  doc
    .fontSize(12)
    .text(`• ${v.name}`, {continued: false})
    .text(`  Address: ${v.address}`)
    .text(v.rating != null ? `  Rating: ${v.rating}` : "");
  // .text(v.photoRef ? `  PhotoRef: ${v.photoRef}` : '');
}
