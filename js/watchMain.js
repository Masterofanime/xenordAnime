const params = new URLSearchParams(window.location.search);
  const animeId = params.get("id");


// let animeId = 'boruto-naruto-next-generations-8143';
// --- SECTION START: Configuration & Constants ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'anime-app';


function updateSocialTags({ title, description, image, url }) {
      // Open Graph
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');

      if (ogTitle) ogTitle.setAttribute('content', title);
      if (ogDesc) ogDesc.setAttribute('content', description);
      if (ogImage) ogImage.setAttribute('content', image);
      if (ogUrl) ogUrl.setAttribute('content', url);

      // Twitter
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      const twImage = document.querySelector('meta[name="twitter:image"]');

      if (twTitle) twTitle.setAttribute('content', title);
      if (twDesc) twDesc.setAttribute('content', description);
      if (twImage) twImage.setAttribute('content', image);

      // Update document title
      document.title = title;
    }
  


// DOM Elements
const epGrid = document.getElementById('epGrid');
const rangeSelect = document.getElementById('rangeSelect');
const epSearch = document.getElementById('epSearch');
const currentEpDisplay = document.getElementById('currentEpDisplay');
const CloseBtn = document.querySelector('.searchCloseIcon');
const searchBtn = document.querySelector('.searchIcon');
const subServers = document.getElementById('subServers');
const dubServers = document.getElementById('dubServers');
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchBtn2 = document.getElementById('search-btn');
const removeValBtn = document.querySelector('.search-btnX');
const grid = document.querySelector(".ani-grid-layout");
const currentUrl = window.location.href;
const infoPageUrl = 'watch.html';


// GLOBAL STATE

const BASE_API = 'https://xeanime.vercel.app/api/v1';
const API_BASE = BASE_API;



let animeData = {};
let episodesData = [];
let subDubData = { sub: [], dub: [] };
let currentEpid = null;
let currentActiveEp = 1;
let searchTimeout;
let selectedServer = {
   serverType: '',
   language: ''
};


// Video Contorl
let settings = {
   autoplay: true,
   autoskip: true,
   autonext: true
};
function setFavicon(iconUrl) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = iconUrl;
}

