import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Lock, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

type Step = 'phone' | 'otp' | 'password' | 'success';

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if phone number exists in registered users
      const storedUsers = JSON.parse(localStorage.getItem("femina360_users") || "[]");
      const userExists = storedUsers.find((u: any) => u.phone === phoneNumber);

      if (!userExists) {
        toast({
          title: "Phone Not Found",
          description: "This phone number is not registered with us",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Simulate OTP sending via SMS API
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP temporarily (in real app, this would be server-side)
      localStorage.setItem("femina360_reset_otp", JSON.stringify({
        phone: phoneNumber,
        otp: generatedOTP,
        timestamp: Date.now(),
        expires: Date.now() + (10 * 60 * 1000) // 10 minutes
      }));

      // Simulate SMS sending
      console.log(`SMS sent to ${phoneNumber}: Your Femina360 reset code is ${generatedOTP}`);
      
      setOtpSent(true);
      setStep('otp');
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const storedOTP = JSON.parse(localStorage.getItem("femina360_reset_otp") || "{}");
      
      if (!storedOTP.otp || Date.now() > storedOTP.expires) {
        toast({
          title: "OTP Expired",
          description: "Please request a new verification code",
          variant: "destructive",
        });
        setStep('phone');
        setIsLoading(false);
        return;
      }

      if (storedOTP.otp !== otp) {
        toast({
          title: "Invalid OTP",
          description: "Please check the code and try again",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setStep('password');
      toast({
        title: "OTP Verified",
        description: "Please set your new password",
      });

    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Update password in stored users
      const storedUsers = JSON.parse(localStorage.getItem("femina360_users") || "[]");
      const updatedUsers = storedUsers.map((user: any) => 
        user.phone === phoneNumber 
          ? { ...user, password: newPassword }
          : user
      );
      
      localStorage.setItem("femina360_users", JSON.stringify(updatedUsers));
      localStorage.removeItem("femina360_reset_otp");
      
      setStep('success');
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated securely",
      });

    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <form onSubmit={sendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Registered Phone Number
              </Label>
              <Input
                id="reset-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-input border-border"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the phone number you registered with
              </p>
            </div>
            
            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? "Sending OTP..." : "Send Verification Code"}
            </Button>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={verifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-otp" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Verification Code
              </Label>
              <Input
                id="reset-otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-input border-border text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Code sent to {phoneNumber}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setStep('phone')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                variant="hero" 
                className="flex-1"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </div>
          </form>
        );

      case 'password':
        return (
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? "Updating Password..." : "Reset Password"}
            </Button>
          </form>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Password Reset Complete
              </h3>
              <p className="text-muted-foreground">
                Your password has been successfully updated. You can now login with your new password.
              </p>
            </div>
            
            <Button 
              onClick={onBack}
              variant="hero" 
              size="lg" 
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderStep()}
    </div>
  );
}