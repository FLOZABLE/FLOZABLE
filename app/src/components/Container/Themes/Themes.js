import React, { useState, useEffect, useRef } from "react";
import styles from "./Themes.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import TagContainerGen from "../../UI/TagContainerGen/TagContainerGen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import Search from "../../UI/Search/Search";
import DropDownButton from "../../UI/DropDownButton/DropDownButton";
import BlobBtn from "../../UI/BlobBtn/BlobBtn";
import ThemesContainer from "../../UI/ThemesContainer/ThemesContainer";
import CreateThemeModal from "../../UI/CreateThemeModal/CreateThemeModal";
import StuckModal from "../../UI/StuckModal/StuckModal";
import RankedTheme from "../../UI/RankedTheme/RankedTheme";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Themes({
  isSidebarOpen,
  isSidebarHovered,
  setResponse,
  userInfo
}) {

  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOpt, setSortOpt] = useState(0);
  const [isCreateThemeModal, setIsCreateThemeModal] = useState(false);
  const [themes, setThemes] = useState([]);
  const [userThemes, setUserThemes] = useState([]);
  const [rankedThemes, setRankedThemes] = useState([]);

  const handleCreatedTagsChange = (tags) => {
    setTags(tags);
  };

  useEffect(() => {
    fetch(`${serverOrigin}/api/themes`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          data.themes.map(theme => {
            theme.likes = theme.likes === "" ? [] : theme.likes.split(",");
          })
          setThemes(data.themes);
        };
      })
      .catch((error) => console.error(error));


    fetch(`${serverOrigin}/api/themes/user`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUserThemes(data.themes.themes.split(","));
        };
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (!themes) return;
    const newThemes = JSON.parse(JSON.stringify(themes));
    newThemes.sort((a, b) => b.likes.length - a.likes.length);
    console.log('srot', newThemes);
    setRankedThemes(newThemes);
  }, [themes]);


  return (
    <div className={styles.Themes}>
      <CreateThemeModal
        isOpen={isCreateThemeModal}
        setIsOpen={setIsCreateThemeModal}
        setResponse={setResponse}
        setThemes={setThemes}
      />
      <StuckModal />
      <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.box} id={styles.likedList}>
          <div className={styles.title}>
            <h1>Check out the most liked themes this week!</h1>
          </div>
          {/* {slidesEl.length ?
            <Swiper>
              {slidesEl}
            </Swiper>
            : null
          } */}
          {rankedThemes.length ?
            <Swiper
              modules={[Pagination, Navigation, Autoplay, EffectCoverflow]}
              navigation={true}
              effect="coverflow"
              coverflowEffect={{
                rotate: -20,
                stretch: 1,
                depth: 100,
                slideShadows: false
              }}
              spaceBetween={30}
              pagination={{ clickable: true }}
              slidesPerView={3}
              autoplay={{ delay: 1300, disableOnInteraction: false }}
              speed={500}
              loop={true}
              className={styles.Swiper}>
              {rankedThemes.map((theme, i) => {
                const liked = theme.likes.includes(userInfo?.user_id);
                return (
                  <SwiperSlide className={styles.Slide} key={i}>
                    <RankedTheme
                      rank={i}
                      theme={theme}
                      liked={liked}
                      setResponse={setResponse}
                      tags={tags}
                    />
                  </SwiperSlide>
                )
              })}
            </Swiper>
            : null
          }
        </div>
        <div className={styles.box}>
          <div className={styles.searchOptions}>
            <div className={styles.tagContainerWrapper}>
              <div className={styles.title}>
                <FontAwesomeIcon icon={faTags} className={styles.faTags} />
                <h2>Tags</h2>
              </div>
              <TagContainerGen
                maxTags={10}
                setTags={setTags}
                handleCreatedTagsChange={handleCreatedTagsChange}
              />
            </div>
            <div>
              <Search
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
              <div className={styles.sortOptWrapper}>
                <DropDownButton
                  options={[
                    { name: "By likes", value: 0 },
                    { name: "By Usage", value: 1 },
                  ]}
                  setValue={setSortOpt}
                />
              </div>
            </div>
            <div className={styles.blobWrapper}>
              <BlobBtn
                name={"Upload template!"}
                setClicked={setIsCreateThemeModal}
                color1={"#fff"}
                color2={"var(--pink)"}
                delay={-1}
              />
            </div>
          </div>
          <ThemesContainer
            themes={themes}
            userInfo={userInfo}
            setResponse={setResponse}
            tags={tags}
            sortOpt={sortOpt}
            searchQuery={searchQuery}
            userThemes={userThemes}
          />
        </div>
      </div>
    </div>
  );
}

export default Themes;