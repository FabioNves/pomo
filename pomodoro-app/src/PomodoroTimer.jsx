import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const alarmSound = new Audio("/futuristic_alarm.mp3"); // Add your alarm sound file in the public folder

const PomodoroTimer = () => {
  // const [sessionEnded, setSessionEnded] = useState(false);
  // Focus Time
  const [startFocus, setStartFocus] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [focusEnded, setFocusEnded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(focusTime * 60);
  // Break Time
  const [startBreak, setStartBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(5);
  const [breakEnded, setBreakEnded] = useState(false);
  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [bTime, setBTime] = useState(breakTime * 60);

  // To dos
  const [todoInput, setTodoInput] = useState("");
  const [todoTasks, setTodoTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);

  const handleSessionCompletion = useCallback(async () => {
    const sessionData = {
      focusTime,
      breakTime,
      tasks: tasks.map((task) => task.text), // Send only the task text
      completedAt: new Date().toISOString(),
    };

    try {
      await axios.post("http://localhost:5000/api/sessions", sessionData);
      console.log("Session saved successfully");
      setIsRunning(false);
      setTime(focusTime * 60);
      setStartFocus(false);
      setFocusEnded(false);
      setStartBreak(false);
      setTasks([]);
    } catch (error) {
      console.error("Error saving session", error);
    }
  }, [focusTime, breakTime, tasks]);

  // Fetch Sessions

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/sessions");
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions", error);
      }
    };

    fetchSessions();
  }, []);
  // Update session
  useEffect(() => {
    const updateSessions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/sessions");
        setSessions(response.data);
      } catch (error) {
        console.error("Error updating sessions", error);
      }
    };

    updateSessions();
  }, [handleSessionCompletion]);

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
                handleSessionCompletion();
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

  // Update time when focusTime changes
  useEffect(() => {
    setTime(focusTime * 60);
  }, [focusTime]);

  useEffect(() => {
    setBTime(breakTime * 60);
  }, [breakTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const addTodoTask = () => {
    if (todoInput.trim() !== "") {
      setTodoTasks([...todoTasks, { text: todoInput, completed: false }]);
      setTodoInput("");
    }
  };

  const transferTaskToSession = (index) => {
    const taskToTransfer = todoTasks[index];
    setTasks([...tasks, taskToTransfer]);
    setTodoTasks(todoTasks.filter((_, i) => i !== index));
  };
  const toggleBackToDo = (index) => {
    const taskToMoveBack = tasks[index];
    setTodoTasks([...todoTasks, taskToMoveBack]);
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="w-screen h-[calc(100vh-4rem)] flex flex-col justify-center items-center p-5 px-40 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
      <div className="w-full flex justify-around items-start py-4 px-8 border-2 border-white rounded-md">
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
                  {[5, 10, 15].map((t) => (
                    <option key={t} value={t}>
                      {t} min
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Buttons */}
          <div className="w-full flex justify-around bg-slate-100/15 p-4 rounded-md mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setStartFocus(true);
                setIsRunning(!isRunning);
                // setSessionEnded(false);
              }}
              // disabled={sessionEnded}
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
                  onClick={handleSessionCompletion}
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
        <div className="w-1/3">
          <div className="w-full h-full bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold">Session tasks doing</h2>
            <ul className="mt-3 overflow-scroll">
              {tasks.map((task, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center p-2 mt-2 rounded ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.text}
                  <button
                    className="bg-green-500 px-3 py-1 rounded text-white"
                    onClick={() => toggleBackToDo(index)}
                  >
                    Not doing
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full flex gap-8 justify-center">
        {/* TO-DO LIST SECTION */}
        <div className="w-full mt-5 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold">To-Do List</h2>
          <div className="flex mt-3">
            <input
              type="text"
              className="flex-1 p-2 rounded bg-gray-700 text-white"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              placeholder="New Task..."
            />
            <button
              className="bg-blue-500 px-4 py-2 ml-2 rounded"
              onClick={addTodoTask}
            >
              Add
            </button>
          </div>
          <ul className="mt-3">
            {todoTasks.map((task, index) => (
              <li
                key={index}
                className={`flex justify-between items-center p-2 mt-2 rounded ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.text}
                <button
                  className="bg-yellow-500 px-3 py-1 rounded text-white"
                  onClick={() => transferTaskToSession(index)}
                >
                  Doing
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Today's sessions */}
        <div className="flex flex-col w-full h-96 mt-5 bg-gray-800 p-4 rounded-lg overflow-scroll">
          <h2 className="text-xl font-bold">Completed sessions today</h2>
          {sessions.map((session, index) => (
            <div key={index}>
              <h2>Session {index + 1}</h2>
              <p>Focus: {session.focusTime} min</p>
              <p>Break: {session.breakTime} min</p>
              <p>Tasks:</p>
              <ul>
                {session.tasks &&
                  session.tasks.map((task, taskIndex) => (
                    <li key={taskIndex}>{task}</li>
                  ))}
              </ul>
              <p>{session.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
