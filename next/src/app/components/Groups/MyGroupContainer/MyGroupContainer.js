import styles from "./MyGroupContainer.module.css";
import React, { useContext, useEffect, useState } from "react";
import config from "@/app/utils/config";
import Link from "next/link";
import {
  CallOptionsContext,
  EditGroupModalContext,
} from "@/app/utils/Contexts";
import GroupUrlBtn from "@/app/components/Buttons/GroupUrlBtn/GroupUrlBtn";
import { IconTimerOutline, IconPen, IconLeave } from "@/app/utils/Svg";
import MembersContainer from "../MembersContainer/MembersContainer";
import { mediaSocket } from "@/app/utils/mediaSocket";
import { Device } from "mediasoup-client";
import { socket } from "@/app/utils/socket";
import { useGroupMembers } from "@/Hooks/groupsHook";
import { secondConverter } from "@/app/utils/Tool";
import MembersStatus from "../MembersStatus/MembersStatus";
import { faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ACTIVE_GROUP_DEBOUNCE } from "@/app/utils/Constant";
import Skeleton from "react-loading-skeleton";
import ChatModalBtn from "../../Buttons/ChatModalBtn/ChatModalBtn";
import { DateTime } from "luxon";

const videoParams = {
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

const audioParams = {
  encodings: [{ maxBitrate: 900000 }],
};

function MyGroupContainer({ group, isAdmin, isActive, leaveGroup }) {
  const { isCam, isMic } = useContext(CallOptionsContext);
  const { setEditGroupModal } = useContext(EditGroupModalContext);

  const { groupMembersData, groupMembersIsLoading, updateGroupMembers } =
    useGroupMembers(group?.group_id, isActive);

  const [totalTime, setTotalTime] = useState("0 h");

  useEffect(() => {
    if (!groupMembersData.length) return;
    const totalTime = groupMembersData.reduce(
      (partialTime, a) => partialTime + a.study_time,
      0
    );
    const membersAvg = Math.floor(totalTime / groupMembersData.length);
    const formattedValue = secondConverter({ sec: membersAvg });
    setTotalTime(formattedValue);
  }, [groupMembersData]);

  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [device, setDevice] = useState(null);
  const [recvTransport, setRecvTransport] = useState(null);

  const [producerTransport, setProducerTransport] = useState(null);

  /**
   * Step 1: Retrieve the Router's RTP Capabilities.
   * This function requests the router's RTP capabilities from the server,
   * which are essential to configure the mediasoup Device.
   * The router's RTP capabilities describe the codecs and RTP parameters supported by the router.
   * This information is crucial for ensuring that the Device is compatible with the router.
   */
  const getRouterRtpCapabilities = async () => {
    return new Promise((resolve, reject) => {
      mediaSocket.emit("getRouterRtpCapabilities", ({ rtpCapabilities }) => {
        if (rtpCapabilities) {
          console.log("SFU: get rtp capabilities", rtpCapabilities);
          setRtpCapabilities(rtpCapabilities);
          resolve(rtpCapabilities);
        } else {
          reject(new Error("Failed to get RTP capabilities"));
        }
      });
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
      console.log("SFU: device", device);
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
        console.log("SFU: create recv transport", transport);
        setTimeout(() => {
          mediaSocket.emit("getRoomProducers");
        }, ACTIVE_GROUP_DEBOUNCE + 500);
        await transport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            console.log("SFU: transport connect");
            try {
              // Notify the server that the transport is ready to connect with the provided DTLS parameters
              await mediaSocket.emit("transport-recv-connect", {
                dtlsParameters,
              });
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
    if (!isActive) {
      return;
    }

    //retry getting router rtp capabilities every 1 sec until it succeeds.
    let intervalId = setInterval(async () => {
      console.log("isactive:", isActive);
      if (!isActive) return;
      const rtpCapabilities = await getRouterRtpCapabilities();

      if (rtpCapabilities) {
        clearInterval(intervalId);
      }
    }, 1000);
  }, [isActive]);

  useEffect(() => {
    if (!rtpCapabilities) return;
    createDevice();
  }, [rtpCapabilities]);

  useEffect(() => {
    if (!device) return;
    setTimeout(() => {
      createRecvTransport();
      createSendTransport();
    }, ACTIVE_GROUP_DEBOUNCE + 500);
  }, [device]);

  /**
   * Step 3: Create a Transport for Sending Media.
   * This function initiates the creation of a transport on the server-side for sending media,
   * and then replicates the transport on the client-side using the parameters returned by the server.
   */
  const createSendTransport = async () => {
    console.log("createSendTransport");
    // Request the server to create a send transport
    mediaSocket.emit(
      "createTransport",
      { sender: true },
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
        const transport = await device.createSendTransport(params);
        // Update the state to hold the reference to the created transport
        /* setParams(params); */

        /**
         * Event handler for the "connect" event on the transport.
         * This event is triggered when the transport is ready to be connected.
         * The `dtlsParameters` are provided by the transport and are required to establish
         * the DTLS connection between the client and the server.
         * This event it emitted as a result of calling the `producerTransport?.produce(params)`
         * method in the next step. The event will only be emitted if this is the first time
         */
        await transport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              // Notify the server that the transport is ready to connect with the provided DTLS parameters
              await mediaSocket.emit("transport-connect", { dtlsParameters });
              // Callback to indicate success
              callback();
            } catch (error) {
              // Errback to indicate failure
              errback(error);
            }
          }
        );

        /**
         * Event handler for the "produce" event on the transport.
         * This event is triggered when the transport is ready to start producing media.
         * The `parameters` object contains the necessary information for producing media,
         * including the kind of media (audio or video) and the RTP parameters.
         * The event is emitted as a result of calling the `producerTransport?.produce(params)`
         * method in the next step.
         */
        await transport.on("produce", async (parameters, callback, errback) => {
          const { kind, rtpParameters, appData } = parameters;

          try {
            // Notify the server to start producing media with the provided parameters
            mediaSocket.emit(
              "transport-produce",
              { kind, rtpParameters },
              ({ id }) => {
                // Callback to provide the server-generated producer ID back to the transport
                callback({ id });
              }
            );
          } catch (error) {
            // Errback to indicate failure
            errback(error);
          }
        });

        setProducerTransport(transport);
      }
    );
  };

  const transportProduce = async () => {
    const track = await videoStream.getVideoTracks()[0];
    const localProducer = await producerTransport.produce({
      track,
      ...videoParams,
    });
    localProducer.on("trackended", () => {
      console.log("video track ended");
    });
    localProducer.on("transportclose", () => {
      console.log("video transport ended");
    });
    console.log("SFU: local video producer", localProducer, track);
  };

  const audioTransportProduce = async () => {
    const track = await audioStream.getAudioTracks()[0];
    const localProducer = await producerTransport.produce({
      track,
      ...audioParams,
    });
    localProducer.on("trackended", () => {
      console.log("audio track ended");
    });
    localProducer.on("transportclose", () => {
      console.log("audio transport ended");
    });
    console.log("local audio producer", localProducer);
  };

  useEffect(() => {
    if (isCam && isActive) {
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
              },
            },
          })
          .then(async (stream) => {
            setVideoStream(stream);
          });
      } catch (err) {
        console.log(err);
      }
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      setVideoStream(null);
      mediaSocket.emit("removeMyProducer", { kind: "video" });
    }

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      setVideoStream(null);
      mediaSocket.emit("removeMyProducer", { kind: "video" });
    };
  }, [isCam, isActive]);

  useEffect(() => {
    if (isMic && isActive) {
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
      }
    } else {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      setAudioStream(null);
      mediaSocket.emit("removeMyProducer", { kind: "audio" });
    }

    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      setAudioStream(null);
      mediaSocket.emit("removeMyProducer", { kind: "audio" });
    };
  }, [isMic, isActive]);

  useEffect(() => {
    if (!producerTransport || !videoStream) return;
    transportProduce();
  }, [producerTransport, videoStream]);

  useEffect(() => {
    if (!producerTransport || !audioStream) return;
    audioTransportProduce();
  }, [producerTransport, audioStream]);

  useEffect(() => {
    if (!group) return;

    const onNewMember = ({ groupId, userInfo }) => {
      console.log("newMember", groupId, userInfo);
      if (group.group_id !== groupId) return;

      updateGroupMembers((prev) => [...prev, userInfo], groupId);
    };

    const onRemoveMember = ({ groupId, userId }) => {
      if (!group.group_id === groupId) return;

      updateGroupMembers(
        (prev) => prev.filter((member) => member.user_id !== userId),
        groupId
      );
    };

    const onStudying = ({ userId, subject }) => {
      updateGroupMembers((prev) => {
        const memberIndex = prev.findIndex(
          (member) => member.user_id === userId
        );
        if (memberIndex === -1) return prev;

        const newGroupMembers = [...prev];
        newGroupMembers[memberIndex] = {
          ...newGroupMembers[memberIndex],
          activeSubject: subject,
        };

        return newGroupMembers;
      }, group.group_id);
    };

    const onStopStudying = ({ userId, subject, duration }) => {
      updateGroupMembers((prev) => {
        const memberIndex = prev.findIndex(
          (member) => member.user_id === userId
        );
        if (memberIndex === -1) return prev;

        const newGroupMembers = [...prev];
        const study_time = newGroupMembers[memberIndex].study_time + duration;
        newGroupMembers[memberIndex] = {
          ...newGroupMembers[memberIndex],
          activeSubject: subject,
          study_time,
        };

        return newGroupMembers;
      }, group.group_id);
    };

    socket.on("newMember", onNewMember);
    socket.on("removeMember", onRemoveMember);
    socket.on("studying", onStudying);
    socket.on("stopStudying", onStopStudying);
    return () => {
      socket.off("newMember", onNewMember);
      socket.off("removeMember", onRemoveMember);
      socket.off("studying", onStudying);
      socket.off("stopStudying", onStopStudying);
    };
  }, [group]);

  return (
    <div className={styles.MyGroupContainer}>
      <div className={styles.header}>
        <div className={`${styles.name} overflowDot`}>{group.name}</div>
        <div className={styles.info}>
          <div>
            <i>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <p>
              {groupMembersIsLoading
                ? group.members.length
                : groupMembersData.length}
            </p>
          </div>
          <div>
            <i>
              <IconTimerOutline />
            </i>
            <p>{totalTime}</p>
          </div>
          <div>
            <ChatModalBtn chatroomId={group.group_id} />
          </div>
          {isAdmin ? (
            <div
              onClick={() => {
                setEditGroupModal({ opened: true, group_id: group.group_id });
              }}
            >
              <i>
                <IconPen />
              </i>
            </div>
          ) : (
            <div
              onClick={() => {
                leaveGroup(group.group_id);
              }}
            >
              <i>
                <IconLeave />
              </i>
            </div>
          )}
        </div>
      </div>
      <div className={styles.MembersStatus}>
        <MembersStatus groupId={group.group_id} members={groupMembersData} />
      </div>
      <div className={`hiddenScroll ${styles.MembersContainer}`}>
        {isActive && !groupMembersIsLoading ? (
          <MembersContainer
            members={groupMembersData}
            group={group}
            videoStream={videoStream}
            device={device}
            recvTransport={recvTransport}
          />
        ) : (
          <div className={styles.memberSkeletons}>
            {group.members.map((_, i) => (
              <Skeleton key={i} className={styles.memberSkeleton} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.buttons}>
        <div>
          <Link href={`/dashboard/study?group=${group.group_id}`}>
            Go to Group
          </Link>
        </div>
        <GroupUrlBtn
          text={`${config.static_server}/dashboard/groups?groupId=${group.group_id}`}
          copyText="Share"
          bgColor="var(--dark-gray)"
        />
      </div>
    </div>
  );
}

export default MyGroupContainer;