async function fetchAnimeDetails(animeId) {
  if (!animeId) {
    console.warn('Please provide an anime ID.');
    
    return null;
  }
  
  try {
    const res = await fetch(`${BASE_API}/anime/${animeId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const response = await res.json();
    console.log(response);
    return response;
  } catch (err) {
    console.error('Error fetching anime details:', err);
    return null;
  }
}


let epdataCache = null;
async function FatchEpData() {
  try {
    const resp = await fetch(`${BASE_API}/episodes/${animeId}`);
    const result = await resp.json();
    // Return the array of episodes directly
    return (result.success && result.data) ? (result.data.episodes || result.data) : [];
  } catch (error) {
    console.error("Error fetching episode data:", error);
    return [];
  }
}

// SERVER_API BTN CALLING
async function loadServers(animeId) {
  try {
    const res = await fetch(`${BASE_API}/servers?id=${animeId}`);
    const json = await res.json();
    subDubData = json?.data || { sub: [], dub: [] };
    console.log(animeId)
  } catch (e) {
    console.error('Server fetch failed', e);
    subDubData = { sub: [], dub: [] };
  }
}


// // --- SECTION START: Navigation & Navbar ---
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
    searchBtn2.classList.toggle('active', hasValue);
    removeValBtn.classList.toggle('active', hasValue);
    removeValBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchBtn2.classList.remove('active');
      removeValBtn.classList.remove('active');
    })
    if (query.length < 2) {
      searchResults.style.display = "none";
      searchResults.innerHTML = "";
      return;
    }


    searchTimeout = setTimeout(async () => {
      const results = await searchAnime(query);
      displayResults(results);

    }, 300);
});

// Close dropdowns
document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container") && e.target !== searchInput) {
      searchResults.style.display = "none";
    }
});
// --- SECTION END: Global Search Logic ---



// --- SECTION START: Server Selection ---
function RenderServerBtn() {
   subServers.innerHTML = '';
   dubServers.innerHTML = '';

   const sub = subDubData.sub.slice(0, 2);
   const dub = subDubData.dub.slice(0, 2);
   let isDefaultSet = false;

   const createBtn = (item, type, isFirst) => {
  const btn = document.createElement('button');
  btn.className = 'btn-srv';
  btn.textContent = item.name;
  
  // Check localStorage to set active
  if (selectedServer.serverType === item.name.toLowerCase() && selectedServer.language === type) {
    btn.classList.add('active');
  } else if (isFirst && type === 'sub' && !selectedServer.serverType) {
    btn.classList.add('active');
    setSelected(item.name, 'sub');
  }
  
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-srv').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setSelected(item.name, type);
    showEptitel();
  });
  return btn;
};

   sub.forEach((item, i) => subServers.appendChild(createBtn(item, 'sub', i === 1)));
   dub.forEach((item) => dubServers.appendChild(createBtn(item, 'dub', false)));
   
}

function setSelected(serverType, language) {
   selectedServer.serverType = serverType.toLowerCase();
   selectedServer.language = language.toLowerCase();

   // Save selected server to localStorage
   localStorage.setItem('selectedServer', JSON.stringify(selectedServer));

   console.log('Selected Server:', selectedServer);
}
// --- SECTION END: Server Selection ---


// --- SECTION START: Episode Grid & Pagination ---
function renderEpisodes(start) {
   epGrid.innerHTML = '';
   const startIndex = parseInt(start, 10) - 1;
   const end = Math.min(startIndex + 100, episodesData.length);
   const currentRange = episodesData.slice(startIndex, end);

   // Check if the total count is small (under 100)
   const isSmallSeries = episodesData.length <= 100;

   // Apply classes to the containers once (outside the loop)
   if (isSmallSeries) {
      epGrid.classList.add('short-list-style'); // Example class for small lists
      epSearch.classList.add('hidden-for-small'); 
   }

   currentRange.forEach(ep => {
      const btn = document.createElement('div');
      
      // Standard classes
      btn.classList.add('ep-btn', 'highlight');
      
      // Add a specific class to the BUTTON only if under 100
      if (isSmallSeries) {
         epGrid.classList.add('UnderGrid');
      epSearch.classList.add('Unactivated');
      document.querySelector('.EpsearchIcon').classList.add('Unactivated');
         
      }

      if (ep.episodeNumber === currentActiveEp) btn.classList.add('active');
      if (ep.isFiller){ btn.classList.add('fillerEp')
        
      };

      // Set text based on the same condition
      btn.innerText = isSmallSeries? `${ep.episodeNumber}. ${ep.title}` :
ep.episodeNumber;

      btn.addEventListener('click', () => {
         currentActiveEp = ep.episodeNumber;
         updateUI();
      });

      epGrid.appendChild(btn);
   });
}


function updateUI() {
  currentEpDisplay.innerText = `Episode: ${currentActiveEp}`;
  
  // Save the current episode
  localStorage.setItem(`progress_${animeId}`, currentActiveEp);``
  
  const buttons = epGrid.querySelectorAll('.ep-btn');
  buttons.forEach(btn => {
    const isMatch = Number(btn.innerText) === currentActiveEp || btn.innerText === getEpisodeTitle(currentActiveEp);
    btn.classList.toggle('active', isMatch);
  });
  
  const ep = episodesData.find(e => e.episodeNumber === currentActiveEp);
  if (ep && (subDubData.sub.length === 0 && subDubData.dub.length === 0)) {
    loadEpisodeServers(ep.id).then(() => showEptitel());
  } else {
    showEptitel();
  }
}


const showEptitel = async () => {
  const player = document.getElementById('player');
  if (!player) return;
  
  player.innerHTML = '<div class="loader"></div>';
  
  setTimeout(() => {
    const ep = episodesData.find(e => e.episodeNumber === currentActiveEp);
    if (ep) currentEpid = ep.id;
    
    // --- Check if user selected a server first ---
    if (!selectedServer.serverType) {
      
      showNotification("error", "Please select a server first!");// toast for no selection
      player.innerHTML = '<p style="color:white;text-align:center;">No server selected</p>';
      return; // stop execution until user selects
    }
    
    let serverType = selectedServer.serverType.toLowerCase();
    let language = selectedServer.language?.toLowerCase() || 'sub';
    
    // --- Ensure serverType is only hd-1 or hd-2 ---
    if (!['hd-1', 'hd-2'].includes(serverType)) {
      serverType = 'hd-2';
    }
    
    // --- Ensure language is only sub or dub ---
    if (!['sub', 'dub'].includes(language)) {
      language = 'sub';
    }
    
    const embedUrl = `${BASE_API}/embed/${serverType}/${currentEpid}/${language}`;
    player.innerHTML = `<iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
    
    console.log('Current Episode ID:', currentEpid, 'Server:', serverType, 'Language:', language);
  }, 300);
};

function getEpisodeTitle(epNum) {
   const ep = episodesData.find(e => e.episodeNumber === epNum);
   return ep ? ep.title : epNum;
}

