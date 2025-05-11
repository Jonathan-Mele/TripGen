'use client';

import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    (window as any).initHome = () => {
      setMapsLoaded(true);
      initAutocompleteWidget();
    };

    async function initAutocompleteWidget() {
      if (!window.google) {
        console.error("Google Maps API is not available.");
        return;
      }
      try {
        await window.google.maps.importLibrary('places');
        //@ts-ignore
        const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement();
        const container = document.getElementById('autocomplete-container');
        if (!container) {
          console.warn('Autocomplete container not found; appending to body.');
          document.body.appendChild(placeAutocomplete);
        } else {
          container.appendChild(placeAutocomplete);
        }

        placeAutocomplete.addEventListener(
          'gmp-select',
          (async (event: any) => {
            // new widget’s event.detail may differ; try both:
            const pred = event.detail?.placePrediction ?? event.placePrediction;
            if (pred?.toPlace) {
              const place = pred.toPlace();
              await place.fetchFields({ fields: [] });
              const details = place.toJSON();
              setSelectedPlace(details.placeId || details.id || '');
            } else {
              console.error('No prediction on event', event);
            }
          }) as unknown as EventListener
        );
      } catch (e) {
        console.error('Error initializing the autocomplete widget:', e);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (!selectedPlace) {
      alert('Please select a place before continuing.');
      return;
    }
    // navigate to /trip with placeId in the query
    router.push(`/trip?placeId=${encodeURIComponent(selectedPlace)}`);
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
          <p>Enter your destination here to get started!</p>
        ) : (
          <p>Loading Google Maps API...</p>
        )}
        <div id="autocomplete-container"></div>
        <button
          className={styles.searchButton}
          style={{ marginTop: '1rem' }}
          onClick={handleSubmit}
        >
          Continue
        </button>
      </main>
    </>
  );
}
