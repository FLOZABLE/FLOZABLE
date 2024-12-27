import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./AppTrial.module.css";
import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import styled from "@emotion/styled";

const StyleWrapper = styled.div`
  .swiper-pagination {
    display: none;
  }
`;
export default function AppTrial({ initialSlide = 0 }) {
  return (
    <div className={styles.AppTrial}>
      <StyleWrapper className={styles.phoneContainer}>
        <Swiper
          slidesPerView={1}
          loop={true}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          modules={[Pagination, Navigation, Autoplay]}
          className={styles.swiper}
          autoplay={{ delay: 3000 }}
          initialSlide={initialSlide}
        >
          <SwiperSlide className={styles.swiperSlide}>
            <Image
              src={"/img/mobile/swiper-main.png"}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                backgroundColor: "pink",
              }}
              alt={`background`}
            />
          </SwiperSlide>
          <SwiperSlide className={styles.swiperSlide}>
            <Image
              src={"/img/mobile/swiper-leaderboard.png"}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                backgroundColor: "pink",
              }}
              alt={`background`}
            />
          </SwiperSlide>
          <SwiperSlide className={styles.swiperSlide}>
            <Image
              src={"/img/mobile/swiper-friends.png"}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                backgroundColor: "pink",
              }}
              alt={`background`}
            />
          </SwiperSlide>
        </Swiper>
        <div className={styles.layout}>
          <Image
            src={"/img/mobile/phone-frame.png"}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            alt={`background`}
          />
        </div>
      </StyleWrapper>
    </div>
  );
}
