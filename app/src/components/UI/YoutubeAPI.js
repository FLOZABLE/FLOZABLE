import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function YoutubeAPI({ }) {

    const login = useGoogleLogin({
        flow: 'auth-code',
        select_account: true,
        onSuccess: (response) => {
            const { code } = response;
            fetch(`${serverOrigin}/account/auth/google`, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: code }),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                })
                .catch((error) => console.error(error));
        },
        scope: "https://www.googleapis.com/auth/youtube.force-ssl"
    });


    return (
        <div>
            DELETE ME
        </div>
    );
}

export default YoutubeAPI;
