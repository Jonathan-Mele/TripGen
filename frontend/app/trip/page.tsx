"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { httpsCallable } from "firebase/functions";
import { getTripGenFunctions } from "../firebase/firebase";

export default function TripPage() {
  const [placeId, setPlaceId]       = useState("");
  const [placeName, setPlaceName]   = useState("");
  const [interests, setInterests]   = useState("");
  const [budget, setBudget]         = useState(0);
  const [days, setDays]             = useState(1);

  // grab the URL params on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setPlaceId(p.get("placeId")   || "");
    setPlaceName(p.get("placeName") || "");
  }, []);

  // dev-only
  useEffect(() => {
    console.log({
      placeId,
      placeName,
      interests: interests.split(",").map(s => s.trim()).filter(Boolean),
      budget,
      days,
    });
  }, [placeId, placeName, interests, budget, days]);

  const handleSubmit = async () => {
    if (!placeId) return alert("Missing place – go back and select one.");
    if (!interests.trim()) return alert("Enter at least one interest.");

    const payload = {
      placeId,
      locationName: placeName,
      interests: interests.split(",").map(s => s.trim()).filter(Boolean),
      budget,
      days,
    };

    try {
      const fn      = getTripGenFunctions();
      const genItin = httpsCallable(fn, "generateItinerary");
      const res     = await genItin(payload);
      const { pdfBase64 } = res.data as { pdfBase64: string };

      const bytes      = atob(pdfBase64);
      const arr        = new Uint8Array(Array.from(bytes).map(c => c.charCodeAt(0)));
      const blob       = new Blob([arr], { type: "application/pdf" });
      const url        = URL.createObjectURL(blob);
      const a          = document.createElement("a");
      a.href           = url;
      a.download       = `itinerary_${placeName.replace(/[^\w\d_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Sorry, something went wrong.");
    }
  };

  return (
    <main className={styles.main}>
      <h1>Plan Your Trip</h1>
      <p>Starting from: <strong>{placeName}</strong></p>

      <div className={styles.formRow}>
        <label>Interests (comma-separated):</label>
        <input
          type="text"
          value={interests}
          onChange={e => setInterests(e.target.value)}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="budget">Budget ($):</label>
        <input
          id="budget"
          type="number"
          value={budget || ""}
          onChange={e => setBudget(Number(e.target.value))}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="days">Number of days:</label>
        <input
          id="days"
          type="number"
          min={1}
          value={days}
          onChange={e => setDays(Number(e.target.value))}
        />
      </div>

      <button className={styles.submitButton} onClick={handleSubmit}>
        Generate &amp; Download PDF
      </button>
    </main>
  );
}
