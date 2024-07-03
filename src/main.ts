import "./main.css";
import { init as authenticatorInit, login, logout } from "./auth";
import {
  getMyPlaylists,
  initPlayer,
  playTrack,
  togglePlay,
  getMyTopGenres,
  getCategories,
  searchResults,
  getSavedTracks,
} from "./api";

const publicSection = document.getElementById("publicSection")!;
const privateSection = document.getElementById("privateSection")!;
const profileSection = document.getElementById("profileSection")!;
const playlistsSection = document.getElementById("playlistsSection")!;
const actionsSection = document.getElementById("actionsSection")!;
const topGenresSection = document.getElementById("topGenresSection")!;

let selectedPlaylistUri: string | null = null;
let savedTracks: any[] = [];

async function init() {
  let profile: UserProfile | undefined;
  try {
    profile = await authenticatorInit();
    initPlayer(document.getElementById("embed-iframe")!);
  } catch (error) {
    console.error(error);
  }

  initPublicSection(profile);
  initPrivateSection(profile);
}

function initPublicSection(profile?: UserProfile): void {
  document.getElementById("loginButton")!.addEventListener("click", login);
  renderPublicSection(!!profile);
}

function renderPublicSection(render: boolean): void {
  publicSection.style.display = render ? "none" : "block";
}

function initPrivateSection(profile?: UserProfile): void {
  renderPrivateSection(!!profile);
  initMenuSection();
  initActionsSection();
  initMyTopGenresSection(profile);
  initBrowseAllSection();
  initSearchSection();

  document.getElementById("profileButton")!.addEventListener("click", () => {
    showProfile(profile);
  });

  document.getElementById("favoriteButton")!.addEventListener("click", () => {
    showFavoriteTracks(profile);
  });

  document.getElementById("playlistsButton")!.addEventListener("click", () => {
    showPlaylists(profile);
  });
}

function showProfile(profile?: UserProfile): void {
  renderPublicSection(false);
  renderPrivateSection(true);

  profileSection.style.display = "block";
  playlistsSection.style.display = "none";
  actionsSection.style.display = "none";
  topGenresSection.style.display = "none";
  document.getElementById("browseAllSection")!.style.display = "none";
  document.getElementById("searchSection")!.style.display = "none";
  document.getElementById("savedTracksSection")!.style.display = "none";

  if (profile) {
    renderProfileSection(true);
    renderProfileData(profile);
  } else {
    renderProfileSection(false);
  }
}

function showPlaylists(profile?: UserProfile): void {
  renderPublicSection(false);
  renderPrivateSection(true);

  profileSection.style.display = "none";
  playlistsSection.style.display = "block";
  actionsSection.style.display = "none";
  topGenresSection.style.display = "none";
  document.getElementById("browseAllSection")!.style.display = "none";
  document.getElementById("searchSection")!.style.display = "none";
  document.getElementById("savedTracksSection")!.style.display = "none";

  if (profile) {
    initPlaylistSection(profile);
  }
}

function showFavoriteTracks(profile?: UserProfile): void {
  renderPublicSection(false);
  renderPrivateSection(true);
  profileSection.style.display = "none";
  playlistsSection.style.display = "none";
  actionsSection.style.display = "none";
  topGenresSection.style.display = "none";
  document.getElementById("browseAllSection")!.style.display = "none";
  document.getElementById("searchSection")!.style.display = "none";
  document.getElementById("savedTracksSection")!.style.display = "block";

  if (profile) {
    initSavedTracksSection(profile);
  }
}

function renderPrivateSection(isLogged: boolean) {
  privateSection.style.display = isLogged ? "block" : "none";
}

function initMenuSection(): void {
  document.getElementById("playlistsButton")!.addEventListener("click", () => {
    renderPlaylistsSection(playlistsSection.style.display !== "none");
  });
  document.getElementById("logoutButton")!.addEventListener("click", logout);
}

function initProfileSection(profile?: UserProfile | undefined) {
  renderProfileSection(false);
  if (profile) {
    renderProfileData(profile);
  }
}

