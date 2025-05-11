import { generateItineraryService, ItineraryRequest } from "./src/itinerary";

const fakeRequest: ItineraryRequest = {
  placeId:   "Amsterdam, Netherlands",
  interests: ["museum", "park", "cafe"],
  budget:    150,
  days:      2
};

(async () => {
  try {
    const result = await generateItineraryService(fakeRequest, 4);
    console.log("RESULT:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
})();