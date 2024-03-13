import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Account.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCamera,
  faLock,
  faUser,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import { BackArrow, Chrome, GoogleCalendar, YouTubeIcon } from "../../../utils/svgs";
import LineInput from "../../UI/LineInput/LineInput";
import BlobBtn from "../../UI/BlobBtn/BlobBtn";
import LabelMovingInput from "../../UI/LabelMovingInput/LabelMovingInput";
import SimpleToggleBtn from "../../UI/SimpleToggleBtn/SimpleToggleBtn";
import StuckModal from "../../UI/StuckModal/StuckModal";
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginBtn from "../../UI/GoogleLoginBtn/GoogleLoginBtn";
import { Link, useSearchParams } from "react-router-dom";
import SpotifyAuthBtn from "../../UI/SpotifyAuthBtn/SpotifyAuthBtn";
import { SpotifyLogo } from "../../../utils/svgs";
import SubjectsManager from "../../UI/SubjectsManager/SubjectsManager";
import ExtensionSetting from "../../UI/ExtensionSetting/ExtensionSetting";
import VerifyEmailButton from "../../UI/VerifyEmailButton/VerifyEmailButton";

const serverOrigin = process.env.REACT_APP_ORIGIN;
const appOrigin = process.env.REACT_APP_LOCATION;
const googleClientId = process.env.REACT_APP_CLIENT_ID;

function Account({ isSidebarHovered, isSidebarOpen, subjects, setSubjects, userInfo, setResponse }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [url, setUrl] = useState("");

  const [isSubmitProfile, setIsSubmitProfile] = useState(false);
  const [isSubmitPw, setIsSubmitPw] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [scrollRef, setScrollRef] = useState(null);
  const subjectsRef = useRef(null);
  const extensionRef = useRef(null);
  const accountsRef = useRef(null);

  const inputRef = useRef(null);
  const PageMain = useRef(null);

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
      /* let response = await fetch(`${serverOrigin}/account/update/image`, {
        method: 'POST',
        body: formData,
      }); */

      fetch(`${serverOrigin}/account/update/image`, {
        method: "post",
        /* headers: {
          'Content-Type': 'application/json'
        }, */
        body: formData,
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
      fetch(`${serverOrigin}/account/update/info`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, confirmEmail }),
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
      fetch(`${serverOrigin}/account/update/password`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword }),
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
    setImageSrc(`${serverOrigin}/profile-images/${userInfo.user_id}.jpeg`);
    fetch(`${serverOrigin}/account/activity-settings`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const { activity_setting } = data;
          setEmail(userInfo.email);
          setConfirmEmail(userInfo.email);
          setName(userInfo.name);
          const websites =
            activity_setting === ""
              ? []
              : JSON.parse(
                activity_setting.replace(/^/, "[").replace(/$/, "]"),
              );
          setWebsites(websites);
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo]);


  useEffect(() => {
    if (!scrollRef || !scrollRef.current) return;
    scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [scrollRef]);

  return (
    <div>
      <div
        className={`Main ${isSidebarOpen || isSidebarHovered ? "sidebarOpen" : ""
          }`}
      >
        <div className="title">
          Account
        </div>
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
                {userInfo ?
                  <div id={styles.welcome}>
                    <h2>Welcome, {userInfo.name}</h2></div>
                  : null
                }
              </div>
            </div>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.profile}>
                <div className={styles.title}>
                  <h1 >Profile</h1>
                </div>
                <div className={styles.contents}>
                  <div >
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
                      name={"SUBMIT"}
                      setClicked={setIsSubmitProfile}
                      color1={"#fff"}
                      color2={"var(--pink)"}
                      delay={-1}
                    />
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
                  <div >
                    <div>
                      <LabelMovingInput
                        title={"Confirm Password"}
                        value={confirmPassword}
                        setValue={setConfirmPassword}
                        type={"password"}
                      />
                    </div>
                  </div>
                  <div >
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
                        name={"SUBMIT"}
                        setClicked={setIsSubmitPw}
                        color1={"#fff"}
                        color2={"var(--pink)"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.subjects} ref={subjectsRef}>
                <div className={styles.title}>
                  <h1>Manage Subjects</h1>
                  <p>Manage your subjects for study</p>
                  <div className={styles.content}>
                    <SubjectsManager subjects={subjects} setSubjects={setSubjects} setResponse={setResponse} />
                  </div>
                </div>
              </div>

            </div>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.extension} ref={extensionRef}>
                <div className={styles.title}>
                  <h1>Chrome Extension</h1>
                  <p>
                    Here you can setup and manage your chrome extension's tracking
                    option (Default option for all websites is all enabled)
                  </p>
                </div>
                <ExtensionSetting
                  websites={websites}
                  setWebsites={setWebsites}
                  setResponse={setResponse}
                />
              </div>
            </div>
            <div className={styles.boxWrapper}>
              <div className={styles.box} id={styles.accounts} ref={accountsRef}>
                <div className={styles.title}>
                  <h1>Accounts</h1>
                  <p>
                    Here you can setup and manage your integration settings
                  </p>
                </div>
                <div>
                  <div>
                    <div className={styles.iconWrapper}>
                      <div>
                        <GoogleCalendar />
                      </div>
                    </div>
                    <div className={styles.explanation}>
                      <p>
                        You haven't connected your Google Calendar yet or you aren't authorized. Please authorize our application to access your Google Calendar
                        by signing in with your Google account here.
                      </p>
                    </div>
                    <div className={styles.authBtn}>
                      <div>
                        <GoogleOAuthProvider
                          clientId={googleClientId}
                        >
                          <GoogleLoginBtn />
                        </GoogleOAuthProvider>
                      </div>
                    </div>
                  </div>

                  <div >
                    <div className={styles.iconWrapper}>
                      <div>
                        <YouTubeIcon />
                      </div>
                    </div>
                    <div className={styles.explanation}>
                      <p>
                        You haven't connected your YouTube Account yet or you aren't authorized. Please authorize our application to access your YouTube Playlists here.
                      </p>
                    </div>
                    <div className={styles.authBtn}>
                      <GoogleOAuthProvider
                        clientId={googleClientId}
                      >
                        <GoogleLoginBtn scope="https://www.googleapis.com/auth/youtube.force-ssl" />
                      </GoogleOAuthProvider>
                    </div>
                  </div>
                  <div >
                    <div className={styles.iconWrapper}>
                      <div>
                        <SpotifyLogo />
                      </div>
                    </div>
                    <div className={styles.explanation}>
                      <p>
                        You haven't connected your Spotify Account yet or you aren't authorized. Please authorize our application to access your Spotify Playlists here.
                      </p>
                    </div>
                    <div className={styles.authBtn}>
                      <SpotifyAuthBtn setResponse={setResponse} userInfo={userInfo} redirectURI={`${appOrigin}/dashboard/account`} />
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
};

export default Account;