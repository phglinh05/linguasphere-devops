// BLOG PAGE API (local)
function sanitizeUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url, window.location.origin);
    
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch (error) {
    return "";
  }
  return "";
}

let API_BASE = "/api/blog";
const AUTH_BASE = "/api/auth";

const ALLOWED_DOMAINS = ["localhost", "127.0.0.1", window.location.hostname];

(() => {
  const u = new URL(window.location.href);
  const api = u.searchParams.get("api");

  if (api) {
    try {
      const parsedApi = new URL(api);
      if (ALLOWED_DOMAINS.includes(parsedApi.hostname)) {
        API_BASE = api.replace(/\/$/, "");
      } else {
        console.warn("Domain API không được phép truy cập.");
      }
    } catch (error) {
      console.error("Định dạng API URL không hợp lệ.");
    }
  }
})();

const $ = (id) => document.getElementById(id);

let relatedPage = 0;
let relatedCache = {};

async function requireAuthAndHydrateUser() {
  try {
    const res = await fetch(`${AUTH_BASE}/me`, { credentials: "include" });
    if (!res.ok) throw new Error("Not authenticated");

    const data = await res.json();
    const username = data?.user?.username || "User";
    const el = document.getElementById("navUsername");
    if (el) el.textContent = username;

    const btn = document.getElementById("btnLogout");
    if (btn) {
      btn.addEventListener("click", async () => {
        await fetch(`${AUTH_BASE}/logout`, {
          method: "POST",
          credentials: "include",
        });
        window.location.href = "/";
      });
    }
  } catch {
    window.location.href = "/";
  }
}

function openPostModal(post) {
  if (!post) return;

  document.getElementById("postModalTitle").textContent = post.title || "Post";
  document.getElementById("postModalExcerpt").textContent = post.excerpt || "";
  document.getElementById("postModalAuthor").textContent = post.author?.name || "Author";
  document.getElementById("postModalViews").textContent = (post.views || 0).toLocaleString("en-US");

  const img = document.getElementById("postModalImage");
  img.src = post.hero_image_url || post.thumbnail_url || "";

  const av = document.getElementById("postModalAvatar");
  av.src = post.author?.avatar_url || "https://i.pravatar.cc/80?img=47";

  const modal = new bootstrap.Modal(document.getElementById("postModal"));
  modal.show();
}

function bindReadMoreButtons() {
  document.querySelectorAll('[data-action="read-more"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const slug = btn.dataset.slug;
      openPostModal(relatedCache[slug]);
    });
  });
}

const relatedPageSize = 2;

async function getJSON(path) {
  const requestUrl = new URL(API_BASE + path, window.location.origin);

  if (!ALLOWED_DOMAINS.includes(requestUrl.hostname)) {
    throw new Error(`Security blocked: Invalid API domain ${requestUrl.hostname}`);
  }

  const res = await fetch(requestUrl.href, { credentials: "include" });
  if (!res.ok) throw new Error(`Fetch failed: ${path}`);
  return res.json();
}

function money(cents) {
  if (cents === null || cents === undefined) return "";
  return `$${Math.round(cents / 100)}`;
}

function renderReading(categories) {
  const grid = $("readingGrid");
  grid.innerHTML = "";
  categories.slice(0, 4).forEach((c) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-3";
    col.innerHTML = `
      <div class="card card-soft position-relative">
        <div class="ratio ratio-4x3">
          <img class="w-100 h-100 object-fit-cover" src="${c.cover_image_url}" alt="${c.name}">
        </div>
        <div class="badge-overlay">${c.name}</div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function renderRelated(pageData) {
  relatedCache = {};
  const grid = $("relatedGrid");
  grid.innerHTML = "";

  pageData.items.forEach((p) => {
    relatedCache[p.slug] = p;
    const col = document.createElement("div");
    col.className = "col-12 col-lg-6";
    col.innerHTML = `
      <div class="card card-soft">
        <div class="ratio ratio-16x10">
          <img class="w-100 h-100 object-fit-cover" src="${p.hero_image_url || p.thumbnail_url}" alt="${p.title}">
        </div>

        <div class="p-4">
          <h5 class="fw-bold mb-2" style="color:#334155;">${p.title}</h5>

          <div class="d-flex align-items-center gap-2 text-secondary small">
            <img src="${p.author?.avatar_url || "https://i.pravatar.cc/80?img=47"}" width="22" height="22" class="rounded-circle" alt="av">
            <span class="fw-semibold">${p.author?.name || "Author"}</span>
          </div>

          <p class="text-secondary mt-3 mb-3">${p.excerpt || ""}</p>

          <div class="d-flex align-items-center justify-content-between small">
            <button type="button"
  class="btn btn-link p-0 text-secondary fw-semibold text-decoration-none"
  data-action="read-more"
  data-slug="${p.slug}">
  Read more
</button>

            <div class="text-secondary d-flex align-items-center gap-2">
              <i class="bi bi-eye"></i>
              <span>${(p.views || 0).toLocaleString("en-US")}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });

  const total = pageData.meta.total || 0;
  const pageSize = pageData.meta.page_size || relatedPageSize;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  $("btnPrev").disabled = relatedPage <= 0;
  $("btnNext").disabled = relatedPage >= pageCount - 1;
  bindReadMoreButtons();
}

