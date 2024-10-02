"use client";

import React, { useState, useEffect, useContext } from "react";
import styles from "./page.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import TagContainerGen from "@/app/components/Inputs/TagContainerGen/TagContainerGen";
import CreateThemeModal from "@/app/components/Modals/CreateThemeModal/CreateThemeModal";
import ThemePreview from "@/app/components/Themes/ThemePreview/ThemePreview";
import SearchBar from "@/app/components/Inputs/SearchBar/SearchBar";
import DropDownButton from "@/app/components/Buttons/DropDownButton/DropDownButton";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import ThemesContainer from "@/app/components/Themes/ThemesContainer/ThemesContainer";
import RankedTheme from "@/app/components/Themes/RankedTheme/RankedTheme";
import { ThemesContext } from "@/app/utils/Contexts";
import TagsGenerator from "@/app/components/Inputs/TagsGenerator/TagsGenerator";

function Themes({ setResponse }) {
  const { themes } = useContext(ThemesContext);

  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOpt, setSortOpt] = useState(0);
  const [isCreateThemeModal, setIsCreateThemeModal] = useState(false);
  const [rankedThemes, setRankedThemes] = useState([]);
  const [isThemePreview, setIsThemePreview] = useState(false);

  useEffect(() => {
    if (!themes) return;

    const newThemes = JSON.parse(JSON.stringify(themes));
    newThemes.sort((a, b) => b.likes.length - a.likes.length);
    setRankedThemes(newThemes);
  }, [themes]);

  return (
    <div className={`Main`}>
      <CreateThemeModal
        isOpen={isCreateThemeModal}
        setIsOpen={setIsCreateThemeModal}
      />
      <ThemePreview
        isActive={isThemePreview}
        setIsActive={setIsThemePreview}
        setResponse={setResponse}
      />
      <div className={styles.Themes}>
        <div className={styles.box} id={styles.likedList}>
          <div className={styles.title}>
            <h1>Theme of the Week!</h1>
          </div>
          {rankedThemes.length ? (
            <Swiper
              modules={[Pagination, Navigation, Autoplay, EffectCoverflow]}
              navigation={true}
              effect="coverflow"
              coverflowEffect={{
                rotate: -20,
                stretch: 1,
                depth: 100,
                slideShadows: false,
              }}
              spaceBetween={30}
              pagination={{ clickable: true }}
              slidesPerView={3}
              autoplay={{ delay: 1300, disableOnInteraction: true }}
              speed={500}
              loop={true}
              className={styles.Swiper}
            >
              {rankedThemes.map((theme, i) => {
                return (
                  <SwiperSlide className={styles.Slide} key={i}>
                    <RankedTheme
                      key={i}
                      theme={theme}
                      setIsThemePreview={setIsThemePreview}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : null}
        </div>
        <div className={styles.box}>
          <div className={styles.searchOptions}>
            <div id={styles.TagsGenerator}>
              <TagsGenerator tags={tags} setTags={setTags} />
            </div>
            <div>
              <SearchBar
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
              <div></div>
            </div>
            <div className={styles.blobWrapper}>
              <DropDownButton
                options={[
                  { value: 0, name: "Sort By: Likes" },
                  { value: 1, name: "Sort By: Usage" },
                ]}
                setValue={setSortOpt}
                value={sortOpt}
              />
              <BlobBtn
                onClick={() => {
                  setIsCreateThemeModal(!isCreateThemeModal);
                }}
              >
                + Upload theme!
              </BlobBtn>
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
  );
}

export default Themes;
