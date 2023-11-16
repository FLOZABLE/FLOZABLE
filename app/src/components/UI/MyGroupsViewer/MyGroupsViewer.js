import React, { useRef, useState, useEffect, useId, useCallback } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import styles from "./MyGroupsViewer.module.css";
import MemberTimer from "../MemberTimer/MemberTimer";
import SimplePeer from 'simple-peer';
import { faBullhorn, faBullseye, faComments, faGear, faHeart, faPeopleGroup, faRankingStar, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";
import { mediaSocket } from '../../../mediaSocket'
import { Device } from 'mediasoup-client';

let device
let rtpCapabilities
let producerTransport
let consumerTransports = []
let audioProducer
let videoProducer
let consumer
let isProducer = false

// https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
// https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
let params = {
  // mediasoup params
  encodings: [
    {
      rid: 'r0',
      maxBitrate: 100000,
      scalabilityMode: 'S1T3',
    },
    {
      rid: 'r1',
      maxBitrate: 300000,
      scalabilityMode: 'S1T3',
    },
    {
      rid: 'r2',
      maxBitrate: 900000,
      scalabilityMode: 'S1T3',
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000
  }
}

let audioParams;
let videoParams = { params };
let consumingTransports = [];

function MyGroupsViewer(props) {
  const { myGroups, socket, userInfo, myTimerTotal, isCam, isMic, mode } = props;

  const [toggleTimer, setToggleTimer] = useState({ id: 0, status: 0 });
  const [groupStudying, setGroupStudying] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  useEffect(() => {
    mediaSocket.connect();
    socket.on("studying", onStudying);
    socket.on("stopStudying", onStopStudying);
    return () => {
      socket.off("studying", onStudying);
      socket.off("stopStudying", onStopStudying);
    };
  }, []);

  useEffect(() => {
    setGroupStudying(
      Object.fromEntries(myGroups.map((group) => {
        const members = [];
        group.members.map(member => {
          if (member.study.study) {
            members.push(member.user_id);
          };
        });
        return [group.group_id, { members: members }]
      }))
    );
  }, [myGroups]);

  const onStudying = (userId, groups) => {
    
    setToggleTimer({ id: userId, status: 1 });
    
    groups.forEach((group) => {
      
      setGroupStudying((prevGroupStudying) => {
        const updatedGroupStudying = { ...prevGroupStudying };
        
        if (updatedGroupStudying[group] && !updatedGroupStudying[group].members.includes(userId)) {
          updatedGroupStudying[group].members.push(userId);
        };
        return updatedGroupStudying;
      });
    });
  };

  const onStopStudying = (userId, groups) => {
    setToggleTimer({ id: userId, status: 0 });
    groups.forEach((group) => {
      setGroupStudying((prevGroupStudying) => {
        const updatedGroupStudying = { ...prevGroupStudying };
        if (updatedGroupStudying[group]) {
          const index = updatedGroupStudying[group].members.indexOf(userId);
          if (index !== -1) {
            updatedGroupStudying[group].members.splice(index, 1);
          }
        }
        return updatedGroupStudying;
      });
    });
  };

  //reset zone
  const [test, setTest] = useState(null);
  const [usersTracks, setUsersTracks] = useState([]);
  const videoRef = useRef(null);
/*   useEffect(() => {
    if (isCam) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then(async(stream) => {
          setLocalStream(stream);
          try {
            videoParams = { track: stream.getVideoTracks()[0], ...videoParams };
          const videoProducer = await producerTransport.produce(videoParams);
          } catch (err) {
            
          }
        });
    };
  }, [isCam]);

  useEffect(() => {
    if (isMic) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(async(stream) => {
          setLocalStream(stream);
          try {
            audioParams = { track: stream.getAudioTracks()[0], ...audioParams };
            const audioProducer = await producerTransport.produce(audioParams);
          } catch (err) {
            
          }
        });
    };
  }, [isMic]); */
  useEffect(() => {
    if (isCam || isMic) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
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
            videoParams = { track: stream.getVideoTracks()[0], ...videoParams };
          const videoProducer = await producerTransport.produce(videoParams);
          audioParams = { track: stream.getAudioTracks()[0], ...audioParams };
          const audioProducer = await producerTransport.produce(audioParams);
          } catch (err) {
            
          }
        });
    };
  }, [isCam, isMic]);

  useEffect(() => {
    if (!myGroups.length) return;
    let selectedGroup;
    if (isNaN(selectedGroupIndex)) {
      selectedGroup = myGroups[0] ? myGroups[0] : false;
    } else if (myGroups[selectedGroupIndex]) {
      selectedGroup = myGroups[selectedGroupIndex];
    };
    mediaSocket.emit('changeGroup', selectedGroup ? selectedGroup.group_id : 0, (data) => {
      
      // we assign to local variable and will be used when
      // loading the client Device (see createDevice above)
      /* setRtpCapabilities(data.rtpCapabilities);
  
      // once we have rtpCapabilities from the Router, create Device
      createDevice(data.rtpCapabilities) */
      rtpCapabilities = data.rtpCapabilities;
      createDevice();
    });
  }, [selectedGroupIndex, myGroups]);
  const createDevice = async () => {
    try {
      device = new Device()
  
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
      // Loads the device with RTP capabilities of the Router (server side)
      await device.load({
        // see getRtpCapabilities() below
        routerRtpCapabilities: rtpCapabilities
      })
  
      
  
      // once the device loads, create transport
      createSendTransport();
    } catch (error) {
      
      if (error.name === 'UnsupportedError')
        console.warn('browser not supported')
    }
  }
  
  const createSendTransport = () => {
    // see server's socket.on('createWebRtcTransport', sender?, ...)
    // this is a call from Producer, so sender = true
    mediaSocket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      // The server sends back params needed 
      // to create Send Transport on the client side
      if (params.error) {
        
        return
      }
  
      
  
      // creates a new WebRTC Transport to send media
      // based on the server's producer transport params
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
      producerTransport = device.createSendTransport(params)
  
      // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
      // this event is raised when a first call to transport.produce() is made
      // see connectSendTransport() below
      producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          // Signal local DTLS parameters to the server side transport
          // see server's mediaSocket.on('transport-connect', ...)
          await mediaSocket.emit('transport-connect', {
            dtlsParameters,
          })
  
          // Tell the transport that parameters were transmitted.
          callback()
  
        } catch (error) {
          errback(error)
        }
      })
  
      producerTransport.on('produce', async (parameters, callback, errback) => {
        
  
        try {
          // tell the server to create a Producer
          // with the following parameters and produce
          // and expect back a server side producer id
          // see server's mediaSocket.on('transport-produce', ...)
          await mediaSocket.emit('transport-produce', {
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData,
          }, ({ id, producersExist }) => {
            // Tell the transport that parameters were transmitted and provide it with the
            // server side producer's id.
            callback({ id })
  
            // if producers exist, then join room
            //if (producersExist) getProducers()
            getProducers()
          })
        } catch (error) {
          errback(error)
        }
      })
    })
  }

  
