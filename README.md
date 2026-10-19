# 🎬 Netflix Executive Analytics Dashboard

A modern, high-performance, interactive Netflix analytics web dashboard inspired by executive Power BI report designs. Built with Vanilla HTML5, CSS3, and JavaScript, featuring real-time reactive filtering, Chart.js visualizations, movie inspection modals, and a built-in **1920×1080 Power BI Canvas Background Exporter**.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla%20JS%20%7C%20CSS3%20%7C%20HTML5-red)
![Chart.js](https://img.shields.io/badge/Charts-Chart.js%204.4-blue)
![Power BI Ready](https://img.shields.io/badge/Power%20BI-1080p%20Canvas%20Ready-yellow)

---

## ✨ Features

- **🔴 Netflix Cinematic Dark Theme**: Crafted with deep obsidian backgrounds (`#0a0b10`), crimson neon glows, glassmorphism, and smooth micro-animations.
- **⚡ Reactive Filter Engine**:
  - **Content-Type Filter**: Instantly switch between **All Titles**, **Movies Only**, and **TV Shows Only**.
  - **Country Dropdown**: Drill down into production countries (United States, India, South Korea, United Kingdom, Spain, Japan, France, etc.).
  - **Genre & Rating Filters**: Filter by content categories (Dramas, Comedies, Sci-Fi) and age ratings (TV-MA, TV-14, PG-13, R, etc.).
  - **Release Year Range Slider**: Dynamic slider to filter titles released from 1990 to 2024.
  - **Instant Global Search**: Search by title, director, cast members, or synopsis keywords.
- **📊 6 Dynamic KPI Cards**:
  - Total Catalog Titles (with animated counter)
  - Total Movies (with percentage share badge)
  - Total TV Shows (with percentage share badge)
  - Production Countries represented
  - Content Maturity Ratings
  - Adaptive Average Duration (seasons vs runtimes)
- **📈 Comprehensive Visualizations (Chart.js 4.4)**:
  - **Movies vs TV Shows**: Donut chart with cutout total counter and click-to-filter.
  - **Content Released Over Years**: Spline area chart with red gradient fill.
  - **Content Added Over Time**: Platform content catalog timeline.
  - **Top 10 Countries**: Ranked horizontal bar chart.
  - **Rating Distribution**: Vertical column chart across maturity categories.
  - **Top Genres**: Horizontal category volume chart.
  - **Top Directors**: Directorial volume leaders.
  - **Duration Distribution**: Adaptive bar chart (movie runtime buckets or TV show season counts).
- **📋 Catalog Drill-Through Table**:
  - Sortable headers, pagination, and color-coded maturity badges.
  - Clicking any row opens a **Netflix Detail Inspector Modal** with synopsis, cast, director, country, and IMDb rating.
- **📥 Power BI 1080p Canvas Exporter**:
  - Built-in canvas generator that renders a **1920×1080 layout background**.
  - One-click downloads for **PNG** and **SVG** vector formats, ready to import directly into Power BI Desktop (`Format > Canvas background > Add file > Fit > Transparency: 0%`).
- **💾 Export to CSV**: One-click export of filtered records to CSV.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Priyatharshan9805/netflix-analytics-dashboard.git
cd netflix-analytics-dashboard
```

### 2. Run Locally
You can run this project with any local HTTP server:

```powershell
# Using Python
python -m http.server 5173

# Or using Node.js
npx serve .
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```text
netflix-analytics-dashboard/
├── index.html       # Main HTML shell, semantic layout & modals
├── style.css        # Cinematic Netflix dark design system & responsive styling
├── data.js          # Curated comprehensive Netflix dataset
├── dashboard.js     # State management, Chart.js instances, filters & exporter
└── README.md        # Documentation and guide
```

---

## 🎨 Power BI Desktop Integration

To use the custom canvas background in Power BI Desktop:
1. Click the **"Power BI Background"** button in the dashboard header.
2. Click **"Download PNG (1920×1080)"**.
3. In **Power BI Desktop**, open your report page.
4. Go to **Format page (Visualizations pane) → Canvas background**.
5. Click **Add file** and select the downloaded PNG.
6. Set **Image fit** to `Fit` and **Transparency** to `0%`.
7. Set individual visual backgrounds to `100% transparent` for a seamless glassmorphism look!

---

## 👤 Author

Developed by **[Priyatharshan9805](https://github.com/Priyatharshan9805)**.
