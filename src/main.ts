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
  getCategoryPlaylists,
  getPlaylistTracks,
} from "./api";

const token = localStorage.getItem("accessToken");
const logoutButton = document.getElementById("logoutButton");
const loginButton = document.getElementById("loginButton");
const loginButtonPublic = document.getElementById("loginButtonPublic");

document.addEventListener("DOMContentLoaded", () => {
  updateButtonState();
  initMenuSection();
});

export function updateButtonState() {
  if (!token) {
    if (logoutButton) logoutButton.style.display = "none";
    if (loginButton) loginButton.style.display = "block";
  } else {
    if (logoutButton) logoutButton.style.display = "block";
    if (loginButton) loginButton.style.display = "none";
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    logout();
    updateButtonState();
  });
}

if (loginButtonPublic) {
  loginButtonPublic.addEventListener("click", () => {
    login();
    updateButtonState();
  });
}

const publicSection = document.getElementById("publicSection")!;
const privateSection = document.getElementById("privateSection")!;
const profileSection = document.getElementById("profileSection")!;
const playlistsSection = document.getElementById("playlistsSection")!;
const topGenresSection = document.getElementById("topGenresSection")!;

export async function init() {
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

export function initPublicSection(profile?: UserProfile): void {
  document.getElementById("loginButton")!.addEventListener("click", login);
  renderPublicSection(!!profile);
}

export function renderPublicSection(render: boolean): void {
  publicSection.style.display = render ? "none" : "block";
}

export function initPrivateSection(profile?: UserProfile): void {
  renderPrivateSection(!!profile);
  initMenuSection();
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

  document.getElementById("homeButton")!.addEventListener("click", () => {
    window.location.reload();
  });

  document
    .getElementById("homeButtonFloating")!
    .addEventListener("click", () => {
      window.location.reload();
    });

  document
    .getElementById("favoriteButtonFloating")!
    .addEventListener("click", () => {
      showFavoriteTracks(profile);
    });

  document
    .getElementById("playlistsButtonFloating")!
    .addEventListener("click", () => {
      showPlaylists(profile);
    });

  document.getElementById("homeButtonBurger")!.addEventListener("click", () => {
    window.location.reload();
    closeBurgerMenu();
  });

  document
    .getElementById("favoriteButtonBurger")!
    .addEventListener("click", () => {
      showFavoriteTracks(profile);
      closeBurgerMenu();
    });

  document
    .getElementById("playlistsButtonBurger")!
    .addEventListener("click", () => {
      showPlaylists(profile);
      closeBurgerMenu();
    });

  document
    .getElementById("menuButton")!
    .addEventListener("click", openBurgerMenu);
  document
    .getElementById("closeBurgerMenu")!
    .addEventListener("click", closeBurgerMenu);
}

export function renderPrivateSection(isLogged: boolean) {
  privateSection.style.display = isLogged ? "block" : "none";
}

export function openBurgerMenu() {
  document.getElementById("burgerMenu")!.style.display = "block";
}

export function closeBurgerMenu() {
  document.getElementById("burgerMenu")!.style.display = "none";
}

export function showProfile(profile?: UserProfile): void {
  renderPublicSection(!!profile);
  renderPrivateSection(true);

  profileSection.style.display = "block";
  playlistsSection.style.display = "none";
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

export function showPlaylists(profile?: UserProfile): void {
  renderPublicSection(!!profile);
  renderPrivateSection(true);

  profileSection.style.display = "none";
  playlistsSection.style.display = "block";
  topGenresSection.style.display = "none";
  document.getElementById("browseAllSection")!.style.display = "none";
  document.getElementById("searchSection")!.style.display = "none";
  document.getElementById("savedTracksSection")!.style.display = "none";

  if (profile) {
    initPlaylistSection(profile);
  }
}

export function showFavoriteTracks(profile?: UserProfile): void {
  renderPublicSection(!!profile);
  renderPrivateSection(true);
  profileSection.style.display = "none";
  playlistsSection.style.display = "none";
  topGenresSection.style.display = "none";
  document.getElementById("browseAllSection")!.style.display = "none";
  document.getElementById("searchSection")!.style.display = "none";
  document.getElementById("savedTracksSection")!.style.display = "block";

  if (profile) {
    initSavedTracksSection(profile);
  }
}

export async function showCategoryPlaylists(categoryId: string): Promise<void> {
  renderPrivateSection(true);

  profileSection.style.display = "none";
  playlistsSection.style.display = "none";
  topGenresSection.style.display = "none";
  document.getElementById("browseAllSection")!.style.display = "none";
  document.getElementById("searchSection")!.style.display = "none";
  document.getElementById("savedTracksSection")!.style.display = "none";

  try {
    const token = localStorage.getItem("accessToken")!;
    const playlists = await getCategoryPlaylists(token, categoryId);
    renderCategoryPlaylists(playlists);
  } catch (error) {
    console.error("Error fetching category playlists: ", error);
  }
}

export function initMenuSection(): void {
  document.getElementById("playlistsButton")!.addEventListener("click", () => {
    renderPlaylistsSection(playlistsSection.style.display !== "none");
  });
  document.getElementById("logoutButton")!.addEventListener("click", logout);
}

export function renderProfileSection(render: boolean) {
  profileSection.style.display = render ? "block" : "none";
}

export function renderProfileData(profile: UserProfile) {
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

export function initPlaylistSection(profile?: UserProfile): void {
  if (profile) {
    getMyPlaylists(localStorage.getItem("accessToken")!).then(
      (playlists: PlaylistRequest): void => {
        renderPlaylistsSection(!!profile);
        renderPlaylists(playlists);
      }
    );
  }
}

export function renderTracksInPlaylistSection(render: boolean) {
  const tracksInPlaylistSection = document.getElementById(
    "tracksInPlaylistSection"
  );
  if (!tracksInPlaylistSection) {
    throw new Error("Element not found");
  }
  tracksInPlaylistSection.style.display = render ? "block" : "none";
}

export function renderTracksInPlaylist(tracks: any[]) {
  const tracksInPlaylistElement = document.getElementById("tracksInPlaylist");
  if (!tracksInPlaylistElement) {
    throw new Error("Element not found");
  }

  tracksInPlaylistElement.innerHTML = "";

  const headerHTML = `
    <li class="header-row"> 
      <span class="track-number">#</span>
      <span class="track-image-header">Song</span>
      <span class="track-title-header">Title</span>
      <span class="track-album-header">Album</span>
      <span class="track-artist-header">Artist</span>
    </li>
  `;

  const tracksHTML = tracks
    .map((item, _index) => {
      const trackName = item.name;
      const artists = item.artists.map((artist: any) => artist.name).join(", ");
      const albumName = item.album.name;
      const albumImage = item.album.images[0].url;
      const trackUri = item.uri;

      return `
        <li data-track-uri="${trackUri}">
          <span class="track-number">${_index + 1}</span>
          <img src="${albumImage}" alt="Imagen de ${trackName}" width="100">
          <span class="track-title">${trackName}</span>
          <span class="track-album">${albumName}</span>
          <span class="track-artist">${artists}</span>
        </li>
      `;
    })
    .join("");

  tracksInPlaylistElement.innerHTML = headerHTML + tracksHTML;

  tracksInPlaylistElement.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "LI") {
      const trackUri = target.getAttribute("data-track-uri");
      if (trackUri) {
        console.log(`Clicked on track with URI ${trackUri}`);
        playTrack(trackUri);
        togglePlay();
      }
    }
  });

  renderTracksInPlaylistSection(true);
}

