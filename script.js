const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const toggleIcon = toggle.querySelector(".icon");
const toggleLabel = toggle.querySelector(".label");
const preferredDark = window.matchMedia("(prefers-color-scheme: dark)");

const THEME_KEY = "aungaung-theme";

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  if (theme === "dark") {
    toggleIcon.textContent = "🌙";
    toggleLabel.textContent = "Dark";
  } else {
    toggleIcon.textContent = "☀️";
    toggleLabel.textContent = "Light";
  }
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const theme = stored || (preferredDark.matches ? "dark" : "light");
  applyTheme(theme);
}

toggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});

// Mobile nav toggle
const navToggle = document.getElementById("nav-toggle");
const nav = document.querySelector(".nav");
if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close nav when a link is clicked (mobile)
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}

preferredDark.addEventListener("change", (event) => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

initTheme();

// Hero photo fallback if the asset is missing
const heroPhoto = document.getElementById("hero-photo");
const heroPhotoCaption = document.querySelector(".photo-caption");
if (heroPhoto) {
  const fallbackSvg =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='880'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%230ea5e9' offset='0%'/><stop stop-color='%239c7bff' offset='100%'/></linearGradient></defs><rect width='800' height='880' fill='url(%23g)'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family=\"Space Grotesk, Arial, sans-serif\" font-size='32' font-weight='700'>Add your photo</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' opacity='0.9' font-family=\"Space Grotesk, Arial, sans-serif\" font-size='20'>Place file at assets/aungaung.jpeg</text></svg>`
    );
  heroPhoto.addEventListener("error", () => {
    heroPhoto.src = fallbackSvg;
    heroPhoto.classList.add("photo-placeholder");
    if (heroPhotoCaption) {
      heroPhotoCaption.innerHTML =
        "<span class='chip'>Portrait pending</span><span class='chip soft'>Place your photo at assets/aungaung.jpeg</span>";
    }
  });
}

// GitHub repo loader for project cards
const repoCards = document.querySelectorAll("[data-repo]");

async function loadRepoCard(card) {
  const repoName = card.dataset.repo;
  const user = card.dataset.user || "my_portfolio";
  const dataLive = card.dataset.live || "";
  if (!repoName) return;

  const titleEl = card.querySelector("h3");
  const descEl = card.querySelector(".project-desc");
  const metaEl = card.querySelector(".meta");
  const linkEl = card.querySelector(".project-link");
  const liveEl = card.querySelector(".live-link");

  const fallbackGitHubUrl = `https://github.com/${user}/${repoName}`;
  if (linkEl) {
    linkEl.href = fallbackGitHubUrl;
    linkEl.textContent = "View on GitHub";
    linkEl.style.display = "inline-flex";
  }

  const setError = (message) => {
    if (titleEl) titleEl.textContent = repoName;
    if (descEl) descEl.textContent = "Could not load repository details.";
    if (metaEl) metaEl.textContent = message;
    if (linkEl) {
      linkEl.href = fallbackGitHubUrl;
      linkEl.style.display = "inline-flex";
    }
    if (liveEl) liveEl.style.display = "none";
  };

  try {
    const response = await fetch(`https://api.github.com/repos/${user}/${repoName}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      setError(`GitHub responded with ${response.status}`);
      return;
    }

    const repo = await response.json();
    if (titleEl) titleEl.textContent = repo.name || repoName;
    if (descEl) descEl.textContent = repo.description || "GitHub repository";
    const updated = repo.updated_at ? new Date(repo.updated_at).toISOString().split("T")[0] : "unknown date";
    if (metaEl) metaEl.textContent = `${updated} • ★ ${repo.stargazers_count} • ${repo.language || "Various"}`;
    if (linkEl) {
      linkEl.href = repo.html_url;
      linkEl.textContent = "View on GitHub";
      linkEl.style.display = "inline-flex";
    }
    let homepage = (repo.homepage || dataLive || "").trim();
    if (!homepage && repo.has_pages) {
      homepage = `https://${user}.github.io/${repo.name || repoName}/`;
    }
    if (liveEl) {
      if (homepage) {
        liveEl.href = homepage.startsWith("http") ? homepage : `https://${homepage}`;
        liveEl.textContent = "Go to website";
        liveEl.style.display = "inline-flex";
      } else {
        liveEl.style.display = "none";
      }
    }
  } catch (error) {
    setError(error.message);
  }
}

repoCards.forEach((card) => loadRepoCard(card));

