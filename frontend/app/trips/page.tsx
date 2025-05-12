// app/trips/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getTripGenFunctions } from '../firebase/firebase';
import styles from './page.module.css';

interface TripRecord {
  location:  string;
  created:   number;
  pdfBase64: string;
}

export default function TripsPage() {
  const [trips, setTrips]       = useState<TripRecord[]>([]);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        const functions  = getTripGenFunctions();
        const getTripsFn = httpsCallable<{}, { trips: TripRecord[] }>(
          functions,
          'getTrips'        // ← must match your onCall export name
        );
        const res = await getTripsFn({});
        setTrips(res.data.trips);
      } catch (e: any) {
        console.error('Failed to load trips', e);
        setError('Could not load past trips.');
      }
    }
    loadTrips();
  }, []);

  if (error) {
    return (
      <main className={styles.main}>
        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <h1>Past Trips</h1>
      {trips.length === 0 ? (
        <p>No trips found.</p>
      ) : (
        <ul className={styles.tripList}>
          {trips.map((t, i) => {
            const dateStr = new Date(t.created).toLocaleDateString();
            const href    = `data:application/pdf;base64,${t.pdfBase64}`;
            return (
              <li key={i} className={styles.tripItem}>
                <span className={styles.tripInfo}>
                  {t.location}, {dateStr}
                </span>
                <a
                  href={href}
                  download={`itinerary_${t.location.replace(/[^\w\d_-]/g, '_')}_${dateStr}.pdf`}
                  className={styles.downloadLink}
                >
                  Download
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}