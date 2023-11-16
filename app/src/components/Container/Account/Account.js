import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Account.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCamera, faFileLines, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { Chrome } from '../../../utils/svgs';
import LineInput from '../../UI/LineInput/LineInput';
import BlobBtn from '../../UI/BlobBtn/BlobBtn';
import LabelMovingInput from '../../UI/LabelMovingInput/LabelMovingInput';
import SimpleToggleBtn from '../../UI/SimpleToggleBtn/SimpleToggleBtn';
import generateRandomId from '../../../utils/RandomId';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Account({isSidebarHovered, isSidebarOpen, userInfo}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [url, setUrl] = useState("");

  const [isSubmitProfile, setIsSubmitProfile] = useState(false);
  const [isSubmitPw, setIsSubmitPw] = useState(false);
  const [isSumbmitUrl, setIsSubmitUrl] = useState(false);
  const [websites, setWebsites] = useState([]);


  const inputRef = useRef(null);

  const readURL = useCallback((input) => {
    
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(input.files[0]);

      reader.onload = (e) => {
        setImageSrc(e.target.result);
        const formData = new FormData();
        formData.append('image', input.files[0]);

        uploadImage(formData);
        
      };
    }
  }, []);

  const uploadImage = useCallback(async (formData) => {
    try {
      /* let response = await fetch(`${serverOrigin}/api/account/update/image`, {
        method: 'POST',
        body: formData,
      }); */
      
      fetch(`${serverOrigin}/api/account/update/image`, {
        method: 'post',
        /* headers: {
          'Content-Type': 'application/json'
        }, */
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            
          }
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, []);

  useEffect(() => {
    if (isSubmitProfile) {
      fetch(`${serverOrigin}/api/account/update/info`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, confirmEmail })
        })
        .then((response) => response.json())
        .then((data) => {
          
        })
        .catch((error) => console.error(error));
    };
    setTimeout(() => {
      setIsSubmitProfile(false);
    }, 2000);
  }, [isSubmitProfile]);

  useEffect(() => {
    if (isSubmitPw) {
      fetch(`${serverOrigin}/api/account/update/password`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password, confirmPassword })
        })
        .then((response) => response.json())
        .then((data) => {
          
        })
        .catch((error) => console.error(error));
    };
    setTimeout(() => {
      setIsSubmitPw(false);
    }, 2000);
  }, [isSubmitPw]);

  const fetchExtensionSettingUpdate = useCallback((d, target, value) => {
    
    fetch(`${serverOrigin}/api/account/update/extension-setting-update`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ d, target, value })
    })
    .then((response) => response.json())
    .then((data) => {
      
    })
    .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (isSumbmitUrl) {
      fetch(`${serverOrigin}/api/account/update/extension-add`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        })
        .then((response) => response.json())
        .then((data) => {
          
          if (data.success) {
            const {domain, origin} = data;
            setWebsites([...websites, {domain, origin, block: false, timer: true}]);
          }
        })
        .catch((error) => console.error(error));
    };
    setTimeout(() => {
      setIsSubmitUrl(false);
    }, 2000);
  }, [isSumbmitUrl]);

  useEffect(() => {
    if(!userInfo) return;
    setEmail(userInfo.email);
    setConfirmEmail(userInfo.email);
    setName(userInfo.name);
    const websites = userInfo.activity_setting === "" ? [] :  JSON.parse(userInfo.activity_setting.replace(/^/,"[").replace(/$/,"]"));
    setWebsites(websites);
    setImageSrc(`${serverOrigin}/profile-images/${userInfo.user_id}.jpeg`);
  }, [userInfo]);

  return (
    <div className={styles.Account}>
      <div className={`Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.fixedNav}>
          <ul className={styles.navWrapper}>
            <li className={styles.navEl}>
              <i>
                <FontAwesomeIcon icon={faUser} />
              </i>
              <p>Profile</p>
            </li>
            <li className={styles.navEl}>
              <i>
                <FontAwesomeIcon icon={faFileLines} />
              </i>
              <p>Information</p>
            </li>
            <li className={styles.navEl}>
              <i>
                <FontAwesomeIcon icon={faLock} />
              </i>
              <p>Change Password</p>
            </li>
            <li className={styles.navEl}>
              <i>
                <Chrome width={"22px"} height={"22px"} fill={"#545454"} />
              </i>
              <p>Chrome Extension</p>
            </li>
            <li className={styles.navEl}>
              <i>
                <FontAwesomeIcon icon={faBell} />
              </i>
              <p>Notifications</p>
            </li>
          </ul>
        </div>
        <div className={styles.boxContainer}>
          <div className={styles.box}>
            <div className={styles.imgSelector}>
              <div className={styles.circle}>
                <img className={styles.profilePic} src={imageSrc} alt="" />
              </div>
              <div className={styles.pImage} onClick={() => { inputRef.current.click() }}>
                <i className={styles.uploadBtn}>
                  <FontAwesomeIcon icon={faCamera} />
                </i>
                <form>
                  <input className={styles.fileUpload} type="file" accept="image/*" ref={inputRef} onChange={(e) => readURL(e.target)} />
                </form>
              </div>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.title}>
              <p>Profile</p>
            </div>
            <div className={styles.content}>
              <div className={styles.layer}>
                <div>
                  <LineInput title={'Name'} value={name} setValue={setName} type={"text"} />
                </div>
                <div>

                </div>
              </div>
              <div className={styles.layer}>
                <div className={styles.left}>
                  <LineInput title={'Email'} value={email} setValue={setEmail} type={"email"} />
                </div>
                <div className={styles.left}>
                  <LineInput title={'Confirm Email'} value={confirmEmail} setValue={setConfirmEmail} type={"email"} />
                </div>
              </div>
              <div className={styles.submitWrapper}>
                <BlobBtn name={'SUBMIT'} setClicked={setIsSubmitProfile} color1={'#fff'} color2={"var(--pink)"} />
              </div>
            </div>
          </div>
          <div className={styles.box} id={styles.password}>
            <div className={styles.title}>
              <p>Change Password</p>
            </div>
            <div className={styles.content}>
              <div className={styles.layer}>
                <div>
                  <LabelMovingInput title={'Password'} value={password} setValue={setPassword} type={"password"} />
                </div>
              </div>
              <div className={styles.layer}>
                <div>
                  <LabelMovingInput title={'Confirm Password'} value={confirmPassword} setValue={setConfirmPassword} type={"password"} />
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
                  <BlobBtn name={'SUBMIT'} setClicked={setIsSubmitPw} color1={'#fff'} color2={"var(--pink)"} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.box} id={styles.extension}>
            <div className={styles.title}>
              <h1>Chrome Extension</h1>
              <p>Here you can setup and manage your chrome extension's tracking option.(Default options for all websitesEl are true for all options)</p>
            </div>
            <div className={styles.content}>
              <div className={styles.layer}>
                <div>
                  <LabelMovingInput title={'ADD WEBSITE'} value={url} setValue={setUrl} type={"text"} />
                </div>
              </div>
              <div className={styles.layer}>
                <div>
                  <BlobBtn name={'SUBMIT'} setClicked={setIsSubmitUrl} color1={'#fff'} color2={"var(--purple)"} />
                </div>
              </div>
              <div className={styles.extensionWrapper}>
                <div className={styles.layer} id={styles.extensionHeader}>
                  <div>
                    WebsitesEl
                  </div>
                  <div>
                    Block When Studying
                  </div>
                  <div>
                    Timer
                  </div>
                </div>
                <ul>
                  {websites.map(({d, b, t}, i) => {
                    return (
                      <li className={styles.websiteOptions} key={i}>
                      <div className={styles.domain}>
                        <p>{d}</p>
                      </div>
                      <div className={styles.block}>
                        <SimpleToggleBtn checked={b} onToggle={(e) => {
                          fetchExtensionSettingUpdate(d, 'block', e.target.checked);
                        }}/>
                      </div>
                      <div className={styles.timer}>
                      <SimpleToggleBtn checked={t} onToggle={(e) => {
                          fetchExtensionSettingUpdate(d, 'timer', e.target.checked);
                        }}/>
                      </div>
                    </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className={styles.box}>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Account;