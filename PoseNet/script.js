async function setupCamera() {
    const video = document.getElementById('video');

    videoHeight = 340
    videoWidth = 340

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


  async function cameraOn() {    
      let video;
      try {
        video = await setupCamera();
        video.play();
      } catch (e) {
        throw e;
      }
  }

  cameraOn()
