const express = require("express");
const Router = express.Router();
const webrtc = require("wrtc");

let senderStream;

Router.post("/consumer", async ({ body }, res) => {
  /* try {
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        }
      ]
    });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
      sdp: peer.localDescription
    }

    res.json(payload);
  } catch (err) {
    console.log(err);
  }; */
});

Router.post('/broadcast', async ({ body }, res) => {
  console.log("ddd", body.sdp.type)
  const peer = new webrtc.RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org"
      }
    ]
  });
  peer.ontrack = (e) => handleTrackEvent(e, peer);
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = {
    sdp: peer.localDescription
  }

  res.json(payload);
});

function handleTrackEvent(e, peer) {
  senderStream = e.streams[0];
};

module.exports = Router;