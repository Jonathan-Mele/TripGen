/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// functions/src/index.ts

// functions/src/index.ts

import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";

import {generateItineraryService, ItineraryRequest, processItinerary} from "./itinerary";
import {renderItineraryPdf} from "./pdfGen";

initializeApp();
const db = getFirestore();

/**
 * This uses the classic v1 auth trigger — it’s fully supported
 * in firebase-functions@4.x even though the module itself is v2-capable.
 */
// eslint-disable-next-line max-len
export const createUser = functions
  .region("us-west1")
  .auth.user().onCreate(async (user) => {
    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoURL,
    };
    db.collection("users").doc(user.uid).set(userInfo);
    logger.info("User Created", userInfo);
  });


// Main function to generate itinerary
// functions/src/index.ts
export const generateItinerary = functions
  .region("us-west1")
  .https
  .onCall(
    async (
      data: ItineraryRequest & { locationName: string },
      context
    ): Promise<{ pdfBase64: string;}> => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Login required"
        );
      }
      const itinerary_budget = data.budget/data.days;
      let budget_level: number;
      if (itinerary_budget < 75) {
        budget_level = 0;
      } else if (itinerary_budget < 150) {
        budget_level = 1;
      } else if (itinerary_budget < 300) {
        budget_level = 2;
      } else if (itinerary_budget < 500) {
        budget_level = 3;
      } else {
        budget_level = 5;
      }

      const rawItineraryData = await generateItineraryService(data, budget_level);

      const processedItineraryData = processItinerary(rawItineraryData.hotel, rawItineraryData.poiGroups);

      const pdfBuffer = await renderItineraryPdf(data.locationName, processedItineraryData);

      const pdfBase64 = pdfBuffer.toString("base64");

      await db
        .collection("users")
        .doc(context.auth.uid)
        .collection("trips")
        .add({
          created: Date.now(),
          location: data.locationName,
          budgetLevel: budget_level,
          pdfBase64, // you might swap this for a Storage URL
          processedItineraryData, // store the JSON too if you like
        });

      return {pdfBase64};
    }
  );
