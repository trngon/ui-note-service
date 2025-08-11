import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './task-card';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskViewDetails?: (task: Task) => void;
  onDeleteAllDone?: () => void;
  isLoading?: boolean;
}

// Draggable Task Card wrapper
interface DraggableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onViewDetails?: (task: Task) => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetails,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onViewDetails={onViewDetails}
      />
    </div>
  );
};

// Droppable Column wrapper
interface DroppableColumnProps {
  status: TaskStatus;
  title: string;
  bgColor: string;
  tasks: Task[];
  allTasks: Task[]; // All tasks to show total counts
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskViewDetails?: (task: Task) => void;
  onDeleteAllDone?: () => void;
  getColumnIcon: (status: TaskStatus) => React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  status,
  title,
  bgColor,
  tasks,
  allTasks,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskViewDetails,
  onDeleteAllDone,
  getColumnIcon,
}) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: `column-${status}`,
    data: {
      type: 'column',
      status,
    },
  });

  // Get total count of all tasks for this status
  const totalCount = allTasks.filter(task => task.status === status).length;
  const isShowingLimited = status === 'Done' && totalCount > tasks.length;

  return (
    <div className="flex-1 min-w-0">
      {/* Column Header */}
      <div className={`${bgColor} rounded-lg p-4 mb-4 border border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getColumnIcon(status)}
            <h2 className="font-semibold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
              {isShowingLimited ? `${tasks.length} of ${totalCount}` : totalCount}
            </span>
            {status === 'Done' && totalCount > 0 && onDeleteAllDone && (
              <button
                onClick={onDeleteAllDone}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                title={`Delete all ${totalCount} done tasks`}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        {isShowingLimited && (
          <p className="text-xs text-gray-600 mt-2">
            Showing {tasks.length} most recent tasks
          </p>
        )}
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-96 p-2 rounded-lg transition-colors ${
          isOver ? 'bg-indigo-50 border-2 border-dashed border-indigo-300' : ''
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="mb-3 opacity-50">
                {getColumnIcon(status)}
              </div>
              <p className="text-sm">No tasks in {title.toLowerCase()}</p>
              <p className="text-xs text-gray-400 mt-1">Drag tasks here to update status</p>
            </div>
          ) : (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                onStatusChange={onTaskStatusChange}
                onViewDetails={onTaskViewDetails}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskViewDetails,
  onDeleteAllDone,
  isLoading = false,
}) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns: { status: TaskStatus; title: string; bgColor: string }[] = [
    { status: 'Todo', title: 'To Do', bgColor: 'bg-gray-50' },
    { status: 'In Progress', title: 'In Progress', bgColor: 'bg-blue-50' },
    { status: 'Done', title: 'Done', bgColor: 'bg-green-50' },
  ];

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    const filteredTasks = tasks.filter(task => task.status === status);
    
    // For Done column, limit to 5 most recent tasks (by updatedAt)
    if (status === 'Done') {
      return filteredTasks
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
    }
    
    return filteredTasks;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Determine the new status based on drop target
    let newStatus: TaskStatus | null = null;

    // Check if dropped over a column container
    if (over.id.toString().startsWith('column-')) {
      const status = over.id.toString().replace('column-', '') as TaskStatus;
      newStatus = status;
    } else {
      // Check if dropped over a specific task (within same column)
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Update task status if it changed
    if (newStatus && newStatus !== activeTask.status) {
      onTaskStatusChange(activeTask.id, newStatus);
    }
  };

  const getColumnIcon = (status: TaskStatus) => {
    switch (status) {
      case 'Todo':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'In Progress':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Done':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <DroppableColumn
              key={column.status}
              status={column.status}
              title={column.title}
              bgColor={column.bgColor}
              tasks={columnTasks}
              allTasks={tasks}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
              onTaskStatusChange={onTaskStatusChange}
              onTaskViewDetails={onTaskViewDetails}
              onDeleteAllDone={onDeleteAllDone}
              getColumnIcon={getColumnIcon}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="transform rotate-3 opacity-95">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};