
// --- SECTION START: Configuration & Constants ---
//let API_BASE = "htttps://animo.qzz.io/api/v1";
// const appId = typeof __app_id !== 'undefined' ? __app_id : 'anime-app';

// DOM Elements
const CloseBtn = document.querySelector('.searchCloseIcon');
const searchBtn = document.querySelector('.searchIcon');
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchBtn2 = document.getElementById('search-btn');
const removeValBtn = document.querySelector('.search-btnX');
const infoPageUrl = 'info.html'

// GLOBAL STATE
// After How Much Time Api Call For Qurry
let searchTimeout;
// Data Sources (Assuming these come from your global deta/serverDeta objects)

// --- SECTION END: Configuration & Constants ---









// --- SECTION START: Navigation & Navbar ---
window.addEventListener('scroll', () => {
  // This Is User For Nave Bar Effect 
  let lastScrollY = 0;
  const navbar = document.querySelector('.navbar');
  const currentScroll = window.scrollY;
  
  if (currentScroll > lastScrollY) {
    navbar.classList.add('active');
  } else {
    navbar.classList.remove('active');
  }
  lastScrollY = currentScroll;
}, {
  passive: true
});




 
// --- SECTION END: Navigation & Navbar ---


// SIDEBAR LOGIC

        const genress = ["action", "adventure", "cars", "comedy", "dementia", "demons", "mystery", "drama", "ecchi", "fantasy", "game", "historical", "horror", "kids", "magic", "martial_arts", "mecha", "music", "parody", "samurai", "romance", "school", "sci-fi", "shoujo", "shoujo_ai", "shounen", "shounen_ai", "space", "sports", "super_power", "vampire", "harem", "slice_of_life", "supernatural", "military", "police", "psychological", "thriller", "seinen", "josei", "isekai"];
        
 // --- SIDEBAR & GENRE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('genressContainer');
    const moreBtn = document.getElementById('showMoreBtn');
    const genreToggle = document.getElementById('genressToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeBtn');
    const menuToggle = document.querySelector('.menuToggle');

    let isExpanded = false;

    // 1. Render Genres Function
    function renderGenres() {
        if (!container) return;
        container.innerHTML = '';
        const limit = isExpanded ? genress.length : 10;
        genress.slice(0, limit).forEach(g => {
            const div = document.createElement('div');
            div.className = 'xe-genre-item'; 
            div.textContent = g.replace('_', ' ');
            container.appendChild(div);
        });
        if (moreBtn) {
            moreBtn.innerHTML = isExpanded ? '<i class="fa-solid fa-minus"></i> Less' : '<i class="fa-solid fa-plus"></i> More';
        }
    }

    // 2. Open Sidebar (The fix for your menuToggle)
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('xe-open');
            overlay.classList.add('xe-active');
        });
    }

    // 3. Close Sidebar
    [closeBtn, overlay].forEach(btn => {
        if (btn) {
            btn.onclick = () => {
                sidebar.classList.remove('xe-open');
                overlay.classList.remove('xe-active');
            };
        }
    });

    // 4. Genre Dropdown Toggle
    if (genreToggle) {
        genreToggle.onclick = () => {
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'grid' : 'none';
            if (moreBtn) moreBtn.style.display = isHidden ? 'flex' : 'none';
            genreToggle.classList.toggle('xe-closed', !isHidden); // Use xe- prefix
        };
    }

    // 5. More Button functionality
    if (moreBtn) {
        moreBtn.onclick = (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            renderGenres();
        };
    }

    // 6. Language Switcher
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
        langSwitch.onclick = function() {
            this.querySelectorAll('span').forEach(s => s.classList.toggle('xe-active')); // Use xe- prefix
        };
    }

    renderGenres();
});



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
      searchResults.innerHTML = `<div class="no-results">No results found</div>`;
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
    
    // ------------------------
// SEARCH BUTTON CLICK
// ------------------------
searchBtn2.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) return alert("Please enter a search term.");
    
    // Go to filter.html with the query as URL param
    const targetUrl = `filter.html?keyword=${encodeURIComponent(query)}`;
    window.location.href = targetUrl;
});

