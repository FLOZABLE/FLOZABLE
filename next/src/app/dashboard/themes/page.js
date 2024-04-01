"use client";

import React, { useState, useEffect, useContext } from "react";
import styles from "./page.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import config from "@/utils/config";
import TagContainerGen from "@/Components/Inputs/TagContainerGen/TagContainerGen";
import CreateThemeModal from "@/Components/Modals/CreateThemeModal/CreateThemeModal";
import ThemePreview from "@/Components/Themes/ThemePreview/ThemePreview";
import SearchBar from "@/Components/Inputs/SearchBar/SearchBar";
import DropDownButton from "@/Components/Buttons/DropDownButton/DropDownButton";
import BlobBtn from "@/Components/Buttons/BlobBtn/BlobBtn";
import ThemesContainer from "@/Components/Themes/ThemesContainer/ThemesContainer";
import RankedTheme from "@/Components/Themes/RankedTheme/RankedTheme";
import { ThemesContext } from "@/utils/Contexts";

function Themes({
  setResponse,
}) {
  const {themes} = useContext(ThemesContext);

  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOpt, setSortOpt] = useState(0);
  const [isCreateThemeModal, setIsCreateThemeModal] = useState(false);
  const [rankedThemes, setRankedThemes] = useState([]);
  const [isThemePreview, setIsThemePreview] = useState(false);

  const handleCreatedTagsChange = (tags) => {
    setTags(tags);
  };


  useEffect(() => {
    if (!themes) return;

    const newThemes = JSON.parse(JSON.stringify(themes));
    newThemes.sort((a, b) => b.likes.length - a.likes.length);
    setRankedThemes(newThemes);
  }, [themes]);

  return (
    <div>
      <CreateThemeModal
        isOpen={isCreateThemeModal}
        setIsOpen={setIsCreateThemeModal}
      />
      <ThemePreview
        isActive={isThemePreview}
        setIsActive={setIsThemePreview}
        setResponse={setResponse}
      />
      <div className={`Main`}>
        <div className="title">
          Themes
        </div>
        <div className={styles.Themes}>
          <div className={styles.box} id={styles.likedList}>
            <div className={styles.title}>
              <h1>Theme of the Week!</h1>
            </div>
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
                autoplay={{ delay: 1300, disableOnInteraction: true }}
                speed={500}
                loop={true}
                className={styles.Swiper}>
                {rankedThemes.map((theme, i) => {
                  return (
                    <SwiperSlide className={styles.Slide} key={i}>
                      <RankedTheme
                        key={i}
                        theme={theme}
                        setIsThemePreview={setIsThemePreview}
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
              <div>
                <div id={styles.tagWrapper}>
                  <TagContainerGen
                    maxTags={10}
                    setTags={setTags}
                    handleCreatedTagsChange={handleCreatedTagsChange}
                  />
                </div>
              </div>
              <div>
                <SearchBar
                  setSearchQuery={setSearchQuery}
                  searchQuery={searchQuery}
                />
                <div>
                </div>
              </div>
              <div className={styles.blobWrapper}>
                <DropDownButton
                  options={{
                    "0": "Sort By: Likes",
                    "1": "Sort By: Usage"
                  }}
                  setValue={setSortOpt}
                  value={sortOpt}
                />
                <BlobBtn
                  name={"+ Upload theme!"}
                  setClicked={setIsCreateThemeModal}
                  color1={"#fff"}
                  color2={"var(--purple2)"}
                  delay={-1}
                />
              </div>
            </div>
            <ThemesContainer
              tags={tags}
              searchQuery={searchQuery}
              sortOpt={sortOpt}
              setIsThemePreview={setIsThemePreview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Themes;