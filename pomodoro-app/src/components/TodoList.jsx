import React, { useState, useEffect } from "react";
import axios from "axios";

const TodoList = ({
  todoInput,
  setTodoInput,
  todoTasks,
  addTodoTask,
  setTodoTasks,
  transferTaskToSession,
}) => {
  const [brands, setBrands] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get("/api/brands");
        // Ensure we're setting an array
        setBrands(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setError("Failed to load brands. Please check server connection.");
      }
    };

    const fetchMilestones = async () => {
      try {
        const response = await axios.get("/api/milestones");
        // Ensure we're setting an array
        setMilestones(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(
          "Error fetching milestones:",
          error.response ? error.response.data : error.message
        );
        setError("Failed to load milestones. Please check server connection.");
      }
    };

    fetchBrands();
    fetchMilestones();
  }, []);

  const addBrand = async () => {
    const newBrand = prompt("Enter new brand:");
    if (newBrand) {
      try {
        await axios.post("/api/brands", { name: newBrand });
        setBrands([...brands, { name: newBrand }]);
      } catch (error) {
        console.error("Error adding brand:", error);
        setError("Failed to add brand. Please try again.");
      }
    }
  };

  const addMilestone = async () => {
    const newMilestone = prompt("Enter new milestone:");
    if (newMilestone) {
      try {
        await axios.post("/api/milestones", { name: newMilestone });
        setMilestones([...milestones, { name: newMilestone }]);
      } catch (error) {
        console.error("Error adding milestone:", error);
        setError("Failed to add milestone. Please try again.");
      }
    }
  };

  // Handle the actual task addition with brand and milestone
  const handleAddTodoTask = () => {
    if (todoInput.trim() === "") return;

    addTodoTask(todoInput, selectedBrand, selectedMilestone);
    setTodoInput("");
  };

  // Update addTodoTask to match the new schema

  function addTodoTask(taskText, brandTitle, brandMilestone) {
    setTodoTasks([
      ...todoTasks,
      {
        task: taskText,
        brand: {
          title: brandTitle,
          milestone: brandMilestone,
        },
      },
    ]);
  }

  return (
    <div className="w-full mt-5 bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold">To-Do List</h2>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="flex flex-col mt-3 gap-2 bg-slate-200/20 p-2 rounded">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            placeholder="New Task..."
          />
          <button
            className="bg-blue-500 px-4 py-2 ml-2 rounded"
            onClick={handleAddTodoTask}
          >
            Add
          </button>
        </div>
        <div className="flex gap-2">
          <select
            className="ml-2 p-2 rounded bg-gray-700 text-white"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">Select Brand</option>
            {brands.map((brand, index) => (
              <option key={index} value={brand.name || ""}>
                {brand.name || ""}
              </option>
            ))}
          </select>
          <button
            className="bg-green-500 px-4 py-2 ml-2 rounded"
            onClick={addBrand}
          >
            Add Brand
          </button>
          <select
            className="ml-2 p-2 rounded bg-gray-700 text-white"
            value={selectedMilestone}
            onChange={(e) => setSelectedMilestone(e.target.value)}
            disabled={!selectedBrand}
          >
            <option value="">Select Milestone</option>
            {milestones.map((milestone, index) => (
              <option key={index} value={milestone.name || ""}>
                {milestone.name || ""}
              </option>
            ))}
          </select>
          <button
            className="bg-green-500 px-4 py-2 ml-2 rounded"
            onClick={addMilestone}
            disabled={!selectedBrand}
          >
            Add Milestone
          </button>
        </div>
      </div>
      <ul className="mt-3">
        {todoTasks &&
          todoTasks.map((task, index) => (
            <li
              key={index}
              className={`flex justify-between items-center p-2 mt-2 rounded ${
                task.completed ? "line-through text-gray-500" : ""
              }`}
            >
              <div>
                {task.task}
                {task.brand?.title && (
                  <span className="ml-2 text-blue-300">{task.brand.title}</span>
                )}
                {task.brand?.milestone && (
                  <span className="ml-2 text-green-300">
                    {task.brand.milestone}
                  </span>
                )}
              </div>
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
  );
};

export default TodoList;