// Episode Search within grid
epSearch.addEventListener('input', (e) => {
   const query = e.target.value.toLowerCase().trim();
   if (Number(query) > 0) {
      const range = Math.floor((query - 1) / 100) * 100 + 1;
      rangeSelect.value = range;
      renderEpisodes(range);
   }

   const buttons = epGrid.querySelectorAll('.ep-btn');
   buttons.forEach(btn => {
      btn.classList.remove('highlight-search');
      if (!query) return;

      const epNum = btn.innerText;
      const epTitle = getEpisodeTitle(Number(epNum)).toLowerCase();

      if (epNum === query || epTitle.includes(query)) {
         btn.classList.add('highlight-search');
         btn.scrollIntoView({
            behavior: "smooth",
            block: "center"
         });
      }
   });
});
// --- SECTION END: Episode Grid & Pagination ---


// --- SECTION START: Player Controls (Next/Prev) ---
function updateNavButtons() {
  const prevBtnEl = document.getElementById('prevBtn');
  const nextBtnEl = document.getElementById('nextBtn');
  
  if (!prevBtnEl || !nextBtnEl) return;
  
  const index = episodesData.findIndex(
    ep => ep.episodeNumber === currentActiveEp
  );
  
  prevBtnEl.disabled = index <= 0;
  nextBtnEl.disabled = index >= episodesData.length - 1;
}

function NextBtn() {
  const index = episodesData.findIndex(
    ep => ep.episodeNumber === currentActiveEp
  );
  
  if (index < episodesData.length - 1) {
    currentActiveEp = episodesData[index + 1].episodeNumber;
    updateUI();
    updateNavButtons();
  }
}

function privBtn() {
  const index = episodesData.findIndex(
    ep => ep.episodeNumber === currentActiveEp
  );
  
  if (index > 0) {
    currentActiveEp = episodesData[index - 1].episodeNumber;
    updateUI();
    updateNavButtons();
  }
}
// --- SECTION END: Player Controls (Next/Prev) ---


// --- SECTION START: Mobile Search UI Toggle ---
const toggleMobileSearch = () => {
   document.querySelector('.search-container').classList.toggle('active');
   searchBtn.classList.toggle('active');
   CloseBtn.classList.toggle('active');
};

searchBtn.addEventListener('click', toggleMobileSearch);
CloseBtn.addEventListener('click', toggleMobileSearch);
// --- SECTION END: Mobile Search UI Toggle ---


// --- SECTION START: Video Settings & Auto-Logic ---
const toggles = document.querySelectorAll('.video-controls-bar strong');

toggles.forEach(toggle => {
   toggle.style.cursor = 'pointer';
   toggle.onclick = () => {
      const isOn = toggle.textContent.trim() === 'On';
      const label = toggle.parentElement.textContent.trim();

      toggle.textContent = isOn ? 'Off' : 'On';
      toggle.classList.toggle('toggle-on', !isOn);
      toggle.classList.toggle('toggle-off', isOn);

      if (label.includes('Auto Play')) settings.autoplay = !isOn;
      if (label.includes('Auto Skip')) settings.autoskip = !isOn;
      if (label.includes('Auto Next')) settings.autonext = !isOn;
   };
});

// Video event listeners (Assuming 'video' element exists in your scope)
const video = document.querySelector('video');
if (video) {
   video.addEventListener('timeupdate', () => {
      if (!settings.autoskip) {
         // Manual skip UI logic here
         return;
      }
      const t = video.currentTime;
      // Mock intro/outro variables (replace with your actual data)
      const intro = {
         start: 0,
         end: 0
      };
      const outro = {
         start: 0,
         end: 0
      };

      if (intro.end > 0 && t >= intro.start && t < intro.end) video.currentTime = intro.end;
      if (outro.end > 0 && t >= outro.start && t < outro.end) video.currentTime = outro.end;
   });

   video.addEventListener('ended', () => {
      if (settings.autonext) {
         console.log("Auto Next triggered");
         NextBtn();
      }
   });
}
// --- SECTION END: Video Settings & Auto-Logic ---

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


// IMAGE LAYZE CUSTOM LOADER JS END

// --- RUING ANIME Moseseasone JS START --

const seasonsgrid = document.getElementById('seasons-grid');

    function renderSeasons(data) {
      // Map through the data using alternativeTitle and poster
      seasonsgrid.innerHTML = 
      data.map(season => `
        <div class="season-card ${season.isActive ? 'active' : ''}" 
             style="background-image: url('${season.poster}')"
             onclick="handleSeasonClick('${season.id}')">
          <span class="season-title">${season.alternativeTitle}</span>
        </div>
      `).join('');
    }

    function handleSeasonClick(id) {
      window.location.href =`watch.html${id}`;
      // You can add your navigation logic here
    }

    


