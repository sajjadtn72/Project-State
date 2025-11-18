import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tag, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Team, User } from '../../types';
import { teamService, CreateTeamDto, UpdateTeamDto } from '../../services/teamService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Teams: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [form] = Form.useForm();
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getAllTeams(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTeamDto) => teamService.createTeam(data),
    onSuccess: () => {
      message.success('Team created successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setModalVisible(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDto }) => teamService.updateTeam(id, data),
    onSuccess: () => {
      message.success('Team updated successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setModalVisible(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => {
      message.success('Team deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamService.addMember(teamId, userId),
    onSuccess: () => {
      message.success('Member added successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (selectedTeam) {
        queryClient.invalidateQueries({ queryKey: ['team', selectedTeam.id] });
      }
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamService.removeMember(teamId, userId),
    onSuccess: () => {
      message.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (selectedTeam) {
        queryClient.invalidateQueries({ queryKey: ['team', selectedTeam.id] });
      }
    },
  });

  const handleCreate = () => {
    setSelectedTeam(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    form.setFieldsValue(team);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedTeam) {
        updateMutation.mutate({ id: selectedTeam.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      // Form validation error
    }
  };

  const handleViewMembers = async (team: Team) => {
    const fullTeam = await teamService.getTeamById(team.id);
    setSelectedTeam(fullTeam);
    setMemberModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Members',
      key: 'members',
      render: (_: any, record: Team) => (
        <Space>
          <UserOutlined />
          <span>{record.members.length}</span>
          <Button type="link" onClick={() => handleViewMembers(record)}>
            View
          </Button>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Team) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!isAdmin}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this team?"
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

  const availableUsers = selectedTeam
    ? users.filter(u => !selectedTeam.members.some(m => m.id === u.id))
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Teams</Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Team
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={teams}
        rowKey="id"
        loading={isLoading}
      />

      <Modal
        title={selectedTeam ? 'Edit Team' : 'Create Team'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={selectedTeam ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter team name' }]}
          >
            <Input placeholder="Team name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Team description" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Team Members - ${selectedTeam?.name}`}
        open={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="mb-4">
          <Title level={5}>Current Members</Title>
          <Space wrap>
            {selectedTeam?.members.map((member) => (
              <Tag
                key={member.id}
                closable={isAdmin}
                onClose={() => removeMemberMutation.mutate({ teamId: selectedTeam.id, userId: member.id })}
                color="blue"
              >
                {member.fullName}
              </Tag>
            ))}
          </Space>
        </div>
        {isAdmin && (
          <div>
            <Title level={5}>Add Member</Title>
            <Space wrap>
              {availableUsers.map((user) => (
                <Tag
                  key={user.id}
                  onClick={() => addMemberMutation.mutate({ teamId: selectedTeam!.id, userId: user.id })}
                  className="cursor-pointer"
                  color="green"
                >
                  + {user.fullName}
                </Tag>
              ))}
              {availableUsers.length === 0 && <Text type="secondary">No available users</Text>}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Teams;

