import { SwiperSlide } from "swiper/react";
import styles from "./MyGroupContainer.module.css";
import { useEffect, useState } from "react";
import { StudyPerson } from "../../../utils/svgs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faComments, faGear, faRankingStar } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function MyGroupContainer({ group, isFocus, studyingUsers }) {
  const [slideContent, setSlideContent] = useState(null);

  useEffect(() => {
    if (!group) return;
    const { group_id, average_hr, color, date, explanation, font, goal_hr, leader, max_member, name, visibility, tags, members, likes } = group;
    const tagsArr = JSON.parse(tags);
    const membersArr = members === "" ? [] : members.split(",");
    const likesArr = likes === "" ? [] : likes.split(",");
    setSlideContent(
      <div className={styles.inner}>
      <div className={styles.name}>
        <Link to="/dashboard/study">{name}</Link>
      </div>
      <div className={styles.information}>
        <div className={styles.header}>
          <ul className={styles.status}>
            <li>
              <StudyPerson
                opt1={"#fff"}
                opt2={"#fff"}
                width={"40px"}
                height={"40px"}
              />
              <p>
                {studyingUsers.length}
                /{membersArr.length}
              </p>
            </li>
            <li>
              <FontAwesomeIcon icon={faBullhorn} />
            </li>
            <li>
              <FontAwesomeIcon icon={faRankingStar} />
            </li>
          </ul>
          <div className={styles.right}>
            <FontAwesomeIcon icon={faGear} />
          </div>
        </div>
        <div className={styles.membersContainer}>
          <div className={`${styles.members} customScroll`}>
            {/* {membersArr.map((userId, j) => {
                if (userId === userInfo.user_id) {
                  return (
                    <MyEl
                      memberInfo={memberInfo}
                      key={j}
                      k={j}
                      toggleTimer={toggleTimer}
                      myTimerTotal={myTimerTotal}
                      socket={socket}
                    />
                  );
                } else {
                  return (
                    <MemberEl
                      memberInfo={memberInfo}
                      key={j}
                      k={j}
                      toggleTimer={toggleTimer}
                      socket={socket} 
                      usersTracks={[]}
                    />
                  );
                }
              })} */}
          </div>
        </div>
      </div>
      <div className={styles.buttons}>
        <Link to="/dashboard/study">
          <button>Go to Group</button>
        </Link>
        <button>
          <FontAwesomeIcon icon={faComments} />
        </button>
      </div>
    </div>
    )
  }, [group, isFocus]);
  return (
    <div className={styles.MyGroupContainer}>
      {slideContent}
    </div>
  )
};

export default MyGroupContainer;