function renderPlaylistsSection(render: boolean) {
  playlistsSection.style.display = render ? "block" : "none";
}

function renderPlaylists(playlists: PlaylistRequest) {
  const playlistContainer = document.getElementById("playlists");
  if (!playlistContainer) {
    throw new Error("Element not found");
  }
  const playlistsHTML = playlists.items
    .map((playlist, _index) => {
      return `
      <div class="playlist-item" data-uri="${playlist.uri}">
        <div class="playlist-image-container">
          <img src="${playlist.images[0].url}" alt="${playlist.name}" class="playlist-image">
        </div>
        <div class="playlist-details">
          <div class="playlist-name">${playlist.name}</div>
          <div class="playlist-owner">Playlist - ${playlist.owner.display_name}</div>
        </div>
      </div>
    `;
    })
    .join("");
  playlistContainer.innerHTML = playlistsHTML;

  const playlistItems = document.querySelectorAll(".playlist-item");
  playlistItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedPlaylistUri = item.getAttribute("data-uri");
      if (selectedPlaylistUri) {
        playTrack(selectedPlaylistUri);
        togglePlay();
        renderPlaylistsSection(false);
      }
    });
  });
}

export function initMyTopGenresSection(profile?: UserProfile): void {
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

export function renderMyTopGenresSection(render: boolean) {
  topGenresSection.style.display = render ? "block" : "none";
}

export async function renderMyTopGenres(topGenres: string[]) {
  const genresElement = document.getElementById("genres");
  if (!genresElement) {
    throw new Error("Element not found");
  }

  genresElement.innerHTML = topGenres
    .map((genre) => {
      const formattedGenre = encodeURIComponent(
        genre.toLowerCase().replace(/\s/g, "%20")
      );
      return `
        <div class="genre-card" data-genre="${formattedGenre}" style="background-image: url('https://t.scdn.co/images/728ed47fc1674feb95f7ac20236eb6d7.jpeg');">
          <h3>${genre}</h3>
        </div>
      `;
    })
    .join("");

  const genreCards = genresElement.querySelectorAll(".genre-card");
  genreCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const selectedGenre = card.getAttribute("data-genre") || "";
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("Access token not found");
        return;
      }
      try {
        document.getElementById("browseAllSection")!.style.display = "none";
        document.getElementById("topGenresSection")!.style.display = "none";
        const playlists = await searchResults(
          accessToken,
          selectedGenre,
          "playlist"
        );
        renderSearchResults(playlists);
      } catch (error) {
        console.error("Error searching playlists:", error);
      }
    });
  });
}