const connectSendTransport = async () => {
  // we now call produce() to instruct the producer transport
  // to send media to the Router
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
  // this action will trigger the 'connect' and 'produce' events above
  
  audioProducer = await producerTransport.produce(audioParams);
  videoProducer = await producerTransport.produce(videoParams);

  audioProducer.on('trackended', () => {
    

    // close audio track
  })

  audioProducer.on('transportclose', () => {
    

    // close audio track
  })
  
  videoProducer.on('trackended', () => {
    

    // close video track
  })

  videoProducer.on('transportclose', () => {
    

    // close video track
  })
}

const signalNewConsumerTransport = async (remoteProducerId) => {
  
  //check if we are already consuming the remoteProducerId
  //if (consumingTransports.includes(remoteProducerId)) return;
  consumingTransports.push(remoteProducerId);

  await mediaSocket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
    // The server sends back params needed 
    // to create Send Transport on the client side
    if (params.error) {
      
      return
    }
    

    let consumerTransport
    try {
      consumerTransport = device.createRecvTransport(params)
    } catch (error) {
      // exceptions: 
      // {InvalidStateError} if not loaded
      // {TypeError} if wrong arguments.
      
      return
    }

    consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        // Signal local DTLS parameters to the server side transport
        // see server's mediaSocket.on('transport-recv-connect', ...)
        await mediaSocket.emit('transport-recv-connect', {
          dtlsParameters,
          serverConsumerTransportId: params.id,
        })

        // Tell the transport that parameters were transmitted.
        callback()
      } catch (error) {
        // Tell the transport that something was wrong
        errback(error)
      }
    })

    connectRecvTransport(consumerTransport, remoteProducerId, params.id)
  })
}

