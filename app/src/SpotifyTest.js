import React from "react";
import { useState, useEffect } from "react";

const CLIENT_ID = "";
const CLIENT_SECRET = "";
const REDIRECT_URI = "http://localhost:3001"
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code";
const SCOPE = "user-read-email";

function SpotifyTest({ }) {

    const [token, setToken] = useState("");
    const [searchKey, setSearchKey] = useState("")
    const [artists, setArtists] = useState([])

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
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

    useEffect(() => {
        let token = window.localStorage.getItem("code");
        if (window.location.href.includes("code="));

        if (!token) {
            token = window.location.href.split("code=")[1];
            console.log(token);
            window.localStorage.setItem("code", token);
            fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&grant_type=authorization_code&code=' + token + '&redirect_uri=' + 'http://localhost:3001'
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        setToken(token)

    }, []);

    const renderArtists = () => {
        return artists.map(artist => (
            <div key={artist.id}>
                {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt="" /> : <div>No Image</div>}
                {artist.name}
            </div>
        ))
    }

    return (
        <div>
            {
                !token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
                        Login to Spotify
                    </a>
                    :
                    <button onClick={logout}>Logout</button>
            }
        </div>
    );
};

export default SpotifyTest;