export async function initBrowseAllSection() {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const categories = await getCategories(accessToken!);
    renderBrowseAllSection(true);
    renderCategories(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export function renderBrowseAllSection(render: boolean) {
  const browseAllSection = document.getElementById("browseAllSection");
  if (!browseAllSection) {
    throw new Error("Element not found");
  }
  browseAllSection.style.display = render ? "block" : "none";
}

export function renderCategories(categories: Category[]) {
  const browseAllElement = document.getElementById("browseAll");
  if (!browseAllElement) {
    throw new Error("Element not found");
  }

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("Access token not found");
  }

  browseAllElement.innerHTML = categories
    .map((category, index) => {
      const categoryClass =
        index < 3 ? "category-link large-category" : "category-link";

      return `
        <li>
          <a href="#" class="${categoryClass}" data-category-id="${
        category.id
      }">
            <img src="${category.icons[0].url}" alt="${category.name}" width="${
        index < 3 ? 150 : 100
      }">
            <span>${category.name}</span>
          </a>
        </li>`;
    })
    .join("");

  const categoryLinks = document.querySelectorAll(".category-link");
  categoryLinks.forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      const categoryId = link.getAttribute("data-category-id");
      if (categoryId) {
        await showCategoryPlaylists(categoryId);
      }
    });
  });
}

export function renderCategoryPlaylists(playlists: Playlist[]) {
  const playlistsSection = document.getElementById("playlistsSection");
  if (!playlistsSection) {
    throw new Error("Element not found");
  }

  playlistsSection.innerHTML = playlists
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

  renderCategoryPlaylistsSection(true);
}

