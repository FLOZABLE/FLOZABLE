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
import AppTrial from "./components/Others/AppTrial/AppTrial";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faComment,
  faComments,
  faHourglass,
  faPeopleGroup,
  faRobot,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";

function Box({ children, title, description }) {
  return (
    <div className={styles.Box}>
      <div className={styles.icon}>{children}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

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
        <div id={styles.mainViewer}>
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
            <AppTrial />
          </div>
        </div>
        <div id={styles.about} className={styles.section}>
          <div className={styles.layer}>
            <div className={styles.title}>
              <h2>About App</h2>
            </div>
            <div className={styles.subTitle}>
              <p>#1 App for Empowering Your Focus and Productivity</p>
            </div>
            <div className={styles.description}>
              <p>
                Flozable is the #1 app that empowers you to regain control of
                your time and boost productivity. With innovative features and
                an interactive community, Flozable is your ultimate tool for
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
                Join the millions of users who have unlocked their full
                potential with Flozable. Start today and become #1 in maximizing
                your focus and productivity.
              </p>
            </div>
            <BlobBtn>
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
      </div>
      <div className={styles.section} id={styles.features}>
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
    </main>
  );
}
