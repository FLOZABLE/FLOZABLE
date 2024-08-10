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

export { getSpotifyInfo };
