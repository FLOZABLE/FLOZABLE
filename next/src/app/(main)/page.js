"use client";

import styles from "./page.module.css";
import Image from "next/image";
import BlobBtn from "../components/Buttons/BlobBtn/BlobBtn";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import AppTrial from "../components/Others/AppTrial/AppTrial";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faChevronLeft,
  faChevronRight,
  faComments,
  faHourglass,
  faPeopleGroup,
  faRobot,
  faStar,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import styled from "@emotion/styled";
import { useCallback, useRef, useState } from "react";
import GradientBtn from "../components/Buttons/GradientBtn/GradientBtn";

const reviews = [
  {
    name: "Jason Lee",
    description: "Future Zuck",
    review: `
      "FLOZABLE is a total game-changer for studying! I can finally
      connect with my friends and study together, even when we're not
      in the same place. It's like having a virtual study group that
      actually keeps me focused and motivated."
    `,
    imageSrc: "/img/main/testimonial-1.jpg",
  },
  {
    name: "Cameron Jiang",
    description: "Stanford Student",
    review: `
      "OMG, FLOZABLE is my new study BFF! The AI study suggestions are
      surprisingly helpful, and the timer keeps me on track without
      feeling too strict. Plus, the study icon is super cute and makes
      studying feel a little less boring."
    `,
    imageSrc: "/img/main/testimonial-2.jpg",
  },
  {
    name: "Kunlin Zheng",
    description: "TFT Player",
    review: `
      "FLOZABLE is a lifesaver during exams! The study planner helps
      me stay organized and on top of my assignments, while the chat
      feature lets me get quick answers to my questions. It's like
      having a study support group right in my pocket!"
    `,
    imageSrc: "/img/main/testimonial-3.jpg",
  },
  {
    name: "Jinting Jing",
    description: "Chinese",
    review: `
      "I can't get enough of FLOZABLE's YouTube background feature! I
      love setting up my study sessions with my favorite study
      playlists in the background. It's such a vibe and helps me stay
      in the zone."
    `,
    imageSrc: "/img/main/testimonial-4.jpg",
  },
  {
    name: "Zihang Yu",
    description: "Academic Weapon",
    review: `
      "FLOZABLE's YouTube background feature is a game-changer! I can
      play my go-to focus playlists while working, and it keeps me
      productive and in the flow."
    `,
    imageSrc: "/img/main/testimonial-5.jpg",
  },
  {
    name: "Changhoe Choe",
    description: "BLM activist",
    review: `
      "This app makes George Floyd breathe."
    `,
    imageSrc: "/img/main/testimonial-6.jpg",
  },
];

