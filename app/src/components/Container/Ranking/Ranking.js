import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from "luxon";
import StatsCalendar from '../../UI/StatsCalendar/StatsCalendar';
import StuckModal from '../../UI/StuckModal/StuckModal';
import RadioBtn from '../../UI/RadioBtn/RadioBtn';
import styles from './Ranking.module.css';
import SmallCalendar from '../../UI/SmallCalendar/SmallCalendar';
import Search from '../../UI/Search/Search';
import CalendarModal from '../../UI/CalendarModal/CalendarModal';
import DateSelectorBtn from '../../UI/DateSelectorBtn/DateSelectorBtn';
import { Link } from 'react-router-dom';
import CountryViewer from '../../UI/CountryViewer/CountryViewer';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Ranking({ isSidebarOpen, isSidebarHovered }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [viewer, setViewer] = useState('Daily');
  const [rankingEl, setRankingEl] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [rankingSearch, setRankingSearch] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [resultStart, setResultStart] = useState(0);
  const [resultEnd, setResultEnd] = useState(50);
  const [resultCount, setResultCount] = useState(0);

  let [searchParams, setSearchParams] = useSearchParams({ page: 1 });

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const updateViewer = (data) => {
    setViewer(data);
  }

  const updateViewDate = (date) => {
    setViewDate(date);

  };

  //fetch new ranking
  useEffect(() => {
    const viewDateTime = DateTime.fromJSDate(viewDate);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetch(`${serverOrigin}/ranking/sort?mode=${viewer}&date=${viewDateTime.toISODate()}&timezone=${timezone}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log(data, 'new ranking');
          setRanking(data.data);
          setResultCount(data.data.length);
        }
      })
      .catch((error) => console.error(error));
  }, [viewDate, viewer]);

  useEffect(() => {
    if (!searchParams.get('page')) {
      setSearchParams({ ...searchParams, page: 1 });
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('page') != 1) {
      setSearchParams({ ...searchParams, page: 1 });
    }
  }, [rankingSearch])

  useEffect(() => {
    let shownResults = 0;
    let allResults = 0;
    setRankingEl(ranking.map(({ t, name, user_id, timezone }, i) => {
      allResults += 1;
      if (rankingSearch.length === 0) {
        if (i < (searchParams.get('page') - 1) * 50 || i >= (searchParams.get('page')) * 50) return;
      }
      else {
        if (!name.toLowerCase().includes(rankingSearch.toLowerCase())) return;
        shownResults += 1;
        if (shownResults < (searchParams.get('page') - 1) * 50 || shownResults >= (searchParams.get('page')) * 50) return;
      }
      return (
        <li key={i}>
          <div className={styles.circle}>
            <p>{i + 1}</p>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.profileImg}
              style={{
                backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`, backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* <FontAwesomeIcon icon={faUser} /> */}
            </div>
            <Link to={`/dashboard/user/${user_id}`} className={styles.profileInfo}>
              <p className={styles.name}>{name}</p>
              <CountryViewer timezone={timezone} />
            </Link>
            <div className={styles.ranking}>
              <p>{(t / (60 * 60)).toFixed(2)}hr</p>
            </div>
          </div>
        </li>
      )
    }));

    if (rankingSearch.length == 0) {
      setResultCount(allResults);
    }
    else {
      setResultCount(shownResults);
    }
  }, [ranking, rankingSearch, searchParams]);

  return (
    <div>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} showHeatmap={false} subjects={[]} />
      <div className={`Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className="title">
          Ranking
        </div>
        <div className={styles.Ranking}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <DateSelectorBtn className={styles.title} viewMode={viewer} startDate={startDate} endDate={endDate} viewDate={viewDate} isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen}></DateSelectorBtn>
              <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
            </div>
            <div className={`${styles.container} ${styles.Ranking}`}>
              <Search className={styles.Search} searchQuery={rankingSearch} setSearchQuery={setRankingSearch}></Search>
              <div className={styles.header}>
                <p>Hours</p>
              </div>
              <ul>
                {rankingEl}
              </ul>
              <div className={styles.PageButtons}>
                {
                  parseInt(searchParams.get('page')) > 1 ?
                    <button onClick={() => { setSearchParams({ 'page': parseInt(searchParams.get('page')) - 1 }) }}>
                      &lt; Back
                    </button>
                    :
                    <div></div>
                }
                <span className={styles.textContainer}>Page {searchParams.get('page')}</span>
                {
                  parseInt(searchParams.get('page')) * 50 < resultCount ?
                    <button onClick={() => { setSearchParams({ 'page': parseInt(searchParams.get('page')) + 1 }) }}>
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
  )
}

export default Ranking;