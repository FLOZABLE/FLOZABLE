import styles from "./Challenge.module.css";
import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';
import BlobBtn from "../../UI/BlobBtn/BlobBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faComments, faEarthAmericas, faUser } from "@fortawesome/free-solid-svg-icons";
import { Punch } from "../../../utils/svgs";
import LineChart from "../../UI/LineChart";
import { timelineSort } from "../../../utils/timelineSorting";
import RadioBtn from "../../UI/RadioBtn/RadioBtn";
import CalendarModal from "../../UI/CalendarModal/CalendarModal";
import DateSelectorBtn from "../../UI/DateSelectorBtn/DateSelectorBtn";
import GroupsGen from "../../UI/GroupsGen/GroupsGen";
import { DateTime } from "luxon";
import { updateRankingTrend, updateTimeTrend } from "../Stats/StatTools";
import FriendsViewer from "../../UI/FriendsViewer/FriendsViewer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Challenge({ challenges, allMembers, userInfo }) { //challenge data, allMembers (for link of challenger), userInfo

  return (
    <div className={styles.ChallengeContainer}>
        <p>Testing</p>
    </div>
  )
}

export default Challenge;