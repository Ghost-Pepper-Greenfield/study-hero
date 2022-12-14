import "../styles/Pomodoro.css";
import React, { useState, useEffect } from "react";
import { Button, Card, Container } from "react-bootstrap";
import axios from "axios";
import { db, auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { query, collection, getDocs, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import run from "../styles/run.gif";
import idle from "../styles/idle.gif";
import dance from "../styles/dance.gif";
import pant from "../styles/pant.gif";

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(5);
  const [duration, setDuration] = useState(1);
  const [displayMessage, setDisplayMessage] = useState(false);
  const [runningTimer, setRunningTimer] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [isPause, setPause] = useState(false);
  const [postObject, setPostObject] = useState({});
  const [uid, setUid] = useState("");
  const [uName, setName] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const fetchUid = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setUid(data.uid);
      setName(data.name);
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };

  function startTimer() {
    setRunningTimer(true);
  }

  function stopTimer() {
    setRunningTimer(false);
    setPostObject({
      firebaseId: uid,
      name: uName,
      date: new Date(),
      duration: duration,
      points: Math.floor(duration / 60),
    });
  }

  async function saveProgress() {
    setDuration(1);
    return await axios.post(`/new-session`, postObject);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/database");
    fetchUid();
  }, [user, loading]);

  useEffect(() => {
    if (runningTimer) {
      let timerInterval = setInterval(() => {
        clearInterval(timerInterval);

        if (seconds === 0) {
          if (minutes !== 0) {
            setSeconds(59);
            setMinutes(minutes - 1);
          } else {
            let minutes = displayMessage ? 24 : 1;
            let seconds = 59;

            setSeconds(seconds);
            setMinutes(minutes);
            setDisplayMessage(!displayMessage);
          }
        } else {
          setSeconds(seconds - 1);
          setDuration(duration + 1);
        }
      }, 100);
    }
  }, [seconds, runningTimer]);

  const timerMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const timerSeconds = seconds < 10 ? `0${seconds}` : seconds;
  const timer = minutes * 60 + seconds;

  return (
    <div
      id="pomodoro__wrapper"
      className="d-flex flex-column justify-content-center align-items-center"
    >
      <Container>
        {displayMessage ? (
          <progress
            class="nes-progress is-pattern"
            value={120 - timer}
            max="120"
          ></progress>
        ) : (
          <progress
            class="nes-progress is-pattern"
            value={5 - timer}
            max="5"
          ></progress>
        )}
        <Card.Body id="card__body" className="nes-balloon">
          {isPause === false ? (
            celebrate === false ? (
              runningTimer ? (
                displayMessage ? (
                  <>
                    <img className="sprite-pant" src={pant}></img>
                  </>
                ) : (
                  <>
                    <img className="sprite-run"  src={run}></img>
                  </>
                )
              ) : displayMessage ? (
                <>
                  <img className="sprite-pant" src={pant}></img>
                </>
              ) : (
                <>
                  <img className="sprite-idle" src={idle}></img>
                </>
              )
            ) : (
              <>
                <img className="sprite-dance" src={dance}></img>
              </>
            )
          ) : (
            <>
              <img className="sprite-pant" src={pant}></img>
            </>
          )}
        </Card.Body>
        <Container>
          {displayMessage && (
            <p className="nes-balloon">
              Take a break!
            </p>
          )}
        </Container>

        <Container>
          <div id="timer__wrapper">
            <Card.Body id="card__body" className="nes-balloon">
              {timerMinutes}:{timerSeconds}
            </Card.Body>
          </div>
        </Container>

        <Container>
          <div id="button__wrapper">
            {runningTimer === false ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-100"
                  onClick={() => {
                    startTimer();
                    setPause(false);
                  }}
                >
                  Start
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-100"
                  onClick={saveProgress}
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-100"
                  onClick={() => {
                    stopTimer();
                    setPause(true);
                  }}
                >
                  Pause
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-100"
                  onClick={() => {
                    setCelebrate(true);
                    setTimeout(() => setCelebrate(false), 5000);
                  }}
                >
                  Celebrate
                </Button>
              </>
            )}
          </div>
        </Container>
      </Container>
    </div>
  );
}