function renderMarketing(pageData) {
  const grid = $("marketingGrid");
  grid.innerHTML = "";

  pageData.items.slice(0, 4).forEach((p) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-3";
    col.innerHTML = `
      <div class="card card-soft h-100">
        <div class="ratio ratio-4x3">
          <img class="w-100 h-100 object-fit-cover" src="${p.thumbnail_url || p.hero_image_url}" alt="${p.title}">
        </div>

        <div class="p-3">
          <div class="d-flex align-items-center justify-content-between small text-secondary">
            <span>${p.tag || "Course"}</span>
            <span><i class="bi bi-clock"></i> ${p.reading_minutes ?? 30} min</span>
          </div>

          <div class="fw-bold mt-2" style="color:#334155;">${p.title}</div>
          <div class="text-secondary mt-2">${p.excerpt || ""}</div>

          <div class="d-flex align-items-center justify-content-between mt-3">
            <div class="d-flex align-items-center gap-2">
              <img src="${p.author?.avatar_url || "https://i.pravatar.cc/80?img=47"}" width="22" height="22" class="rounded-circle" alt="av">
              <span class="fw-semibold text-secondary">${p.author?.name || "Author"}</span>
            </div>

            <div class="d-flex align-items-baseline gap-2">
              ${p.old_price_cents ? `<span class="small text-secondary text-decoration-line-through">${money(p.old_price_cents)}</span>` : ""}
              <span class="fw-bold" style="color:var(--teal);">${money(p.price_cents)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

async function loadAll() {
  const [hero, cats, related, marketing] = await Promise.all([
    getJSON("/posts/hero"),
    getJSON("/categories/reading"),
    getJSON(`/posts/related?page=${relatedPage}&page_size=${relatedPageSize}`),
    getJSON("/posts/marketing?page=0&page_size=4"),
  ]);

  $("heroTitle").textContent = hero.title || "";
  $("heroExcerpt").textContent = hero.excerpt || "";
  const rawUrl = hero.hero_image_url || hero.thumbnail_url || "";
  $("heroImage").src = sanitizeUrl(rawUrl);

  renderReading(cats);
  renderRelated(related);
  renderMarketing(marketing);
}

function wireEvents() {
  $("btnPrev").addEventListener("click", async () => {
    if (relatedPage <= 0) return;
    relatedPage -= 1;
    const related = await getJSON(`/posts/related?page=${relatedPage}&page_size=${relatedPageSize}`);
    renderRelated(related);
  });

  $("btnNext").addEventListener("click", async () => {
    relatedPage += 1;
    const related = await getJSON(`/posts/related?page=${relatedPage}&page_size=${relatedPageSize}`);
    renderRelated(related);
  });

  $("subscribeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("subscribeEmail").value.trim();
    $("subscribeMsg").textContent = "Đang đăng ký...";

    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      $("subscribeMsg").textContent = json.message || "OK";
    } catch {
      $("subscribeMsg").textContent = "Lỗi đăng ký. Kiểm tra backend.";
    }
  });
}

(async function main() {
  try {
    await requireAuthAndHydrateUser();
    wireEvents();
    await loadAll();
  } catch (e) {
    console.error(e);
    alert("Không load được dữ liệu. Kiểm tra docker-compose hoặc backend API.");
  }
})();