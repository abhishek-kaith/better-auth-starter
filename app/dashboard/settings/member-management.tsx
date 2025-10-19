"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import {
  cancelInvitation,
  getOrganizationInvitations,
} from "@/actions/invitation";
import {
  getOrganizationMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
} from "@/actions/organization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberTableSkeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveOrganization, useSession } from "@/lib/auth-client";
import type {
  InvitationDetails,
  InviteMemberInput,
  OrganizationMember,
} from "@/types/actions";

const InviteMemberSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum(["member", "admin", "owner"]),
});

export function MemberManagement() {
  const { data: organization } = useActiveOrganization();
  const { data: session } = useSession();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<InvitationDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(InviteMemberSchema),
    defaultValues: {
      role: "member",
    },
  });

  const role = watch("role");

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadData is stable and doesn't need to be in dependencies
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersResult, invitationsResult] = await Promise.all([
        getOrganizationMembers(),
        getOrganizationInvitations(),
      ]);

      if (membersResult.error) {
        toast.error(membersResult.error);
      } else {
        setMembers(membersResult.data || []);
      }

      if (invitationsResult.error) {
        toast.error(invitationsResult.error);
      } else {
        setInvitations(invitationsResult.data || []);
      }
    } catch (_error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: InviteMemberInput) => {
    setIsInviting(true);
    try {
      const result = await inviteMember(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Invitation sent successfully");
        reset();
        loadData();
      }
    } catch (_error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberIdOrEmail: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const result = await removeMember({ memberIdOrEmail });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Member removed successfully");
        loadData();
      }
    } catch (_error) {
      toast.error("Failed to remove member");
    }
  };

  const handleUpdateMemberRole = async (
    memberId: string,
    newRole: "member" | "admin" | "owner",
  ) => {
    if (
      !confirm(
        `Are you sure you want to change this member's role to ${newRole}?`,
      )
    ) {
      return;
    }

    setUpdatingRole(memberId);
    try {
      const result = await updateMemberRole({ memberId, role: newRole });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Member role updated successfully");
        loadData();
      }
    } catch (_error) {
      toast.error("Failed to update member role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    try {
      const result = await cancelInvitation(invitationId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Invitation cancelled successfully");
        loadData();
      }
    } catch (_error) {
      toast.error("Failed to cancel invitation");
    }
  };

  if (!organization) {
    return null;
  }

  if (isLoading) {
    return <MemberTableSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
        <CardDescription>
          Manage organization members and invitations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                disabled={isInviting}
                className="w-full"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setValue("role", value as "member" | "admin" | "owner")
                }
                disabled={isInviting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isInviting}
                className="w-full flex items-center gap-2"
              >
                {isInviting && <Spinner size="sm" />}
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        </form>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations ({invitations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Current Members</h4>
              {members.length === 0 ? (
                <div className="text-sm text-muted-foreground p-8 text-center border border-dashed rounded-lg">
                  No members found. Send an invitation to add team members.
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Name</TableHead>
                          <TableHead className="min-w-[180px]">Email</TableHead>
                          <TableHead className="min-w-[80px]">Role</TableHead>
                          <TableHead className="min-w-[100px]">
                            Joined
                          </TableHead>
                          <TableHead className="w-[140px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.user.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              {member.user.email}
                            </TableCell>
                            <TableCell>
                              {member.role === "owner" ? (
                                <Badge
                                  variant="default"
                                  className="font-medium"
                                >
                                  Owner
                                </Badge>
                              ) : (
                                <Select
                                  value={member.role}
                                  onValueChange={(
                                    newRole: "member" | "admin",
                                  ) =>
                                    handleUpdateMemberRole(member.id, newRole)
                                  }
                                  disabled={updatingRole === member.id}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">
                                      Member
                                    </SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={
                                  member.role === "owner" ||
                                  session?.user?.id === member.userId ||
                                  session?.user?.email === member.user.email
                                }
                                className="text-xs"
                                title={
                                  member.role === "owner"
                                    ? "Cannot remove organization owner"
                                    : session?.user?.id === member.userId ||
                                        session?.user?.email ===
                                          member.user.email
                                      ? "You cannot remove yourself"
                                      : "Remove member"
                                }
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Pending Invitations</h4>
              {invitations.length === 0 ? (
                <div className="text-sm text-muted-foreground p-8 text-center border border-dashed rounded-lg">
                  No pending invitations. All sent invitations will appear here.
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[180px]">Email</TableHead>
                          <TableHead className="min-w-[80px]">Role</TableHead>
                          <TableHead className="min-w-[80px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">
                            Invited By
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            Expires
                          </TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((invitation) => (
                          <TableRow key={invitation.id}>
                            <TableCell className="font-medium">
                              {invitation.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  invitation.role === "admin"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {invitation.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  invitation.status === "pending"
                                    ? "outline"
                                    : invitation.status === "accepted"
                                      ? "default"
                                      : "destructive"
                                }
                              >
                                {invitation.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {invitation.inviterName}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(
                                invitation.expiresAt,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {invitation.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelInvitation(invitation.id)
                                  }
                                  className="text-xs"
                                >
                                  Cancel
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
