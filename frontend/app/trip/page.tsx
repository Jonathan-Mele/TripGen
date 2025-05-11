'use client';

import styles from './page.module.css';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function TripPage() {
  const searchParams   = useSearchParams();
  const placeId        = searchParams.get('placeId') || '';
  const [interests, setInterests] = useState('');
  const [budget, setBudget]       = useState(0);
  const [days, setDays]           = useState(1);

  useEffect(() => {
    const payload = {
      placeId,
      interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
      budget,
      days,
    };
    console.log('Current payload:', payload);
  }, [placeId, interests, budget, days]);

  const handleSubmit = async () => {
    if (!placeId) {
      alert('Missing placeId – please go back and select a place.');
      return;
    }
    if (!interests) {
      alert('Please enter at least one interest.');
      return;
    }

    // Build the payload
    const payload = {
      placeId,
      interests: interests.split(',').map((s) => s.trim()),
      budget,
      days
    };

    try {
      // Initialize the Functions client
      const functions = getFunctions();
      // Get a reference to your callable
      const genItin = httpsCallable(functions, 'generateItinerary');
      // Call it
      const { data } = await genItin(payload);
      
      // data should be your ItineraryResponse
      //console.log('Generated itinerary:', data.itinerary);
      // e.g. navigate to a results page or store in state
    } catch (err) {
      console.error('Itinerary generation failed:', err);
      alert('Sorry, something went wrong. Please try again.');
    }
  };

  return (
    <main className={styles.main}>
      <h1>Plan Your Trip</h1>
      <p>Starting from place: <strong>{placeId}</strong></p>

      <div className={styles.formRow}>
        <label>Interests (comma‑separated):</label>
        <input
          type="text"
          value={interests}
          onChange={e => setInterests(e.target.value)}
        />
      </div>

      <div className={styles.formRow}>
        <label>Daily budget ($):</label>
        <input
          type="number"
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
        />
      </div>

      <div className={styles.formRow}>
        <label>Number of days:</label>
        <input
          type="number"
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          min={1}
        />
      </div>

      <button
        className={styles.submitButton}
        onClick={handleSubmit}
      >
        Generate Itinerary
      </button>
    </main>
  );
}