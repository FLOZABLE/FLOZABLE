"use client";

import styles from "./page.module.css";


function Study() {
  const [isTimerModal, setIsTimerModal] = useState(true);
  const [isPlaylistModal, setIsPlaylistModal] = useState(false);
  const [isMicModal, setIsMicModal] = useState(false);
  const [isCamModal, setIsCamModal] = useState(false);
  const [isPlannerModal, setIsPlannerModal] = useState(false);
  const [isTemplateModal, setIsTemplateModal] = useState(false);
  const [isVolumeModal, setIsVolumeModal] = useState(false);
  const [isZoom, setIsZoom] = useState(false);
  const [isToolModal, setIsToolModal] = useState(false);

  const [videoId, setVideoId] = useState("MYPVQccHhAQ");
  const [volume, setVolume] = useState(0);

  return (
    <div className={styles.Study}>
      <StudyModalContainer
        startPos={dragPos.playlist}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "playlist") }}
        isDisp={isPlaylistModal}
        element={
          <PlaylistModal
            userInfo={userInfo}
            setResponse={setResponse}
          />
        }
      />
      <StudyModalContainer
        startPos={dragPos.subject}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "subject") }}
        isDisp={isTimerModal}
        element={
          <SubjectTimer
            subjects={subjects}
            setSubjects={setSubjects}
            subject={subject}
            setSubject={setSubject}
            isStudy={isStudy}
            setIsStudy={setIsStudy}
            setIsAddSubjectModal={setIsAddSubjectModal}
            isAddSubjectModal={isAddSubjectModal}
            setMyTimerTotal={setMyTimerTotal}
            tutorialBoxRef={tutorialBoxRef}
            tutorialTextRef={tutorialTextRef}
          />
        }
      />
      <StudyModalContainer
        startPos={dragPos.plan}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "plan") }}
        isDisp={isPlannerModal}
        element={
          <PlanTimeline
            plans={events}
            viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
            viewMode={"timeGridDay"}
            subjects={subjects}
            setPlans={setEvents}
            mode={"study"}
            setPlanModal={setPlanModal}
          />
        }
      />
      <StudyModalContainer
        startPos={dragPos.theme}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "theme") }}
        isDisp={isTemplateModal}
        element={
          <ThemeSelector
            link={link}
            handleLinkInput={handleLinkInput}
            setVideoId={setVideoId}
          />
        }
      />
      <StudySubjectTools
        startPos={{ x: "50vw", y: "19vh" }}
        isDisp={isToolModal}
        subject={subject}
      />
      {
        <StudyModalContainer
          startPos={dragPos.music}
          onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "music") }}
          isDisp={isVolumeModal}
          element={
            <MusicModal
              originalVideoVolume={volume}
              setOriginalVideoVolume={setVolume}
              musicFiles={musicFiles}
            />
          }
        />
      }
      <StudySidebar
        setIsPlaylistModal={setIsPlaylistModal}
        isPlaylistModal={isPlaylistModal}
        isTimerModal={isTimerModal}
        isPlannerModal={isPlannerModal}
        isTemplateModal={isTemplateModal}
        isVolumeModal={isVolumeModal}
        isCam={isCam}
        isMic={isMic}
        setIsTimerModal={setIsTimerModal}
        setIsPlannerModal={setIsPlannerModal}
        setIsTemplateModal={setIsTemplateModal}
        setIsVolumeModal={setIsVolumeModal}
        isZoom={isZoom}
        setIsZoom={setIsZoom}
        isHeadphone={isHeadphone}
        setIsHeadphone={setIsHeadphone}
        setIsViewGroups={setIsViewGroups}
        setIsCam={setIsCam}
        setIsMic={setIsMic}
        bringSubjects={bringSubjects}
        isToolModal={isToolModal}
        setIsToolModal={setIsToolModal}
        tutorialBoxRef={tutorialBoxRef}
        tutorialTextRef={tutorialTextRef}
      />
      <div
        className={`StudyMain ${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? "sidebarOpen" : ""
          }`}
      >
        <div
          className={`${styles.myGroupsViewerWrapper} ${isViewGroups ? styles.open : ""
            }`}
        >
          <MyGroupsViewer
            myGroups={myGroups}
            mode={"study"}
            userInfo={userInfo}
            myTimerTotal={myTimerTotal}
            isCam={isCam}
            isMic={isMic}
            setIsChatModal={setIsChatModal}
            groupsViewerRef={groupsViewerRef}
            isHeadphone={isHeadphone}
            setIsCam={setIsCam}
            setIsMic={setIsMic}
          />
        </div>
        <div className={styles.PlanTimelineBarWrapper}>
          {
            <div>
              {
                //<PlanTimelineBar events={events} subjects={subjects} />
              }
              <StudyTimelineBar events={events} subjects={subjects} setPlanModal={setPlanModal} />
            </div>
          }
        </div>
      </div>
      <div className={styles.ytBg}>
        <YouTubePlayer
          height={"100vh"}
          width={"100vw"}
          videoId={videoId}
          volume={volume}
        />
      </div>
    </div>
  );
};

export default Study;