import React, { useCallback, useEffect, useState } from "react";
import styles from "./MembersContainer.module.css";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";
import { mediaSocket } from "../../../mediaSocket";
import { Device } from "mediasoup-client";

const serverOrigin = process.env.REACT_APP_ORIGIN;
window.localStorage.setItem('debug', 'mediasoup-client:WARN* mediasoup-client:ERROR*');

function MembersContainer({ isFocus, userInfo, groupInfo, setStudyingMembers, members, setMembers, isCam, isMic, isHeadphone }) {
  const [membersEl, setMembersEl] = useState([]);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [device, setDevice] = useState(null);
  const [recvTransport, setRecvTransport] = useState(null);
  /**
 * Step 1: Retrieve the Router's RTP Capabilities.
 * This function requests the router's RTP capabilities from the server,
 * which are essential to configure the mediasoup Device.
 * The router's RTP capabilities describe the codecs and RTP parameters supported by the router.
 * This information is crucial for ensuring that the Device is compatible with the router.
 */
  const getRouterRtpCapabilities = async () => {
    mediaSocket.emit("getRouterRtpCapabilities", ({ rtpCapabilities }) => {
      console.log('SFU: get rtp capabilities', rtpCapabilities)
      setRtpCapabilities(rtpCapabilities);
    });
  };

  /**
   * Step 2: Create and Initialize the mediasoup Device.
   * This function creates a new mediasoup Device instance and loads the router's RTP capabilities into it.
   * The Device is a client-side entity that provides an API for managing sending/receiving media with a mediasoup server.
   * Loading the router's RTP capabilities ensures that the Device is aware of the codecs and RTP parameters it needs to use
   * to successfully send and receive media with the server.
   *
   * If the Device is unable to load the router's RTP capabilities (e.g., due to an unsupported browser),
   * an error is logged to the console.
   */
  const createDevice = async () => {
    try {
      const device = new Device();

      await device.load({ routerRtpCapabilities: rtpCapabilities });
      setDevice(device);
    } catch (error) {
      console.log(error);
      if (error.name === "UnsupportedError") {
        console.error("Browser not supported");
      }
    }
  };


  /**
   * this function is used for creating receiving transport
   */
  const createRecvTransport = async () => {
    // Request the server to create a send transport
    mediaSocket.emit(
      "createTransport",
      { sender: false },
      async ({ params }) => {
        if (params.error) {
          console.log(params.error);
          return;
        }

        /**
         * Replicate the send transport on the client-side.
         * The `device.createSendTransport` method creates a send transport instance on the client-side
         * using the parameters provided by the server.
         */
        const transport = await device.createRecvTransport(params);
        console.log('create recv transport', transport);
        await transport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            console.log("transport connect")
            try {
              // Notify the server that the transport is ready to connect with the provided DTLS parameters
              await mediaSocket.emit("transport-recv-connect", { dtlsParameters });
              // Callback to indicate success
              callback();
            } catch (error) {
              // Errback to indicate failure
              errback(error);
            }
          }
        );

        setRecvTransport(transport);
      }
    );
  };

  useEffect(() => {
    if (!isFocus) return;
    setTimeout(() => {
      getRouterRtpCapabilities();
    }, 1000);
  }, [isFocus]);

  useEffect(() => {
    if (!rtpCapabilities) return;
    createDevice();
  }, [rtpCapabilities]);

  useEffect(() => {
    if (!device || !isFocus) return;
    createRecvTransport();
  }, [device, isFocus]);

  useEffect(() => {
    if (!userInfo || !groupInfo || !isFocus) return;
    const { group_id } = groupInfo;
    fetch(`${serverOrigin}/groups/members?groupId=${group_id}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMembers(data.membersData);
        };
      })
      .catch((error) => console.error(error));
  }, [isFocus, userInfo, groupInfo]);

  useEffect(() => {

    if (isCam) {
      try {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              width: {
                min: 640,
                max: 1920,
              },
              height: {
                min: 400,
                max: 1080,
              }
            }
          })
          .then(async (stream) => {
            setVideoStream(stream);
          });
      } catch (err) {
        console.log(err);
      };
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      setVideoStream(null);
      mediaSocket.emit("removeMyProducer", { kind: 'video' });
    };
  }, [isCam]);

  useEffect(() => {

    if (isMic) {
      try {
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
          })
          .then(async (stream) => {
            setAudioStream(stream);
          });
      } catch (err) {
        console.log(err);
      };
    } else {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      setAudioStream(null);
      mediaSocket.emit("removeMyProducer", { kind: 'audio' });
    };
  }, [isMic]);

  useEffect(() => {
    if (!userInfo || !isFocus) return;
    const studyingMembers = [];
    const newMembers = JSON.parse(JSON.stringify(members));
    newMembers.map((member, i) => {
      if (member.activeSubject && member.activeSubject.id !== '0') {
        newMembers.splice(i, 1);
        studyingMembers.push(member);
      }
    });

    newMembers.sort((a, b) => parseInt(b.totalTime) - parseInt(a.totalTime));
    const now = Math.floor(new Date().getTime() / 1000);
    studyingMembers.sort((a, b) => parseInt(b.totalTime) + now - parseInt(b.activeSubject.time) - (parseInt(a.totalTime) + now - parseInt(a.activeSubject.time)))
    const totalMembers = studyingMembers.concat(newMembers);
    setMembersEl(totalMembers.map((memberInfo, i) => {
      if (userInfo.user_id === memberInfo.user_id) {
        return (
          <MyEl
            memberInfo={memberInfo}
            key={i}
            setStudyingMembers={setStudyingMembers}
            videoStream={videoStream}
            audioStream={audioStream}
            isFocus={isFocus}
            device={device}
          />
        )
      } else {
        return (
          <MemberEl
            memberInfo={memberInfo}
            key={i}
            setStudyingMembers={setStudyingMembers}
            isFocus={isFocus}
            device={device}
            recvTransport={recvTransport}
            isHeadphone={isHeadphone}
          />
        )
      }
    }));
    setStudyingMembers(studyingMembers);
  }, [members, videoStream, audioStream, userInfo, isFocus, device, recvTransport, isHeadphone]);

  return (
    <div className={styles.MembersContainer}>
      {membersEl}
    </div>
  )
};

export default MembersContainer;