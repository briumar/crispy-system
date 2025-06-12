# Weather Wardrobe

A weather-based fashion recommendation web app that helps users decide what to wear based on current weather conditions and optional style preferences. It combines real-time weather data and outfit image suggestions to enhance everyday fashion planning.

---

## 📦 Project Description

Weather Wardrobe allows users to:
- Get the current weather of a city.
- Automatically receive an outfit keyword suggestion based on temperature.
- Search for outfit images related to either the auto-generated or user-entered keyword.
- Log in and register (with localStorage or backend support).
- Switch between dark and light UI themes.
- Track search history for reference.

This project integrates OpenWeatherMap and Pexels APIs and supports basic user authentication features.

---

## ⚙️ Setup Instructions

To run the project locally:

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd weather-wardrobe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Visit the app**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: Make sure you have Node.js and SQLite installed on your system.

---

## ✨ Features and Functionality

- **Weather Fetching**: Retrieves city-specific weather using OpenWeatherMap API.
- **Outfit Keyword Suggestion**: Suggests clothing types based on temperature (e.g., "summer outfit", "winter coat").
- **Outfit Image Display**: Searches and shows fashion images using the Pexels API.
- **User Authentication**: Users can register and log in. Authenticated users can save history to a database (backend version).
- **Search History**: Recent keyword searches are stored and displayed.
- **Theme Toggle**: Switch between dark and light modes.
- **Responsive UI**: Built with Tailwind CSS for modern and mobile-friendly design.

---

## 🐞 Known Bugs or Limitations

- **Frontend-only auth (in `index.html`) is insecure**: It stores usernames and passwords in `localStorage` without encryption.
- **Backend history API is implemented but not fully integrated** with the frontend interface yet.
- **City input requires correct spelling**: No fuzzy matching or city auto-suggestions.
- **API rate limits**:
  - Pexels API may restrict image queries if requests are too frequent.
  - Weather API may fail if invalid city names are entered.

---

## 📁 File Overview

- `index.html` – Main UI for interaction.
- `script.js` – Core client-side logic for weather, images, and login.
- `server.js` – Node.js Express backend with API proxy, database handling, and user auth.
- `webstyle.css` – Basic custom CSS.
- `database.sqlite` – SQLite DB for storing users and search history (auto-generated).

---

## 📜 License

This project is for educational and demonstration purposes only.