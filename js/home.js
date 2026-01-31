        let API_BASE = "https://animo.qzz.io/api/v1";
// const infoPageUrl = "/details";

const grid = document.querySelector(".ani-grid-layout");

let homeCache = null;

// --- DATA FETCHING ---
async function fetchHomeData() {
  if (homeCache) return homeCache;
  try {
    const resp = await fetch(`${API_BASE}/home`);
    const data = await resp.json();
    if (!data.success || !data.data) throw new Error("Invalid home data");
    homeCache = data.data;
    return homeCache;
  } catch (error) {
    console.error("Error fetching home data:", error);
    return null;
  }
}

// --- SWIPER / SPOTLIGHT LOGIC --

//NEW swiper JS BANNER AND TRANDING SECTION


function renderApp(val) {
            // Render Spotlight
            const spotlightHTML = val.spotlight.map(item => `
                <div class="swiper-slide hero-slide" style="background-image: url('${item.poster}');">
                    <div class="hero-content">
                        <p class="hero-rank">#${item.rank} Spotlight</p>
                        <h1 class="hero-title">${item.title}</h1>
                        <div class="hero-meta">
                            <span class="meta-item"><i class="fa-solid fa-play-circle"></i> ${item.type}</span>
                            <span class="meta-item"><i class="fa-solid fa-clock"></i> ${item.duration}</span>
                            <span class="meta-item"><i class="fa-solid fa-calendar"></i> ${item.aired}</span>
                            <span class="meta-item"><i class="fa-solid fa-closed-captioning cc-icon"></i> SUB ${item.episodes.sub}</span>
                            ${item.episodes.dub > 0 ? `<span class="meta-item"><i class="fa-solid fa-microphone dub-icon"></i> DUB ${item.episodes.dub}</span>` : ''}
                        </div>
                        <p class="hero-synopsis">${item.synopsis}</p>
                        <div class="hero-btns">
                            <a href="watch.html?id=${item.id}" class="btn-watch"><i class="fa-solid fa-play"></i> Watch Now</a>
                            <a href="info.html?id=${item.id}" class="btn-detail">Detail <i class="fa-solid fa-chevron-right" style="font-size: 10px;"></i></a>
                        </div>
                    </div>
                </div>
            `).join('');
            document.getElementById('spotlight-wrapper').innerHTML = spotlightHTML;


            initSwipers();
        }
                function renderTrending(list) {
            const wrapper = document.getElementById('az-trending-wrapper');
            wrapper.innerHTML = list.map(item => `
                <div class="swiper-slide">
                    <div class="az-anime-card">
                        <div class="az-rank-badge">${item.rank}</div>
                        <img src="${item.poster}" alt="Poster" loading="lazy">
                    </div>
                    <p style="font-size:13px; margin-top:10px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.title}</p>
                </div>
            `).join('');
        }
        

        function initSwipers() {
            new Swiper('.hero-swiper', {
                loop: true,
                
                speed: 1000,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                
                autoplay: { delay: 4500,
                
                disableOnInteraction: false },
                
                pagination: { el: '.hero-pagination', clickable: true },
            });
            
            new Swiper('.az-trending-swiper', {
    slidesPerView: 2.3,
    spaceBetween: 15,
    navigation: { nextEl: '.az-next', prevEl: '.az-prev' },
    breakpoints: {
        768: { slidesPerView: 4.5, spaceBetween: 20 },
        1200: { slidesPerView: 6.5, spaceBetween: 25 }
    }
});
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


//-------HOME PAGE IAMGES LOADER ------

document.addEventListener("DOMContentLoaded", () => {
  const imgs = document.querySelectorAll("img:not([data-processed])");

  imgs.forEach(img => {
    img.dataset.processed = "true";

    // Wrap image in .minimal-img if not already wrapped
    if (!img.parentElement.classList.contains("minimal-img")) {
      const wrapper = document.createElement("div");
      wrapper.className = "minimal-img";
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    }

    // Store original src in data-src
    if (!img.dataset.src) img.dataset.src = img.src;
    img.removeAttribute("src");
  });

  // Lazy load using IntersectionObserver
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      img.src = img.dataset.src;

      img.onload = () => {
        img.classList.add("loaded");
      };

      obs.unobserve(img);
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll("img[data-src]").forEach(img => observer.observe(img));
});




// --- INITIALIZATION ---
async function init() {
  try {
    const homeData = await fetchHomeData();
    if (!homeData) throw new Error("Could not load data");
    
    renderApp(homeData);
    renderTrending(homeData.trending);
                    
                    
    
    console.log("Home Data:", homeData); // ✅ now works inside async
    if (homeData.latestEpisode) {
      renderAnimeSection(homeData.latestEpisode, 'LatestEpisodes');
      
    }
    // Load Recommended Anime
    if (homeData.newAdded) {
      renderAnimeSection(homeData.newAdded, 'NewOnXeanime');
    }
    renderAnimeLists(homeData.topAiring, 'TopAiringContainer');
    
    
    renderAnimeLists(homeData.mostPopular, 'MostPopular');
    renderAnimeLists(homeData.mostFavorite, 'MostFavorite');
    renderAnimeLists(homeData.latestCompleted, 'LatestCompleted');
    
    
    hidePageLoader();
    
  }
  catch (error) {
    console.error(error);
    const errorEl = document.getElementById("error");
    if (errorEl) errorEl.innerHTML = `<h2>Error: ${error.message}</h2>`;
  }
  
}
init();


console.log("loader.js loaded");