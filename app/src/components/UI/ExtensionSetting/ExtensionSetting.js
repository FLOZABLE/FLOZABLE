import React, { useCallback, useEffect, useRef, useState } from "react";
import BlobBtn from "../BlobBtn/BlobBtn";
import LabelMovingInput from "../LabelMovingInput/LabelMovingInput";
import SimpleToggleBtn from "../SimpleToggleBtn/SimpleToggleBtn";
import styles from "./ExtensionSetting.module.css";
import { useSearchParams } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ExtensionSetting({ websites, setWebsites, setResponse }) {
  const [url, setUrl] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const extensionRef = useRef(null);

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
    if (!websites.length) return;

    const domain = searchParams.get("website");
    searchParams.delete("website");
    if (!domain) {
      extensionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start"
      });
      return;
    };

    const isExist = websites.find(website => website.d.replace(/^www\.(.*)$/, "$1") === domain.replace(/^www\.(.*)$/, "$1"));

    if (isExist) {
      const section = document.querySelector(`#${domain.replace(/^www\.(.*)$/, "$1").replace(/\./g, '_')}`);
      if (!section) return;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onSubmitUrl(domain);
    };
  }, [websites, searchParams]);


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


  return (
    <div className={styles.ExtensionSetting}>
      <div>
        <div>
          <LabelMovingInput
            title={"Please Provide A URL"}
            value={url}
            setValue={setUrl}
            type={"text"}
          />
        </div>
        <div className={styles.BtnPos}>
          <BlobBtn
            name={"SUBMIT"}
            setClicked={() => { onSubmitUrl() }}
            color1={"#fff"}
            color2={"var(--pink)"}
          />
        </div>
      </div>
      <div>
        <div className={styles.extensionHeader}>
        <div>Websites</div>
          <div>Block</div>
          <div>Block when studying</div>  
          <div>Timer</div>
          <div>Timer when studying</div>
        </div>
        <ul ref={extensionRef}>
          {websites.map(({ d, b, bs, t, ts }, i) => {
            return (
              <li className={styles.websiteOptions} key={i} id={d.replace(/\./g, '_')}>
                <div>
                  <p>{d}</p>
                </div>
                <div>
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
                <div>
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
                <div>
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
                <div>
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
  )
};

export default ExtensionSetting;