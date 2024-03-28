"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import RadioBtn from "@/Components/Buttons/RadioBtn/RadioBtn";
import Search from "@/Components/Inputs/Search/Search";
import { useSearchParams } from "next/navigation";
import { DateTime } from "luxon";
import config from "@/utils/config";
import CalendarModal from "@/Components/Modals/CalendarModal/CalendarModal";
import DateSelectorBtn from "@/Components/Buttons/DateSelectorBtn/DateSelectorBtn";
import ProfileImage from "@/Components/Users/ProfileImage/ProfileImage";
import Link from "next/link";
import CountryViewer from "@/Components/Others/CountryViewer/CountryViewer";

function Ranking({ }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [viewer, setViewer] = useState('Daily');
  const [rankingSearch, setRankingSearch] = useState("");
  const searchParams = useSearchParams({ page: 1 });
  const [rankings, setRankings] = useState([]);
  const [selectedRanking, setSelectedRanking] = useState([]);

  useEffect(() => {
    const viewDateTime = DateTime.fromJSDate(viewDate);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetch(`${config.server}/ranking/sort?mode=${viewer}&date=${viewDateTime.toISODate()}&timezone=${timezone}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setRankings(data.data);
        }
      })
      .catch((error) => console.error(error));
  }, [viewDate, viewer]);

  return (
    <div>
      <CalendarModal
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
        updateViewDate={setViewDate}
        viewDate={viewDate}
        showHeatmap={true}
      />
      <div
        className={`Main`}
      >
        <div className="title">Ranking</div>
        <div className={styles.Ranking}>
          <div className={styles.boxes}>
            <div className={styles.box} id="daily">
              <div className={styles.buttonArea}>
                <DateSelectorBtn
                  viewMode={viewer}
                  className={styles.title}
                  viewDate={viewDate}
                  isCalendarOpen={isCalendarOpen}
                  setIsCalendarOpen={setIsCalendarOpen}
                />
                <RadioBtn
                  items={[
                    { view: "Daily", value: "Daily" },
                    { view: "Weekly", value: "Weekly" },
                    { view: "Monthly", value: "Monthly" },
                  ]}
                  changeEvent={setViewer}
                  defaultViewer={0}
                />
              </div>
              <div className={`${styles.container} ${styles.Ranking}`}>
                <Search
                  className={styles.Search}
                  searchQuery={rankingSearch}
                  setSearchQuery={setRankingSearch}
                />
                <div className={styles.header}>
                  <p>Hours</p>
                </div>
                <ul>
                  {rankings.map(({ t, name, user_id, timezone }, i) => {
                  return (
                    <li key={i}>
                      <div className={styles.circle}>
                        <p>{i + 1}</p>
                      </div>
                      <div className={styles.userInfo}>
                        <ProfileImage 
                          userId={user_id}
                        />
                        <Link href={`/dashboard/user/${user_id}`} className={styles.profileInfo}>
                          <p className={styles.name}>{name}</p>
                          <CountryViewer timezone={timezone} />
                        </Link>
                        <div className={styles.ranking}>
                          <p>{(t / (60 * 60)).toFixed(2)}hr</p>
                        </div>
                      </div>
                    </li>
                  )
                })}
                </ul>
                {/* <div className={styles.PageButtons}>
                  {parseInt(searchParams.get("page")) > 1 ? (
                    <button
                      onClick={() => {
                        setSearchParams({
                          page: parseInt(searchParams.get("page")) - 1,
                        });
                      }}
                    >
                      &lt; Back
                    </button>
                  ) : (
                    <div></div>
                  )}
                  <span className={styles.textContainer}>
                    Page {searchParams.get("page")}
                  </span>
                  {parseInt(searchParams.get("page")) * 50 < resultCount ? (
                    <button
                      onClick={() => {
                        setSearchParams({
                          page: parseInt(searchParams.get("page")) + 1,
                        });
                      }}
                    >
                      Next &gt;
                    </button>
                  ) : (
                    <div></div>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ranking;