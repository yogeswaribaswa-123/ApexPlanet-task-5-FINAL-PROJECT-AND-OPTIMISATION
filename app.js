/* ======= DATA (inline to reduce requests) ======= */
const ITEMS = [
  { id: 1, name: "Portfolio UI Kit",      cat: "UI",    price: 0,  pop: 95, img: "ui-kit"  },
  { id: 2, name: "Minimal Blog",          cat: "Web",   price: 19, pop: 88, img: "blog"    },
  { id: 3, name: "JS Utilities",          cat: "Tools", price: 9,  pop: 75, img: "utils"   },
  { id: 4, name: "E-Commerce Template",   cat: "Web",   price: 29, pop: 93, img: "shop"    },
  { id: 5, name: "Design Tokens",         cat: "UI",    price: 5,  pop: 65, img: "tokens"  },
  { id: 6, name: "Charts Module",         cat: "Tools", price: 15, pop: 80, img: "charts"  },
  { id: 7, name: "Landing Page",          cat: "Web",   price: 12, pop: 70, img: "landing" },
  { id: 8, name: "Button Library",        cat: "UI",    price: 3,  pop: 60, img: "buttons" }
];

/* ======= STATE ======= */
let S = { q: "", cat: "", sort: "pop" };
try {
  const saved = localStorage.getItem("app.state");
  if (saved) S = { ...S, ...(JSON.parse(saved) || {}) };
} catch {}

/* ======= ELEMENTS ======= */
const $ = (id) => document.getElementById(id);
const grid = $("grid"),
      q = $("q"),
      category = $("category"),
      sort = $("sort"),
      count = $("count"),
      reset = $("reset"),
      note = $("contactNote"),
      form = $("contactForm");

q.value = S.q;
category.value = S.cat;
sort.value = S.sort;

/* ======= HELPERS ======= */
function svgPlaceholder(kind) {
  const map = {
    "ui-kit":"%233b82f6","blog":"%23f472b6","utils":"%2322c55e","shop":"%23f59e0b",
    "tokens":"%238b5cf6","charts":"%230ea5e9","landing":"%23ef4444","buttons":"%2310b981"
  };
  const color = map[kind] || "%234ade80";
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 420'%3E%3Crect width='100%25' height='100%25' rx='20' fill='%23121a34'/%3E%3Ccircle cx='120' cy='120' r='70' fill='"+color+"' opacity='.5'/%3E%3Crect x='220' y='70' width='360' height='20' rx='10' fill='%23cbd5e1' opacity='.4'/%3E%3Crect x='220' y='110' width='300' height='16' rx='8' fill='%23cbd5e1' opacity='.25'/%3E%3Crect x='220' y='160' width='280' height='160' rx='14' fill='"+color+"' opacity='.18'/%3E%3C/svg%3E";
}
const persist = () => { try { localStorage.setItem("app.state", JSON.stringify(S)); } catch {} };
const rank = (a) => a.pop || 0;

/* ======= RENDER ======= */
function render() {
  const list = ITEMS
    .filter(x =>
      (!S.cat || x.cat === S.cat) &&
      (!S.q || x.name.toLowerCase().includes(S.q.toLowerCase()))
    )
    .sort((a,b) => {
      switch (S.sort) {
        case "asc":  return a.price - b.price;
        case "desc": return b.price - a.price;
        case "az":   return a.name.localeCompare(b.name);
        default:     return rank(b) - rank(a);
      }
    });

  count.textContent = `${list.length} item${list.length !== 1 ? "s" : ""} shown`;
  grid.innerHTML = list.map(x => `
    <article class="card" role="listitem" tabindex="0" aria-label="${x.name}">
      <picture>
        <img loading="lazy" decoding="async" alt="${x.name}" src="${svgPlaceholder(x.img)}" width="640" height="420" />
      </picture>
      <h3>${x.name}</h3>
      <p>$${x.price.toFixed(2)} • ${x.cat}</p>
      <div class="badge">
        <span class="tag">${x.cat}</span>
        <span class="tag">Popularity ${x.pop}</span>
      </div>
      <button class="btn" data-id="${x.id}" aria-label="Add ${x.name}">Add</button>
    </article>
  `).join("");
}
render();

/* ======= INTERACTIONS ======= */
function onChange() {
  S.q = q.value.trim();
  S.cat = category.value;
  S.sort = sort.value;
  persist();
  render();
}
q.addEventListener("input", onChange);
category.addEventListener("change", onChange);
sort.addEventListener("change", onChange);
reset.addEventListener("click", () => {
  q.value = "";
  category.value = "";
  sort.value = "pop";
  onChange();
});

grid.addEventListener("click", (e) => {
  const b = e.target.closest(".btn[data-id]");
  if (!b) return;
  const id = +b.getAttribute("data-id");
  const item = ITEMS.find(x => x.id === id);
  b.textContent = "Added ✓";
  b.disabled = true;
  b.setAttribute("aria-pressed","true");
  setTimeout(() => {
    b.textContent = "Add";
    b.disabled = false;
    b.removeAttribute("aria-pressed");
  }, 1200);
});

/* ======= CONTACT (fake submit) ======= */
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const d = new FormData(form);
  const name = (d.get("name") || "").toString().trim();
  const email = (d.get("email") || "").toString().trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    note.textContent = "Please enter a valid name & email.";
    note.style.color = "var(--warn)";
    return;
  }
  note.textContent = `Thanks, ${name}! We will get back to ${email}.`;
  note.style.color = "var(--accent)";
  form.reset();
});

/* ======= PERFORMANCE: IntersectionObserver fallback ======= */
(function () {
  if ("IntersectionObserver" in window) return; // basic fallback
  const imgs = [].slice.call(document.querySelectorAll('img[loading="lazy"]'));
  imgs.forEach((img) => (img.loading = "auto")); // load now if no IO
})();

/* ======= ACCESSIBILITY: focus target if hash present ======= */
if (location.hash) {
  const el = document.querySelector(location.hash);
  if (el) { el.setAttribute("tabindex","-1"); el.focus(); }
}
