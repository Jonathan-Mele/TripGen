# ​​ TripGen — Itinerary Generator

Check it out live: https://tripgen-client-321790330163.us-west1.run.app

---

## ​ Overview  
TripGen is a full-stack travel planning app that lets users generate, save, and later revisit personalized itineraries. Built with **Next.js**, **Firebase Functions**, and **Firestore**, it integrates the **Google Maps & Places APIs** and features secure, per-user data storage and PDF exports.

---

##  Key Features  
-  **Google Auth** for secure user sign-in  
-  Save itineraries as **Firestore documents** (includes PDF data and processed content)  
-  Fetch location details and recommendations via **Google Maps/Places APIs**  
-  Live frontend hosted on **Google Cloud Run**  

---

##  Architecture & Tech Stack  
| Layer        | Technologies Used                                      |
|--------------|--------------------------------------------------------|
| Frontend     | Next.js (TypeScript), deployed on Google Cloud Run    |
| Backend      | Firebase Functions                                     |
| Database     | Firestore (NoSQL) with secure user-specific collections|
| APIs         | Google Maps API, Google Places API                     |
| Hosting      | GCP (Cloud Run for frontend, Firebase for backend)     |

---

## Project Structure  