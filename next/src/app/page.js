"use client";

import { motion } from "framer-motion";
import styles from "./page.module.css";
import Link from "next/link";
import AccountBtn from "./components/Buttons/AccountBtn/AccountBtn";
import Image from "next/image";
import BlobBtn from "./components/Buttons/BlobBtn/BlobBtn";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

export default function Home() {
  const router = useRouter();

  return (
    <main className={styles.Home}>
      <header>
        <div className={styles.left}>
          <h1>FLOZABLE</h1>
        </div>
        <div className={styles.pages}>
          <div className={styles.page}>
            <Link href={"/#about"}>About</Link>
          </div>
          <div className={styles.page}>
            <Link href={"/#feature"}>Feature</Link>
          </div>
          <div className={styles.page}>
            <Link href={"/#pricing"}>Pricing</Link>
          </div>
          <div className={styles.review}>
            <Link href={"/#pricing"}>Review</Link>
          </div>
          <div className={styles.review}>
            <Link href={"/dashboard"}>Dashboard</Link>
          </div>
        </div>
        <div className={styles.right}>
          <AccountBtn />
        </div>
      </header>
      <div>
        <div className={styles.mainViewer}>
          <div className={styles.floating}>
            <h3>Unlock Your Focus, Unleash Your Potential with FLOZABLE</h3>
            <p>
              Ignite your focus, conquer distractions, and achieve greatness
              with FLOZABLE. Join our dynamic community, leverage our powerful
              timer, and unleash your full potential today.
            </p>
            <div id={styles.tryBtn}>
              <BlobBtn
                onClick={() => {
                  router.push("/dashboard");
                }}
              >
                <p>Try it!</p>
              </BlobBtn>
            </div>
          </div>
          <div className={styles.wave}>
            <Image
              src={"/img/main/bg-bottom.png"}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              alt={`background`}
            />
          </div>
          <div className={styles.app}>
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
          </div>
        </div>
      </div>
      {/* <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.5 },
        }}
      >
        <div>
          <h1>Welcome to the Home Page</h1>
        </div>
      </motion.div>
       */}
    </main>
  );
}
