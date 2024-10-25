import React, { useCallback, useEffect, useRef, useState } from "react";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import LabelMovingInput from "../../Inputs/LabelMovingInput/LabelMovingInput";
import SimpleToggleBtn from "../../Buttons/SimpleToggleBtn/SimpleToggleBtn";
import styles from "./ExtensionSetting.module.css";
import { useExtensionSettings } from "@/Hooks/extensionHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { patchExtensionSetting, putExtensionSetting } from "@/Api/extensionApi";
import { toast } from "react-toastify";

function ExtensionSetting() {
  const { useExtensionSettingsData, useExtensionSettingsIsLoading } =
    useExtensionSettings();

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
      if (data.success) {
        toast.success(data.msg);
        setSettings((prev) => [...prev, data.setting]);
        setUrl("");

        setTimeout(() => {
          const section = document.querySelector(
            `#${domain.replace(/\./g, "_")}`
          );
          if (!section) return;
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      } else {
        toast.error(data.reason);
      }
    })();
  }, [url]);

  const settingUpdate = useCallback(
    (website, mode, value) => {
      (async () => {
        const data = await patchExtensionSetting({ website, mode, value });
        if (data.success) {
          toast.success(data.msg);
          const settingIndex = settings.findIndex(
            (setting) => setting.website === website
          );
          if (settingIndex === -1) return;
          const newSettings = [...settings];
          newSettings[settingIndex][mode] = value;
          setSettings(newSettings);
        } else {
          toast.error(data.reason);
        }
      })();
    },
    [settings]
  );

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
                      onToggle={() => {
                        console.log("gddd");
                        settingUpdate(website, "block", !block);
                      }}
                    />
                  </div>
                  <div>
                    <SimpleToggleBtn
                      checked={study_block}
                      onToggle={() => {
                        settingUpdate(website, "study_block", !study_block);
                      }}
                    />
                  </div>
                  <div>
                    <SimpleToggleBtn
                      checked={timer}
                      onToggle={() => {
                        settingUpdate(website, "timer", !timer);
                      }}
                    />
                  </div>
                  <div>
                    <SimpleToggleBtn
                      checked={study_timer}
                      onToggle={() => {
                        settingUpdate(website, "study_timer", !study_timer);
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
