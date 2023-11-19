import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import TopNotification from '../../UI/TopNotification/TopNotification';
import styles from "./EditTemplate.module.css";
import { setGroupMembers, getMyGroups } from './StudyTool';
import MyGroupsViewer from '../../UI/MyGroupsViewer/MyGroupsViewer';
import YouTubePlayer from '../../UI/YouTubePlayer/YouTubePlayer';
import StudyHeader from '../../UI/StudyHeader/StudyHeader';
import PlanTimelineBar from '../../UI/PlanTimelineBar/PlanTimelineBar';
import AddSubjectModal from '../../UI/AddSubjectModal/AddSubjectModal';
import EventModal from '../../UI/EventModal/EventModal';
import { sortSubjects } from '../Stats/StatTools';
import { generateRandomId } from "../../../utils/RandomId";
import SimplePeer from 'simple-peer';
import ToolBoxModal from '../../UI/ToolBoxModal/ToolBoxModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import StudySidebar from '../../UI/StudySidebar/StudySidebar';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function EditTemplate(props) {

}

export default EditTemplate;