import "./main.css";
import { init as authenticatorInit, login, logout } from "./auth";
import {
  getMyPlaylists,
  initPlayer,
  playTrack,
  togglePlay,
  getMyTopGenres,
  getCategories,
} from "./api";

const publicSection = document.getElementById("publicSection")!;
const privateSection = document.getElementById("privateSection")!;
const profileSection = document.getElementById("profileSection")!;
const playlistsSection = document.getElementById("playlistsSection")!;
const actionsSection = document.getElementById("actionsSection")!;
const topGenresSection = document.getElementById("topGenresSection")!;
const browseAllSection = document.getElementById("browseAllSection")!;

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
  initProfileSection(profile);
  initPlaylistSection(profile);
  initActionsSection();
  initMyTopGenresSection(profile);
  initBrowseAllSection();
}

function renderPrivateSection(isLogged: boolean) {
  privateSection.style.display = isLogged ? "block" : "none";
}

function initMenuSection(): void {
  document.getElementById("profileButton")!.addEventListener("click", () => {
    renderProfileSection(profileSection.style.display !== "none");
  });
  document.getElementById("playlistsButton")!.addEventListener("click", () => {
    renderPlaylistsSection(playlistsSection.style.display !== "none");
  });
  document.getElementById("logoutButton")!.addEventListener("click", logout);
}

function initProfileSection(profile?: UserProfile | undefined) {
  renderProfileSection(!!profile);
  if (profile) {
    renderProfileData(profile);
  }
}

function renderProfileSection(render: boolean) {
  profileSection.style.display = render ? "none" : "block";
}

function renderProfileData(profile: UserProfile) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document
    .getElementById("uri")!
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
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
  playlistsSection.style.display = render ? "none" : "block";
}

function renderPlaylists(playlists: PlaylistRequest) {
  const playlist = document.getElementById("playlists");
  if (!playlist) {
    throw new Error("Element not found");
  }
  playlist.innerHTML = playlists.items
    .map((playlist) => {
      return `<li>${playlist.name}</li>`;
    })
    .join("");
}

function initActionsSection(): void {
  document.getElementById("changeButton")!.addEventListener("click", () => {
    playTrack("spotify:track:11dFghVXANMlKmJXsNCbNl"); // solo a modo de ejemplo
  });
  document.getElementById("playButton")!.addEventListener("click", () => {
    togglePlay();
  });
  renderActionsSection(true);
}

function renderActionsSection(render: boolean) {
  actionsSection.style.display = render ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", init);

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
