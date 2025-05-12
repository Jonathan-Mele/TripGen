'use client';

import styles from './page.module.css';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { httpsCallable } from "firebase/functions";
import { getTripGenFunctions } from "../firebase/firebase";

export default function TripPage() {
  const searchParams = useSearchParams();
  const placeId      = searchParams.get('placeId')   || '';
  const placeName    = searchParams.get('placeName') || '';
  const [interests, setInterests] = useState('');
  const [budget,    setBudget]      = useState(0);
  const [days,      setDays]        = useState(1);

  // Just for dev debugging
  useEffect(() => {
    console.log('Current payload will be:', {
      placeId,
      placeName,
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      budget,
      days,
    });
  }, [placeId, placeName, interests, budget, days]);

  const handleSubmit = async () => {
    if (!placeId) {
      alert('Missing place – please go back and select one.');
      return;
    }
    if (!interests.trim()) {
      alert('Please enter at least one interest.');
      return;
    }

    // Build the payload once
    const payload = {
      placeId,
      locationName: placeName,
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      budget,
      days,
    };

    try {
      const functions = getTripGenFunctions();
      const genItin   = httpsCallable(functions, 'generateItinerary');
      const result  = await genItin(payload);
      // result.data is `any` by default; assert its shape:
      const { pdfBase64 } = result.data as { pdfBase64: string };

      // now turn it into a blob and download…
      const byteChars   = atob(pdfBase64);
      const byteNumbers = Array.from(byteChars).map(c => c.charCodeAt(0));
      const byteArray   = new Uint8Array(byteNumbers);
      const blob        = new Blob([byteArray], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href    = url;
      const safeName = placeName.replace(/[^\w\d_-]/g, '_').slice(0, 30);
      a.download = `itinerary_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Itinerary generation failed:', err);
      alert('Sorry, something went wrong. Please try again.');
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
          type="text"
          placeholder="e.g. 150"
          value={budget === 0 ? "" : budget.toString()}
          onChange={e => {
            const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
            if (!isNaN(v)) setBudget(v);
            else setBudget(0);
          }}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="days">Number of days:</label>
        <input
          id="days"
          type="text"
          placeholder=""
          value={days === 0 ? "" : days.toString()}
          onChange={e => {
            const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
            if (!isNaN(v)) setDays(v);
            else setDays(0);
          }}
        />
      </div>


      <button
        className={styles.submitButton}
        onClick={handleSubmit}
      >
        Generate &amp; Download PDF
      </button>
    </main>
  );
}
