import "./main.css";
import { init as authenticatorInit, login, logout } from "./auth";
import {
  getMyPlaylists,
  getPlaybackState,
  initPlayer,
  playTrack,
  togglePlay,
  nextTrack,
  previousTrack,
  shuffleTrack,
  repeatTrack,
} from "./api";

import { PlaybackState, UserProfile, PlaylistRequest } from "./utils/types";

const publicSection = document.getElementById("publicSection")!;
const privateSection = document.getElementById("privateSection")!;
const profileSection = document.getElementById("profileSection")!;
const playlistsSection = document.getElementById("playlistsSection")!;
const actionsSection = document.getElementById("actionsSection")!;

let selectedPlaylistUri: string | null = null;

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
        playlistsSection.style.display = "none";
      }
    });
  });
}
// function playFirstTrackOfPlaylist(playlistUri: string) {
//   getPlaylistTracks(playlistUri).then((tracks) => {
//     if (tracks.items.length > 0) {
//       const firstTrackUri = tracks.items[0].track.uri;
//       playTrack(firstTrackUri);
//       togglePlay();
//     } else {
//       alert("The selected playlist has no tracks.");
//     }
//   });
// }

function getPlaylistTracks(playlistUri: string): Promise<TracksResponse> {
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

document.addEventListener("DOMContentLoaded", init);
