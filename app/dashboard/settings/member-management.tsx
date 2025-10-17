"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import {
  getOrganizationMembers,
  inviteMember,
  removeMember,
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
import { useActiveOrganization } from "@/lib/auth-client";
import type { InviteMemberInput, OrganizationMember } from "@/types/actions";

const InviteMemberSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum(["member", "admin"]),
});

export function MemberManagement() {
  const { data: organization } = useActiveOrganization();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadMembers is stable and doesn't need to be in dependencies
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const result = await getOrganizationMembers();
      if (result.error) {
        toast.error(result.error);
      } else {
        setMembers(result.data || []);
      }
    } catch (_error) {
      toast.error("Failed to load members");
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
        loadMembers();
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
        loadMembers();
      }
    } catch (_error) {
      toast.error("Failed to remove member");
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
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Manage organization members and send invitations.
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
                  setValue("role", value as "member" | "admin")
                }
                disabled={isInviting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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
                      <TableHead className="min-w-[100px]">Joined</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
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
                          <Badge
                            variant={
                              member.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-xs"
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
      </CardContent>
    </Card>
  );
}
