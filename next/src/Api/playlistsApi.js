import AxiosInstance from "@/app/utils/axiosInstance";

async function getPlaylistsSpotify() {
  const response = await AxiosInstance.get(`/playlists/spotify`);
  return response.data;
}

async function getSpotifyInfo() {
  const response = await AxiosInstance.get(`/playlists/spotify/info`);
  return response.data;
}

async function getPlaylistsYoutube() {
  const response = await AxiosInstance.get(`/playlists/youtube`);
  return response.data;
}

async function getPlaylistsYoutubeItems(playlistId) {
  const response = await AxiosInstance.get(`/playlists`, {
    params: { playlist_id: playlistId },
  });
  return response.data;
}

export {
  getSpotifyInfo,
  getPlaylistsSpotify,
  getPlaylistsYoutube,
  getPlaylistsYoutubeItems,
};
