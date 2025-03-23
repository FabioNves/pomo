import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  formatDate,
  formatDatee,
  todayDate,
  yesterdayDate,
} from "../utils/timeUtils";
import TimerControls from "./TimerControls";
import SessionTasks from "./SessionTasks";
import TodoList from "./TodoList";
import SessionHistory from "./SessionHistory";

const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://pomo-pzgr.onrender.com";

const PomodoroTimer = () => {
  const [todoInput, setTodoInput] = useState("");
  const [todoTasks, setTodoTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedDay, setSelectedDay] = useState("today");
  const [error, setError] = useState(null);

  const handleSessionCompletion = useCallback(
    async (focus, brk) => {
      const sessionData = {
        focusTime: focus,
        breakTime: brk,
        tasks: tasks.map((task) => ({
          task: task.task,
          brand: {
            title: task.brand?.title || "",
            milestone: task.brand?.milestone || "",
          },
        })),
      };

      try {
        await axios.post(`${BACKEND_URL}/api/sessions`, sessionData);
        console.log("Session saved successfully");
        setTasks([]);
        // Fetch updated sessions
        const response = await axios.get(`${BACKEND_URL}/api/sessions`);
        setSessions(response.data);
      } catch (error) {
        console.error("Error saving session", error);
      }
    },
    [tasks]
  );

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/sessions`);
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions", error);
        setError("Error 404");
      }
    };

    fetchSessions();
  }, []);

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

  const filteredSessions = sessions.filter((session) =>
    selectedDay === "today"
      ? formatDatee(session.date) === todayDate
      : formatDatee(session.date) === yesterdayDate
  );

  return (
    <div className="w-screen h-[calc(100vh-4rem)] flex flex-col justify-center items-center p-5 px-40 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
      <div className="w-full flex justify-around items-start gap-2 py-4 px-8 border-2 border-white rounded-md">
        <TimerControls handleSessionCompletion={handleSessionCompletion} />
        <div className="w-1/3">
          <SessionTasks tasks={tasks} toggleBackToDo={toggleBackToDo} />
        </div>
      </div>
      <div className="w-full flex gap-8 justify-center">
        <TodoList
          todoInput={todoInput}
          setTodoInput={setTodoInput}
          todoTasks={todoTasks}
          setTodoTasks={setTodoTasks}
          transferTaskToSession={transferTaskToSession}
        />
        <SessionHistory
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          error={error}
          filteredSessions={filteredSessions}
        />
      </div>
    </div>
  );
};

export default PomodoroTimer;
