import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Space, Typography, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Project, Team } from '../../types';
import { projectService, CreateProjectDto, UpdateProjectDto } from '../../services/projectService';
import { teamService } from '../../services/teamService';
import { useAuthStore } from '../../store/authStore';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Projects: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAllProjects(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getAllTeams(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectDto) => projectService.createProject(data),
    onSuccess: () => {
      message.success('Project created successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setModalVisible(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) => projectService.updateProject(id, data),
    onSuccess: () => {
      message.success('Project updated successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setModalVisible(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      message.success('Project deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => projectService.updateProjectStatus(id, status),
    onSuccess: () => {
      message.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const filteredProjects = statusFilter === 'all'
    ? allProjects
    : allProjects.filter(p => p.status === statusFilter);

  const handleCreate = () => {
    setSelectedProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    form.setFieldsValue({
      ...project,
      dateRange: project.startDate && project.endDate
        ? [dayjs(project.startDate), dayjs(project.endDate)]
        : null,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const projectData = {
        name: values.name,
        description: values.description,
        teamId: values.teamId,
        startDate: values.dateRange?.[0]?.toISOString(),
        endDate: values.dateRange?.[1]?.toISOString(),
        status: selectedProject?.status || 'NotStarted',
      };

      if (selectedProject) {
        updateMutation.mutate({ id: selectedProject.id, data: { ...projectData, status: selectedProject.status } as UpdateProjectDto });
      } else {
        createMutation.mutate(projectData);
      }
    } catch (error) {
      // Form validation error
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NotStarted':
        return 'default';
      case 'InProgress':
        return 'processing';
      case 'Review':
        return 'warning';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Team',
      dataIndex: 'teamName',
      key: 'teamName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Project) => (
        <Select
          value={status}
          onChange={(value) => statusMutation.mutate({ id: record.id, status: value })}
          style={{ width: 120 }}
          disabled={!isAdmin}
        >
          <Select.Option value="NotStarted">Not Started</Select.Option>
          <Select.Option value="InProgress">In Progress</Select.Option>
          <Select.Option value="Review">Review</Select.Option>
          <Select.Option value="Completed">Completed</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Tasks',
      dataIndex: 'taskCount',
      key: 'taskCount',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!isAdmin}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => deleteMutation.mutate(record.id)}
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
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Projects</Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Project
          </Button>
        )}
      </div>

      <Card className="mb-4">
        <Space>
          <span>Filter by Status:</span>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="NotStarted">Not Started</Select.Option>
            <Select.Option value="InProgress">In Progress</Select.Option>
            <Select.Option value="Review">Review</Select.Option>
            <Select.Option value="Completed">Completed</Select.Option>
          </Select>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredProjects}
        rowKey="id"
        loading={isLoading}
      />

      <Modal
        title={selectedProject ? 'Edit Project' : 'Create Project'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={selectedProject ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Project name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Project description" />
          </Form.Item>
          <Form.Item
            name="teamId"
            label="Team"
            rules={[{ required: true, message: 'Please select a team' }]}
          >
            <Select placeholder="Select team">
              {teams.map((team) => (
                <Select.Option key={team.id} value={team.id}>
                  {team.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="Date Range">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;

