
  /* =====================
   CONFIG
===================== */
  const API_BASE = "https://animo.qzz.io/api/v1";
  const TitelChange = document.querySelector('.SearchAnT');
  let currentType =
    new URLSearchParams(window.location.search).get("type") || "top-airing";
  
  /* =====================
     LOAD ANIME
  ===================== */
  async function loadAnime(page = 1) {
    try {
      const res = await fetch(`${API_BASE}/animes/${currentType}?page=${page}`);
      const data = await res.json();
      
      console.log(data);
      TitelChange.textContent= currentType;
      const animeList = data.data.response;
      const pageInfo = data.data.pageInfo;
      
      renderAnimeSection(animeList);
      renderPagination(pageInfo);
      estimatedResult(pageInfo,animeList)
      
      // ✅ Update result count
       function estimatedResult(page,length) {
  document.getElementById("ResultsEstimated").textContent = page.totalPages * length.length;
}
      
    } catch (e) {
      console.error(e);
      const el = document.getElementById("FilterdAnime");
      if (el) el.innerHTML = "<p>Error loading anime</p>";
    }
  }
  
  /* =====================
     CARD RENDER (STYLE SAFE)
  ===================== */
  function renderAnimeSection(animeList) {
    const containerEl = document.getElementById("FilterdAnime");
    
    if (!containerEl || !animeList?.length) {
      containerEl.innerHTML = "<p>No anime found.</p>";
      return;
    }
    
    containerEl.innerHTML = animeList.map(anime => `
    <div class="ani-card-item">
      <div class="ani-poster-wrapper">
        <img class="ani-img-main" src="${anime.poster}" alt="${anime.title}">
        <a class="ani-hover-link" href="info.html?id=${anime.id}">
          <div class="ani-play-circle">
            <i class="fa-solid fa-play"></i>
          </div>
        </a>
        <div class="ani-badge-container">
          <div class="ani-badge b-sub">${anime.episodes.sub}</div>
          <div class="ani-badge b-dub">${anime.episodes.dub}</div>
          <div class="ani-badge b-total">
            ${anime.episodes.total || anime.episodes.sub}
          </div>
        </div>
      </div>
      <div class="ani-info-box">
        <h3 class="ani-title-text">
          <a href="info.html?id=${anime.id}">${anime.title}</a>
        </h3>
      </div>
    </div>
  `).join("");
  }
  
  /* =====================
     PAGINATION (UNCHANGED)
  ===================== */
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
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
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
        li.onclick = () => loadAnime(item);
      }
      ul.appendChild(li);
    });
    
    ul.appendChild(
      createPgBtn("chevron-right", currentPage < totalPages, currentPage + 1)
    );
    
    wrap.innerHTML = "";
    wrap.appendChild(ul);
  }
  
  function createPgBtn(icon, enabled, target) {
    const li = document.createElement("li");
    li.className = `dg-pg-item ${!enabled ? "dg-pg-disabled" : ""}`;
    li.innerHTML = `<i class="fas fa-${icon}"></i>`;
    if (enabled) li.onclick = () => loadAnime(target);
    return li;
  }
  
  /* =====================
     INIT
  ===================== */
  document.addEventListener("DOMContentLoaded", () => {
    loadAnime(1);
  });
