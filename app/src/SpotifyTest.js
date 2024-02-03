import React from "react";
import { useState, useEffect } from "react";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code";
const SCOPE = "user-read-email";

function SpotifyTest({ }) {

    const [token, setToken] = useState("");


    const logout = () => {
        setToken("");
    }

    const getRefreshToken = (refreshToken) => {

        // refresh token that has been previously stored
        const url = "https://accounts.spotify.com/api/token";

        fetch('https://accounts.spotify.com/api/token', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refreshToken: refreshToken,
                clientId: CLIENT_ID
            })
        }).then((response) => response.json())
            .then((data) => {
                console.log(data);
            }).catch((err) => {
                console.log(err);
            });
    }

    /*const searchArtists = async (e) => {
        console.log(searchKey);
        e.preventDefault();

        fetch(`https://api.spotify.com/v1/search/?q=${searchKey}&type=artist`, {
            method: "get",
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => console.error(error));
    }*/

    /*
    useEffect(() => {
        let token = false
        if (window.location.href.includes("code=")) {
            if (!token) {
                token = window.location.href.split("code=")[1];
                fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&grant_type=authorization_code&code=' + token + '&redirect_uri=' + REDIRECT_URI
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(data);
                        if (data.refresh_token) {
                            //Store in server

                            //Get access token
                            token = data.access_token;

                            fetch('https://api.spotify.com/v1/me', {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    console.log(data);
                                }).catch((err) => {
                                    console.log(err);
                                })

                            setToken(token);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        }
    }, []);
    */

    return (
        <div>
            {
                <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
                    Login to Spotify
                </a>
            }
        </div>
    );
};

export default SpotifyTest;