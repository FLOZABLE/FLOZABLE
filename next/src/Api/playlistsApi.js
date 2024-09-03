import config from "@/app/utils/config";

async function getSpotifyInfo() {
  const response = await fetch(`${config.server}/playlists/spotify/info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

async function getPlaylistsSpotify() {
  const response = await fetch(`${config.server}/playlists/spotify`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

async function getPlaylistsYoutube() {
  const response = await fetch(`${config.server}/playlists/youtube`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

async function getPlaylistsYoutubeItems(playlistId) {
  const response = await fetch(
    `${config.server}/playlists/youtube/items?playlistId=${playlistId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  return data;
}

export {
  getSpotifyInfo,
  getPlaylistsSpotify,
  getPlaylistsYoutube,
  getPlaylistsYoutubeItems,
};
