const orgName = "BluePill-Project";
const siteRepoName = "bluepill-project.github.io";
const repoGrid = document.getElementById("repo-grid");

const fallbackTracks = [
  {
    role: "BluePilote",
    title: "Android application",
    description:
      "Mobile application for scanning devices, configuring runtime behavior, reviewing sessions, and exporting recovered data.",
    visibility: "Organization managed"
  },
  {
    role: "BluePill",
    title: "Logger firmware",
    description:
      "BGM220S firmware for autonomous BLE temperature logging, local storage, and later dump over a field-friendly workflow.",
    visibility: "Organization managed"
  },
  {
    role: "BlueBerry",
    title: "Field antenna firmware",
    description:
      "Relay and search-side firmware used to detect nearby devices and help with collection in the field.",
    visibility: "Organization managed"
  },
  {
    role: "Hardware",
    title: "BluePill board design",
    description:
      "KiCad hardware project for the compact BLE logger platform, including schematic, PCB layout, and fabrication outputs.",
    visibility: "Organization managed"
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function classifyRepo(repo) {
  const name = repo.name.toLowerCase();

  if (name.includes("bluepilote")) {
    return {
      role: "BluePilote",
      title: "Android application"
    };
  }

  if (name.includes("blueberry")) {
    return {
      role: "BlueBerry",
      title: "Field antenna firmware"
    };
  }

  if (name.includes("hardware") || name.includes("kicad")) {
    return {
      role: "Hardware",
      title: "BluePill board design"
    };
  }

  if (name.includes("bluepill")) {
    return {
      role: "BluePill",
      title: "Logger firmware or project repository"
    };
  }

  return {
    role: "Project",
    title: repo.name
  };
}

function repoPriority(repo) {
  const name = repo.name.toLowerCase();
  if (name.includes("bluepilote")) return 1;
  if (name.includes("bluepill") && (name.includes("hardware") || name.includes("kicad"))) return 2;
  if (name.includes("bluepill")) return 3;
  if (name.includes("blueberry")) return 4;
  return 9;
}

function buildPublicRepoCard(repo) {
  const info = classifyRepo(repo);
  const visibility = repo.private ? "Private repository" : "Public repository";

  return `
    <article class="repo-card">
      <p class="repo-meta">${escapeHtml(info.role)}</p>
      <h3>${escapeHtml(info.title)}</h3>
      <p>${escapeHtml(repo.description || "Repository published through the BluePill Project organization.")}</p>
      <div class="status-row">
        <span class="status-chip">${escapeHtml(visibility)}</span>
        <span class="status-chip">${escapeHtml(repo.name)}</span>
      </div>
      <a class="repo-link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">Open repository</a>
    </article>
  `;
}

function buildFallbackCard(track) {
  return `
    <article class="repo-card">
      <p class="repo-meta">${escapeHtml(track.role)}</p>
      <h3>${escapeHtml(track.title)}</h3>
      <p>${escapeHtml(track.description)}</p>
      <div class="status-row">
        <span class="status-chip status-chip-private">${escapeHtml(track.visibility)}</span>
      </div>
      <a class="repo-link" href="https://github.com/${orgName}" target="_blank" rel="noreferrer">Visit organization</a>
    </article>
  `;
}

function renderFallback(message) {
  repoGrid.innerHTML = `
    ${message ? `
      <article class="repo-card repo-card-loading">
        <p class="repo-meta">Public teaser</p>
        <h3>Repository visibility is managed in the organization</h3>
        <p>${escapeHtml(message)}</p>
      </article>
    ` : ""}
    ${fallbackTracks.map(buildFallbackCard).join("")}
  `;
}

async function renderRepositories() {
  try {
    const response = await fetch(`https://api.github.com/orgs/${orgName}/repos?per_page=100`, {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repos = await response.json();
    const publicRepos = repos
      .filter((repo) => repo.name !== ".github")
      .filter((repo) => repo.name.toLowerCase() !== siteRepoName)
      .sort((a, b) => repoPriority(a) - repoPriority(b) || a.name.localeCompare(b.name));

    if (!publicRepos.length) {
      renderFallback("No public repositories are exposed yet, so this page highlights the project structure instead.");
      return;
    }

    repoGrid.innerHTML = publicRepos
      .slice(0, 4)
      .map(buildPublicRepoCard)
      .join("");
  } catch (error) {
    renderFallback("The organization remains the main entry point while public repositories are still being arranged.");
  }
}

renderRepositories();
