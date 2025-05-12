// functions/src/itinerary.ts

// import * as functions from "firebase-functions";
import {Client} from "@googlemaps/google-maps-services-js";

const mapsKey = "AIzaSyC_V1SbpVbXkVwePe54hE6FcwXKfJzhXYw";
// functions.config().maps.key;
const mapsClient = new Client();

export interface ItineraryRequest {
  placeId: string;
  placeName: string;
  interests: string[];
  budget: number;
  days: number;
}

export interface Visit {
  placeId: string;
  name: string;
  address: string;
  arrival: string;
  departure: string;
}

export interface ItineraryResponse {
  days: Array<{
    date: string;
    visits: Visit[];
  }>;
}

// A trimmed version of the data we collect - to have only the info to include in the itinerary
export interface SummaryVisit {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  photoRef?: string;
}

// And the shape of the final itinerary you’ll hand off to your PDF generator
export interface SummaryItinerary {
  hotel: SummaryVisit;
  poiGroups: Record<string, SummaryVisit[]>;
}

interface LatLng { lat: number; lng: number; }

/**
 * Given a text address or Place ID, return its lat/lng.
 * If you only have a Place ID, you can also call `placeDetails` instead.
 */
async function lookupPlaceCenter(placeId: string): Promise<LatLng> {
  const res = await mapsClient.placeDetails({
    params: {
      key: mapsKey,
      place_id: placeId,
      fields: ["geometry"],
    },
    timeout: 5000,
  });

  if (res.data.status !== "OK" || !res.data.result.geometry) {
    throw new Error("Place Details failed for " + placeId);
  }

  const loc = res.data.result.geometry.location;
  return {lat: loc.lat, lng: loc.lng};
}


/**
 * Wrapper around the Places Nearby Search REST endpoint.
 */
async function searchNearby(
  location: LatLng,
  radius: number,
  type: string,
  keyword: string,
  budget: number,
) {
  const res = await mapsClient.placesNearby({
    params: {
      key: mapsKey,
      location,
      radius,
      type,
      keyword,
    },
    timeout: 5000,
  });
  if (res.data.status === "ZERO_RESULTS") {
    return []; // no matches, but not an exception
  }
  if (res.data.status !== "OK") {
    throw new Error(`Places API error: ${res.data.status}`);
  }
  let results = res.data.results;
  results = results.filter((place) => {
    // if price_level missing, keep it; otherwise enforce the cap
    if (typeof place.price_level !== "number") return true;
    return place.price_level <= budget;
  });
  return results;
}

/**
 * Your core itinerary generator.
 * For now, just returns the raw arrays so you can inspect them.
 */
export async function generateItineraryService(
  req: ItineraryRequest,
  budget: number
): Promise<{
  hotel: any;
  poiGroups: Record<string, any[]>;
}> {
  // 1) Geocode the starting place (could be a city name)
  const center = await lookupPlaceCenter(req.placeId);

  // 2) Find a hotel near that center
  const hotels = await searchNearby(center, 10000, "", "hotel", budget);
  if (!hotels.length) throw new Error("No hotels found");
  hotels.sort((a, b) => {
    const pa = a.price_level ?? 0;
    const pb = b.price_level ?? 0;
    if (pb !== pa) return pb - pa; // higher price first

    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    return rb - ra; // then higher rating
  });

  const hotel = hotels[0];

  // 3) Use that hotel’s location to find POIs for each interest
  if (!hotel.geometry || !hotel.geometry.location) {
    throw new Error("Selected hotel has no geometry data");
  }
  const home: LatLng = {
    lat: hotel.geometry.location.lat,
    lng: hotel.geometry.location.lng,
  };
  const poiGroups: Record<string, any[]> = {};
  for (const interest of req.interests) {
    poiGroups[interest] = await searchNearby(home, 12000, "", interest, budget);
  }

  // 4) Return everything so you can see it in your client console
  return {hotel, poiGroups};
}

export function processItinerary(
  hotel: any,
  poiGroups: Record<string, any[]>
): SummaryItinerary {
  // helper to pick only the fields we care about
  const toSummary = (p: any): SummaryVisit => ({
    placeId: p.place_id,
    name: p.name,
    address: p.vicinity || p.formatted_address || "",
    rating: p.rating,
    photoRef: p.photos?.[0]?.photo_reference,
  });

  // summarize the hotel
  const summaryHotel: SummaryVisit = toSummary(hotel);

  // summarize each POI list, maybe limit to top 3 by rating
  const summaryPOIs: Record<string, SummaryVisit[]> = {};
  for (const [interest, list] of Object.entries(poiGroups)) {
    summaryPOIs[interest] = list
      .map(toSummary)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 3);
  }

  return {
    hotel: summaryHotel,
    poiGroups: summaryPOIs,
  };
}
