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
import {mediaSocket} from '../../../mediaSocket'
import {Device} from 'mediasoup-client';

const params = {
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

function MyGroupsViewer(props) {

  const { myGroups, socket, userInfo, myTimerTotal, isCam, isMic, mode } = props;

  const [toggleTimer, setToggleTimer] = useState({ id: 0, status: 0 });
  const [groupStudying, setGroupStudying] = useState({});
  const [myGroupsViewerContent, setMyGroupsViewerContent] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  //mediasoup related codes
  const [device, setDevice] = useState(null);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [consumerTransports, setConsumerTransports] = useState([]);
  const [audioProducer, setAudioProducer] = useState(null);
  const [videoProducer, setVideoProducer] = useState(null);
  const [consumer, setConsumer] = useState(null);
  const [audioParams, setAudioParams] = useState(null);
  const [videoParams, setVideoParams] = useState({ params });
  const [consumingTransports, setConsumingTransports] = useState([]);

  const createDevice = async (rtpCapabilities) => {
    try {
      const newDevice = new Device()
      console.log('rtc capa',rtpCapabilities)
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
      // Loads the device with RTP capabilities of the Router (server side)
      await newDevice.load({
        // see getRtpCapabilities() below
        routerRtpCapabilities: rtpCapabilities
      })
  
      console.log('Device RTP Capabilities', newDevice.rtpCapabilities)
      setDevice(newDevice);
      // once the device loads, create transport
      createSendTransport(newDevice)
  
    } catch (error) {
      console.log(error)
      if (error.name === 'UnsupportedError')
        console.warn('browser not supported')
    }
  };

  const createSendTransport = (device) => {
    // see server's socket.on('createWebRtcTransport', sender?, ...)
    // this is a call from Producer, so sender = true
    console.log('send trasport')
    mediaSocket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      console.log('create webrtc transport')
      // The server sends back params needed 
      // to create Send Transport on the client side
      if (params.error) {
        console.log(params.error)
        return
      }
  
      // creates a new WebRTC Transport to send media
      // based on the server's producer transport params
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
      const newProducerTransport = device.createSendTransport(params)
  
      // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
      // this event is raised when a first call to transport.produce() is made
      // see connectSendTransport() below
      newProducerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        console.log('ptransport conn' )
        try {
          // Signal local DTLS parameters to the server side transport
          // see server's socket.on('transport-connect', ...)
          mediaSocket.emit('transport-connect', {
            dtlsParameters,
          })
  
          // Tell the transport that parameters were transmitted.
          callback()
  
        } catch (error) {
          errback(error)
        }
      })
  
      newProducerTransport.on('produce', async (parameters, callback, errback) => {
        console.log('produce')
  
        try {
          // tell the server to create a Producer
          // with the following parameters and produce
          // and expect back a server side producer id
          // see server's socket.on('transport-produce', ...)
          mediaSocket.emit('transport-produce', {
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData,
          }, ({ id, producersExist }) => {
            // Tell the transport that parameters were transmitted and provide it with the
            // server side producer's id.
            callback({ id })
  
            // if producers exist, then join room
            if (producersExist) getProducers(device)
          })
        } catch (error) {
          errback(error)
        }
      });
      setProducerTransport(newProducerTransport);
      //connectSendTransport(newProducerTransport)
    })
  };

  const connectSendTransport = async (audioParams, videoParams) => {
    // we now call produce() to instruct the producer transport
    // to send media to the Router
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
    // this action will trigger the 'connect' and 'produce' events above
    if (!producerTransport) return;
    if (audioParams && audioParams.track) {
      const audioProducer = await producerTransport.produce(audioParams);
    
      audioProducer.on('trackended', () => {
        console.log('audio track ended')
    
        // close audio track
      })
    
      audioProducer.on('transportclose', () => {
        console.log('audio transport ended')
    
        // close audio track
      })
    }
    if (videoParams && videoParams.track) {
      const videoProducer = await producerTransport.produce(videoParams);
      videoProducer.on('trackended', () => {
        console.log('video track ended')
    
        // close video track
      })
    
      videoProducer.on('transportclose', () => {
        console.log('video transport ended')
    
        // close video track
      })
    }
  }
  
  const getProducers = (device) => {
    console.log('getproducer')
    mediaSocket.emit('getProducers', producerIds => {
      console.log('producerIds', producerIds)
      // for each of the producer create a consumer
      // producerIds.forEach(id => signalNewConsumerTransport(id))
      //producerIds.forEach(signalNewConsumerTransport());
      producerIds.map((producerId) => {
        signalNewConsumerTransport(producerId, device)
      })
    })
  };

  const signalNewConsumerTransport = async (remoteProducerId, device) => {
    //check if we are already consuming the remoteProducerId
    if (consumingTransports.includes(remoteProducerId)) return;
    consumingTransports.push(remoteProducerId);
  
    mediaSocket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
      console.log('gdd')
      // The server sends back params needed 
      // to create Send Transport on the client side
      if (params.error) {
        console.log(params.error)
        return
      }
      console.log(`PARAMS... ${params}`)
  
      let consumerTransport
      try {
        consumerTransport = device.createRecvTransport(params)
      } catch (error) {
        // exceptions: 
        // {InvalidStateError} if not loaded
        // {TypeError} if wrong arguments.
        console.log(error)
        return
      }
  
      consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          // Signal local DTLS parameters to the server side transport
          // see server's socket.on('transport-recv-connect', ...)
          mediaSocket.emit('transport-recv-connect', {
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
  
      connectRecvTransport(consumerTransport, remoteProducerId, params.id, device)
    })
  };

  
