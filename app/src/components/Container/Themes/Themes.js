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
const serverOrigin = process.env.REACT_APP_ORIGIN;

function Themes({
  isSidebarOpen,
  isSidebarHovered,
  setResponse
}) {

  const [slidesEl, setSlidesEl] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOpt, setSortOpt] = useState(0);
  const [isCreateTemplateModal, setIsCreateTemplateModal] = useState(false);
  //const [is]

  const handleCreatedTagsChange = (tags) => {
    setTags(tags);
  };

  return (
    <div className={styles.Themes}>
      <CreateThemeModal 
        isOpen={true}
        setIsOpen={setIsCreateTemplateModal}
        setResponse={setResponse}
      />
      <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.box} id={styles.likedList}>
          <div className={styles.title}>
            <h1>Checkout the most liked themes this week!</h1>
          </div>
          {/* {slidesEl.length ?
            <Swiper>
              {slidesEl}
            </Swiper>
            : null
          } */}
          <Swiper
            modules={[Pagination, Navigation, Autoplay, EffectCoverflow]}
            effect="coverflow"
            coverflowEffect={{
              rotate: -20,
              stretch: 1,
              depth: 100,
              slideShadows: false
            }}
            pagination={{ clickable: true }}
            slidesPerView={3}
            autoplay={{ delay: 1300, disableOnInteraction: false }}
            speed={500}
            loop={true}
            className={styles.Swiper}>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
            <SwiperSlide className={styles.Slide}>
              sdfsdf
            </SwiperSlide>
          </Swiper>
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
                setClicked={setIsCreateTemplateModal}
                color1={"#fff"}
                color2={"var(--pink)"}
              />
            </div>
          </div>
          <ThemesContainer />
        </div>
      </div>
    </div>
  );
}

export default Themes;