function renderProfileSection(render: boolean) {
  profileSection.style.display = render ? "block" : "none";
}

function renderProfileData(profile: UserProfile) {
  if (profile) {
    document.getElementById("displayName")!.innerText =
      profile.display_name || "";
    document.getElementById("id")!.innerText = profile.id || "";
    document.getElementById("email")!.innerText = profile.email || "";
    document.getElementById("uri")!.innerText = profile.uri || "";
    document
      .getElementById("uri")!
      .setAttribute("href", profile.external_urls.spotify || "");
    document.getElementById("url")!.innerText = profile.href || "";
    document.getElementById("url")!.setAttribute("href", profile.href || "");
    profileSection.style.display = "block";
  } else {
    profileSection.style.display = "none";
  }
}

function initPlaylistSection(profile?: UserProfile): void {
  if (profile) {
    getMyPlaylists(localStorage.getItem("accessToken")!).then(
      (playlists: PlaylistRequest): void => {
        renderPlaylistsSection(!!profile);
        renderPlaylists(playlists);
      }
    );
  }
}

function renderPlaylistsSection(render: boolean) {
  playlistsSection.style.display = render ? "block" : "none";
}

function renderPlaylists(playlists: PlaylistRequest) {
  const playlistContainer = document.getElementById("playlists");
  if (!playlistContainer) {
    throw new Error("Element not found");
  }
  playlistContainer.innerHTML = playlists.items
    .map((playlist, index) => {
      return `<li><input type="radio" name="playlist" id="playlist${index}" value="${playlist.uri}">
    <label for="playlist${index}">${playlist.name}</label></li>`;
    })
    .join("");

  document.querySelectorAll("input[name='playlist']").forEach((input) => {
    input.addEventListener("change", (event) => {
      const selected = event.target as HTMLInputElement;
      if (selected) {
        const selectedPlaylistUri = selected.value;
        playTrack(selectedPlaylistUri);
        togglePlay();
        renderPlaylistsSection(false);
      }
    });
  });
}

function getPlaylistTracks(playlistUri: string): Promise<string[]> {
  return fetch(
    `https://api.spotify.com/v1/playlists/${playlistUri.split(":")[2]}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")!}`,
      },
    }
  ).then((response) => response.json());
}

function initActionsSection(): void {
  document.getElementById("changeButton")!.addEventListener("click", () => {
    playTrack("spotify:track:11dFghVXANMlKmJXsNCbNl"); // solo a modo de ejemplo
  });
  document.getElementById("playButton")!.addEventListener("click", () => {
    togglePlay();
  });
  renderActionsSection(true);
  document.getElementById("nextButton")!.addEventListener("click", () => {
    nextTrack();
  });
  document.getElementById("previousButton")!.addEventListener("click", () => {
    previousTrack();
  });
  document.getElementById("shuffleButton")!.addEventListener("click", () => {
    shuffleTrack();
  });
  document.getElementById("repeatButton")!.addEventListener("click", () => {
    repeatTrack();
  });
}

function renderActionsSection(render: boolean) {
  actionsSection.style.display = render ? "block" : "none";
}

function initMyTopGenresSection(profile?: UserProfile): void {
  if (profile) {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access token:", accessToken);
    getMyTopGenres(accessToken!)
      .then((topGenres: UserTopGenres) => {
        console.log("Top genres:", topGenres);
        renderMyTopGenresSection(true);
        renderMyTopGenres(topGenres);
      })
      .catch((error) => {
        console.error("Error fetching top genres:", error);
      });
  }
}

function renderMyTopGenresSection(render: boolean) {
  topGenresSection.style.display = render ? "block" : "none";
}

function renderMyTopGenres(topGenres: UserTopGenres) {
  const genresElement = document.getElementById("genres");
  if (!genresElement) {
    throw new Error("Element not found");
  }
  genresElement.innerHTML = topGenres
    .map((genre) => `<li>${genre}</li>`)
    .join("");
}