// server informs the client of a new producer just joined
const onNewProducer = ({producerId}) => {
  signalNewConsumerTransport(producerId)
}

useEffect(() => {
  mediaSocket.on('new-producer', onNewProducer)
  return () => {
    mediaSocket.off('new-producer', onNewProducer)
  }
}, []);
//mediaSocket.on('new-producer', ({ producerId }) => signalNewConsumerTransport(producerId))

const getProducers = () => {
  mediaSocket.emit('getProducers', producerIds => {
    
    // for each of the producer create a consumer
    // producerIds.forEach(id => signalNewConsumerTransport(id))
    producerIds.forEach(signalNewConsumerTransport)
  })
}

const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
  // for consumer, we need to tell the server first
  // to create a consumer based on the rtpCapabilities and consume
  // if the router can consume, it will send back a set of params as below
  await mediaSocket.emit('consume', {
    rtpCapabilities: device.rtpCapabilities,
    remoteProducerId,
    serverConsumerTransportId,
  }, async ({ params }) => {
    if (params.error) {
      
      return
    }

    
    // then consume with the local consumer transport
    // which creates a consumer
    const consumer = await consumerTransport.consume({
      id: params.id,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters
    })

    consumerTransports = [
      ...consumerTransports,
      {
        consumerTransport,
        serverConsumerTransportId: params.id,
        producerId: remoteProducerId,
        consumer,
      },
    ]

    // destructure and retrieve the video track from the producer
    const { track } = consumer;
    
    const newStream = new MediaStream();
    newStream.addTrack(track);
    if (track.kind === 'audio') {
      audioRef.current.srcObject = newStream;
    } else {
      videoRef.current.srcObject = newStream;
    }
    //videoRef.current.srcObject = newStream;
    
    
    mediaSocket.emit('consumer-resume', { serverConsumerId: params.serverConsumerId })
  })
}

  useEffect(() => {
    
  }, [test]);
  const audioRef = useRef(null);
  return (
    <div className={`${styles.MyGroupsViewer} ${mode === 'study' ? styles.study : ''}`}>
            <video ref={videoRef} autoPlay playsInline className={`${styles.video}`} style={{zIndex: -1, position: 'fixed'}} />
            <audio ref={audioRef} autoPlay></audio>
      <Swiper
        slidesPerView={1}
        loop={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className={styles.Swiper}
        initialSlide={0}
        onSlideChange={(swiperCore) => {
          const {
            realIndex
          } = swiperCore;
          setSelectedGroupIndex(realIndex);
          
        }}
      >
        {myGroups.map((group, i) => {
          
          return (
            <SwiperSlide className={styles.slide} key={i}>
              <div className={styles.inner}>
                <div className={styles.name}>
                  <Link>
                    {group.name}
                  </Link>
                </div>
                <div className={styles.information}>
                  <div className={styles.header}>
                    <ul className={styles.status}>
                      <li>
                        <StudyPerson opt1={'#fff'} opt2={'#fff'} width={'40px'} height={'40px'} />
                        <p>{groupStudying[group.group_id] ? groupStudying[group.group_id].members.length : 0}/{group.members.length}</p>
                      </li>
                      <li>
                        <FontAwesomeIcon icon={faBullhorn} />
                      </li>
                      <li>
                        <FontAwesomeIcon icon={faRankingStar} />
                      </li>
                    </ul>
                    <div className={styles.right}>
                      <FontAwesomeIcon icon={faGear} />
                    </div>
                  </div>
                  <div className={styles.membersContainer}>
                    <div className={`${styles.members} customScroll`}>
                      {group.members.map((memberInfo, j) => {
                        if (memberInfo.user_id === userInfo.user_id) {
                          return (<MyEl memberInfo={memberInfo} key={j} k={j} toggleTimer={toggleTimer} myTimerTotal={myTimerTotal} stream={localStream} socket={socket} />)
                        } else {
                          return (<MemberEl memberInfo={memberInfo} key={j} k={j} toggleTimer={toggleTimer} socket={socket} usersTracks={usersTracks} />)
                        }
                      })}
                    </div>
                  </div>
                </div>
                <div className={styles.buttons}>
                  <button>Go to Group</button>
                  <button>
                    <FontAwesomeIcon icon={faComments} />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default MyGroupsViewer;