import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, List, Typography, Tag, Spin, Space } from 'antd';
import { TeamOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { dashboardService } from '../../services/dashboardService';
import dayjs from 'dayjs';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboardData(),
  });

  if (isLoading) {
    return (
      <div className="text-center p-12">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <Title level={3}>Error loading dashboard</Title>
        <p>{(error as any)?.response?.data?.message || 'An error occurred'}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-12">
        <Title level={3}>No data available</Title>
      </div>
    );
  }

  const getStatusColor = (type: string) => {
    if (type === 'Project') return 'blue';
    if (type === 'Task') return 'green';
    return 'default';
  };

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Teams"
              value={dashboardData.totalTeams}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={dashboardData.totalProjects}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={dashboardData.projectsInProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={dashboardData.projectsCompleted}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Projects by Status">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Not Started" value={dashboardData.projectsNotStarted} />
              </Col>
              <Col span={12}>
                <Statistic title="In Review" value={dashboardData.projectsInReview} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Recent Activity">
            <List
              dataSource={dashboardData.recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color={getStatusColor(item.type)}>{item.type}</Tag>
                        {item.description}
                      </Space>
                    }
                    description={dayjs(item.createdAt).format('MMM DD, YYYY HH:mm')}
                  />
                </List.Item>
              )}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