function Box({ children, title, description }) {
  return (
    <div className={styles.Box}>
      <div className={styles.icon}>{children}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

const StyleWrapper = styled.div`
  .swiper-pagination {
    display: none;
  }

  /* .swiper-button-next {
    position: absolute;
    bottom: 0rem;
    top: unset;
  } */
`;

function Review({ imageSrc, name, description, feedback, isFocused }) {
  return (
    <div className={`${styles.Review} ${isFocused ? styles.focused : ""}`}>
      <div className={styles.info}>
        <div className={styles.profile}>
          <Image
            src={`${imageSrc}`}
            width={0}
            height={0}
            sizes="100vw"
            style={{
              width: "100%",
              height: "auto",
            }}
            alt={`background`}
            className={styles.img}
          />
        </div>
        <div>
          <p className={styles.name}>{name}</p>
          <p className={styles.description}>{description}</p>
          <div className={styles.stars}>
            <FontAwesomeIcon icon={faStar} />
            <FontAwesomeIcon icon={faStar} />
            <FontAwesomeIcon icon={faStar} />
            <FontAwesomeIcon icon={faStar} />
            <FontAwesomeIcon icon={faStar} />
          </div>
        </div>
      </div>
      <div className={styles.feedback}>{feedback}</div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);

  const reviewsRef = useRef(null);

  const handleReviewPrev = useCallback(() => {
    if (!reviewsRef.current) return;
    reviewsRef.current.swiper.slidePrev();
  }, []);

  const handleReviewNext = useCallback(() => {
    if (!reviewsRef.current) return;
    reviewsRef.current.swiper.slideNext();
  }, []);

  return (
    <main className={styles.Home}>
      <div id={styles.mainViewer}>
        <div className={styles.floating}>
          <h3>Unlock Your Focus, Unleash Your Potential with FLOZABLE</h3>
          <p>
            Ignite your focus, conquer distractions, and achieve greatness with
            FLOZABLE. Join our dynamic community, leverage our powerful timer,
            and unleash your full potential today.
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
          <AppTrial />
        </div>
      </div>
      <div id={styles.about} className={styles.section}>
        <div className={styles.scroll} id="about"></div>
        <div className={styles.layer}>
          <div className={styles.title}>
            <h2>About App</h2>
          </div>
          <div className={styles.subTitle}>
            <p>#1 App for Empowering Your Focus and Productivity</p>
          </div>
          <div className={styles.description}>
            <p>
              Flozable is the #1 app that empowers you to regain control of your
              time and boost productivity. With innovative features and an
              interactive community, Flozable is your ultimate tool for
              studying, learning, and connecting with like-minded individuals.
            </p>
            <br />
            <p>
              Experience the power of our advanced timer function, designed to
              challenge you and keep you focused on your tasks. Our AI-based
              study suggestions provide personalized course recommendations
              tailored to your interests and weaknesses. Engage in group study
              sessions, communicate with peers, and tap into the active
              community for motivation and support.
            </p>
            <br />
            <p>
              Benefit from integrated school platform authorization, webcam
              support, and microphone compatibility. Achieve your goals, track
              your progress with detailed study analytics, and compete for the
              top spot on our dynamic leaderboard.
            </p>
            <br />
            <p>
              Join the millions of users who have unlocked their full potential
              with Flozable. Start today and become #1 in maximizing your focus
              and productivity.
            </p>
          </div>
          <BlobBtn
            onClick={() => {
              window.open(
                "https://apps.apple.com/us/app/flozable/id6739476657"
              );
            }}
          >
            <p>Try it!</p>
          </BlobBtn>
        </div>
        <div className={styles.layer}>
          <div id={styles.phone2}>
            <AppTrial initialSlide={1} />
          </div>
          <div id={styles.phone3}>
            <AppTrial initialSlide={2} />
          </div>
        </div>
      </div>
      <div className={styles.section} id={styles.features}>
        <div className={styles.scroll} id="feature"></div>
        <div className={styles.layer}>
          <div className={styles.title}>
            <h2>App Features</h2>
          </div>
          <div className={styles.subTitle}>
            <p>Awesome Features</p>
          </div>
          <div className={styles.boxes}>
            <Box
              title="Timer and Study Tracker"
              description={`Efficiently manage your time and track your study progress with
                our intuitive timer and study tracker features.`}
            >
              <FontAwesomeIcon icon={faHourglass} />
            </Box>
            <Box
              title="Collaborative Study Groups"
              description={`Connect with like-minded individuals, form study groups, and share ideas to enhance your learning experience.`}
            >
              <FontAwesomeIcon icon={faPeopleGroup} />
            </Box>
            <Box
              title="AI-Based Study Suggestions"
              description={`Receive personalized study suggestions tailored to your interests and goals, powered by our advanced AI model.`}
            >
              <FontAwesomeIcon icon={faRobot} />
            </Box>
            <Box
              title="Active Community"
              description={`Engage with a vibrant community of learners, exchange knowledge, and receive support to stay motivated and inspired.`}
            >
              <FontAwesomeIcon icon={faComments} />
            </Box>
            <Box
              title="Study Analytics"
              description={`Gain insights into your study habits with detailed statistics and trends to improve your productivity.`}
            >
              <FontAwesomeIcon icon={faChartSimple} />
            </Box>
            <Box
              title="Competitive Leaderboard"
              description={`Challenge yourself and others by competing on the leaderboard, fostering a sense of achievement and accountability.`}
            >
              <FontAwesomeIcon icon={faTrophy} />
            </Box>
          </div>
        </div>
      </div>
      <StyleWrapper className={styles.section} id={styles.review}>
        <div className={styles.scroll} id="review"></div>
        <div className={styles.layer}>
          <div className={styles.subTitle}>What Our Client Say!</div>
          <Swiper
            slidesPerView={3}
            loop={true}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            modules={[Pagination, Autoplay]}
            className={styles.swiper}
            autoplay={{ delay: 3000, disableOnInteraction: true }}
            /* onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)} */
            onSnapIndexChange={(swiperCore) => {
              const { realIndex } = swiperCore;
              setActiveIndex(realIndex);
            }}
            ref={reviewsRef}
          >
            {reviews.map((review, i) => {
              return (
                <SwiperSlide key={i} className={styles.swiperSlide}>
                  <Review
                    name={review.name}
                    description={review.description}
                    feedback={review.review}
                    imageSrc={review.imageSrc}
                    isFocused={i === (activeIndex + 1) % reviews.length}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className={styles.buttons}>
            <GradientBtn onClick={handleReviewPrev}>
              <i>
                <FontAwesomeIcon icon={faChevronLeft} />
              </i>
            </GradientBtn>
            <GradientBtn onClick={handleReviewNext}>
              <i>
                <FontAwesomeIcon icon={faChevronRight} />
              </i>
            </GradientBtn>
          </div>
        </div>
      </StyleWrapper>
    </main>
  );
}
