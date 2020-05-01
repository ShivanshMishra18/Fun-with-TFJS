const videoHeight = 200
const videoWidth = 270
const videoVisibility = true
const showPoints = true
const colorLeft = 'blue'
const colorRight = 'red'

async function getPoseNet() {
    
    PoseNet = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: videoWidth, height: videoHeight },
        multiplier: 0.75
      });

    return PoseNet;
}

async function setupCamera() {
    const video = document.getElementById('video');

    video.width = videoWidth;
    video.height = videoHeight;
  
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        width: videoWidth,
        height: videoHeight,
      },
    });
    video.srcObject = stream;
  
    return new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(video);
    });
}

function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

/*
function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    let leftWrist = keypoints.find(point => point.part === 'leftWrist');
    let rightWrist = keypoints.find(point => point.part === 'rightWrist');

    if (leftWrist.score > minConfidence) {
        const {y, x} = leftWrist.position;
        drawPoint(ctx, y * scale, x * scale, 5, colorLeft);
    }

    if (rightWrist.score > minConfidence) {
        const {y, x} = rightWrist.position;
        drawPoint(ctx, y * scale, x * scale, 5, colorRight);
    }
}
*/

function drawKeypointsLight(keypoints, minConfidence, ctx, scale = 1) {
  let leftWrist = keypoints.find(point => point.part === 'leftWrist');
  let rightWrist = keypoints.find(point => point.part === 'rightWrist');

  if (leftWrist.score > minConfidence) {
      const {y, x} = leftWrist.position;
      console.log('Success for left');
      if (showPoints)
        drawPoint(ctx, y * scale, x * scale, 5, colorLeft);
  }
  if (rightWrist.score > minConfidence) {
      const {y, x} = rightWrist.position;
      console.log('Success for right');
      myGameArea.x = x;
      myGameArea.y = y;
      if (showPoints)
        drawPoint(ctx, y * scale, x * scale, 5, colorRight);
  }
}

/*
function detectPoseFromVideo(video, poseNetModel) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');
  
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  
    async function poseDetectionFrame() {
      let poses = [];
      let minPoseConfidence;
      let minPartConfidence;
  
    	const pose = await poseNetModel.estimatePoses(video, {
				flipHorizontal: true,
				decodingMethod: 'single-person'
		});
		poses = poses.concat(pose);
		minPoseConfidence = 0.2;
		minPartConfidence = 0.5;

      ctx.clearRect(0, 0, videoWidth, videoHeight);
  

	//   Change global variable video visibility

      if (videoVisibility === true) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);
        ctx.restore();
      }
  
      poses.forEach(({score, keypoints}) => {
        if (score >= minPoseConfidence) {
          if (showPoints) {
            drawKeypoints(keypoints, minPartConfidence, ctx);
            console.log(keypoints);
          }
        }
      });
      console.log('Requesting frame animation');
      requestAnimationFrame(poseDetectionFrame);
      console.log('Requested')
    }
  
	  console.log("Detecting");
    poseDetectionFrame();
    console.log("Done for once");
}
*/

function detectPoseFromVideoLight(video, poseNetModel) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    let poses = [];
    const minPoseConfidence = 0.1;
    const minPartConfidence = 0.4;

    const pose = await poseNetModel.estimatePoses(video, {
      flipHorizontal: true,
      decodingMethod: 'single-person'
    });

    poses = poses.concat(pose);

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (videoVisibility === true) {     // Put false to turn off player
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      ctx.restore();
    }

    poses.forEach(({score, keypoints}) => {
        // console.log('Trying for ', keypoints)
        if (score > minPoseConfidence) {
          drawKeypointsLight(keypoints, minPartConfidence, ctx);
        }
    });
    // console.log('Requesting frame animation');
    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}


async function cameraOn() {    
    let video;
    const PoseNet = await getPoseNet();

    try {
        video = await setupCamera();
        video.play();
        console.log("cameraOn");
        detectPoseFromVideoLight(video,PoseNet);
        console.log("cameraOnDone");
    } catch (e) {
        throw e;
    }
}


var myGameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
      this.canvas.width = videoWidth;
      this.canvas.height = videoHeight;
      this.canvas.style.cursor = "none"; //hide the original cursor
      this.context = this.canvas.getContext("2d");
      document.body.appendChild(this.canvas);
      this.canvas.style.margin = "20px";
      this.canvas.style.backgroundColor = "#f1f1f1";
      this.canvas.style.borderColor = '#07070707';
      this.interval = setInterval(updateGameArea, 20);
      // this.canvas.addEventListener('mousemove', function (e) {
      //     myGameArea.x = e.offsetX;
      //     myGameArea.y = e.offsetY;
      // })
  }, 
  clear : function(){
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function updateGameArea() {
  myGameArea.clear();
  if (myGameArea.x && myGameArea.y) {
      myGamePiece.x = myGameArea.x;
      myGamePiece.y = myGameArea.y;        
  }
  myGamePiece.update();
}

function component(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;    
  this.update = function() {
      ctx = myGameArea.context;
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

myGamePiece = new component(10, 10, "red", 10, 120);
myGameArea.start()
// cameraOn()
