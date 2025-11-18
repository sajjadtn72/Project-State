import { ReactNode, useEffect } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Avatar, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/teams',
      icon: <TeamOutlined />,
      label: 'Teams',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tasks Board',
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <AntLayout className="min-h-screen">
      <Header className="flex items-center justify-between px-6">
        <div className="text-white text-lg font-bold">Project Management</div>
        <Space>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="flex-1 min-w-0 bg-transparent"
          />
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <Space className="text-white cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span>{user?.fullName}</span>
              {isAdmin && <span className="text-xs opacity-80">(Admin)</span>}
            </Space>
          </Dropdown>
        </Space>
      </Header>
      <Content className="p-6 bg-gray-50">
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;

