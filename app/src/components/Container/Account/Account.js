import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Account.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCamera,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Chrome, GoogleCalendar } from "../../../utils/svgs";
import LineInput from "../../UI/LineInput/LineInput";
import BlobBtn from "../../UI/BlobBtn/BlobBtn";
import LabelMovingInput from "../../UI/LabelMovingInput/LabelMovingInput";
import SimpleToggleBtn from "../../UI/SimpleToggleBtn/SimpleToggleBtn";
import StuckModal from "../../UI/StuckModal/StuckModal";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import GoogleLoginBtn from "../../UI/GoogleLoginBtn/GoogleLoginBtn";
import { useSearchParams } from "react-router-dom";
import SpotifyAuthBtn from "../../UI/SpotifyAuthBtn/SpotifyAuthBtn";
import { SpotifyLogo } from "../../../utils/svgs";

const serverOrigin = process.env.REACT_APP_ORIGIN;
const googleClientId = process.env.REACT_APP_CLIENT_ID;
const appOrigin = process.env.REACT_APP_LOCATION;

function Account({ isSidebarHovered, isSidebarOpen, userInfo, setResponse }) {
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
  const profileRef = useRef(null);
  const passwordRef = useRef(null);
  const extensionRef = useRef(null);
  const accountsRef = useRef(null);

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

  const fetchExtensionSettingUpdate = useCallback((d, target, value) => {
    fetch(`${serverOrigin}/account/update/extension-setting-update`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ d, target, value }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));
  }, []);

  const onSubmitUrl = (urlPar) => {
    fetch(`${serverOrigin}/account/update/extension-add`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: urlPar ? urlPar : url }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          const { domain, origin } = data;

          setWebsites([
            ...websites,
            { d: domain, o: origin, b: false, t: false, bs: false, ts: true },
          ]);

          setTimeout(() => {
            const section = document.querySelector(`#${domain.replace(/\./g, '_')}`);
            if (!section) return;
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      })
      .catch((error) => console.error(error));
  };

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
    if (!websites.length) return;

    const domain = searchParams.get("website");
    searchParams.delete("website");
    if (!domain) return;

    if (!domain) return;

    const isExist = websites.find(website => website.d.replace(/^www\.(.*)$/, "$1") === domain.replace(/^www\.(.*)$/, "$1"));

    if (isExist) {
      const section = document.querySelector(`#${domain.replace(/^www\.(.*)$/, "$1").replace(/\./g, '_')}`);
      if (!section) return;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onSubmitUrl(domain);
    };
  }, [websites, searchParams]);

  useEffect(() => {
    if (!scrollRef || !scrollRef.current) return;
    scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [scrollRef]);

  return (
    <div className={styles.Account}>
      <StuckModal />
      <div
        className={`Main ${isSidebarOpen || isSidebarHovered ? "sidebarOpen" : ""
          }`}
      >
        <div className={styles.fixedNav}>
          <ul className={styles.navWrapper}>
            <li className={styles.navEl} onClick={() => { setScrollRef(profileRef) }}>
              <i>
                <FontAwesomeIcon icon={faUser} />
              </i>
              <p>Profile</p>
            </li>
            <li className={styles.navEl} onClick={() => { setScrollRef(passwordRef) }}>
              <i>
                <FontAwesomeIcon icon={faLock} />
              </i>
              <p>Change Password</p>
            </li>
            <li className={styles.navEl} onClick={() => { setScrollRef(extensionRef) }}>
              <i>
                <Chrome width={"22px"} height={"22px"} fill={"#545454"} />
              </i>
              <p>Chrome Extension</p>
            </li>
            {/* <li className={styles.navEl} onClick={() => {setScrollRef(profileRef)}}>
              <i>
                <FontAwesomeIcon icon={faBell} />
              </i>
              <p>Notifications</p>
            </li> */}
            <li className={styles.navEl} onClick={() => { setScrollRef(accountsRef) }}>
              <i>
                <FontAwesomeIcon icon={faBell} />
              </i>
              <p>Accounts</p>
            </li>
          </ul>
        </div>
        <div className={styles.boxContainer}>
          <div className={styles.box}>
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
          </div>
          <div className={styles.box} ref={profileRef}>
            <div className={styles.title}>
              <p>Profile</p>
            </div>
            <div className={styles.content}>
              <div className={styles.layer}>
                <div>
                  <LineInput
                    title={"Name"}
                    value={name}
                    setValue={setName}
                    type={"text"}
                  />
                </div>
                <div></div>
              </div>
              <div className={styles.layer}>
                <div className={styles.left}>
                  <LineInput
                    title={"Email"}
                    value={email}
                    setValue={setEmail}
                    type={"email"}
                  />
                </div>
                <div className={styles.left}>
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
          <div className={styles.box} id={styles.password} ref={passwordRef}>
            <div className={styles.title}>
              <p>Change Password</p>
            </div>
            <div className={styles.content}>
              <div className={styles.layer}>
                <div>
                  <LabelMovingInput
                    title={"Password"}
                    value={password}
                    setValue={setPassword}
                    type={"password"}
                  />
                </div>
              </div>
              <div className={styles.layer}>
                <div>
                  <LabelMovingInput
                    title={"Confirm Password"}
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    type={"password"}
                  />
                </div>
              </div>
              <div className={styles.layer}>
                <div className={styles.passwordReq}>
                  <h5>Password requirements</h5>
                  <ul>
                    <li>One special characters</li>
                    <li>Min 6 characters</li>
                  </ul>
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
          <div className={styles.box} id={styles.extension} ref={extensionRef}>
            <div className={styles.title}>
              <h1>Chrome Extension</h1>
              <p>
                Here you can setup and manage your chrome extension's tracking
                option.(Default options for all websitesEl are true for all
                options)
              </p>
            </div>
            <div className={styles.content}>
              <div className={styles.layer}>
                <div>
                  <LabelMovingInput
                    title={"ADD WEBSITE"}
                    value={url}
                    setValue={setUrl}
                    type={"text"}
                  />
                </div>
                <div>
                  <BlobBtn
                    name={"SUBMIT"}
                    setClicked={() => { onSubmitUrl() }}
                    color1={"#fff"}
                    color2={"var(--purple)"}
                  />
                </div>
              </div>
              {/* <div className={styles.layer}>
                <DropDownButton
                  options={[
                    { name: "Focus mode", value: 0 },
                    { name: "General", value: 1 },
                  ]}
                  setValue={setWebsitesViewr}
                />
              </div> */}
              <div className={styles.extensionWrapper}>
                <div className={styles.layer} id={styles.extensionHeader}>
                  <div>Websites</div>
                  <div>Block</div>
                  <div>Block when studying</div>
                  <div>Timer</div>
                  <div>Timer when studying</div>
                </div>
                <ul>
                  {websites.map(({ d, b, bs, t, ts }, i) => {
                    return (
                      <li className={styles.websiteOptions} key={i} id={d.replace(/\./g, '_')}>
                        <div className={styles.domain}>
                          <p>{d}</p>
                        </div>
                        <div className={styles.block}>
                          <SimpleToggleBtn
                            checked={b}
                            onToggle={(e) => {
                              fetchExtensionSettingUpdate(
                                d,
                                "block",
                                e.target.checked,
                              );
                            }}
                          />
                        </div>
                        <div className={styles.block}>
                          <SimpleToggleBtn
                            checked={bs}
                            onToggle={(e) => {
                              fetchExtensionSettingUpdate(
                                d,
                                "blockstudy",
                                e.target.checked,
                              );
                            }}
                          />
                        </div>
                        <div className={styles.timer}>
                          <SimpleToggleBtn
                            checked={t}
                            onToggle={(e) => {
                              fetchExtensionSettingUpdate(
                                d,
                                "timer",
                                e.target.checked,
                              );
                            }}
                          />
                        </div>
                        <div className={styles.timer}>
                          <SimpleToggleBtn
                            checked={ts}
                            onToggle={(e) => {
                              fetchExtensionSettingUpdate(
                                d,
                                "timerstudy",
                                e.target.checked,
                              );
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className={styles.box} id={styles.accounts} ref={accountsRef}>
            <div className={styles.title}>
              <h1>Accounts</h1>
              <p>
                Here you can setup and manage your integration settings.
              </p>
            </div>
            <div className={styles.content}>
              <div className={styles.layer}>
                <div className={styles.iconWrapper}>
                  <GoogleCalendar />
                </div>
                <div className={styles.explanation}>
                  You haven't connected your Google Calendar yet or you aren't authorized. Please authorize our application to access your Google Calendar by signing in with your Google account here.
                </div>
                <div className={styles.authBtn}>
                  <GoogleOAuthProvider
                    clientId={googleClientId}
                  >
                    <GoogleLoginBtn />
                  </GoogleOAuthProvider>
                </div>
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.layer}>
                <div className={styles.iconWrapper}>
                  <SpotifyLogo />
                </div>
                <div className={styles.explanation}>
                  You haven't connected your Spotify Account yet or you aren't authorized. Please authorize our application to access your Spotify Playlists here.
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
  );
};

export default Account;