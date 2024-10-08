let socket = io.connect(window.location.origin);
let localStream;
let remoteStream;
let peerConnection;
const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

// Handle WebSocket events for signaling
socket.on('call_created', function(data) {
    document.getElementById('call-info').textContent = `Share this call code: ${data.call_code}`;
});

socket.on('joined_call', function(data) {
    startCall();
});

// Listen for signaling data and apply it to the peer connection
socket.on('signaling', async function(signal) {
    if (signal.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.offer));
        createAnswer(signal.call_code);
    } else if (signal.answer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.answer));
    } else if (signal.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
});

// Generate call code
function generateCallCode() {
    socket.emit('create_call');
}

// Join a call with the provided code
function joinCallWithCode() {
    const joinCode = document.getElementById('joinCode').value;
    socket.emit('join_call', { call_code: joinCode });
}

// Set up WebRTC connection
async function startCall() {
    peerConnection = new RTCPeerConnection(servers);

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Listen for remote stream
    peerConnection.ontrack = event => {
        remoteStream = event.streams[0];
        document.getElementById("remoteVideo").srcObject = remoteStream;
    };

    // Send ICE candidates through signaling server
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('signaling', { call_code: joinCode, signal: { candidate: event.candidate } });
        }
    };

    // Create offer for the call
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('signaling', { call_code: joinCode, signal: { offer } });
}

// Create an answer to an incoming offer
async function createAnswer(call_code) {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('signaling', { call_code, signal: { answer } });
}

// Get local media stream
async function getMedia() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("localVideo").srcObject = localStream;
}

// Start the media stream on page load
getMedia();