const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId, device) => {
  // for consumer, we need to tell the server first
  // to create a consumer based on the rtpCapabilities and consume
  // if the router can consume, it will send back a set of params as below
  console.log('consumer', consumer, params)
  await mediaSocket.emit('consume', {
    rtpCapabilities: device.rtpCapabilities,
    remoteProducerId,
    serverConsumerTransportId,
  }, async ({ params }) => {
    console.log('params err', params)
    if (params.error) {
      console.log('Cannot Consume')
      return
    }

    console.log(`Consumer Params ${params}`)
    // then consume with the local consumer transport
    // which creates a consumer
    const consumer = await consumerTransport.consume({
      id: params.id,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters
    })
    const newConsumerTransports = [
      ...consumerTransports,
      {
        consumerTransport,
        serverConsumerTransportId: params.id,
        producerId: remoteProducerId,
        consumer,
      },
    ];

    setConsumerTransports(newConsumerTransports);
    const { track } = consumer
    console.log('consumer!!!',new MediaStream([track]))
    // create a new div element for the new consumer media
    /* const newElem = document.createElement('div')
    newElem.setAttribute('id', `td-${remoteProducerId}`)

    if (params.kind == 'audio') {
      //append to the audio container
      newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
    } else {
      //append to the video container
      newElem.setAttribute('class', 'remoteVideo')
      newElem.innerHTML = '<video id="' + remoteProducerId + '" autoplay class="video" ></video>'
    }

    videoContainer.appendChild(newElem)

    // destructure and retrieve the video track from the producer
    const { track } = consumer

    document.getElementById(remoteProducerId).srcObject = new MediaStream([track])

    // the server consumer started with media paused
    // so we need to inform the server to resume
    socket.emit('consumer-resume', { serverConsumerId: params.serverConsumerId }) */
  })
};

const onNewProducer = () => {
  console.log('gdp')
}
  
  useEffect(() => {
    mediaSocket.connect();
    //createPeerConnection(socket.id);
    console.log('socket', socket)
    socket.on("studying", onStudying);
    socket.on("stopStudying", onStopStudying);
    socket.on('new-producer', onNewProducer);
    return () => {
      socket.off("studying", onStudying);
      socket.off("stopStudying", onStopStudying);
      socket.off('new-producer', onNewProducer);
    };
  }, []);

  useEffect(() => {
    if (isCam || isMic) {
      navigator.mediaDevices
        .getUserMedia({
          audio: isMic,
          video: isCam,
        })
        .then((stream) => {
          setLocalStream(stream);
          const newAudioParams = { track: stream.getAudioTracks()[0], ...audioParams };
          const newVideoParams = { track: stream.getVideoTracks()[0], ...videoParams };
          console.log('params: ', newAudioParams, newVideoParams)
          setAudioParams({ track: stream.getAudioTracks()[0], ...audioParams });
          setVideoParams(newAudioParams, newVideoParams);
          connectSendTransport(newAudioParams, newVideoParams);
        });
    };
  }, [isCam, isMic]);


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
    console.log(userId, groups)
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

  useEffect(() => {
    setMyGroupsViewerContent(
      myGroups.map((group, i) => {
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
                        return (<MemberEl memberInfo={memberInfo} key={j} k={j} toggleTimer={toggleTimer} myTimerTotal={myTimerTotal} socket={socket} />)
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
      })
    )
  }, [myGroups]);

  useEffect(() => {
    if (!myGroups.length) return;
    let selectedGroup;
    if (isNaN(selectedGroupIndex)) {
      selectedGroup = myGroups[0] ? myGroups[0] : false;
    } else if (myGroups[selectedGroupIndex]) {
      selectedGroup = myGroups[selectedGroupIndex];
    };
    mediaSocket.emit('changeGroup', selectedGroup ? selectedGroup.group_id : 0, (data) => {
      console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`)
      // we assign to local variable and will be used when
      // loading the client Device (see createDevice above)
      setRtpCapabilities(data.rtpCapabilities);
  
      // once we have rtpCapabilities from the Router, create Device
      createDevice(data.rtpCapabilities)
    });
  }, [selectedGroupIndex, myGroups]);

  return (
    <div className={`${styles.MyGroupsViewer} ${mode === 'study' ? styles.study : ''}`}>
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
          console.log('index', realIndex)
        }}
      >
        {      myGroups.map((group, i) => {
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
                        return (<MemberEl memberInfo={memberInfo} key={j} k={j} toggleTimer={toggleTimer} myTimerTotal={myTimerTotal} socket={socket} />)
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