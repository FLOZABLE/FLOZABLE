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
import { useExtensionSettings } from "@/Hooks/extensionHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { patchExtensionSetting, putExtensionSetting } from "@/Api/extensionApi";

function ExtensionSetting() {
  const { useExtensionSettingsData, useExtensionSettingsIsLoading } =
    useExtensionSettings();

  const { setResponse } = useContext(ResponseContext);

  const router = useRouter();

  const [url, setUrl] = useState("");
  const [settings, setSettings] = useState([]);

  const extensionRef = useRef(null);

  useEffect(() => {
    if (!useExtensionSettingsData?.success) return;

    setSettings(useExtensionSettingsData.websiteSettings);
  }, [useExtensionSettingsData]);

  const onSubmitUrl = useCallback(() => {
    (async () => {
      const data = await putExtensionSetting(url);
      setResponse(data);
      if (data.success) {
        setSettings((prev) => [...prev, data.setting]);

        setTimeout(() => {
          const section = document.querySelector(
            `#${domain.replace(/\./g, "_")}`
          );
          if (!section) return;
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    })();
  }, [url]);

  const settingUpdate = useCallback((website, mode, value) => {
    (async () => {
      console.log('gddd')
      const data = await patchExtensionSetting({ website, mode, value });
      setResponse(data);
    })();
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
          {useExtensionSettingsIsLoading ? (
            <CircularLoading />
          ) : !useExtensionSettingsData?.success ? null : (
            settings.map((setting, i) => {
              const { website, timer, study_timer, block, study_block } =
                setting;
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
                      checked={block}
                      onToggle={(e) => {
                        console.log('gddd')
                        settingUpdate(website, "block", e.target.checked);
                      }}
                    />
                  </div>
                  <div>
                    <SimpleToggleBtn
                      checked={study_block}
                      onToggle={(e) => {
                        settingUpdate(website, "study_block", e.target.checked);
                      }}
                    />
                  </div>
                  <div>
                    <SimpleToggleBtn
                      checked={timer}
                      onToggle={(e) => {
                        settingUpdate(website, "timer", e.target.checked);
                      }}
                    />
                  </div>
                  <div>
                    <SimpleToggleBtn
                      checked={study_timer}
                      onToggle={(e) => {
                        settingUpdate(website, "study_timer", e.target.checked);
                      }}
                    />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export default ExtensionSetting;