async function initBrowseAllSection() {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const categories = await getCategories(accessToken!);
    renderBrowseAllSection(true);
    renderCategories(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

function renderBrowseAllSection(render: boolean) {
  const browseAllSection = document.getElementById("browseAllSection");
  if (!browseAllSection) {
    throw new Error("Element not found");
  }
  browseAllSection.style.display = render ? "block" : "none";
}

function renderCategories(categories: Category[]) {
  const browseAllElement = document.getElementById("browseAll");
  if (!browseAllElement) {
    throw new Error("Element not found");
  }
  browseAllElement.innerHTML = categories
    .map((category) => {
      return `<li>${category.name} - <img src="${category.icons[0].url}" alt="${category.name}" width="100"></li>`;
    })
    .join("");
}

function initSearchSection() {
  const searchInput = document.getElementById(
    "searchInput"
  ) as HTMLInputElement;
  const searchButton = document.getElementById("searchButton");
  const searchTypeSelect = document.getElementById(
    "searchType"
  ) as HTMLSelectElement;

  if (!searchButton || !searchInput || !searchTypeSelect) {
    throw new Error("Search elements not found");
  }

  searchButton.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    const type = searchTypeSelect.value;
    if (query && type) {
      const accessToken = localStorage.getItem("accessToken");
      const searchResultsElement = document.getElementById("searchResults");

      if (searchResultsElement) {
        searchResultsElement.innerHTML = "";
      }

      try {
        const results = await searchResults(accessToken!, query, type);
        renderSearchResults(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
        renderSearchResults([]);
      }
    }
  });

  searchTypeSelect.addEventListener("change", () => {
    const searchResultsElement = document.getElementById("searchResults");
    if (searchResultsElement) {
      searchResultsElement.innerHTML = "";
    }
  });
}

function renderSearchResults(results: string[]) {
  const searchResultsElement = document.getElementById("searchResults");
  if (!searchResultsElement) {
    throw new Error("Search results element not found");
  }

  searchResultsElement.innerHTML = "";

  const items = results.map((result) => `<li>${result}</li>`).join("");
  searchResultsElement.innerHTML = items;
}

async function initSavedTracksSection(profile?: UserProfile): Promise<void> {
  try {
    if (profile) {
      const accessToken = localStorage.getItem("accessToken");
      const savedTracks = await getSavedTracks(accessToken!);
      renderSavedTracksSection(true);
      renderSavedTracks(savedTracks);
    }
  } catch (error) {
    console.error("Error fetching saved tracks:", error);
  }
}

function renderSavedTracksSection(render: boolean) {
  const savedTracksSection = document.getElementById("savedTracksSection");
  if (!savedTracksSection) {
    throw new Error("Element not found: savedTracksSection");
  }
  savedTracksSection.style.display = render ? "block" : "none";
}

function renderSavedTracks(savedTracks: any[]) {
  const savedTracksElement = document.getElementById("savedTracks");
  if (!savedTracksElement) {
    throw new Error("Element not found: savedTracks");
  }

  savedTracksElement.innerHTML = "";

  const tracksHTML = savedTracks
    .map((item, index) => {
      const trackName = item.track.name;
      const artists = item.track.artists
        .map((artist: any) => artist.name)
        .join(", ");
      const albumName = item.track.album.name;
      const albumImage = item.track.album.images[0].url;
      const trackUri = item.track.uri;

      return `
        <li data-track-uri="${trackUri}">
          <img src="${albumImage}" alt="Imagen de ${trackName}" width="100">
          <div>
            <h3>${trackName}</h3>
            <p>Artista(s): ${artists}</p>
            <p>Álbum: ${albumName}</p>
          </div>
        </li>
      `;
    })
    .join("");

  savedTracksElement.innerHTML = tracksHTML;

  // Agregar el event listener para manejar clics en los tracks guardados
  savedTracksElement.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "LI") {
      const trackUri = target.getAttribute("data-track-uri");
      if (trackUri) {
        console.log(`Clicked on track with URI ${trackUri}`); // Log de depuración
        playTrack(trackUri);
        togglePlay();
        console.log("deberia reproducir la cancion");
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
