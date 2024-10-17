import React from 'react'
import * as posenet from '@tensorflow-models/posenet'
import questions from '../questions.json';
import Fish from '../Fish';
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

class Camera extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cameraSet: false,
      videoHeight: 500,
      videoWidth: 800,
      answer: '',
      score: 0,
      question: { question: '', options: [], answer: '' },
      gameEnded: false,
      answerIsCorrect: false,
      test: false,
      curAnswer: '',
    }
  }
  async componentDidMount() {
    const randomQuestion = this.randomQuestion();
    this.setState({ question: randomQuestion });

    this.posenet = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: 193,
      multiplier: 0.75
    })
    await this.setupCamera()
  }

  setupTimer() {
    clearInterval(this.timer);

    this.elapsedTime = 0
    this.timer = setInterval(() => {
      if (this.elapsedTime > 60) {
        this.setState({gameEnded: true})
      }
      if (this.elapsedTime === 50) {
        this.notifyTime(10)
      }
      if (this.elapsedTime === 30) {
        this.notifyTime(30)
      }
      this.elapsedTime = this.elapsedTime + 1
    }, 1000)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.score !== prevState.score) {
      this.setState({answerIsCorrect: false})
      const randomQuestion = this.randomQuestion();
      setTimeout(() => {
        this.setState({ question: randomQuestion })
      }, 1000);
    }
  }

  checkAnswer = (question, answer) => {
    this.setState({ curAnswer: answer });
    if (question.answer === answer) {
      this.setState({
        score: this.state.score + question.pointValue,
        answerIsCorrect: true,
        test: true,
      })
      this.notifyCorrect(answer)
    } else {
      this.setState({
        answerIsCorrect: false,
        test: false,
      })
      this.notifyWrong(answer)
    }
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      )
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: this.state.videoWidth,
          height: this.state.videoHeight
        }
      })
      this.setState({cameraSet: true})
      this.video.srcObject = stream
    } catch (err) {
      console.error(err)
    } finally {
      this.detectPose()
    }
  }

  detectBodyDebounce = (func, timeout = 300) => {
    let timer;
    return (...args) => {
      if (!timer) {
        func.apply(this, args);
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
      }, timeout);
    };
  }

  async detectPose() {
    if (this.state.gameEnded) {
      return;
    }

    clearTimeout(this.detectPoseTest);
    let poses;
    try {
      poses = await this.posenet.estimateSinglePose(this.video, {
        flipHorizontal: false
      })
    } catch (err) {
      console.log('ERROR: ', err);
    }

    if (poses) {
      this.detectBodyDebounce(this.gotPoses(poses), 1500);
    }

    this.detectPoseTest = setTimeout(() => {
      this.detectPose();
    }, 1500); 
  }
  notifyTime = time => {
    toast.success(`You have ${time} seconds!!!`, {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      rtl: false,
      pauseOnVisibilityChange: false,
      draggable: false,
      pauseOnHover: true
    })
  }
  notifyCorrect = choice => {
    toast.info(`'GREAT JOB! ${choice} is the correct answer.'`, {
      position: 'bottom-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      rtl: false,
      pauseOnVisibilityChange: false,
      draggable: false,
      pauseOnHover: true
    })
  }

  notifyWrong = choice => {
    toast.error(`OOPS! ${choice} is the wrong Answer`, {
      position: 'bottom-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false
    })
  }

  gotPoses(poses) {
    const width = this.state.videoWidth
    const height = this.state.videoHeight
    const rightWX = poses.keypoints[10]?.position.x
    const rightWY = poses.keypoints[10]?.position.y
    const leftWX = poses.keypoints[9]?.position.x
    const leftWY = poses.keypoints[9]?.position.y

    if (this.state.question.choices) {
      if (
        leftWX > 0 &&
        leftWX < width * 0.3 &&
        (leftWY > 0 && leftWY < height * 0.3)
      ) {
        const index = 1;
        const answer = this.state.question.choices[index];
        if (!this.state.answerIsCorrect) {
          this.checkAnswer(this.state.question, answer)
        }
      }
      if (
        rightWX > width * 0.7 &&
        rightWX < width &&
        (rightWY > 0 && rightWY < height * 0.3)
      ) {
        const index = 0;
        const answer = this.state.question.choices[index];
        if (!this.state.answerIsCorrect) {
          this.checkAnswer(this.state.question, answer)
        }
      }
      if (
        leftWX > 0 &&
        leftWX < width * 0.3 &&
        (leftWY > height * 0.7 && leftWY < height)
      ) {
        const index = 3;
        const answer = this.state.question.choices[index];
        if (!this.state.answerIsCorrect) {
          this.checkAnswer(this.state.question, answer)
        }
      }
      if (
        rightWX > width * 0.7 &&
        rightWX < width &&
        (rightWY > height * 0.7 && rightWY < height)
      ) {
        const index = 2;
        const answer = this.state.question.choices[index];
        if (!this.state.answerIsCorrect) {
          this.checkAnswer(this.state.question, answer)
        }
      }
    }
  }
  getVideo = element => {
    this.video = element
  }

  getCanvas = element => {
    this.canvas = element
  }

  randomQuestion = () => {
    this.setupTimer();
    const max = 4;
    const min = 0;
    const randomIndex = Math.floor(Math.random() * (max - min + 1) + min);
    return questions[randomIndex]
  }

  render() {
    const { cameraSet, gameEnded, score, question, test, curAnswer } = this.state

    return (
      <div className="camera">
        <div id="toast-container">
          <div className="toast-container" id="toast-container">
            <ToastContainer />
          </div>
        </div>
        <div className='title'>Save our sea</div>
        <div className='question'>
          {gameEnded ? 'Game Over' : `Question: ${question.question}`}
        </div>
        <div className='score'>Score: {score}</div>
        { test && <div className='fish-announcement'>More fish is coming!</div> }
        {cameraSet ? (
          <div id="answer-circle-container">
            <div 
              className={`answer-circle${curAnswer === question.choices[0] && test ? ' correct' : ''}${curAnswer === question.choices[0] && !test ? ' incorrect' : ''}`}
              id="answer-circle-a"
            >
              <h1>{question.choices[0]}</h1>
            </div>
            <div 
              className={`answer-circle${curAnswer === question.choices[1] && test ? ' correct' : ''}${curAnswer === question.choices[1] && !test ? ' incorrect' : ''}`}
              id="answer-circle-b"
            >
              <h1>{question.choices[1]}</h1>
            </div>
            <div 
              className={`answer-circle${curAnswer === question.choices[2] && test ? ' correct' : ''}${curAnswer === question.choices[2] && !test ? ' incorrect' : ''}`}
              id="answer-circle-c"
            >
              <h1>{question.choices[2]}</h1>
            </div>
            <div 
              className={`answer-circle${curAnswer === question.choices[3] && test ? ' correct' : ''}${curAnswer === question.choices[3] && !test ? ' incorrect' : ''}`}
              id="answer-circle-d"
            >
              <h1>{question.choices[3]}</h1>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <div className='video-wrapper'>
          <video
            playsInline
            id="webcam"
            width={this.state.videoWidth}
            height={this.state.videoHeight}
            autoPlay={true}
            ref={this.getVideo}
          />
        </div>
        <Fish score={this.state.score}/>
      </div>
    )
  }
}

export default Camera;