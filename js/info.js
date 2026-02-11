const animeId = new URLSearchParams(window.location.search).get("id")//||'jack-of-all-trades-party-of-none-20333';

const API_BASE = "https://xeanime.vercel.app/api/v1";

let animeDet = null;

document.addEventListener("DOMContentLoaded", () => {
  
    // 1. --- REDIRECT GUARD ---
  if (!animeId || animeId === 'null' || animeId === 'undefined') {
    console.error('Anime ID missing. Redirecting...');
    showNotification("error", "Anime not found. Redirecting to home...");
    
    // Delay redirect by 3 seconds so the user can see the notification
    setTimeout(() => {
      window.location.href = 'home.html'; // Change to '404.html' if you have one
    }, 3000);
    
    // Stop all further code execution
    if (epGrid) epGrid.innerHTML = '<div class="no-results">Invalid Anime ID. Redirecting...</div>';
    return;
  
  }
  fetchAnimeDetails();
 
});


// FETCH ANIME DETAILS
async function fetchAnimeDetails() {
  try {
    const res = await fetch(`${API_BASE}/anime/${animeId}`);
    const json = await res.json();
     animeDet = json.data
    
    if (!json.success) throw new Error("Anime not found");
    
    // Render page
    document.getElementById("app").innerHTML = renderAnimePage(json.data);
    if (json.data.recommended) {
      
  renderAnimeSection(json.data.recommended, 'recommended');
  
  renderAnimeLists(json.data.mostPopular, 'MostPopular');
    }
    hidePageLoader();
    
  } catch (err) {
    document.getElementById("app").innerHTML = `
      <div class="container">
        <h2>Error loading anime</h2>
        <p>${err.message}</p>
      </div>
    `;
    hidePageLoader();
  }
}

// RENDER FUNCTIONS
function renderAnimePage(d) {
  return `
    <div class="wrapper-container" style="--bg:url('${d.poster}')">
      <div class="anime-detail-container">
        <div class="main-info-section">
          <div class="poster-area">
            <img data-no-loader class="main-poster" src="${d.poster}">
          </div>
          <div class="content-area">
            <h1 class="anime-title">${d.title}</h1>
            <div class="meta-tags">
              <span class="tag rating">${d.rating}</span>
              <span class="tag hd">HD</span>
              <span class="tag cc"><i class="fas fa-closed-captioning"></i> ${d.episodes.sub}</span>
              <span class="tag mic"><i class="fas fa-microphone"></i> ${d.episodes.dub}</span>
              <span class="tag eps">${d.episodes.eps}</span>
              <span class="meta-line">• ${d.type} • ${d.duration}</span>
            </div>
            <div class="btn-row">
<button class="btn btn-watch" onclick="window.location.href='watch.html?id=${d.id}'">
  <i class="fas fa-play"></i> Watch now
</button>

              
              <button class="btn btn-add" onclick="shareAnime()"><i class="fas fa-share"></i> Share now</button>
            </div>
            <div class="description-wrapper">
              <div class="description">${d.synopsis}</div>
            </div>
          </div>
        </div>
        <aside class="metadata-sidebar">
          ${meta("Japanese", d.japanese)}
          ${meta("Synonyms", d.synonyms)}
          ${meta("Aired", d.aired.from)}
          ${meta("Premiered", d.premiered)}
          ${meta("Status", d.status)}
          <div class="meta-label">Genres:</div>
          <div class="genre-list">${d.genres.map(g => `<span class="genre-tag">${g}</span>`).join("")}</div>
          ${meta("Studios", d.studios.join(", "))}
          ${meta("Producers", d.producers.join(", "))}
        </aside>
      </div>
    </div>
  `;
}

function meta(label, value) {
  return `
    <div class="meta-entry">
      <span class="meta-label">${label}:</span>
      <span class="meta-value">${value}</span>
    </div>
  `;
}
// SHARE FUNCTION

function shareAnime() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    showNotification("success", "Thank You for Share!");
  }
  
}

// Render anime into any container by ID or selector
function renderAnimeSection(animeList, container) {
    const containerEl = typeof container === 'string' ? document.getElementById(container) : container;
    if (!containerEl) return;
    
    containerEl.innerHTML = animeList.map(anime => `
        <div class="ani-card-item">
            <div class="ani-poster-wrapper">
                <img class="ani-img-main" src="${anime.poster}" alt="${anime.title}" data-no-loader>
                
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
    
    if (typeof applyImageLoader === "function") applyImageLoader();
}


//ANIME LIST RENDER

function renderAnimeLists(animeList, container) {
    const containerEl = typeof container === 'string' ? document.getElementById(container) : container;
    if (!containerEl) return;
    
    containerEl.innerHTML = animeList.map(anime => {
        const sub = anime.episodes.sub || 0;
        const dub = anime.episodes.dub || 0;
        const total = anime.episodes.total || sub;

        return `
            <a class="related-item" href="${infoPageUrl}?id=${anime.id}">
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
            </a>
        `;
    }).join('');
}

