import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Account.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCamera, faFileLines, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { Chrome } from '../../../utils/svgs';
import LineInput from '../../UI/LineInput/LineInput';
import BlobBtn from '../../UI/BlobBtn/BlobBtn';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Account(props) {
  const [imageSrc, setImageSrc] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  const [isSubmitInfo, setIsSubmitInfo] = useState(false);
  const [isSubmitPw, setIsSubmitPw] = useState(false);

  const inputRef = useRef(null);

  const readURL = useCallback((input) => {
    console.log('gd', input.files)
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(input.files[0]);

      reader.onload = (e) => {
        setImageSrc(e.target.result);
        const formData = new FormData();
        formData.append('image', input.files[0]);

        uploadImage(formData);
        console.log('formdaa', formData)
      };
    }
  }, []);

  const uploadImage = useCallback(async (formData) => {
    try {
      /* let response = await fetch(`${serverOrigin}/api/account/update/image`, {
        method: 'POST',
        body: formData,
      }); */
      console.log('fetch', formData)
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
            console.log('ranking', data);
          }
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, []);


  return (
    <div className={styles.Account}>
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
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
              <p>Chrome</p>
            </li>
            <li className={styles.navEl}>
              <i>
                <FontAwesomeIcon icon={faBell} />
              </i>
              <p>Bell</p>
            </li>
          </ul>
        </div>
        <div className={styles.boxContainer}>
          <div className={styles.box}>
            <div className={styles.imgSelector}>
              <div className={styles.circle}>
                <img className={styles.profilePic} src="/profile-images/.jpeg" alt="" />
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
                <BlobBtn name={'SUBMIT'} setClicked={setIsSubmitInfo} color1={'#fff'} color2={"var(--pink)"} />
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
                  <LineInput title={'Name'} value={name} setValue={setName} type={"text"} />
                </div>
              </div>
              <div className={styles.layer}>
                <div>
                  <LineInput title={'Name'} value={name} setValue={setName} type={"text"} />
                </div>
              </div>
              <div className={styles.layer}>
                <div className={styles.passwordReq}>
                  <h5>Password requirements</h5>
                  <ul>
                    <li>one</li>
                    <li>sdf</li>
                  </ul>
                </div>
                <div className={styles.submitWrapper}>
                  <BlobBtn name={'SUBMIT'} setClicked={setIsSubmitInfo} color1={'#fff'} color2={"var(--pink)"} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.box} id={styles.extension}>
            <div className={styles.title}>
              <h1>Chrome Extension</h1>
              <p>Here you can setup and manage your chrome extension's tracking option.(Default options for all websites are true for all options)</p>
            </div>
            <div className={styles.content}>
              <div className={styles.layer}>
                <div>
                  <LineInput title={'Name'} value={name} setValue={setName} type={"text"} />
                </div>
              </div>
              <div className={styles.layer}>
                <div>
                <BlobBtn name={'SUBMIT'} setClicked={setIsSubmitInfo} color1={'#fff'} color2={"var(--purple)"} />
                </div>
              </div>
              <div className={styles.layer}>
                <div className={styles.passwordReq}>
                  <h5>Password requirements</h5>
                  <ul>
                    <li>one</li>
                    <li>sdf</li>
                  </ul>
                </div>
                <div className={styles.submitWrapper}>
                  <BlobBtn name={'SUBMIT'} setClicked={setIsSubmitInfo} color1={'#fff'} color2={"var(--pink)"} />
                </div>
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