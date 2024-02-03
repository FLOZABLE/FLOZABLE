import React from "react";
import { useState, useEffect } from "react";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code";
const SCOPE = "user-read-email";
const serverOrigin = process.env.REACT_APP_ORIGIN;

function SpotifyCallbackHandler({ }) {
    
    const [token, setToken] = useState("");

    useEffect(() => {
        if (window.location.href.includes("code=")) {
            let token = window.location.href.split("code=")[1];

            console.log("Fetching to server");

            fetch(`${serverOrigin}/playlists/spotify-login`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    redirectURI: REDIRECT_URI,
                })
            });

            setToken(token);
        }
    }, []);

    return (
        <div>
            {
                !token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
                        Login to Spotify
                    </a>
                    :
                    <button>Logout</button>
            }
        </div>
    );
};

export default SpotifyCallbackHandler;