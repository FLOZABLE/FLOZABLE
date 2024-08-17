import styles from "./MyGroupContainer.module.css";
import React, { useContext, useEffect, useState } from "react";
import config from "@/app/utils/config";
import Link from "next/link";
import {
  CallOptionsContext,
  GroupsContext,
  ModalsContext,
  UserInfoContext,
} from "@/app/utils/Contexts";
import GroupUrlBtn from "@/app/components/Buttons/GroupUrlBtn/GroupUrlBtn";
import {
  IconMessage,
  IconTimerOutline,
  StudyPerson,
  IconPen,
  IconLeave,
} from "@/app/utils/Svg";
import MembersContainer from "../MembersContainer/MembersContainer";
import { mediaSocket } from "@/app/utils/mediaSocket";
import { Device } from "mediasoup-client";
import { socket } from "@/app/utils/socket";
import { useGroupMembers } from "@/Hooks/groupsHook";

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

function MyGroupContainer({
  group,
  mode,
  leaveGroup,
  setIsEditGroupModal,
  isMine,
  setRightClickedMember,
}) {
  const { isCam, isMic } = useContext(CallOptionsContext);
  const { setChatModal } = useContext(ModalsContext);
  const { setMyGroups } = useContext(GroupsContext);
  const { userInfo } = useContext(UserInfoContext);

  const { groupMembersData, groupMembersIsLoading } = useGroupMembers(
    group?.group_id
  );

  const [studyingMembers, setStudyingMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupTotal, setGroupTotal] = useState(0);

  useEffect(() => {
    if (!groupMembersData?.success) return;

    setMembers(groupMembersData.members);
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
    mediaSocket.emit("getRouterRtpCapabilities", ({ rtpCapabilities }) => {
      console.log("SFU: get rtp capabilities", rtpCapabilities);
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
    getRouterRtpCapabilities();
  }, []);

  useEffect(() => {
    if (!rtpCapabilities) return;
    createDevice();
  }, [rtpCapabilities]);

  useEffect(() => {
    if (!device) return;
    setTimeout(() => {
      createRecvTransport();
      createSendTransport();
    }, 1000);
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
      }
    } else {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      setAudioStream(null);
      mediaSocket.emit("removeMyProducer", { kind: "audio" });
    }
  }, [isMic]);

  useEffect(() => {
    if (!producerTransport || !videoStream) return;
    transportProduce();
  }, [producerTransport, videoStream]);

  useEffect(() => {
    if (!producerTransport || !audioStream) return;
    audioTransportProduce();
  }, [producerTransport, audioStream]);

  useEffect(() => {
    if (!group || !userInfo) return;

    const memberJoinGroup = (groupId, memberInfo) => {
      if (group.group_id !== groupId) return;
      setMembers((prev) => {
        [...prev, memberInfo];
      });
    };

    const memberLeaveGroup = (groupId, memberId) => {
      if (group.group_id !== groupId) return;

      if (memberId === userInfo.user_id) {
        setMyGroups((prev) =>
          prev.filter((group) => group.group_id !== groupId)
        );
      } else {
        setMembers((prev) => prev.filter((user) => user.user_id !== memberId));
      }
    };

    socket.on(`newMemberInfo`, memberJoinGroup);
    socket.on(`removeMember`, memberLeaveGroup);
    return () => {
      socket.off("newMemberInfo", memberJoinGroup);
      socket.off(`removeMember`, memberLeaveGroup);
    };
  }, [group, userInfo]);

  return (
    <div
      className={`${styles.MyGroupContainer} ${
        mode === "study" ? styles.study : ""
      }`}
    >
      <div className={styles.header}>
        <div>
          <div className={`${styles.name} overflowDot`}>{group?.name}</div>
          <div className={styles.info}>
            <div>
              <i>
                <StudyPerson />
              </i>
              <p>
                {studyingMembers.length}/{members.length}
              </p>
            </div>
            <div>
              <i>
                <IconTimerOutline />
              </i>
              <p>{Math.round((groupTotal * 100) / 3600) / 100}hr</p>
            </div>
            <div
              onClick={() => {
                setChatModal((prev) => ({
                  ...prev,
                  chatroom: group.group_id,
                  name: group.name,
                  open: true,
                }));
              }}
            >
              <i>
                <IconMessage />
              </i>
            </div>
            {isMine ? (
              <div />
            ) : (
              <div
                onClick={() => {
                  leaveGroup(group);
                }}
              >
                <i>
                  <IconLeave />
                </i>
              </div>
            )}
          </div>
          {isMine ? (
            <div
              className={styles.editIcon}
              onClick={() => {
                setIsEditGroupModal((prev) => {
                  return prev ? false : group;
                });
              }}
            >
              <i>
                <IconPen />
              </i>
            </div>
          ) : (
            <div />
          )}
        </div>
        <div className={styles.buttons}>
          <div>
            <Link href={`/dashboard/study?group=${group.group_id}`}>
              <button>Go to Group</button>
            </Link>
          </div>
          <div className={styles.urlBtnWrapper}>
            <GroupUrlBtn
              text={`${config.server}/dashboard/groups?joinId=${group.group_id}`}
              copyText="Share"
              bgColor="var(--dark-gray)"
            />
          </div>
        </div>
      </div>
      <div className={`${styles.membersWrapper} customScroll`}>
        <MembersContainer
          members={members}
          group={group}
          setStudyingMembers={setStudyingMembers}
          videoStream={videoStream}
          device={device}
          recvTransport={recvTransport}
          setRightClickedMember={setRightClickedMember}
        />
      </div>
    </div>
  );
}

export default MyGroupContainer;
