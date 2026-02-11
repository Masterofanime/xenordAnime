const API_BASE = "https://xeanime.vercel.app/api/v1";
let selectedGenres = [];
const pageCache = new Map();
const searchCache = new Map(); // cache for search results

// ------------------------
// INIT FILTER OPTIONS
// ------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await initFilters();
  
  // Check if URL has ?keyword=...
  const keyword = getQueryParam("keyword");
  if (keyword) {
    loadSearch(1, keyword);
  } else {
    loadAnime(1); // normal filter
  }
});

// ------------------------
// FETCH FILTER OPTIONS
// ------------------------
async function initFilters() {
  const res = await fetch(`${API_BASE}/filter/options`);
  const json = await res.json();
  const d = json.data;
  
  ["type", "status", "rated", "score", "season", "language", "sort"].forEach(id => {
    if (id === "sort") {
      const defaultSort = d[id][2] || "all";
      fillSelect(id, d[id], defaultSort);
    } else {
      fillSelect(id, d[id], "all");
    }
  });
  
  // Fill genres
  const gList = document.getElementById("genre-list");
  gList.innerHTML = "";
  d.genres.forEach(g => {
    if (!g) return;
    const chip = document.createElement("div");
    chip.className = "genre-chip";
    chip.innerText = g.replace(/_/g, " ");
    chip.onclick = () => {
      document.querySelectorAll(".genre-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      selectedGenres = [g];
      
      // If on search page, reset URL to filter page
      if (getQueryParam("keyword")) {
        window.history.pushState({}, "", "filter.html");
      }
      
      loadAnime(1);
    };
    gList.appendChild(chip);
  });
}

// ------------------------
function fillSelect(id, list, defaultVal = "all") {
  const el = document.getElementById(id);
  el.innerHTML = "";
  list.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.innerText = item.replace(/_/g, " ").toUpperCase();
    el.appendChild(opt);
  });
  el.value = defaultVal;
  updateLabel(id);
}

// ------------------------
function updateLabel(id) {
  const sel = document.getElementById(id);
  document.getElementById(`val-${id}`).innerText =
    sel.options[sel.selectedIndex]?.text || "All";
}

// ------------------------
function buildParams(page = 1) {
  const params = new URLSearchParams();
  ["type", "status", "rated", "score", "season", "language", "sort"].forEach(id => {
    const val = document.getElementById(id).value;
    if (val && val !== "all") params.set(id, val);
  });
  if (selectedGenres.length) {
    params.set("genres", selectedGenres.join(","));
  }
  params.set("page", page);
  return params;
}

// ------------------------
// LOAD FILTER ANIME
// ------------------------
async function loadAnime(page = 1) {
  const params = buildParams(page);
  const key = params.toString();
  if (pageCache.has(key)) {
    const cached = pageCache.get(key);
    renderAnimeSection(cached.data.response, "FilterdAnime");
    renderPagination(cached.data.pageInfo);
    return;
  }
  
  const res = await fetch(`${API_BASE}/filter?${key}`);
  const data = await res.json();
  pageCache.set(key, data);
  
  estimatedResult(data.data.pageInfo.totalPages, data.data.response.length);
  renderAnimeSection(data.data.response, "FilterdAnime");
  applyImageLoader();
  hidePageLoader();
  renderPagination(data.data.pageInfo);
}

// ------------------------
// LOAD SEARCH ANIME
// ------------------------
async function loadSearch(page = 1, keyword = "") {
  if (!keyword) keyword = getQueryParam("keyword") || "";
  if (!keyword) {
    document.getElementById("FilterdAnime").innerHTML = "<p>Please enter a search term.</p>";
    return;
  }
  
  const key = `search=${encodeURIComponent(keyword)}&page=${page}`;
  if (searchCache.has(key)) {
    const cached = searchCache.get(key);
    renderAnimeSection(cached.data.response, "FilterdAnime");
    renderPagination(cached.data.pageInfo);
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/search?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    const data = await res.json();
    searchCache.set(key, data);
    
    estimatedResult(data.data.pageInfo.totalPages, data.data.response.length);
    renderAnimeSection(data.data.response, "FilterdAnime");
    applyImageLoader();
    hidePageLoader();
    renderPagination(data.data.pageInfo);
  } catch (e) {
    console.error(e);
    document.getElementById("FilterdAnime").innerHTML = "<p>Error loading search results</p>";
  }
}

// ------------------------
// UTILS
// ------------------------
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function estimatedResult(pages, perPage) {
  document.getElementById("ResultsEstimated").textContent = pages * perPage;
}

// ------------------------
// PAGINATION
// ------------------------
function renderPagination(pageInfo) {
  const wrap = document.getElementById("pagination");
  if (!pageInfo || !wrap) return;
  
  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.currentPage || 1;
  
  const ul = document.createElement("ul");
  ul.className = "dg-pg-wrapper";
  
  const isMobile = window.innerWidth < 480;
  const delta = isMobile ? 1 : 2;
  
  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }
  
  ul.appendChild(createPgBtn("chevron-left", currentPage > 1, currentPage - 1));
  
  range.forEach(item => {
    const li = document.createElement("li");
    if (item === "...") {
      li.className = "dg-pg-item dg-pg-dots";
      li.innerText = "...";
    } else {
      li.className = `dg-pg-item ${item === currentPage ? "dg-pg-active" : ""}`;
      li.innerText = item;
      li.onclick = () => {
        const keyword = getQueryParam("keyword");
        if (keyword) loadSearch(item, keyword);
        else loadAnime(item);
      };
    }
    ul.appendChild(li);
  });
  
  ul.appendChild(createPgBtn("chevron-right", currentPage < totalPages, currentPage + 1));
  
  wrap.innerHTML = "";
  wrap.appendChild(ul);
}

function createPgBtn(icon, enabled, target) {
  const li = document.createElement("li");
  li.className = `dg-pg-item ${!enabled ? "dg-pg-disabled" : ""}`;
  li.innerHTML = `<i class="fas fa-${icon}"></i>`;
  if (enabled) li.onclick = () => {
    const keyword = getQueryParam("keyword");
    if (keyword) loadSearch(target, keyword);
    else loadAnime(target);
  };
  return li;
}

// ------------------------
// RENDER ANIME SECTION
// ------------------------
function renderAnimeSection(animeList, container) {
  const containerEl = typeof container === "string" ? document.getElementById(container) : container;
  if (!containerEl || !animeList?.length) {
    containerEl.innerHTML = "<p>No anime found.</p>";
    return;
  }
  
  containerEl.innerHTML = animeList
    .map(
      anime => `
      <div class="ani-card-item">
        <div class="ani-poster-wrapper">
          <img class="ani-img-main" src="${anime.poster}" alt="${anime.title}" data-no-loader>
          <a class="ani-hover-link" href="${infoPageUrl}?id=${anime.id}">
            <div class="ani-play-circle">
              <i class="fa-solid fa-play"></i>
            </div>
          </a>
          <div class="ani-badge-container">
            <div class="ani-badge b-sub">${anime.episodes.sub}</div>
            <div class="ani-badge b-dub">${anime.episodes.dub}</div>
            <div class="ani-badge b-total">${anime.episodes.total || anime.episodes.sub}</div>
          </div>
        </div>
        <div class="ani-info-box">
          <h3 class="ani-title-text">
            <a href="${infoPageUrl}?id=${anime.id}">${anime.title}</a>
          </h3>
        </div>
      </div>
    `
    )
    .join("");
}