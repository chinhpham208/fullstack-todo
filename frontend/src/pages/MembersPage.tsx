import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Typography, Card, Table, Tag, Button, Input, Select, Space,
  Popconfirm, Avatar, App as AntApp, Modal, Form,
} from "antd";
import {
  UserAddOutlined, DeleteOutlined, CrownOutlined, MailOutlined,
} from "@ant-design/icons";
import { useWorkspace } from "../contexts/WorkspaceContext";
import api from "../api";
import type { WorkspaceMember, Invitation, MemberRole, User } from "../types";

const { Title, Text } = Typography;

export default function MembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { currentWorkspace, userRole, refreshWorkspaces } = useWorkspace();
  const { message } = AntApp.useApp();
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("member");
  const [inviting, setInviting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);

  const currentUser: User | null = (() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  })();

  const canManage = userRole === "owner" || userRole === "admin";

  useEffect(() => {
    fetchInvitations();
  }, [workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInvitations = async () => {
    // This fetches user's own pending invitations, not workspace's
    // For admin view, we'd need a separate endpoint, but for now show own
    try {
      const res = await api.get<Invitation[]>("/invitations");
      setPendingInvitations(res.data);
    } catch {
      // silent
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !workspaceId) return;
    setInviting(true);
    try {
      await api.post(`/workspaces/${workspaceId}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      message.success(`Invitation sent to ${inviteEmail}!`);
      setInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      message.error(error.response?.data?.error || "Failed to send invitation!");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.put(`/workspaces/${workspaceId}/members/${userId}`, { role });
      await refreshWorkspaces();
      message.success("Role updated!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      message.error(error.response?.data?.error || "Failed to update role!");
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      await refreshWorkspaces();
      message.success("Member removed!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      message.error(error.response?.data?.error || "Failed to remove member!");
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await api.post(`/invitations/${invitationId}/accept`);
      await refreshWorkspaces();
      setPendingInvitations((prev) => prev.filter((i) => i._id !== invitationId));
      message.success("Invitation accepted!");
    } catch {
      message.error("Failed to accept invitation!");
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await api.post(`/invitations/${invitationId}/decline`);
      setPendingInvitations((prev) => prev.filter((i) => i._id !== invitationId));
      message.success("Invitation declined.");
    } catch {
      message.error("Failed to decline invitation!");
    }
  };

  const members = currentWorkspace?.members || [];

  const roleColor: Record<string, string> = {
    owner: "gold",
    admin: "blue",
    member: "default",
  };

  const columns = [
    {
      title: "Member",
      key: "member",
      render: (_: unknown, record: WorkspaceMember) => {
        const u = record.user;
        return (
          <Space>
            <Avatar style={{ backgroundColor: "#667eea" }}>
              {u.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Text strong>{u.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>{u.email}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Role",
      key: "role",
      width: 150,
      render: (_: unknown, record: WorkspaceMember) => {
        const u = record.user;
        const isOwner = record.role === "owner";
        const isSelf = currentUser?.id === (u.id || u._id);

        if (isOwner) {
          return <Tag icon={<CrownOutlined />} color="gold">Owner</Tag>;
        }

        if (canManage && !isSelf) {
          return (
            <Select
              value={record.role}
              onChange={(val) => handleRoleChange((u.id || u._id)!, val)}
              size="small"
              style={{ width: 100 }}
              options={[
                { label: "Admin", value: "admin" },
                { label: "Member", value: "member" },
              ]}
            />
          );
        }

        return <Tag color={roleColor[record.role]}>{record.role}</Tag>;
      },
    },
    ...(canManage
      ? [
          {
            title: "",
            key: "action",
            width: 80,
            render: (_: unknown, record: WorkspaceMember) => {
              const u = record.user;
              const isOwner = record.role === "owner";
              const isSelf = currentUser?.id === (u.id || u._id);
              if (isOwner || isSelf) return null;
              return (
                <Popconfirm
                  title="Remove this member?"
                  onConfirm={() => handleRemove((u.id || u._id)!)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Members ({members.length})
        </Title>
        {canManage && (
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setInviteModal(true)}>
            Invite
          </Button>
        )}
      </div>

      {/* Pending invitations for current user */}
      {pendingInvitations.length > 0 && (
        <Card title="Pending Invitations" style={{ marginBottom: 16 }}>
          {pendingInvitations.map((inv) => (
            <div key={inv._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <div>
                <Text strong>{typeof inv.workspace === "object" ? inv.workspace.name : "Workspace"}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Invited by {inv.invitedBy.name} as {inv.role}
                </Text>
              </div>
              <Space>
                <Button type="primary" size="small" onClick={() => handleAcceptInvitation(inv._id)}>
                  Accept
                </Button>
                <Button size="small" onClick={() => handleDeclineInvitation(inv._id)}>
                  Decline
                </Button>
              </Space>
            </div>
          ))}
        </Card>
      )}

      <Card>
        <Table
          dataSource={members}
          columns={columns}
          rowKey={(record) => (record.user.id || record.user._id)!}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Invite Modal */}
      <Modal
        title="Invite Member"
        open={inviteModal}
        onCancel={() => setInviteModal(false)}
        onOk={handleInvite}
        okText="Send Invitation"
        okButtonProps={{ loading: inviting, disabled: !inviteEmail.trim() }}
      >
        <Form layout="vertical">
          <Form.Item label="Email" required>
            <Input
              prefix={<MailOutlined />}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              type="email"
              onPressEnter={handleInvite}
            />
          </Form.Item>
          <Form.Item label="Role">
            <Select
              value={inviteRole}
              onChange={setInviteRole}
              options={[
                { label: "Member", value: "member" },
                { label: "Admin", value: "admin" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
