import { useCallback, useEffect, useState } from "react";
import styles from "./MembersContainer.module.css";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";
import { mediaSocket } from "../../../mediaSocket";
import { Device } from "mediasoup-client";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MembersContainer({isFocus, userInfo, groupInfo, socket, setStudyingMembers, members, setMembers, isCam, isMic}) {
  const [membersEl, setMembersEl] = useState([]);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [localStream, setLocalStream] = useState(null);
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
  mediaSocket.emit("getRouterRtpCapabilities", ({rtpCapabilities}) => {
    setRtpCapabilities(rtpCapabilities);
    console.log(`getRouterRtpCapabilities:`, rtpCapabilities);
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
    console.log(device, rtpCapabilities, 'trp' )
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
    async({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }

      /**
       * Replicate the send transport on the client-side.
       * The `device.createSendTransport` method creates a send transport instance on the client-side
       * using the parameters provided by the server.
       */
      let transport = device.createRecvTransport(params);
      console.log('consumer transport',transport)


      transport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          try {
            console.log("----------> consumer transport has connected");
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

      transport.on(
        "consume",
        async (parameters, callback, errback) => {
          const { kind, rtpParameters } = parameters;

          console.log("----------> transport-consume");

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
        }
      );

      setRecvTransport(transport);
    }
  );
};

useEffect(() => {
  if (!isFocus) return;
  getRouterRtpCapabilities();
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
    const {group_id} = groupInfo;
    fetch(`${serverOrigin}/api/groups/members?groupId=${group_id}`, {
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
    if (isCam || isMic) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
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
        .then(async(stream) => {
          setLocalStream(stream);
          try {
          } catch (err) {
            console.log(err);
          }
        });
    };
  }, [isCam, isMic]);

  useEffect(() => {
    if (!userInfo) return;
    setMembersEl(members.map((memberInfo, i) => {
      if (userInfo.user_id === memberInfo.user_id) {
        return (
          <MyEl 
          memberInfo={memberInfo}
          key={i}
          socket={socket}
          setStudyingMembers={setStudyingMembers}
          localStream={localStream}
          isFocus={isFocus}
          device={device}
          />
        )
      } else {
        return (
          <MemberEl 
          memberInfo={memberInfo}
          key={i}
          socket={socket}
          setStudyingMembers={setStudyingMembers}
          isFocus={isFocus}
          device={device}
          recvTransport={recvTransport}
          />
        )
      }
    }));
  }, [members, localStream, userInfo, isFocus, device, recvTransport]);

  return (
    <div className={styles.MembersContainer}>
      {membersEl}
    </div>
  )
};

export default MembersContainer;