const videoHeight = 500
const videoWidth = 500
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

function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    let leftWrist = keypoints.find(point => point.part === 'leftWrist');
    let rightWrist = keypoints.find(point => point.part === 'rightWrist');

    if (leftWrist.score > minConfidence) {
        const {y, x} = leftWrist.position;
        drawPoint(ctx, y * scale, x * scale, 10, colorLeft);
    }

    if (rightWrist.score > minConfidence) {
        const {y, x} = rightWrist.position;
        drawPoint(ctx, y * scale, x * scale, 10, colorRight);
    }
}

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
          }
        }
      });
      requestAnimationFrame(poseDetectionFrame);
    }
  
	console.log("Detecting");
	
    poseDetectionFrame();
  }


async function cameraOn() {    
    let video;
    const PoseNet = await getPoseNet();

    try {
        video = await setupCamera();
        video.play();
        detectPoseFromVideo(video,PoseNet);
    } catch (e) {
        throw e;
    }
}

cameraOn()
