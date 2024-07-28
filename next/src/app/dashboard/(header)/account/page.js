"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import LineInput from "@/app/components/Inputs/LineInput/LineInput";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import LabelMovingInput from "@/app/components/Inputs/LabelMovingInput/LabelMovingInput";
import GoogleLoginBtn from "@/app/components/Buttons/GoogleLoginBtn/GoogleLoginBtn";
import SpotifyAuthBtn from "@/app/components/Spotify/SpotifyAuthBtn/SpotifyAuthBtn";
import ExtensionSetting from "@/app/components/Account/ExtensionSetting/ExtensionSetting";
import config from "@/app/utils/config";
import SubjectsManager from "@/app/components/Account/SubjectsManager/SubjectsManager";
import { GoogleCalendar, SpotifyLogo, YouTubeIcon } from "@/app/utils/Svg";
import { ResponseContext } from "@/app/utils/Contexts";
import { useAccount } from "@/Hooks/accountHooks";

function Account() {
  const { userInfo } = useAccount();
  const { setResponse } = useContext(ResponseContext);

  const [imageSrc, setImageSrc] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitProfile, setIsSubmitProfile] = useState(false);
  const [isSubmitPw, setIsSubmitPw] = useState(false);
  const [websites, setWebsites] = useState({});

  const inputRef = useRef(null);
  const readURL = useCallback((input) => {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(input.files[0]);

      reader.onload = (e) => {
        setImageSrc(e.target.result);
        const formData = new FormData();
        formData.append("image", input.files[0]);

        uploadImage(formData);
      };
    }
  }, []);

  const uploadImage = useCallback(async (formData) => {
    try {
      fetch(`${config.server}/account/image`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: formData,
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
          if (data.success) {
          }
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }, []);

  useEffect(() => {
    if (isSubmitProfile) {
      fetch(`${config.server}/account/info`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, confirmEmail }),
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
        })
        .catch((error) => console.error(error));
    }
    setTimeout(() => {
      setIsSubmitProfile(false);
    }, 2000);
  }, [isSubmitProfile]);

  useEffect(() => {
    if (isSubmitPw) {
      fetch(`${config.server}/account/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword }),
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
        })
        .catch((error) => console.error(error));
    }
    setTimeout(() => {
      setIsSubmitPw(false);
    }, 2000);
  }, [isSubmitPw]);

  useEffect(() => {
    if (!userInfo) return;
    setImageSrc(
      `${config.static_server}/profile-image/${userInfo.user_id}.jpeg`
    );
    fetch(`${config.server}/extension/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const { activity_setting } = data;
          setEmail(userInfo.email);
          setConfirmEmail(userInfo.email);
          setName(userInfo.name);
          setWebsites(activity_setting);
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo]);

  return (
    <div>
      <div className={`Main`}>
        <div className="title">Account</div>
        <div className={styles.Account}>
          <div className={styles.boxContainer}>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.profileImg}>
                <div className={styles.imgSelector}>
                  <div className={styles.circle}>
                    <img className={styles.profilePic} src={imageSrc} alt="" />
                  </div>
                  <div
                    className={styles.pImage}
                    onClick={() => {
                      inputRef.current.click();
                    }}
                  >
                    <i className={styles.uploadBtn}>
                      <FontAwesomeIcon icon={faCamera} />
                    </i>
                    <form>
                      <input
                        className={styles.fileUpload}
                        type="file"
                        accept="image/*"
                        ref={inputRef}
                        onChange={(e) => readURL(e.target)}
                      />
                    </form>
                  </div>
                </div>
                {userInfo ? (
                  <div id={styles.welcome}>
                    <h2>Welcome, {userInfo.name}</h2>
                  </div>
                ) : null}
              </div>
            </div>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.profile}>
                <div className={styles.title}>
                  <h1>Profile</h1>
                </div>
                <div className={styles.contents}>
                  <div>
                    <div>
                      <LineInput
                        title={"Name"}
                        value={name}
                        setValue={setName}
                        type={"text"}
                      />
                    </div>
                  </div>
                  <div className={styles.emailWrapper}>
                    {
                      //<VerifyEmailButton setResponse={setResponse}/>
                    }
                    <div>
                      <LineInput
                        title={"Email"}
                        value={email}
                        setValue={setEmail}
                        type={"email"}
                      />
                    </div>
                    <div className={styles.ProfileConfirm}>
                      <LineInput
                        title={"Confirm Email"}
                        value={confirmEmail}
                        setValue={setConfirmEmail}
                        type={"email"}
                      />
                    </div>
                  </div>
                  <div className={styles.submitWrapper}>
                    <BlobBtn
                      onClick={() => {
                        setIsSubmitProfile(true);
                      }}
                      color1={"#fff"}
                      color2={"var(--pink)"}
                    >
                      SUBMIT
                    </BlobBtn>
                  </div>
                </div>
              </div>
              <div className={styles.box}>
                <div className={styles.title}>
                  <h1>Change Password</h1>
                </div>
                <div className={styles.content}>
                  <div>
                    <div>
                      <LabelMovingInput
                        title={"Password"}
                        value={password}
                        setValue={setPassword}
                        type={"password"}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <LabelMovingInput
                        title={"Confirm Password"}
                        value={confirmPassword}
                        setValue={setConfirmPassword}
                        type={"password"}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <div id={styles.passwordReq}>
                        <h3>Password requirements</h3>
                        <ul>
                          <li> One special characters</li>
                          <li> Minimum 6 characters</li>
                        </ul>
                      </div>
                    </div>
                    <div className={styles.submitWrapper}>
                      <BlobBtn
                        onClick={() => {
                          setIsSubmitPw(true);
                        }}
                        color1={"#fff"}
                        color2={"var(--pink)"}
                      >
                        SUBMIT
                      </BlobBtn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.subjects}>
                <div className={styles.title}>
                  <h1>Manage Subjects</h1>
                  <p>Manage your subjects for study</p>
                  <div className={styles.content}>
                    <SubjectsManager />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.extension}>
                <div className={styles.title}>
                  <h1>Chrome Extension</h1>
                  <p>
                    Here you can setup and manage your chrome extension&apos;s
                    tracking option (Default option for all websites is all
                    enabled)
                  </p>
                </div>
                <ExtensionSetting
                  websites={websites}
                  setWebsites={setWebsites}
                />
              </div>
            </div>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.accounts}>
                <div className={styles.title}>
                  <h1>Accounts</h1>
                  <p>Here you can setup and manage your integration settings</p>
                </div>
                <div>
                  <div>
                    <div className={styles.iconWrapper}>
                      <GoogleCalendar />
                    </div>
                    <div className={styles.explanation}>
                      <p>
                        You haven&apos;t connected your Google Calendar yet or
                        you aren&apos;t authorized. Please authorize our
                        application to access your Google Calendar by signing in
                        with your Google account here.
                      </p>
                    </div>
                    <div className={styles.authBtn}>
                      <div>
                        <GoogleLoginBtn />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={styles.iconWrapper}>
                      <YouTubeIcon />
                    </div>
                    <div className={styles.explanation}>
                      <p>
                        You haven&apos;t connected your YouTube Account yet or
                        you aren&apos;t authorized. Please authorize our
                        application to access your YouTube Playlists here.
                      </p>
                    </div>
                    <div className={styles.authBtn}>
                      <GoogleLoginBtn scope="https://www.googleapis.com/auth/youtube.force-ssl" />
                    </div>
                  </div>
                  <div>
                    <div className={styles.iconWrapper}>
                      <SpotifyLogo />
                    </div>
                    <div className={styles.explanation}>
                      <p>
                        You haven&apos;t connected your Spotify Account yet or
                        you aren&apos;t authorized. Please authorize our
                        application to access your Spotify Playlists here.
                      </p>
                    </div>
                    <div className={styles.authBtn}>
                      <SpotifyAuthBtn
                        redirectURI={`${config.location}/dashboard/account`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
