"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Mail,
  Shield,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  disableTwoFactor,
  enableTwoFactor,
  sendOTP,
} from "@/actions/two-factor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExtendedUser } from "@/types/auth";

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface TwoFactorFormProps {
  user: ExtendedUser;
}

export function TwoFactorForm({ user }: TwoFactorFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    totpURI: string;
    backupCodes: string[];
  } | null>(null);
  const [copiedURI, setCopiedURI] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onEnable = (data: PasswordFormData) => {
    startTransition(async () => {
      const result = await enableTwoFactor(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        if (result.data?.totpURI && result.data?.backupCodes) {
          setQrCodeData({
            totpURI: result.data.totpURI,
            backupCodes: result.data.backupCodes,
          });
        }
        setShowQrCode(true);
        reset();
      }
    });
  };

  const onDisable = (data: PasswordFormData) => {
    startTransition(async () => {
      const result = await disableTwoFactor(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        reset();
      }
    });
  };

  const onSendOTP = () => {
    startTransition(async () => {
      const result = await sendOTP();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }
    });
  };

  const copyToClipboard = async (text: string, type: "uri" | number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "uri") {
        setCopiedURI(true);
        setTimeout(() => setCopiedURI(false), 2000);
      } else {
        setCopiedCodes((prev) => [...prev, type]);
        setTimeout(
          () => setCopiedCodes((prev) => prev.filter((id) => id !== type)),
          2000,
        );
      }
    } catch (_err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const ActionForm = ({
    onSubmit,
    buttonText,
    variant = "default",
  }: {
    onSubmit: (data: PasswordFormData) => void;
    buttonText: string;
    variant?: "default" | "destructive";
  }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Enter your password"
            disabled={isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button
        type="submit"
        variant={variant}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Processing..." : buttonText}
      </Button>
    </form>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {user.twoFactorEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {user.twoFactorEnabled
              ? "Two-factor authentication is currently enabled for your account."
              : "Add an extra layer of security to your account with TOTP or email-based authentication."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                Status: {user.twoFactorEnabled ? "Enabled" : "Disabled"}
              </div>
              <div className="text-sm text-muted-foreground">
                {user.twoFactorEnabled
                  ? "Your account is protected with 2FA"
                  : "Choose your preferred 2FA method below"}
              </div>
            </div>
            {user.twoFactorEnabled && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Disable 2FA</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      Enter your password to disable two-factor authentication.
                    </DialogDescription>
                  </DialogHeader>
                  <ActionForm
                    onSubmit={onDisable}
                    buttonText="Disable 2FA"
                    variant="destructive"
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!user.twoFactorEnabled && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Available 2FA Methods:</div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Authenticator App (TOTP)</div>
                    <div className="text-sm text-muted-foreground">
                      Use Google Authenticator, Authy, or similar apps
                    </div>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Set Up Authenticator App
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Enable TOTP Two-Factor Authentication
                      </DialogTitle>
                      <DialogDescription>
                        Enter your password to set up authenticator app 2FA.
                      </DialogDescription>
                    </DialogHeader>
                    <ActionForm
                      onSubmit={onEnable}
                      buttonText="Enable TOTP 2FA"
                      variant="default"
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Email OTP</div>
                    <div className="text-sm text-muted-foreground">
                      Receive one-time passwords via email
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onSendOTP}
                  disabled={isPending}
                >
                  {isPending ? "Sending..." : "Test Email OTP"}
                </Button>
                <div className="text-xs text-muted-foreground">
                  Email OTP is automatically available when 2FA is enabled.
                  Click to test sending an OTP to your email.
                </div>
              </div>
            </div>
          )}

          {user.twoFactorEnabled && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Active 2FA Method:</div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Authenticator App (TOTP)</div>
                    <div className="text-sm text-muted-foreground">
                      Using time-based one-time passwords
                    </div>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Email OTP</div>
                      <div className="text-sm text-muted-foreground">
                        Alternative authentication method
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSendOTP}
                    disabled={isPending}
                  >
                    {isPending ? "Sending..." : "Send Test OTP"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and save the backup
              codes.
            </DialogDescription>
          </DialogHeader>
          {qrCodeData && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData.totpURI)}`}
                    alt="QR Code for 2FA setup"
                    width={192}
                    height={192}
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Manual Entry URI</Label>
                <div className="flex gap-2">
                  <Input
                    value={qrCodeData.totpURI}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(qrCodeData.totpURI, "uri")}
                  >
                    {copiedURI ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Backup Codes (Save these safely)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {qrCodeData.backupCodes.map((code, index) => (
                    <div
                      key={`${code} ${index.toString()}`}
                      className="flex gap-2"
                    >
                      <Input
                        value={code}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code, index)}
                      >
                        {copiedCodes.includes(index) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => setShowQrCode(false)} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