export function renderCategoryPlaylistsSection(render: boolean) {
  playlistsSection.style.display = render ? "block" : "none";
}
export function initSearchSection() {
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
        document.getElementById("browseAllSection")!.style.display = "none";
        topGenresSection.style.display = "none";
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

export function renderSearchResults(data: any[]) {
  const searchResultsElement = document.getElementById("searchResults");
  if (!searchResultsElement) {
    throw new Error("Search results element not found");
  }

  searchResultsElement.innerHTML = "";

  console.log("Rendering search results:", data);
  const items = data
    .map((item) => {
      if (item.type === "track") {
        return `<li><input type="radio" name="result" id="${item.id}" value="${
          item.uri
        }"> ${item.name} by ${item.artists
          .map((artist: any) => artist.name)
          .join(", ")}</li>`;
      } else if (item.type === "album") {
        return `<li><input type="radio" name="result" id="${item.id}" value="${
          item.uri
        }"> ${item.name} by ${item.artists
          .map((artist: any) => artist.name)
          .join(", ")}</li>`;
      } else if (item.type === "artist") {
        return `<li><input type="radio" name="result" id="${item.id}" value="${item.uri}"> ${item.name}</li>`;
      } else if (item.type === "playlist") {
        return `<li><input type="radio" name="result" id="${item.id}" value="${item.uri}"> ${item.name} by ${item.owner.display_name}</li>`;
      } else {
        return `<li><input type="radio" name="result" id="${item.id}" value="${item.uri}"> ${item.name}</li>`;
      }
    })
    .join("");

  searchResultsElement.innerHTML = `<ul>${items}</ul>`;

  const radioInputs = searchResultsElement.querySelectorAll(
    "input[name='result']"
  );
  radioInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      const selected = event.target as HTMLInputElement;
      if (selected) {
        const selectedResultUri = selected.value;
        playTrack(selectedResultUri);
        console.log(selected + "El Selected");
        console.log(items + "Es items");
        togglePlay();
        searchResultsElement.innerHTML = "";
        document.getElementById("browseAllSection")!.style.display = "none";
        topGenresSection.style.display = "none";
      }
    });
  });
}

export async function initSavedTracksSection(
  profile?: UserProfile
): Promise<void> {
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

export function renderSavedTracksSection(render: boolean) {
  const savedTracksSection = document.getElementById("savedTracksSection");
  if (!savedTracksSection) {
    throw new Error("Element not found: savedTracksSection");
  }
  savedTracksSection.style.display = render ? "block" : "none";
}

export function renderSavedTracks(savedTracks: any[]) {
  const savedTracksElement = document.getElementById("savedTracks");
  if (!savedTracksElement) {
    throw new Error("Element not found: savedTracks");
  }

  savedTracksElement.innerHTML = "";

  const headerHTML = `
    <li class="header-row">
      <span class="track-number">#</span>
      <span class="track-image-header">Song</span>
      <span class="track-title-header">Title</span>
      <span class="track-album-header">Album</span>
      <span class="track-artist-header">Artist</span>
    </li>
  `;

  const tracksHTML = savedTracks
    .map((item, _index) => {
      const trackName = item.track.name;
      const artists = item.track.artists
        .map((artist: any) => artist.name)
        .join(", ");
      const albumName = item.track.album.name;
      const albumImage = item.track.album.images[0].url;
      const trackUri = item.track.uri;

      return `
        <li data-track-uri="${trackUri}">
          <span class="track-number">${_index + 1}</span>
          <img src="${albumImage}" alt="Imagen de ${trackName}" width="100">
          <span class="track-title">${trackName}</span>
          <span class="track-album">${albumName}</span>
          <span class="track-artist">${artists}</span>
        </li>
      `;
    })
    .join("");

  savedTracksElement.innerHTML = headerHTML + tracksHTML;

  savedTracksElement.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "LI") {
      const trackUri = target.getAttribute("data-track-uri");
      if (trackUri) {
        console.log(`Clicked on track with URI ${trackUri}`);
        playTrack(trackUri);
        togglePlay();
        console.log("deberia reproducir la cancion");
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