// --- RUING ANIME moreseasone  end --


// --- RUING ANIME DETAILS JS START --

function generateAnimeCard(data) {
   const container = document.getElementById('anime-container');

   const cardHTML = `
        <div class="anime-card">
            <div class="card-content">
                <div class="poster-container">
                    <img src="${data.poster}"data-no-loader alt="${data.title}">
                </div>

                <div class="info-container">
                    <h2 class="title">${data.title}</h2>
                    
                    <div class="badges">
                        <span class="badge rating">${data.rating}</span>
                       
                        <span class="badge sub-count">
                            <i class="fa-solid fa-closed-captioning"></i> ${data.episodes.sub}
                        </span>
                        <span class="badge dub-count">
                            <i class="fa-solid fa-microphone"></i> ${data.episodes.dub}
                        </span>
                        <span class="badge type">${data.type}</span>
                        <span class="duration">${data.duration}</span>
                    </div>

                    <p class="synopsis">${data.synopsis}</p>
                    

                 <a class="view-detail" href="${infoPageUrl}?id=${data.id}">View detail</a>
                </div>
            </div>
        </div>
    `;

   container.innerHTML = cardHTML;
}


// --- RUING ANIME DETAILS JS END --


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
async function loadEpisodeServers(epId) {
  await loadServers(epId);
  RenderServerBtn();
}





// SHOW TOST NOTIFICATION JS FOR WATCH PAGE
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




// --- SECTION START: Initialization ---
async function init() {
   // 1. Fetch the episodes first
   episodesData = await FatchEpData();

   if (episodesData.length > 0) {
      // Setup the dropdown ranges (1-100, 101-200, etc.)
      const ranges = [];
      for (let i = 0; i < episodesData.length; i += 100) {
         ranges.push({
            start: i + 1,
            end: Math.min(i + 100, episodesData.length)
         });
      }
      rangeSelect.innerHTML = ranges.map(r =>
         `<option value="${r.start}">EP: ${r.start}-${r.end}</option>`
      ).join('');

      // Only show range selector if there are more than 100 episodes
      rangeSelect.style.display = episodesData.length > 100 ? 'block' : 'none';
      rangeSelect.onchange = (e) => renderEpisodes(e.target.value);
      
      renderEpisodes(1);
      updateNavButtons();
   } else {
      epGrid.innerHTML = '<p style="color:white;text-align:center;">No episodes available.</p>';
   }

   // 2. Fetch Anime Meta Details (Details, Related, Recommended)
   const animeDetailsContainer = await fetchAnimeDetails(animeId);
   
   if (animeDetailsContainer && animeDetailsContainer.data) {
      const animeData = animeDetailsContainer.data;
      
      
      // Update social tags dynamically
  updateSocialTags({
    title: animeData.title,
    description: animeData.synopsis || `Watch ${animeData.title} in HD with English subtitles.`,
    image: animeData.poster,
    url: window.location.href
  });

  // Update favicon (small version recommended if available, otherwise poster)
  setFavicon(animeData.poster);

      
      // Update UI with the dynamic data
      generateAnimeCard(animeData);
      renderSeasons(animeData.moreSeasons);
      
      // Handle Related & Recommended (assuming your existing functions handle the arrays)
      if (animeData.related) {
         // This assumes 'animeDetile' is what your renderRelatedList uses
         window.animeDetile = animeDetailsContainer; 
         renderRelatedList();
      }
      
      if (animeData.recommended) {
         recommendeAnime(animeData.recommended);
      }
      // Only call servers API once per episode change
// Restore previous selection if exists
const savedEpisode = localStorage.getItem(`progress_${animeId}`);
if (savedEpisode) {
  currentActiveEp = Number(savedEpisode);
} else {
  currentActiveEp = 1; // Default if never watched before
}
if (savedEpisode) {
    showNotification("info", `Resumed at Episode ${savedEpisode}`);
}


const savedServer = localStorage.getItem('selectedServer');
if (savedServer) {
  selectedServer = JSON.parse(savedServer);
}
updateUI();
applyImageLoader();
   }

   // 3. Attach Event Listeners
   const showMoreBtn = document.getElementById('show-more');
   if (showMoreBtn) {
      showMoreBtn.addEventListener('click', handleRelatedToggle);
   }
   if (!animeId) {
  showNotification("error","Please search for an anime!");
}
}


// Run on load
window.onload = init;
// --- SECTION END: Initialization ---