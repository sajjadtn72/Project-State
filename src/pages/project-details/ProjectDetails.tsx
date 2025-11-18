import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Table, Modal, Form, Input, Select, DatePicker, message, Tag, Space, Typography, Popconfirm } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { ProjectTask, User, Team } from '../../types';
import { projectService } from '../../services/projectService';
import { taskService, CreateTaskDto, UpdateTaskDto } from '../../services/taskService';
import { userService } from '../../services/userService';
import { teamService } from '../../services/teamService';
import { useAuthStore } from '../../store/authStore';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [form] = Form.useForm();
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id!),
    enabled: !!id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', 'project', id],
    queryFn: () => taskService.getTasksByProjectId(id!),
    enabled: !!id,
  });

  const { data: team } = useQuery({
    queryKey: ['team', project?.teamId],
    queryFn: () => teamService.getTeamById(project!.teamId),
    enabled: !!project?.teamId,
  });

  const users = team?.members || [];

  const statusMutation = useMutation({
    mutationFn: (status: string) => projectService.updateProjectStatus(id!, status),
    onSuccess: () => {
      message.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => taskService.createTask(data),
    onSuccess: () => {
      message.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setTaskModalVisible(false);
      form.resetFields();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id: taskId, data }: { id: string; data: UpdateTaskDto }) => taskService.updateTask(taskId, data),
    onSuccess: () => {
      message.success('Task updated successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] });
      setTaskModalVisible(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      message.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const taskStatusMutation = useMutation({
    mutationFn: ({ id: taskId, status }: { id: string; status: string }) => taskService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      message.success('Task status updated');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] });
    },
  });

  const handleCreateTask = () => {
    setSelectedTask(null);
    form.resetFields();
    setTaskModalVisible(true);
  };

  const handleEditTask = (task: ProjectTask) => {
    setSelectedTask(task);
    form.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    });
    setTaskModalVisible(true);
  };

  const handleSubmitTask = async () => {
    try {
      const values = await form.validateFields();
      const taskData = {
        title: values.title,
        description: values.description,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate?.toISOString(),
        status: selectedTask?.status || 'Todo',
      };

      if (selectedTask) {
        updateTaskMutation.mutate({ id: selectedTask.id, data: { ...taskData, status: selectedTask.status } as UpdateTaskDto });
      } else {
        if (!id) return;
        createTaskMutation.mutate({ ...taskData, projectId: id });
      }
    } catch (error) {
      // Form validation error
    }
  };

  if (isLoading || !project) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NotStarted':
      case 'Todo':
        return 'default';
      case 'InProgress':
      case 'Doing':
        return 'processing';
      case 'Review':
        return 'warning';
      case 'Completed':
      case 'Done':
        return 'success';
      default:
        return 'default';
    }
  };

  const taskColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: ProjectTask) => (
        <Select
          value={status}
          onChange={(value) => taskStatusMutation.mutate({ id: record.id, status: value })}
          style={{ width: 120 }}
        >
          <Select.Option value="Todo">Todo</Select.Option>
          <Select.Option value="Doing">Doing</Select.Option>
          <Select.Option value="Done">Done</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedToName',
      key: 'assignedToName',
      render: (name: string) => name || '-',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ProjectTask) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTask(record)}
            disabled={!isAdmin}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => deleteTaskMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={!isAdmin}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={!isAdmin}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/projects')}
        className="mb-4"
      >
        Back to Projects
      </Button>

      <Card className="mb-6">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex justify-between items-center">
            <Title level={2}>{project.name}</Title>
            {isAdmin && (
              <Select
                value={project.status}
                onChange={(value) => statusMutation.mutate(value)}
                style={{ width: 150 }}
              >
                <Select.Option value="NotStarted">Not Started</Select.Option>
                <Select.Option value="InProgress">In Progress</Select.Option>
                <Select.Option value="Review">Review</Select.Option>
                <Select.Option value="Completed">Completed</Select.Option>
              </Select>
            )}
          </div>

          <Descriptions column={2}>
            <Descriptions.Item label="Team">{project.teamName}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(project.status)}>{project.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {project.startDate ? dayjs(project.startDate).format('MMM DD, YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {project.endDate ? dayjs(project.endDate).format('MMM DD, YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tasks">{project.taskCount}</Descriptions.Item>
          </Descriptions>

          {project.description && (
            <div>
              <Title level={5}>Description</Title>
              <p>{project.description}</p>
            </div>
          )}
        </Space>
      </Card>

      <Card
        title="Tasks"
        extra={
          isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
              Add Task
            </Button>
          )
        }
      >
        <Table
          columns={taskColumns}
          dataSource={tasks}
          rowKey="id"
        />
      </Card>

      <Modal
        title={selectedTask ? 'Edit Task' : 'Create Task'}
        open={taskModalVisible}
        onOk={handleSubmitTask}
        onCancel={() => setTaskModalVisible(false)}
        okText={selectedTask ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
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

export default ProjectDetails;

