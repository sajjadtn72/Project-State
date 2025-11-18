import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, Select, Space, message, Modal, Form, Input, DatePicker, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { ProjectTask, Project, User } from '../../types';
import { taskService, CreateTaskDto } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

interface TaskColumn {
  id: string;
  title: string;
  tasks: ProjectTask[];
}

const TasksBoard: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAllProjects(),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks', selectedProject],
    queryFn: async () => {
      if (selectedProject === 'all') {
        return taskService.getAllTasks();
      } else {
        return taskService.getTasksByProjectId(selectedProject);
      }
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
    enabled: isAdmin,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => taskService.createTask(data),
    onSuccess: () => {
      message.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setModalVisible(false);
      form.resetFields();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => taskService.updateTaskStatus(id, status),
    onSuccess: () => {
      message.success('Task status updated');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const columns: TaskColumn[] = [
    {
      id: 'Todo',
      title: 'Todo',
      tasks: allTasks.filter(t => t.status === 'Todo'),
    },
    {
      id: 'Doing',
      title: 'Doing',
      tasks: allTasks.filter(t => t.status === 'Doing'),
    },
    {
      id: 'Done',
      title: 'Done',
      tasks: allTasks.filter(t => t.status === 'Done'),
    },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = allTasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      statusMutation.mutate({ id: taskId, status: targetStatus });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCreateTask = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmitTask = async () => {
    try {
      const values = await form.validateFields();
      if (!values.projectId) {
        message.error('Please select a project');
        return;
      }

      createTaskMutation.mutate({
        projectId: values.projectId,
        title: values.title,
        description: values.description,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate?.toISOString(),
      });
    } catch (error) {
      // Form validation error
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Tasks Board</Title>
        <Space>
          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 200 }}
          >
            <Select.Option value="all">All Projects</Select.Option>
            {projects.map((project) => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
              Create Task
            </Button>
          )}
        </Space>
      </div>

      <div className="flex gap-4 overflow-x-auto">
        {columns.map((column) => (
          <Card
            key={column.id}
            title={column.title}
            className="min-w-[300px] flex-1 bg-gray-100"
            onDrop={(e) => handleDrop(e, column.id)}
            onDragOver={handleDragOver}
          >
            <Space direction="vertical" size="middle" className="w-full">
              {column.tasks.map((task) => (
                <Card
                  key={task.id}
                  size="small"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-move bg-white"
                >
                  <div>
                    <Title level={5}>{task.title}</Title>
                    {task.description && <p className="m-0 text-xs text-gray-600">{task.description}</p>}
                    {task.projectName && (
                      <div className="mt-2 text-xs text-blue-500">
                        📁 {task.projectName}
                      </div>
                    )}
                    {task.assignedToName && (
                      <div className="mt-1 text-xs text-gray-600">
                        👤 {task.assignedToName}
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="mt-1 text-xs text-gray-400">
                        📅 {dayjs(task.dueDate).format('MMM DD, YYYY')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {column.tasks.length === 0 && (
                <div className="text-center text-gray-400 p-5">
                  No tasks
                </div>
              )}
            </Space>
          </Card>
        ))}
      </div>

      <Modal
        title="Create Task"
        open={modalVisible}
        onOk={handleSubmitTask}
        onCancel={() => setModalVisible(false)}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="projectId"
            label="Project"
            rules={[{ required: true, message: 'Please select a project' }]}
          >
            <Select placeholder="Select project">
              {projects.map((project) => (
                <Select.Option key={project.id} value={project.id}>
                  {project.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Task title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Task description" />
          </Form.Item>
          <Form.Item name="assignedTo" label="Assign To">
            <Select placeholder="Select user" allowClear>
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TasksBoard;

