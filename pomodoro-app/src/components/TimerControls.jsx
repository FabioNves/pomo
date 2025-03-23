import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatTime } from "../utils/timeUtils";

const alarmSound = new Audio("/futuristic_alarm.mp3");

const TimerControls = ({ handleSessionCompletion }) => {
  const [startFocus, setStartFocus] = useState(false);
  const [focusTime, setFocusTime] = useState(0.5);
  const [focusEnded, setFocusEnded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(focusTime * 60);
  const [startBreak, setStartBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [breakEnded, setBreakEnded] = useState(false);
  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [bTime, setBTime] = useState(breakTime * 60);

  useEffect(() => {
    let timer;
    if (isRunning && !focusEnded) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setFocusEnded(true);
            alarmSound.play();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, focusEnded]);

  useEffect(() => {
    let breakTimer;
    if (isBreakRunning) {
      breakTimer = setInterval(() => {
        setBTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(breakTimer);
            setStartBreak(false);

            setBreakEnded((prevBreakEnded) => {
              if (!prevBreakEnded) {
                setIsBreakRunning(false);
                handleSessionCompletion(focusTime, breakTime);
                if (!alarmSound.paused) {
                  alarmSound.pause();
                  alarmSound.currentTime = 0;
                }
                alarmSound.play();
                return true;
              }
              return prevBreakEnded;
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(breakTimer);
  }, [isBreakRunning, handleSessionCompletion]);

  useEffect(() => {
    setTime(focusTime * 60);
  }, [focusTime]);

  useEffect(() => {
    setBTime(breakTime * 60);
  }, [breakTime]);

  return (
    <div className="w-2/3 flex flex-col">
      <div className="w-full h-full flex justify-around items-center">
        {startFocus && !focusEnded ? (
          <motion.div className="text-5xl font-bold mt-5">
            {formatTime(time)}
          </motion.div>
        ) : (
          <div className="mt-5 selectTime">
            <label>Focus Time: </label>
            <select
              value={focusTime}
              onChange={(e) => setFocusTime(Number(e.target.value))}
              className="text-black p-2 rounded-md"
            >
              {[20, 25, 30].map((t) => (
                <option key={t} value={t}>
                  {t} min
                </option>
              ))}
            </select>
          </div>
        )}
        {startBreak && !breakEnded ? (
          <motion.div className="text-5xl font-bold mt-5">
            {formatTime(bTime)}
          </motion.div>
        ) : (
          <div className="mt-3 selectTime">
            <label>Break Time: </label>
            <select
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              className="text-black p-2 rounded-md"
            >
              {[0, 5, 10, 15].map((t) => (
                <option key={t} value={t}>
                  {t} min
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="w-full flex justify-around bg-slate-100/15 p-4 rounded-md mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setStartFocus(true);
            setIsRunning(!isRunning);
          }}
        >
          {isRunning ? "Pause" : "Start"}
        </button>

        {focusEnded && (
          <div>
            <button
              className="bg-orange-700 text-white px-4 py-2 rounded"
              onClick={() => {
                setStartBreak(true);
                setIsBreakRunning(!isBreakRunning);
              }}
            >
              {isBreakRunning ? "Pause Break" : "Start Break"}
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => handleSessionCompletion(focusTime, breakTime)}
            >
              Finish Session
            </button>
          </div>
        )}
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => {
            setIsRunning(false);
            setTime(focusTime * 60);
            setFocusEnded(false);
            setStartBreak(false);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default TimerControls;
