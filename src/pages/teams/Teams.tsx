import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tag, Space, Typography, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, UserAddOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Team, User } from '../../types';
import { teamService, CreateTeamDto, UpdateTeamDto } from '../../services/teamService';
import { userService, CreatePersonnelDto } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Teams: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [personnelModalVisible, setPersonnelModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [form] = Form.useForm();
  const [personnelForm] = Form.useForm();
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
    onSuccess: (newTeam) => {
      message.success('Team created successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setModalVisible(false);
      form.resetFields();
      return newTeam;
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

  const createPersonnelMutation = useMutation({
    mutationFn: (data: CreatePersonnelDto) => userService.createPersonnel(data),
    onSuccess: async (newUser) => {
      message.success('Personnel created successfully');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      
      // Automatically add to selected team if viewing team members
      if (selectedTeam && memberModalVisible) {
        await addMemberMutation.mutateAsync({ teamId: selectedTeam.id, userId: newUser.id });
        setPersonnelModalVisible(false);
        personnelForm.resetFields();
      } else if (modalVisible && !selectedTeam) {
        // If creating team, add to form
        const currentMembers = form.getFieldValue('members') || [];
        form.setFieldsValue({ members: [...currentMembers, newUser.id] });
        setPersonnelModalVisible(false);
        personnelForm.resetFields();
        message.info('Personnel added to team form. Click Create to finish.');
      } else {
        setPersonnelModalVisible(false);
        personnelForm.resetFields();
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
      const selectedMembers = values.members || [];
      
      if (selectedTeam) {
        updateMutation.mutate({ id: selectedTeam.id, data: values });
      } else {
        // Create team first, then add members
        createMutation.mutate(
          { name: values.name, description: values.description },
          {
            onSuccess: async (newTeam) => {
              // Add selected members to the new team
              if (selectedMembers.length > 0) {
                for (const userId of selectedMembers) {
                  await addMemberMutation.mutateAsync({ teamId: newTeam.id, userId });
                }
              }
            },
          }
        );
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

  const handleCreatePersonnel = () => {
    personnelForm.resetFields();
    setPersonnelModalVisible(true);
  };

  const handlePersonnelCreatedAndAddToForm = async (newUser: User) => {
    // If team form is open, add the new user to the members select
    if (modalVisible && !selectedTeam) {
      const currentMembers = form.getFieldValue('members') || [];
      form.setFieldsValue({ members: [...currentMembers, newUser.id] });
    }
  };

  const handlePersonnelSubmit = async () => {
    try {
      const values = await personnelForm.validateFields();
      createPersonnelMutation.mutate(values);
    } catch (error) {
      // Form validation error
    }
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
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <UserOutlined />
            <span>{record.members.length} member(s)</span>
            <Button type="link" size="small" onClick={() => handleViewMembers(record)}>
              View All
            </Button>
          </Space>
          {record.members.length > 0 && (
            <div>
              <Space wrap size="small">
                {record.members.slice(0, 3).map((member) => (
                  <Tag key={member.id} color="blue">
                    {member.fullName}
                    {member.jobRole && ` (${member.jobRole})`}
                  </Tag>
                ))}
                {record.members.length > 3 && (
                  <Tag>+{record.members.length - 3} more</Tag>
                )}
              </Space>
            </div>
          )}
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
        <Space>
          <Button 
            icon={<UserAddOutlined />} 
            onClick={handleCreatePersonnel}
            disabled={!isAdmin}
          >
           Add user
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
            disabled={!isAdmin}
          >
           Add team
          </Button>
        </Space>
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
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={selectedTeam ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Team Name"
            rules={[{ required: true, message: 'Please enter team name' }]}
          >
            <Input placeholder="Enter team name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter team description" />
          </Form.Item>
          {!selectedTeam && (
            <Form.Item
              name="members"
              label="Add Personnel to Team"
              tooltip="Select personnel to add to this team"
            >
              <Select
                mode="multiple"
                placeholder="Select personnel"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.fullName}${user.jobRole ? ` (${user.jobRole})` : ''}`,
                }))}
                notFoundContent={
                  <div className="text-center p-2">
                    <Button 
                      type="link" 
                      icon={<UserAddOutlined />}
                      onClick={() => {
                        setModalVisible(false);
                        handleCreatePersonnel();
                      }}
                    >
                      Create New Personnel
                    </Button>
                  </div>
                }
              />
            </Form.Item>
          )}
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
                {member.fullName} {member.jobRole && `(${member.jobRole})`}
              </Tag>
            ))}
          </Space>
        </div>
        {isAdmin && (
          <div>
            <div className="mb-4">
              <Title level={5}>Add Existing Member</Title>
              <Space wrap>
                {availableUsers.map((user) => (
                  <Tag
                    key={user.id}
                    onClick={() => addMemberMutation.mutate({ teamId: selectedTeam!.id, userId: user.id })}
                    className="cursor-pointer"
                    color="green"
                  >
                    + {user.fullName} {user.jobRole && `(${user.jobRole})`}
                  </Tag>
                ))}
                {availableUsers.length === 0 && <Text type="secondary">No available users</Text>}
              </Space>
            </div>
            <div>
              <Button 
                type="dashed" 
                icon={<UserAddOutlined />} 
                onClick={handleCreatePersonnel}
                block
              >
                Add New Personnel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Add New Personnel"
        open={personnelModalVisible}
        onOk={handlePersonnelSubmit}
        onCancel={() => setPersonnelModalVisible(false)}
        okText="Create & Add to Team"
        cancelText="Cancel"
        confirmLoading={createPersonnelMutation.isPending}
      >
        <Form form={personnelForm} layout="vertical">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="jobRole"
            label="Job Role"
            rules={[{ required: true, message: 'Please enter job role' }]}
          >
            <Input placeholder="e.g., Developer, Manager, Designer" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teams;

