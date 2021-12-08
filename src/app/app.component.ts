import { Component } from '@angular/core';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSSD from '@tensorflow-models/coco-ssd';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'CodeSandbox';
  private video!: HTMLVideoElement;
  otype: string = '';
  score: number = 0;

  ngOnInit() {
    console.log('Inside OnInit');
    if (this.webcam_init() == true) {
      console.log('Camera started');
      this.predictWithCocoModel();
    } else {
      console.log('Camera not started');
    }
    // this.predictWithCocoModel();
  }

  public async predictWithCocoModel() {
    const model = await cocoSSD.load();
    this.detectFrame(this.video, model);
    console.log('model loaded');
  }
  webcam_init() {
    this.video = <HTMLVideoElement>document.getElementById('vid');

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
        },
      })
      .then((stream) => {
        this.video.srcObject = stream;
        console.log(stream);
        this.video.onloadedmetadata = () => {
          this.video.play();
        };
      });
    console.log('Inside webcam');
    return true;
  }

  detectFrame = (video, model) => {
    model.detect(video).then((predictions) => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = (predictions) => {
    console.log('Inside renderPredictions');
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    console.log(predictions);
    const ctx = canvas.getContext('2d');

    canvas.width = 300;
    canvas.height = 300;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = '16px sans-serif';
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.drawImage(this.video, 0, 0, 300, 300);

    predictions.forEach((prediction) => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = 'green';
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach((prediction) => {
      console.log(prediction.class);
      this.otype = prediction.class;
      this.score = prediction.score * 100;
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = '#000000';
      ctx.fillText(prediction.class, x, y);
    });
  };
}
