import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface Task {
  id: string;
  name: string;
  description: string;
  time: string;
  location: string;
}

interface TodaysTaskListProps {
  events: any[];
  onClose: () => void;
}

const TodaysTaskList: React.FC<TodaysTaskListProps> = ({ events, onClose }) => {
  // Convert calendar events to tasks
  const initialTasks: Task[] = events
    .filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      const today = new Date();
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      );
    })
    .map(event => ({
      id: event.id,
      name: event.summary,
      description: event.description || "",
      time: event.start.dateTime
        ? `${new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : "All Day",
      location: event.location || ""
    }));

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    description: '',
    time: '',
    location: ''
  });

  const handleAddTask = () => {
    if (newTask.name) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          name: newTask.name || '',
          description: newTask.description || '',
          time: newTask.time || '',
          location: newTask.location || ''
        }
      ]);

      // Reset form
      setNewTask({
        name: '',
        description: '',
        time: '',
        location: ''
      });
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <button className="text-blue-500 text-sm" onClick={onClose}>
          BACK
        </button>
        <h2 className="text-xl font-bold text-center flex-1">Today's Task List</h2>
        <button className="text-blue-500 text-sm">
          GENERATE
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {tasks.map(task => (
          <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{task.name}</div>
                <div className="text-sm text-gray-600">{task.description}</div>
                <div className="text-sm text-gray-600">{task.time}</div>
                <div className="text-sm text-gray-600">{task.location}</div>
              </div>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveTask(task.id)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="space-y-2">
          <div>
            <label className="block text-sm text-gray-600">Name:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={newTask.name}
              onChange={(e) => setNewTask({...newTask, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Description:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Time:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={newTask.time}
              onChange={(e) => setNewTask({...newTask, time: e.target.value})}
              placeholder="e.g. 9:00 AM - 10:30 AM"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Location:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={newTask.location}
              onChange={(e) => setNewTask({...newTask, location: e.target.value})}
            />
          </div>
        </div>
      </div>

      <button 
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
        onClick={handleAddTask}
      >
        <FaPlus className="mr-2" /> Add Task
      </button>
    </div>
  );
};

export default TodaysTaskList;