/**
 * NETFLIX EXECUTIVE ANALYTICS DASHBOARD - CORE ENGINE
 * Powers reactive filters, Chart.js instances, dynamic KPI cards, table pagination,
 * Netflix modal inspector, and 1920x1080 Power BI Canvas Background generation.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global State
  const state = {
    allData: window.NETFLIX_DATA || [],
    filteredData: [],
    filters: {
      type: "All",
      country: "All",
      genre: "All",
      rating: "All",
      minYear: 1990,
      searchQuery: ""
    },
    table: {
      currentPage: 1,
      pageSize: 6,
      sortColumn: "title",
      sortDirection: "asc"
    },
    charts: {}
  };

  // DOM Elements Cache
  const els = {
    // Inputs & Filters
    globalSearch: document.getElementById("global-search"),
    clearSearchBtn: document.getElementById("clear-search-btn"),
    typeControl: document.getElementById("content-type-filter"),
    countryFilter: document.getElementById("country-filter"),
    genreFilter: document.getElementById("genre-filter"),
    ratingFilter: document.getElementById("rating-filter"),
    yearRange: document.getElementById("year-range"),
    yearValueLabel: document.getElementById("year-value-label"),
    resultsCountBadge: document.getElementById("filter-count"),
    
    // Header Actions
    btnExportPBI: document.getElementById("btn-export-pbi"),
    btnExportCSV: document.getElementById("btn-export-csv"),
    btnResetFilters: document.getElementById("btn-reset-filters"),
    btnFullscreen: document.getElementById("btn-fullscreen"),

    // KPIs
    kpiTitles: document.getElementById("kpi-val-titles"),
    kpiMovies: document.getElementById("kpi-val-movies"),
    kpiTVShows: document.getElementById("kpi-val-tvshows"),
    kpiCountries: document.getElementById("kpi-val-countries"),
    kpiRatings: document.getElementById("kpi-val-ratings"),
    kpiDuration: document.getElementById("kpi-val-duration"),
    kpiSubTitles: document.getElementById("kpi-sub-titles"),
    kpiPillMovies: document.getElementById("kpi-pill-movies"),
    kpiPillTVShows: document.getElementById("kpi-pill-tvshows"),
    kpiSubDuration: document.getElementById("kpi-sub-duration"),
    donutCenterTotal: document.getElementById("donut-center-total"),
    typeDonutRatio: document.getElementById("type-donut-ratio"),
    durationBadgeMode: document.getElementById("duration-badge-mode"),

    // Table
    tableTbody: document.getElementById("content-table-tbody"),
    tableRecordCount: document.getElementById("table-record-count"),
    tablePageNumber: document.getElementById("table-page-number"),
    tablePrevBtn: document.getElementById("table-prev-btn"),
    tableNextBtn: document.getElementById("table-next-btn"),
    tableHeaders: document.querySelectorAll("#content-table th.sortable"),

    // Detail Modal
    detailModal: document.getElementById("movie-detail-modal"),
    modalCloseBtn: document.getElementById("modal-close-btn"),
    modalTitle: document.getElementById("modal-title"),
    modalType: document.getElementById("modal-type"),
    modalRating: document.getElementById("modal-rating"),
    modalYear: document.getElementById("modal-year"),
    modalDuration: document.getElementById("modal-duration"),
    modalImdb: document.getElementById("modal-imdb"),
    modalSynopsis: document.getElementById("modal-synopsis"),
    modalGenres: document.getElementById("modal-genres"),
    modalDirector: document.getElementById("modal-director"),
    modalCountry: document.getElementById("modal-country"),
    modalDateAdded: document.getElementById("modal-date-added"),
    modalCast: document.getElementById("modal-cast"),

    // Power BI Export Modal
    pbiModal: document.getElementById("pbi-export-modal"),
    pbiModalCloseBtn: document.getElementById("pbi-modal-close-btn"),
    pbiCanvas: document.getElementById("pbi-canvas-renderer"),
    btnDownloadPBIPng: document.getElementById("btn-download-pbi-png"),
    btnDownloadPBISvg: document.getElementById("btn-download-pbi-svg")
  };

  // Configure Chart.js Dark Netflix Defaults
  Chart.defaults.color = "#94a3b8";
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.06)";
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.plugins.tooltip.backgroundColor = "rgba(18, 20, 29, 0.95)";
  Chart.defaults.plugins.tooltip.titleColor = "#ffffff";
  Chart.defaults.plugins.tooltip.bodyColor = "#cbd5e1";
  Chart.defaults.plugins.tooltip.borderColor = "rgba(229, 9, 20, 0.4)";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;

  // Initialize
  initFiltersDropdowns();
  bindEventListeners();
  initCharts();
  applyFiltersAndRender();
  renderPowerBICanvas();

  // =====================================================================
  // 1. POPULATE DROPDOWNS
  // =====================================================================
  function initFiltersDropdowns() {
    const countries = new Set();
    const genres = new Set();
    const ratings = new Set();

    state.allData.forEach(item => {
      if (item.country) countries.add(item.country);
      if (item.rating) ratings.add(item.rating);
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach(g => genres.add(g));
      }
    });

    // Populate Countries
    Array.from(countries).sort().forEach(country => {
      const opt = document.createElement("option");
      opt.value = country;
      opt.textContent = country;
      els.countryFilter.appendChild(opt);
    });

    // Populate Genres
    Array.from(genres).sort().forEach(genre => {
      const opt = document.createElement("option");
      opt.value = genre;
      opt.textContent = genre;
      els.genreFilter.appendChild(opt);
    });

    // Populate Ratings
    Array.from(ratings).sort().forEach(rating => {
      const opt = document.createElement("option");
      opt.value = rating;
      opt.textContent = rating;
      els.ratingFilter.appendChild(opt);
    });
  }

  // =====================================================================
  // 2. EVENT LISTENERS
  // =====================================================================
  function bindEventListeners() {
    // Search Box
    els.globalSearch.addEventListener("input", (e) => {
      state.filters.searchQuery = e.target.value.trim().toLowerCase();
      els.clearSearchBtn.style.display = state.filters.searchQuery ? "block" : "none";
      state.table.currentPage = 1;
      applyFiltersAndRender();
    });

    els.clearSearchBtn.addEventListener("click", () => {
      els.globalSearch.value = "";
      state.filters.searchQuery = "";
      els.clearSearchBtn.style.display = "none";
      state.table.currentPage = 1;
      applyFiltersAndRender();
    });

    // Content Type Segmented Control
    els.typeControl.addEventListener("click", (e) => {
      const btn = e.target.closest(".seg-btn");
      if (!btn) return;
      els.typeControl.querySelectorAll(".seg-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-checked", "true");
      state.filters.type = btn.dataset.type;
      state.table.currentPage = 1;
      applyFiltersAndRender();
    });

    // Dropdown Filters
    els.countryFilter.addEventListener("change", (e) => {
      state.filters.country = e.target.value;
      state.table.currentPage = 1;
      applyFiltersAndRender();
    });

    els.genreFilter.addEventListener("change", (e) => {
      state.filters.genre = e.target.value;
      state.table.currentPage = 1;
      applyFiltersAndRender();
    });

    els.ratingFilter.addEventListener("change", (e) => {
      state.filters.rating = e.target.value;
      state.table.currentPage = 1;
      applyFiltersAndRender();
    });

    // Year Slider
    els.yearRange.addEventListener("input", (e) => {
      state.filters.minYear = parseInt(e.target.value, 10);
      els.yearValueLabel.textContent = state.filters.minYear;
      state.table.currentPage = 1;
      applyFiltersAndRender();
    });

    // Reset Filters
    els.btnResetFilters.addEventListener("click", resetAllFilters);

    // CSV Export
    els.btnExportCSV.addEventListener("click", exportFilteredDataToCSV);

    // Fullscreen Toggle
    els.btnFullscreen.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Table Pagination
    els.tablePrevBtn.addEventListener("click", () => {
      if (state.table.currentPage > 1) {
        state.table.currentPage--;
        renderTable();
      }
    });

    els.tableNextBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(state.filteredData.length / state.table.pageSize) || 1;
      if (state.table.currentPage < totalPages) {
        state.table.currentPage++;
        renderTable();
      }
    });

    // Table Header Sorting
    els.tableHeaders.forEach(th => {
      th.addEventListener("click", () => {
        const col = th.dataset.sort;
        if (state.table.sortColumn === col) {
          state.table.sortDirection = state.table.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.table.sortColumn = col;
          state.table.sortDirection = "asc";
        }
        updateTableSortIcons();
        renderTable();
      });
    });

    // Modal Close
    els.modalCloseBtn.addEventListener("click", () => {
      els.detailModal.classList.remove("open");
      els.detailModal.setAttribute("aria-hidden", "true");
    });

    els.detailModal.addEventListener("click", (e) => {
      if (e.target === els.detailModal) {
        els.detailModal.classList.remove("open");
        els.detailModal.setAttribute("aria-hidden", "true");
      }
    });

    // Power BI Background Exporter Modal
    els.btnExportPBI.addEventListener("click", () => {
      renderPowerBICanvas();
      els.pbiModal.classList.add("open");
      els.pbiModal.setAttribute("aria-hidden", "false");
    });

    els.pbiModalCloseBtn.addEventListener("click", () => {
      els.pbiModal.classList.remove("open");
      els.pbiModal.setAttribute("aria-hidden", "true");
    });

    els.pbiModal.addEventListener("click", (e) => {
      if (e.target === els.pbiModal) {
        els.pbiModal.classList.remove("open");
        els.pbiModal.setAttribute("aria-hidden", "true");
      }
    });

    els.btnDownloadPBIPng.addEventListener("click", downloadPowerBIBackgroundPNG);
    els.btnDownloadPBISvg.addEventListener("click", downloadPowerBIBackgroundSVG);

    // Keyboard ESC to close modals
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        els.detailModal.classList.remove("open");
        els.pbiModal.classList.remove("open");
      }
    });
  }

  // =====================================================================
  // 3. FILTERING & REACTIVE PIPELINE
  // =====================================================================
  function applyFiltersAndRender() {
    const { type, country, genre, rating, minYear, searchQuery } = state.filters;

    state.filteredData = state.allData.filter(item => {
      // Content Type Filter
      if (type !== "All" && item.type !== type) return false;

      // Country Filter
      if (country !== "All" && item.country !== country) return false;

      // Genre Filter
      if (genre !== "All" && (!item.genres || !item.genres.includes(genre))) return false;

      // Rating Filter
      if (rating !== "All" && item.rating !== rating) return false;

      // Release Year
      if (item.release_year < minYear) return false;

      // Search Query
      if (searchQuery) {
        const titleMatch = (item.title || "").toLowerCase().includes(searchQuery);
        const dirMatch = (item.director || "").toLowerCase().includes(searchQuery);
        const castMatch = (item.cast || "").toLowerCase().includes(searchQuery);
        const descMatch = (item.description || "").toLowerCase().includes(searchQuery);
        if (!titleMatch && !dirMatch && !castMatch && !descMatch) return false;
      }

      return true;
    });

    // Update Result Badge
    els.resultsCountBadge.textContent = state.filteredData.length;

    // Update KPIs
    updateKPIs();

    // Update Charts
    updateCharts();

    // Update Table
    renderTable();
  }

  function resetAllFilters() {
    state.filters = {
      type: "All",
      country: "All",
      genre: "All",
      rating: "All",
      minYear: 1990,
      searchQuery: ""
    };

    els.globalSearch.value = "";
    els.clearSearchBtn.style.display = "none";
    els.countryFilter.value = "All";
    els.genreFilter.value = "All";
    els.ratingFilter.value = "All";
    els.yearRange.value = 1990;
    els.yearValueLabel.textContent = "1990";

    els.typeControl.querySelectorAll(".seg-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.type === "All");
      b.setAttribute("aria-checked", b.dataset.type === "All" ? "true" : "false");
    });

    state.table.currentPage = 1;
    applyFiltersAndRender();
  }

  // =====================================================================
  // 4. KPI COMPUTATION
  // =====================================================================
  function updateKPIs() {
    const data = state.filteredData;
    const totalCount = data.length;

    const moviesCount = data.filter(d => d.type === "Movie").length;
    const tvShowsCount = data.filter(d => d.type === "TV Show").length;
    const countriesSet = new Set(data.map(d => d.country).filter(Boolean));
    const ratingsSet = new Set(data.map(d => d.rating).filter(Boolean));

    // Durations
    const movieItems = data.filter(d => d.type === "Movie" && d.duration_val);
    const tvItems = data.filter(d => d.type === "TV Show" && d.duration_val);

    const avgMovieMin = movieItems.length
      ? Math.round(movieItems.reduce((acc, curr) => acc + curr.duration_val, 0) / movieItems.length)
      : 0;

    const avgTVSeasons = tvItems.length
      ? (tvItems.reduce((acc, curr) => acc + curr.duration_val, 0) / tvItems.length).toFixed(1)
      : 0;

    // Update DOM
    animateCounter(els.kpiTitles, totalCount);
    animateCounter(els.kpiMovies, moviesCount);
    animateCounter(els.kpiTVShows, tvShowsCount);
    animateCounter(els.kpiCountries, countriesSet.size);
    animateCounter(els.kpiRatings, ratingsSet.size);

    // Subtext & Share Pills
    const moviePct = totalCount ? Math.round((moviesCount / totalCount) * 100) : 0;
    const tvPct = totalCount ? Math.round((tvShowsCount / totalCount) * 100) : 0;
    els.kpiPillMovies.textContent = `${moviePct}%`;
    els.kpiPillTVShows.textContent = `${tvPct}%`;
    els.donutCenterTotal.textContent = totalCount;
    els.typeDonutRatio.textContent = `${moviePct}% Movies / ${tvPct}% Shows`;

    if (state.filters.type === "TV Show") {
      els.kpiDuration.textContent = `${avgTVSeasons} Seasons`;
      els.kpiSubDuration.textContent = `Across ${tvItems.length} series`;
      els.durationBadgeMode.textContent = "TV Seasons";
    } else if (state.filters.type === "Movie") {
      els.kpiDuration.textContent = `${avgMovieMin} min`;
      els.kpiSubDuration.textContent = `Across ${movieItems.length} movies`;
      els.durationBadgeMode.textContent = "Movie Minutes";
    } else {
      els.kpiDuration.textContent = `${avgMovieMin} min`;
      els.kpiSubDuration.textContent = `${avgTVSeasons} avg TV Seasons`;
      els.durationBadgeMode.textContent = "Runtime & Seasons";
    }
  }

  function animateCounter(el, target) {
    const current = parseInt(el.textContent.replace(/,/g, ""), 10) || 0;
    if (current === target) return;

    const diff = target - current;
    const duration = 400;
    const steps = 15;
    const increment = diff / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const val = Math.round(current + (increment * stepCount));
      el.textContent = val.toLocaleString();
      if (stepCount >= steps) {
        el.textContent = target.toLocaleString();
        clearInterval(timer);
      }
    }, duration / steps);
  }

  // =====================================================================
  // 5. CHART.JS VISUALIZATIONS (INITIALIZATION & UPDATES)
  // =====================================================================
  function initCharts() {
    // 1. Movies vs TV Shows Donut
    const ctxType = document.getElementById("chart-type-distribution").getContext("2d");
    state.charts.type = new Chart(ctxType, {
      type: "doughnut",
      data: {
        labels: ["Movies", "TV Shows"],
        datasets: [{
          data: [0, 0],
          backgroundColor: ["#e50914", "#8b5cf6"],
          borderColor: "#12141d",
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, padding: 14, color: "#cbd5e1" }
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const selectedType = idx === 0 ? "Movie" : "TV Show";
            state.filters.type = state.filters.type === selectedType ? "All" : selectedType;
            els.typeControl.querySelectorAll(".seg-btn").forEach(b => {
              b.classList.toggle("active", b.dataset.type === state.filters.type);
            });
            applyFiltersAndRender();
          }
        }
      }
    });

    // 2. Content Released Over Years (Spline Area)
    const ctxYears = document.getElementById("chart-released-years").getContext("2d");
    const redGradient = ctxYears.createLinearGradient(0, 0, 0, 220);
    redGradient.addColorStop(0, "rgba(229, 9, 20, 0.55)");
    redGradient.addColorStop(1, "rgba(229, 9, 20, 0.0)");

    state.charts.releasedYears = new Chart(ctxYears, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Titles Released",
          data: [],
          borderColor: "#e50914",
          backgroundColor: redGradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#e50914",
          pointBorderColor: "#fff",
          pointRadius: 3,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true }
        }
      }
    });

    // 3. Content Added Over Time
    const ctxAdded = document.getElementById("chart-added-timeline").getContext("2d");
    const blueGradient = ctxAdded.createLinearGradient(0, 0, 0, 220);
    blueGradient.addColorStop(0, "rgba(59, 130, 246, 0.45)");
    blueGradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");

    state.charts.addedTimeline = new Chart(ctxAdded, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Added to Netflix",
          data: [],
          borderColor: "#3b82f6",
          backgroundColor: blueGradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          pointRadius: 3,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true }
        }
      }
    });

    // 4. Top 10 Countries Horizontal Bar Chart
    const ctxCountries = document.getElementById("chart-top-countries").getContext("2d");
    state.charts.countries = new Chart(ctxCountries, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: "Titles",
          data: [],
          backgroundColor: "#e50914",
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true },
          y: { grid: { display: false } }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const clickedCountry = state.charts.countries.data.labels[idx];
            state.filters.country = state.filters.country === clickedCountry ? "All" : clickedCountry;
            els.countryFilter.value = state.filters.country;
            applyFiltersAndRender();
          }
        }
      }
    });

    // 5. Content Rating Distribution Vertical Bar Chart
    const ctxRatings = document.getElementById("chart-ratings-distribution").getContext("2d");
    state.charts.ratings = new Chart(ctxRatings, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: "Titles",
          data: [],
          backgroundColor: [
            "#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"
          ],
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const clickedRating = state.charts.ratings.data.labels[idx];
            state.filters.rating = state.filters.rating === clickedRating ? "All" : clickedRating;
            els.ratingFilter.value = state.filters.rating;
            applyFiltersAndRender();
          }
        }
      }
    });

    // 6. Top Genres Horizontal Bar Chart
    const ctxGenres = document.getElementById("chart-top-genres").getContext("2d");
    state.charts.genres = new Chart(ctxGenres, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: "Titles in Category",
          data: [],
          backgroundColor: "#e50914",
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true },
          y: { grid: { display: false } }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const clickedGenre = state.charts.genres.data.labels[idx];
            state.filters.genre = state.filters.genre === clickedGenre ? "All" : clickedGenre;
            els.genreFilter.value = state.filters.genre;
            applyFiltersAndRender();
          }
        }
      }
    });

    // 7. Top Directors Horizontal Bar Chart
    const ctxDirectors = document.getElementById("chart-top-directors").getContext("2d");
    state.charts.directors = new Chart(ctxDirectors, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: "Directorial Titles",
          data: [],
          backgroundColor: "#8b0000",
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true },
          y: { grid: { display: false } }
        }
      }
    });

    // 8. Duration Distribution Chart
    const ctxDuration = document.getElementById("chart-duration-distribution").getContext("2d");
    state.charts.duration = new Chart(ctxDuration, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: "Distribution",
          data: [],
          backgroundColor: "#e50914",
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true }
        }
      }
    });
  }

  function updateCharts() {
    const data = state.filteredData;

    // 1. Movies vs TV Shows Donut
    const movieCount = data.filter(d => d.type === "Movie").length;
    const tvCount = data.filter(d => d.type === "TV Show").length;
    state.charts.type.data.datasets[0].data = [movieCount, tvCount];
    state.charts.type.update();

    // 2. Content Released Over Years
    const yearsMap = {};
    data.forEach(d => {
      if (d.release_year) {
        yearsMap[d.release_year] = (yearsMap[d.release_year] || 0) + 1;
      }
    });
    const sortedYears = Object.keys(yearsMap).map(Number).sort((a, b) => a - b);
    state.charts.releasedYears.data.labels = sortedYears;
    state.charts.releasedYears.data.datasets[0].data = sortedYears.map(y => yearsMap[y]);
    state.charts.releasedYears.update();

    // 3. Content Added Over Time
    const addedMap = {};
    data.forEach(d => {
      if (d.date_added) {
        const yr = d.date_added.split("-")[0];
        addedMap[yr] = (addedMap[yr] || 0) + 1;
      }
    });
    const sortedAddedYears = Object.keys(addedMap).sort();
    state.charts.addedTimeline.data.labels = sortedAddedYears;
    state.charts.addedTimeline.data.datasets[0].data = sortedAddedYears.map(y => addedMap[y]);
    state.charts.addedTimeline.update();

    // 4. Top 10 Countries
    const countryMap = {};
    data.forEach(d => {
      if (d.country) {
        countryMap[d.country] = (countryMap[d.country] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    state.charts.countries.data.labels = topCountries.map(c => c[0]);
    state.charts.countries.data.datasets[0].data = topCountries.map(c => c[1]);
    state.charts.countries.update();

    // 5. Rating Distribution
    const ratingMap = {};
    data.forEach(d => {
      if (d.rating) {
        ratingMap[d.rating] = (ratingMap[d.rating] || 0) + 1;
      }
    });
    const sortedRatings = Object.entries(ratingMap)
      .sort((a, b) => b[1] - a[1]);
    state.charts.ratings.data.labels = sortedRatings.map(r => r[0]);
    state.charts.ratings.data.datasets[0].data = sortedRatings.map(r => r[1]);
    state.charts.ratings.update();

    // 6. Top Genres
    const genreMap = {};
    data.forEach(d => {
      if (d.genres && Array.isArray(d.genres)) {
        d.genres.forEach(g => {
          genreMap[g] = (genreMap[g] || 0) + 1;
        });
      }
    });
    const topGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    state.charts.genres.data.labels = topGenres.map(g => g[0]);
    state.charts.genres.data.datasets[0].data = topGenres.map(g => g[1]);
    state.charts.genres.update();

    // 7. Top Directors
    const dirMap = {};
    data.forEach(d => {
      if (d.director && d.director !== "N/A") {
        dirMap[d.director] = (dirMap[d.director] || 0) + 1;
      }
    });
    const topDirectors = Object.entries(dirMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
    state.charts.directors.data.labels = topDirectors.map(d => d[0]);
    state.charts.directors.data.datasets[0].data = topDirectors.map(d => d[1]);
    state.charts.directors.update();

    // 8. Duration Distribution
    let durationLabels = [];
    let durationCounts = [];

    if (state.filters.type === "TV Show") {
      const seasonBuckets = { "1 Season": 0, "2 Seasons": 0, "3 Seasons": 0, "4 Seasons": 0, "5+ Seasons": 0 };
      data.forEach(d => {
        if (d.type === "TV Show" && d.duration_val) {
          if (d.duration_val === 1) seasonBuckets["1 Season"]++;
          else if (d.duration_val === 2) seasonBuckets["2 Seasons"]++;
          else if (d.duration_val === 3) seasonBuckets["3 Seasons"]++;
          else if (d.duration_val === 4) seasonBuckets["4 Seasons"]++;
          else seasonBuckets["5+ Seasons"]++;
        }
      });
      durationLabels = Object.keys(seasonBuckets);
      durationCounts = Object.values(seasonBuckets);
    } else {
      const minBuckets = { "< 90m": 0, "90-110m": 0, "111-130m": 0, "131-150m": 0, "150m+": 0 };
      data.forEach(d => {
        if (d.type === "Movie" && d.duration_val) {
          if (d.duration_val < 90) minBuckets["< 90m"]++;
          else if (d.duration_val <= 110) minBuckets["90-110m"]++;
          else if (d.duration_val <= 130) minBuckets["111-130m"]++;
          else if (d.duration_val <= 150) minBuckets["131-150m"]++;
          else minBuckets["150m+"]++;
        }
      });
      durationLabels = Object.keys(minBuckets);
      durationCounts = Object.values(minBuckets);
    }

    state.charts.duration.data.labels = durationLabels;
    state.charts.duration.data.datasets[0].data = durationCounts;
    state.charts.duration.update();
  }

  // =====================================================================
  // 6. TABLE RENDERING, PAGINATION & SORTING
  // =====================================================================
  function renderTable() {
    const { currentPage, pageSize, sortColumn, sortDirection } = state.table;
    const sorted = [...state.filteredData].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    const totalRecords = sorted.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const validPage = Math.min(Math.max(currentPage, 1), totalPages);
    state.table.currentPage = validPage;

    const startIdx = (validPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalRecords);
    const pagedRecords = sorted.slice(startIdx, endIdx);

    // Update pagination UI
    els.tableRecordCount.textContent = totalRecords === 0
      ? "0 records"
      : `${startIdx + 1}-${endIdx} of ${totalRecords}`;
    els.tablePageNumber.textContent = `${validPage} / ${totalPages}`;
    els.tablePrevBtn.disabled = validPage <= 1;
    els.tableNextBtn.disabled = validPage >= totalPages;

    // Render table rows
    els.tableTbody.innerHTML = "";

    if (pagedRecords.length === 0) {
      const emptyTr = document.createElement("tr");
      emptyTr.innerHTML = `
        <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
          <i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px;"></i>
          No titles found matching current filters.
        </td>
      `;
      els.tableTbody.appendChild(emptyTr);
      return;
    }

    pagedRecords.forEach(item => {
      const tr = document.createElement("tr");
      tr.addEventListener("click", () => openDetailModal(item));

      const ratingClass = getRatingBadgeClass(item.rating);
      const typeIcon = item.type === "TV Show" ? "fa-tv" : "fa-film";

      tr.innerHTML = `
        <td class="table-title-cell">
          <i class="fa-solid ${typeIcon}"></i>
          <span>${escapeHTML(item.title)}</span>
        </td>
        <td>${escapeHTML(item.type)}</td>
        <td>${escapeHTML(item.director || "N/A")}</td>
        <td>${escapeHTML(item.country || "International")}</td>
        <td><span class="badge-rating ${ratingClass}">${escapeHTML(item.rating || "NR")}</span></td>
        <td>${item.release_year}</td>
        <td><span class="badge-duration">${escapeHTML(item.duration)}</span></td>
      `;

      els.tableTbody.appendChild(tr);
    });
  }

  function getRatingBadgeClass(rating) {
    if (!rating) return "rating-pg";
    const r = rating.toUpperCase();
    if (r === "TV-MA" || r === "R") return "rating-tvma";
    if (r === "TV-14" || r === "PG-13") return "rating-tv14";
    if (r === "TV-PG" || r === "PG") return "rating-tvpg";
    return "rating-tvg";
  }

  function updateTableSortIcons() {
    els.tableHeaders.forEach(th => {
      const icon = th.querySelector("i");
      if (th.dataset.sort === state.table.sortColumn) {
        icon.className = state.table.sortDirection === "asc"
          ? "fa-solid fa-sort-up"
          : "fa-solid fa-sort-down";
      } else {
        icon.className = "fa-solid fa-sort";
      }
    });
  }

  // =====================================================================
  // 7. DETAIL INSPECTOR MODAL
  // =====================================================================
  function openDetailModal(item) {
    els.modalTitle.textContent = item.title;
    els.modalType.textContent = item.type;
    els.modalRating.textContent = item.rating || "Unrated";
    els.modalYear.textContent = item.release_year;
    els.modalDuration.textContent = item.duration;
    els.modalImdb.innerHTML = `<i class="fa-solid fa-star"></i> ${item.imdb || "7.5"}`;
    els.modalSynopsis.textContent = item.description || "No synopsis available.";
    els.modalDirector.textContent = item.director || "Not Specified";
    els.modalCountry.textContent = item.country || "Global";
    els.modalDateAdded.textContent = item.date_added || "Archived";
    els.modalCast.textContent = item.cast || "N/A";

    els.modalGenres.innerHTML = "";
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach(g => {
        const badge = document.createElement("span");
        badge.className = "genre-tag-pill";
        badge.textContent = g;
        els.modalGenres.appendChild(badge);
      });
    }

    els.detailModal.classList.add("open");
    els.detailModal.setAttribute("aria-hidden", "false");
  }

  // =====================================================================
  // 8. POWER BI 1920x1080 CANVAS BACKGROUND GENERATOR
  // =====================================================================
  function renderPowerBICanvas() {
    const canvas = els.pbiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 1920;
    const H = 1080;

    // 1. Canvas Background Deep Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
    bgGradient.addColorStop(0, "#0c0d13");
    bgGradient.addColorStop(0.5, "#0f111a");
    bgGradient.addColorStop(1, "#07080b");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // 2. Ambient Red Glow on Top
    const radialGlow = ctx.createRadialGradient(W / 2, 0, 50, W / 2, 0, 700);
    radialGlow.addColorStop(0, "rgba(229, 9, 20, 0.22)");
    radialGlow.addColorStop(1, "rgba(229, 9, 20, 0)");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, W, 400);

    // 3. Header Bar Container
    drawRoundedPanel(ctx, 30, 24, W - 60, 85, 14, "#131623", "rgba(255, 255, 255, 0.08)");
    
    // Header Red Accent Glow line
    ctx.save();
    ctx.strokeStyle = "#e50914";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#e50914";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 250, 24);
    ctx.lineTo(W / 2 + 250, 24);
    ctx.stroke();
    ctx.restore();

    // Netflix Header Brand text
    ctx.fillStyle = "#e50914";
    ctx.font = "bold 34px 'Montserrat', sans-serif";
    ctx.fillText("NETFLIX", 65, 78);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px 'Montserrat', sans-serif";
    ctx.fillText("DASHBOARD", 235, 78);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("EXECUTIVE ANALYTICS & GLOBAL TITLE METRICS", 520, 75);

    // 4. KPI Cards Row (6 Containers across width)
    const kpiY = 125;
    const kpiHeight = 115;
    const kpiGap = 20;
    const kpiCount = 6;
    const totalGap = (kpiCount - 1) * kpiGap;
    const kpiWidth = (W - 60 - totalGap) / kpiCount;

    const kpiLabels = [
      "Total Titles", "Total Movies", "Total TV Shows",
      "Total Countries", "Content Ratings", "Avg Duration"
    ];

    for (let i = 0; i < kpiCount; i++) {
      const kX = 30 + i * (kpiWidth + kpiGap);
      drawRoundedPanel(ctx, kX, kpiY, kpiWidth, kpiHeight, 12, "#141724", "rgba(255, 255, 255, 0.07)");

      // Card Header Line
      ctx.fillStyle = "#64748b";
      ctx.font = "600 13px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(kpiLabels[i].toUpperCase(), kX + 18, kpiY + 32);

      // Red Accent Dot
      ctx.fillStyle = "#e50914";
      ctx.beginPath();
      ctx.arc(kX + kpiWidth - 24, kpiY + 28, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Visualizations Row 1 (3 Charts)
    const r1Y = 258;
    const r1H = 370;
    const r1Gap = 20;
    const r1W = (W - 60 - 2 * r1Gap) / 3;

    const r1Titles = [
      "MOVIES VS TV SHOWS",
      "CONTENT RELEASED OVER YEARS",
      "CONTENT ADDED OVER TIME"
    ];

    for (let i = 0; i < 3; i++) {
      const cX = 30 + i * (r1W + r1Gap);
      drawRoundedPanel(ctx, cX, r1Y, r1W, r1H, 14, "#131623", "rgba(255, 255, 255, 0.07)");
      drawCardHeader(ctx, cX, r1Y, r1W, r1Titles[i]);
    }

    // 6. Visualizations Row 2 (3 Deep-Dive Cards: Table, Top Directors, Duration)
    const r2Y = 646;
    const r2H = 405;
    const tW = (W - 60) * 0.50; // Table gets 50% width
    const remW = (W - 60 - tW - 2 * 20) / 2;

    // Table Visual Container
    drawRoundedPanel(ctx, 30, r2Y, tW, r2H, 14, "#131623", "rgba(255, 255, 255, 0.07)");
    drawCardHeader(ctx, 30, r2Y, tW, "CONTENT DETAILS (CATALOG DRILL-THROUGH)");

    // Top Directors Container
    const dirX = 30 + tW + 20;
    drawRoundedPanel(ctx, dirX, r2Y, remW, r2H, 14, "#131623", "rgba(255, 255, 255, 0.07)");
    drawCardHeader(ctx, dirX, r2Y, remW, "TOP DIRECTORS");

    // Duration Distribution Container
    const durX = dirX + remW + 20;
    drawRoundedPanel(ctx, durX, r2Y, remW, r2H, 14, "#131623", "rgba(255, 255, 255, 0.07)");
    drawCardHeader(ctx, durX, r2Y, remW, "DURATION DISTRIBUTION");
  }

  function drawRoundedPanel(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.fill();

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCardHeader(ctx, x, y, width, title) {
    ctx.save();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px 'Montserrat', sans-serif";
    ctx.fillText(title, x + 20, y + 34);

    // Subtle divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 48);
    ctx.lineTo(x + width - 15, y + 48);
    ctx.stroke();
    ctx.restore();
  }

  function downloadPowerBIBackgroundPNG() {
    renderPowerBICanvas();
    const link = document.createElement("a");
    link.download = "Netflix_PowerBI_Canvas_Background_1080p.png";
    link.href = els.pbiCanvas.toDataURL("image/png");
    link.click();
  }

  function downloadPowerBIBackgroundSVG() {
    // Generate clean SVG template matching 1920x1080 layout
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0c0d13"/>
      <stop offset="50%" stop-color="#0f111a"/>
      <stop offset="100%" stop-color="#07080b"/>
    </linearGradient>
    <radialGradient id="redGlow" cx="960" cy="0" r="700" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#e50914" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#e50914" stop-opacity="0"/>
    </radialGradient>
    <filter id="neon" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1920" height="1080" fill="url(#bgGrad)"/>
  <rect width="1920" height="400" fill="url(#redGlow)"/>

  <!-- Header Container -->
  <rect x="30" y="24" width="1860" height="85" rx="14" fill="#131623" stroke="rgba(255,255,255,0.08)"/>
  <line x1="710" y1="24" x2="1210" y2="24" stroke="#e50914" stroke-width="3" filter="url(#neon)"/>
  <text x="65" y="78" fill="#e50914" font-family="Montserrat, sans-serif" font-weight="900" font-size="34">NETFLIX</text>
  <text x="235" y="78" fill="#ffffff" font-family="Montserrat, sans-serif" font-weight="900" font-size="34">DASHBOARD</text>

  <!-- Row 1: KPI Cards -->
  <g id="kpis">
    <rect x="30" y="125" width="293" height="115" rx="12" fill="#141724" stroke="rgba(255,255,255,0.07)"/>
    <rect x="343" y="125" width="293" height="115" rx="12" fill="#141724" stroke="rgba(255,255,255,0.07)"/>
    <rect x="656" y="125" width="293" height="115" rx="12" fill="#141724" stroke="rgba(255,255,255,0.07)"/>
    <rect x="969" y="125" width="293" height="115" rx="12" fill="#141724" stroke="rgba(255,255,255,0.07)"/>
    <rect x="1282" y="125" width="293" height="115" rx="12" fill="#141724" stroke="rgba(255,255,255,0.07)"/>
    <rect x="1595" y="125" width="293" height="115" rx="12" fill="#141724" stroke="rgba(255,255,255,0.07)"/>
  </g>

  <!-- Row 2: Visualizations -->
  <g id="charts-row-1">
    <rect x="30" y="258" width="606" height="370" rx="14" fill="#131623" stroke="rgba(255,255,255,0.07)"/>
    <rect x="656" y="258" width="606" height="370" rx="14" fill="#131623" stroke="rgba(255,255,255,0.07)"/>
    <rect x="1282" y="258" width="606" height="370" rx="14" fill="#131623" stroke="rgba(255,255,255,0.07)"/>
  </g>

  <!-- Row 3: Visualizations -->
  <g id="charts-row-2">
    <rect x="30" y="646" width="930" height="405" rx="14" fill="#131623" stroke="rgba(255,255,255,0.07)"/>
    <rect x="980" y="646" width="445" height="405" rx="14" fill="#131623" stroke="rgba(255,255,255,0.07)"/>
    <rect x="1445" y="646" width="445" height="405" rx="14" fill="#131623" stroke="rgba(255,255,255,0.07)"/>
  </g>
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = "Netflix_PowerBI_Canvas_Background.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  // =====================================================================
  // 9. EXPORT FILTERED DATA TO CSV
  // =====================================================================
  function exportFilteredDataToCSV() {
    const data = state.filteredData;
    if (data.length === 0) {
      alert("No data available to export under current filters.");
      return;
    }

    const headers = ["Title", "Type", "Director", "Country", "Release Year", "Date Added", "Rating", "Duration", "Genres", "IMDb"];
    const rows = data.map(d => [
      `"${(d.title || "").replace(/"/g, '""')}"`,
      `"${d.type || ""}"`,
      `"${(d.director || "").replace(/"/g, '""')}"`,
      `"${(d.country || "").replace(/"/g, '""')}"`,
      d.release_year || "",
      `"${d.date_added || ""}"`,
      `"${d.rating || ""}"`,
      `"${d.duration || ""}"`,
      `"${(d.genres || []).join(", ")}"`,
      d.imdb || ""
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.download = `Netflix_Titles_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  // Utility to prevent HTML injection in table
  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
