const mobileNavToggle = document.getElementById("mobile-toggle");
const Homebtn = document.querySelector(".home-btn");
const navItems = document.getElementById("nav-list");
const menuIcon = document.getElementById("menu-icon");
const navOverlay = document.getElementById("nav-overlay");


// --- CONFIGURATION ---
const API_BASE = "https://xeanime.vercel.app/api/v1"; // Example base, replace with yours
const infoPageUrl = "info.html"; 
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchBtn2 = document.getElementById("searchBtn2");
const removeValBtn = document.getElementById("removeValBtn");
let searchTimeout;

// --- SECTION START: Global Search Logic ---

async function searchAnime(query) {
   try {
      const resp = await fetch(`${API_BASE}/search?keyword=${encodeURIComponent(query)}&page=1`);
      const data = await resp.json();
      return data.data?.response || [];
   } catch (e) {
      console.error("Search error:", e);
      return [];
   }
}

function displayResults(results) {
   searchResults.innerHTML = "";
   if (!results || results.length === 0) {
      searchResults.innerHTML = `<div class="no-results" style="padding:20px; text-align:center; color:var(--text-dim);">No results found</div>`;
      searchResults.style.display = "block";
      return;
   }

   results.slice(0, 8).forEach(anime => {
      const item = document.createElement("a");
      item.className = "search-result-item";
      item.href = `${infoPageUrl}?id=${anime.id}`;
      item.innerHTML = `
            <img src="${anime.poster}" class="search-result-image" alt="${anime.title || anime.alternativeTitle}">
            <div>
                <h3 class="search-result-title">${anime.title || anime.alternativeTitle}</h3>
                <div class="search-result-info">
                    <span>${anime.type || "TV"} • <i class="fa-solid fa-closed-captioning"></i> Sub: ${anime.episodes?.sub || 0} / Dub: ${anime.episodes?.dub || 0}</span>
                </div>
            </div>`;
      searchResults.appendChild(item);
   });

   searchResults.style.display = "block";
}

// INPUT EVENT LISTENER
searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    const hasValue = query.length > 0;
    
    // UI State Management
    searchBtn2.classList.toggle('active', hasValue);
    removeValBtn.classList.toggle('active', hasValue);
    
    if (query.length < 2) {
        searchResults.style.display = "none";
        searchResults.innerHTML = "";
        return;
    }
    
    // ADD LOADER
    searchResults.style.display = "block";
    searchResults.innerHTML = `
        <div class="search-loader-container">
            <div class="dots">
                <div style="animation: dotGrowing 1s infinite ease-in-out;"></div>
                <div style="animation: dotGrowing 1s infinite ease-in-out 0.2s;"></div>
                <div style="animation: dotGrowing 1s infinite ease-in-out 0.4s;"></div>
            </div>
        </div>`;
    
    searchTimeout = setTimeout(async () => {
        const results = await searchAnime(query);
        displayResults(results);
    }, 300);
});

// REMOVE VALUE BUTTON
removeValBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchResults.style.display = "none";
    removeValBtn.classList.remove('active');
    searchInput.focus();
});

// SEARCH BUTTON CLICK
searchBtn2.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) return;
    const targetUrl = `filter.html?keyword=${encodeURIComponent(query)}`;
    window.location.href = targetUrl;
});

// ENTER KEY PRESS
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn2.click();
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
   if (!e.target.closest(".search-container")) {
      searchResults.style.display = "none";
   }
});

// --- SECTION END: Global Search Logic ---

Homebtn.addEventListener('click',()=>{
    window.location.href ='home.html'
})



function toggleMenu() {
    const isOpen = navItems.classList.toggle("show");
    // This overlay handles the background dimming smoothly
    navOverlay.classList.toggle("active"); 
    document.body.classList.toggle("menu-open");
    
    menuIcon.className = isOpen ? "fas fa-times" : "fas fa-bars";
}


// Open/Close on button click
mobileNavToggle.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
});

// Close on overlay click (Outside Click)
navOverlay.addEventListener("click", toggleMenu);

// Optional: Close menu when a link inside is clicked
navItems.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', toggleMenu);
});