// ------------------------
// ENTER KEY PRESS
// ------------------------
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn2.click();
});
    
    
    // --- ADD LOADER HERE ---
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
        displayResults(results); // This will naturally overwrite the loader
    }, 300);
});


// Close dropdowns
document.addEventListener("click", (e) => {
   if (!e.target.closest(".search-container") && e.target !== searchInput) {
      searchResults.style.display = "none";
   }
});
// --- SECTION END: Global Search Logic ---




// --- SECTION START: Mobile Search UI Toggle ---
const toggleMobileSearch = () => {
   document.querySelector('.search-container').classList.toggle('active');
   searchBtn.classList.toggle('active');
   CloseBtn.classList.toggle('active');
};

searchBtn.addEventListener('click', toggleMobileSearch);
CloseBtn.addEventListener('click', toggleMobileSearch);
// --- SECTION END: Mobile Search UI Toggle ---




// IMAGE LAYZE CUSTOM LOADER JS START


// Call this function whenever new images are added to DOM
function applyImageLoader() {
   const imgs = document.querySelectorAll("img:not([data-no-loader]):not([data-processed])");

   imgs.forEach(img => {
      img.dataset.processed = "true"; // mark processed

      // Wrap image
      const wrapper = document.createElement("div");
      wrapper.className = "img-wrap loading";

      const loader = document.createElement("div");
      loader.className = "img-loader";
      loader.innerHTML = "<span></span>";

      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(loader);
      wrapper.appendChild(img);

      // Lazy load
      const src = img.getAttribute("src");
      img.removeAttribute("src");
      img.dataset.src = src;
   });

   // IntersectionObserver for all new images
   const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
         if (!entry.isIntersecting) return;

         const img = entry.target;
         const wrap = img.parentElement;
         const loader = wrap.querySelector(".img-loader");

         img.src = img.dataset.src;

         img.onload = () => {
            img.classList.add("loaded");
            wrap.classList.remove("loading");
            loader.remove();
         };

         obs.unobserve(img);
      });
   }, {
      threshold: 0.15
   });

   document.querySelectorAll("img[data-src]:not([data-observed])").forEach(img => {
      img.dataset.observed = "true";
      observer.observe(img);
   });
}

// Other kind of iamge loading

function applyLazyToNewImages(parent = document) {
  parent.querySelectorAll("img:not([loading])").forEach(img => {
    img.setAttribute("loading", "lazy");
  });
}

// Example: after rendering trending section
applyLazyToNewImages();
// IMAGE LAYZE CUSTOM LOADER JS END

// GLOBAL TOST NOTIFICATION CSS START

const notifications = document.querySelector(".notifications");

const toastDetails = {
    timer: 5000,
    success: { icon: 'fa-circle-check' },
    error: { icon: 'fa-circle-xmark' },
    warning: { icon: 'fa-triangle-exclamation' },
    info: { icon: 'fa-circle-info' }
};

// Remove toast
const removeToast = (toast) => {
    toast.classList.add("hide");
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    setTimeout(() => toast.remove(), 500);
}

