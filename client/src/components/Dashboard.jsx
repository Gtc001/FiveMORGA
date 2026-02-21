import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Sidebar from './Sidebar';
import StatsBar from './StatsBar';
import TaskBoard from './TaskBoard';
import TaskModal from './TaskModal';
import Toast from './Toast';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [modalTask, setModalTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [tasksData, catsData, statsData] = await Promise.all([
        api.tasks.list({
          category_id: selectedCategory || '',
          search,
          priority: filterPriority,
        }),
        api.categories.list(),
        api.stats.get(),
      ]);
      setTasks(tasksData);
      setCategories(catsData);
      setStats(statsData);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [selectedCategory, search, filterPriority]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (taskId, status) => {
    try {
      const updated = await api.tasks.updateStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await api.tasks.update(taskData.id, taskData);
        showToast('Tâche mise à jour');
      } else {
        await api.tasks.create(taskData);
        showToast('Tâche créée');
      }
      setShowModal(false);
      setModalTask(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.tasks.delete(taskId);
      showToast('Tâche supprimée');
      setShowModal(false);
      setModalTask(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateCategory = async (catData) => {
    try {
      await api.categories.create(catData);
      showToast('Catégorie créée');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await api.categories.delete(catId);
      showToast('Catégorie supprimée');
      if (selectedCategory === catId) setSelectedCategory(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openNewTask = () => {
    setModalTask(null);
    setShowModal(true);
  };

  const openEditTask = (task) => {
    setModalTask(task);
    setShowModal(true);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-dark-900">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StatsBar
          stats={stats}
          search={search}
          onSearch={setSearch}
          filterPriority={filterPriority}
          onFilterPriority={setFilterPriority}
          onNewTask={openNewTask}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <TaskBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEditTask={openEditTask}
        />
      </div>

      {showModal && (
        <TaskModal
          task={modalTask}
          categories={categories}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => { setShowModal(false); setModalTask(null); }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
