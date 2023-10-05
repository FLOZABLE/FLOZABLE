import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Account.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Account(props) {
  const [imageSrc, setImageSrc] = useState(null);
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
      let response = await fetch(`${serverOrigin}/api/account/update/image`, {
        method: 'POST',
        body: formData,
      });

      response = await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, []);
  return (
    <div className={styles.Account}>
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.fixedNav}></div>
        <div className={styles.boxContainer}>
          <div className={styles.box}>
            <div className={styles.imgSelector}>
              <div className={styles.circle}>
                <img className={styles.profilePic} src="/profile-images/.jpeg" alt="" />
              </div>
              <div className={styles.pImage} onClick={() => {inputRef.current.click()}}>
                <i className={styles.uploadBtn}>
                  <FontAwesomeIcon icon={faCamera} />
                </i>
                <form>
                  <input className={styles.fileUpload} type="file" accept="image/*" ref={inputRef} onChange={(e) => readURL(e.target)} />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account;