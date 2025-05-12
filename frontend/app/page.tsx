"use client";

import Script from "next/script";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [placeId, setPlaceId]     = useState<string>("");
  const [placeName, setPlaceName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // callback for when the Maps script loads
    (window as any).initHome = () => {
      setMapsLoaded(true);
      initAutocompleteWidget();
    };

    async function initAutocompleteWidget() {
      if (!window.google) {
        console.error("Google Maps API not available");
        return;
      }
      // load the new Web Components library
      await window.google.maps.importLibrary("places");
      //@ts-ignore
      const widget = new window.google.maps.places.PlaceAutocompleteElement();
      const container = document.getElementById("autocomplete-container");
      if (container) container.appendChild(widget);
      else document.body.appendChild(widget);

      widget.addEventListener("gmp-select", (async (event: any) => {
        const pred = event.detail?.placePrediction ?? event.placePrediction;
        if (!pred?.placeId) {
          console.error("No placePrediction or placeId!");
          return;
        }

        // save the ID right away
        setPlaceId(pred.placeId);

        // now fetch full Place Details for just the "name" field
        const service = new google.maps.places.PlacesService(
          document.createElement("div")
        );
        service.getDetails(
          {
            placeId: pred.placeId,
            fields: ["name"],
          },
          (placeResult, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && placeResult?.name) {
              setPlaceName(placeResult.name);
            } else {
              console.warn("Place Details failed:", status);
              // fallback to description text if needed:
              setPlaceName(pred.description ?? "");
            }
          }
        );
      }) as unknown as EventListener);
    }
  }, []);

  const handleSubmit = () => {
    if (!placeId) {
      alert("Please select a place first.");
      return;
    }
    router.push(
      `/trip?${new URLSearchParams({
        placeId,
        placeName,
      }).toString()}`
    );
  };

  return (
    <>
      <Script
        id="google-maps-script"
        strategy="afterInteractive"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_PLACES_KEY}&libraries=places&callback=initHome`}
      />
      <main className={styles.main}>
        <h1>Welcome to TripGen!</h1>
        {mapsLoaded ? (
          <p>Enter your destination here to get started:</p>
        ) : (
          <p>Loading Google Maps API…</p>
        )}
        <div id="autocomplete-container" />
  
        <button
          className={styles.searchButton}
          style={{ marginTop: "1rem" }}
          onClick={handleSubmit}
        >
          Continue
        </button>
  
        {/* ↓ My Trips button right underneath ↓ */}
        <button
          className={styles.searchButton}
          style={{ 
            marginTop: "0.5rem", 
            background: "#888", 
            color: "#fff" 
          }}
          onClick={() => router.push("/trips")}
        >
          My Past Trips
        </button>
  
        {placeName && (
          <p style={{ marginTop: "0.5rem" }}>
            Selected: <strong>{placeName}</strong>
          </p>
        )}
      </main>
    </>
  )
}