// Create toast dynamically
function showNotification(type, message) {
    if (!toastDetails[type]) type = "info"; // default to info if type invalid
    const { icon } = toastDetails[type];
    
    const toast = document.createElement("li");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="column">
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        </div>
        <i class="fa-solid fa-xmark" onclick="removeToast(this.parentElement)"></i>
    `;
    notifications.appendChild(toast);
    
    toast.timeoutId = setTimeout(() => removeToast(toast), toastDetails.timer);
}

// Examples:

// showNotification("success", "Your operation was successful!");

// showNotification("error", "Something went wrong!");

// showNotification("warning", "This is a warning!");

// showNotification("info", "hi some info.");
// GLOBAL TOST NOTIFICATION CSS END




// --- RUING ANIME RELATED ANIME JS St --


// Global state to track if the list is expanded
let isRelatedExpanded = false;

function renderRelatedList() {
   const listContainer = document.getElementById('related-list-container');
   const showMoreBtn = document.getElementById('show-more');

   // Correct data path check
   const fullData = (typeof animeDetile !== 'undefined' && animeDetile.data && animeDetile.data.related) ?
      animeDetile.data.related :
      [];

   if (!listContainer) return;

   // Filter items based on toggle state
   const displayItems = isRelatedExpanded ? fullData : fullData.slice(0, 5);

   // Clear and Render
   listContainer.innerHTML = '';

   displayItems.forEach((anime, index) => {
      const sub = anime.episodes?.sub || 0;
      const dub = anime.episodes?.dub || 0;
      const total = anime.episodes?.eps || 0;

      const itemHTML = `
            <a class="related-item" href="${infoPageUrl}?id=${anime.id}" style="cursor: pointer;">
                <div class="item-poster">
                    <img src="${anime.poster}" alt="${anime.title}">
                </div>
                <div class="item-info">
                    <h4 class="item-title">${anime.title}</h4>
                    <div class="item-badges">
                        <span class="badge sub-count"><i class="fa-solid fa-closed-captioning"></i> ${sub}</span>
                        <span class="badge dub-count"><i class="fa-solid fa-microphone"></i> ${dub}</span>
                        <span class="badge eps-total">${total}</span>
                    </div>
                    <div class="item-meta">${anime.type}</div>
                </div>
            </a>`;
      listContainer.insertAdjacentHTML('beforeend', itemHTML);
   });

   // Update Button Text
   if (showMoreBtn) {
      const remaining = fullData.length - 5;
      showMoreBtn.innerHTML = isRelatedExpanded ?
         `Show Less <i class="fa-solid fa-chevron-up"></i>` :
         `Show ${remaining} More <i class="fa-solid fa-chevron-down"></i>`;
   }
}

function handleRelatedToggle() {
   isRelatedExpanded = !isRelatedExpanded;

   // If closing the list, scroll back to the top of the section
   if (!isRelatedExpanded) {
      document.querySelector('.related-anime-section').scrollIntoView({
         behavior: 'smooth'
      });
   }

   renderRelatedList();
}


// --- RUING ANIME RELATED ANIME JS End --
// CUSTOME LOADER GLOBAL

/**
 * Call this function to hide the loader once your 
 * data (Episodes, Servers, Details) is ready.
 */
function hidePageLoader() {
  const loader = document.getElementById("page-loader");
  if (loader) {
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";
    
    // Remove from DOM after transition to save memory
    setTimeout(() => {
      loader.remove();
    }, 500); 
  }
}


// RUING ANIME RECOMMENDED ANIME JS START
function recommendeAnime(animeList) {

   grid.innerHTML = animeList.map(anime => `
        <div class="ani-card-item">
            <div class="ani-poster-wrapper">
                <img class="ani-img-main" src="${anime.poster}" alt="${anime.title}">
                
                <a class="ani-hover-link" href="${infoPageUrl}?id=${anime.id}">
                    <div class="ani-play-circle">
                        <i class="fa-solid fa-play"></i>
                    </div>
                </a>

                <div class="ani-badge-container">
                    <div class="ani-badge b-sub">
                        <i class="fa-regular fa-closed-captioning"></i> 
                        ${anime.episodes.sub}
                    </div>
                    <div class="ani-badge b-dub">
                        <i class="fa-solid fa-microphone"></i> 
                        ${anime.episodes.dub}
                    </div>
                    <div class="ani-badge b-total">
                        ${anime.episodes.total || anime.episodes.sub}
                    </div>
                </div>
            </div>

            <div class="ani-info-box">
                <h3 class="ani-title-text">
                    <a href="${infoPageUrl}?id=${anime.id}">${anime.title}</a>
                </h3>
                <div class="ani-meta-row">
                    <span class="meta-type">TV</span>
                    <span class="meta-dot"></span>
                    <span class="meta-time">${anime.duration || '24m'}</span>
                </div>
            </div>
        </div>
    `).join("");
}


// RUING ANIME RECOMMENDED ANIME JS END
