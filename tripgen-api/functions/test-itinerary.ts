// test-itinerary.ts
import { writeFileSync } from "fs";
import {
  generateItineraryService,
  ItineraryRequest
} from "./src/itinerary";
import { processItinerary } from "./src/itinerary";
import { renderItineraryPdf } from "./src/pdfGen";

const fakeRequest: ItineraryRequest = {
  placeId:   "ChIJW-T2Wt7Gt4kRKl2I1CJFUsI",
  placeName: "Washington, DC, USA",
  interests: ["museum", "park", "cafe"],
  budget:    150,
  days:      2
};

(async () => {
  try {
    // 1) raw data
    const raw = await generateItineraryService(fakeRequest, /*budget_level*/ 2);
    console.log("RAW:", JSON.stringify(raw, null, 2));

    // 2) summary
    const summary = processItinerary(raw.hotel, raw.poiGroups);
    console.log("SUMMARY:", JSON.stringify(summary, null, 2));

    // 3) render PDF
    const pdfBuffer = await renderItineraryPdf(
      fakeRequest.placeName,
      summary
    );

    // 4) write file into your current directory
    writeFileSync("itinerary-test.pdf", pdfBuffer);
    console.log("✅ PDF written to ./itinerary-test.pdf");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
})();