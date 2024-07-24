"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import RadioBtn from "@/app/components/Buttons/RadioBtn/RadioBtn";
import Search from "@/app/components/Inputs/Search/Search";
import { DateTime } from "luxon";
import config from "@/app/utils/config";
import CalendarModal from "@/app/components/Modals/CalendarModal/CalendarModal";
import DateSelectorBtn from "@/app/components/Buttons/DateSelectorBtn/DateSelectorBtn";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";
import Link from "next/link";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import { useRouter } from "next/navigation";
import { useGetRankings } from "@/Hooks/rankingsHooks";

function Ranking({ }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [viewer, setViewer] = useState('day');
  const [rankingSearch, setRankingSearch] = useState("");
  const [rankings, setRankings] = useState([]);
  const [allRankings, setAllRankings] = useState([]);
  const [page, setPage] = useState(1);

  const router = useRouter();

  const {data: useRankingsData} = useGetRankings(viewer, viewDate);


  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    const searchPage = parseInt(searchParams.get('page'))
    if (!searchPage) {
      router.push("?page=1", { scroll: false });
      setPage(1);
    }
    else {
      setPage(searchPage);
    }
  }, []);

  useEffect(() => {
      if (!useRankingsData?.success) return;

      setAllRankings(useRankingsData.rankings)
  }, [useRankingsData]);

  useEffect(() => {
    const newState = [];
    for (let i = 0; i < allRankings.length; i++) {
      const r = allRankings[i];
      if (r.name.toLowerCase().includes(rankingSearch.toLowerCase())) {
        newState.push({ ...r, place: i + 1 });
      }
    }
    setRankings(newState)
  }, [allRankings, rankingSearch]);

  useEffect(() => {
    if (rankingSearch.length > 0) {
      setPage(1);
    }
  }, [rankingSearch])

  useEffect(() => {
    router.push(`?page=${page}`, { scroll: false });
  }, [page]);

  return (
    <div>
      <CalendarModal
        isOpen={isCalendarOpen}
        setIsOpen={setIsCalendarOpen}
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
                    { view: "day", value: "day" },
                    { view: "week", value: "week" },
                    { view: "month", value: "month" },
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
                  {rankings.slice((page - 1) * 50, page * 50).map(({ study_time, name, user_id, timezone, place }, i) => {
                    return (
                      <li key={i}>
                        <div className={styles.circle}>
                          <p>{place}</p>
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
                            <p>{(study_time / (60 * 60)).toFixed(2)}hr</p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className={styles.PageButtons}>
                  {
                    page > 1 ?
                      <button onClick={() => setPage(page - 1)}>
                        &lt; Back
                      </button>
                      :
                      <div></div>
                  }
                  <span className={styles.textContainer}>Page {page}</span>
                  {
                    page * 50 < rankings.length ?
                      <button onClick={() => { setPage(page + 1) }} >
                        Next &gt;
                      </button>
                      :
                      <div></div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ranking;