// GitHub profile + latest repo for Experience
const ghName = document.getElementById("gh-name");
const ghMeta = document.getElementById("gh-meta");
const ghBio = document.getElementById("gh-bio");
const ghRepoTitle = document.getElementById("gh-repo-title");
const ghRepoMeta = document.getElementById("gh-repo-meta");
const ghRepoDesc = document.getElementById("gh-repo-desc");
const ghRepoLink = document.getElementById("gh-repo-link");

async function loadGithubExperience(user) {
  const setProfileError = (message) => {
    if (ghName) ghName.textContent = "GitHub profile";
    if (ghMeta) ghMeta.textContent = message;
    if (ghBio) ghBio.textContent = "Could not load GitHub profile details.";
  };

  try {
    const profileRes = await fetch(`https://api.github.com/users/${user}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!profileRes.ok) {
      setProfileError(`GitHub responded with ${profileRes.status}`);
    } else {
      const profile = await profileRes.json();
      const joined = profile.created_at ? new Date(profile.created_at).toISOString().split("T")[0] : "unknown";
      if (ghName) ghName.textContent = profile.name ? `${profile.name} on GitHub` : `${user} on GitHub`;
      if (ghMeta) {
        ghMeta.textContent = `${profile.followers} followers • ${profile.public_repos} public repos • Joined ${joined}`;
      }
      if (ghBio) ghBio.textContent = profile.bio || "No bio provided on GitHub.";
    }
  } catch (error) {
    setProfileError(error.message);
  }

  const setRepoError = (message) => {
    if (ghRepoTitle) ghRepoTitle.textContent = "Latest repository";
    if (ghRepoMeta) ghRepoMeta.textContent = message;
    if (ghRepoDesc) ghRepoDesc.textContent = "Could not load latest repository.";
    if (ghRepoLink) ghRepoLink.style.display = "none";
  };

  try {
    const repoRes = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=1`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!repoRes.ok) {
      setRepoError(`GitHub responded with ${repoRes.status}`);
      return;
    }
    const repos = await repoRes.json();
    const repo = repos && repos[0];
    if (!repo) {
      setRepoError("No repositories found");
      return;
    }
    const updated = repo.updated_at ? new Date(repo.updated_at).toISOString().split("T")[0] : "unknown date";
    if (ghRepoTitle) ghRepoTitle.textContent = repo.name || "Latest repository";
    if (ghRepoMeta) ghRepoMeta.textContent = `${updated} • ★ ${repo.stargazers_count} • ${repo.language || "Various"}`;
    if (ghRepoDesc) ghRepoDesc.textContent = repo.description || "Most recently updated repository.";
    if (ghRepoLink) {
      ghRepoLink.href = repo.html_url;
      ghRepoLink.textContent = "View repo";
      ghRepoLink.style.display = "inline-flex";
    }
  } catch (error) {
    setRepoError(error.message);
  }
}

loadGithubExperience("my_portfolio");

// Starfield animation
const canvas = document.getElementById("star-canvas");
const ctx = canvas.getContext("2d");
let stars = [];
let pointerOffset = { x: 0, y: 0 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createStar() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.3 + 0.3,
    speed: Math.random() * 0.25 + 0.05,
    twinkle: Math.random() * 0.6 + 0.4,
  };
}

function initStars() {
  const density = canvas.width < 640 ? 80 : 150;
  stars = Array.from({ length: density }, createStar);
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const color = getComputedStyle(root).getPropertyValue("--text").trim() || "#eaf0ff";
  ctx.fillStyle = color;

  stars.forEach((star, index) => {
    const driftX = pointerOffset.x * (star.size * 0.4);
    const driftY = pointerOffset.y * (star.size * 0.4);

    star.y += star.speed;
    if (star.y > canvas.height) {
      stars[index] = createStar();
      stars[index].y = 0;
    }

    const alpha = star.twinkle + Math.sin((Date.now() / 400 + index) % Math.PI) * 0.2;
    ctx.globalAlpha = Math.max(0.2, Math.min(1, alpha));
    ctx.beginPath();
    ctx.arc(star.x + driftX, star.y + driftY, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  initStars();
});

window.addEventListener("pointermove", (event) => {
  const xNorm = event.clientX / window.innerWidth - 0.5;
  const yNorm = event.clientY / window.innerHeight - 0.5;
  pointerOffset = { x: xNorm * 2, y: yNorm * 2 };
});

resizeCanvas();
initStars();
requestAnimationFrame(drawStars);
