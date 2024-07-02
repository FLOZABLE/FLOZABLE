import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import LabelMovingInput from "../../Inputs/LabelMovingInput/LabelMovingInput";
import SimpleToggleBtn from "../../Buttons/SimpleToggleBtn/SimpleToggleBtn";
import styles from "./ExtensionSetting.module.css";
import config from "@/app/utils/config";
import { ResponseContext } from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";

function ExtensionSetting({ websites, setWebsites }) {
  const { setResponse } = useContext(ResponseContext);

  const router = useRouter();

  const [url, setUrl] = useState("");
  const extensionRef = useRef(null);

  const onSubmitUrl = useCallback(
    (url) => {
      fetch(`${config.server}/extension/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
          if (data.success) {
            const { domain } = data;

            setWebsites((prev) => ({
              ...prev,
              [domain]: { b: false, t: false, bs: false, ts: true },
            }));

            setTimeout(() => {
              const section = document.querySelector(
                `#${domain.replace(/\./g, "_")}`
              );
              if (!section) return;
              section.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
          }
        })
        .catch((error) => console.error(error));
    },
    [websites]
  );

  useEffect(() => {
    if (!websites.length) return;

    const searchParams = new URLSearchParams(document.location.search);
    const domain = searchParams.get("website");
    router.push(window.location.pathname, { scroll: false });
    if (!domain) {
      extensionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
      return;
    }

    const isExist = websites[domain.replace(/^www\.(.*)$/, "$1")];

    if (isExist) {
      const section = document.querySelector(
        `#${domain.replace(/^www\.(.*)$/, "$1").replace(/\./g, "_")}`
      );
      if (!section) return;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      onSubmitUrl(domain);
    }
  }, [websites]);

  const fetchExtensionSettingUpdate = useCallback((d, target, value) => {
    fetch(`${config.server}/extension/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ d, target, value }),
      credentials: "include",
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
            onClick={() => {
              onSubmitUrl(url);
            }}
            color1={"#fff"}
            color2={"var(--pink)"}
          >
            SUBMIT
          </BlobBtn>
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
          {Object.keys(websites).map((website, i) => {
            const { b, bs, t, ts } = websites[website];
            return (
              <li
                className={styles.websiteOptions}
                key={i}
                id={website.replace(/\./g, "_")}
              >
                <div>
                  <p>{website}</p>
                </div>
                <div>
                  <SimpleToggleBtn
                    checked={b}
                    onToggle={(e) => {
                      fetchExtensionSettingUpdate(
                        website,
                        "block",
                        e.target.checked
                      );
                    }}
                  />
                </div>
                <div>
                  <SimpleToggleBtn
                    checked={bs}
                    onToggle={(e) => {
                      fetchExtensionSettingUpdate(
                        website,
                        "blockstudy",
                        e.target.checked
                      );
                    }}
                  />
                </div>
                <div>
                  <SimpleToggleBtn
                    checked={t}
                    onToggle={(e) => {
                      fetchExtensionSettingUpdate(
                        website,
                        "timer",
                        e.target.checked
                      );
                    }}
                  />
                </div>
                <div>
                  <SimpleToggleBtn
                    checked={ts}
                    onToggle={(e) => {
                      fetchExtensionSettingUpdate(
                        website,
                        "timerstudy",
                        e.target.checked
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
  );
}

export default ExtensionSetting;
