import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Phone, Mail, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

interface AuthFormProps {
  onLogin: (userData: any) => void;
}

interface UserData {
  phone: string;
  password: string;
  email: string;
  username: string;
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [registerData, setRegisterData] = useState({
    phone: "",
    password: "",
    email: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card border-primary/20 shadow-primary">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForgotPassword(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex justify-center flex-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="w-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Reset Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Secure password recovery for your safety
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem("femina360_users") || "[]");
      const user = storedUsers.find(
        (u: UserData) => u.username === loginData.username && u.password === loginData.password
      );

      if (user) {
        // Store login session
        localStorage.setItem("femina360_session", JSON.stringify({
          ...user,
          loginTime: Date.now(),
          sessionId: Math.random().toString(36).substring(7)
        }));
        
        toast({
          title: "Welcome back!",
          description: "You're now protected by Femina360",
        });
        
        onLogin(user);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!registerData.username || !registerData.password || !registerData.phone || !registerData.email) {
      toast({
        title: "Registration Failed",
        description: "All fields are required for your safety",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(registerData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate registration
    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem("femina360_users") || "[]");
      
      if (storedUsers.find((u: UserData) => u.username === registerData.username)) {
        toast({
          title: "Registration Failed",
          description: "Username already exists",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if email already exists
      if (storedUsers.find((u: UserData) => u.email === registerData.email)) {
        toast({
          title: "Registration Failed",
          description: "Email already registered",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Save new user
      const newUser = { ...registerData, registeredAt: Date.now() };
      storedUsers.push(newUser);
      localStorage.setItem("femina360_users", JSON.stringify(storedUsers));
      
      // Auto login after registration
      localStorage.setItem("femina360_session", JSON.stringify({
        ...newUser,
        loginTime: Date.now(),
        sessionId: Math.random().toString(36).substring(7)
      }));
      
      toast({
        title: "Welcome to Femina360!",
        description: "Your digital guardian is now active",
      });
      
      onLogin(newUser);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card border-primary/20 shadow-primary">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            <span className="text-primary">Femina</span>360
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your Digital Guardian Awaits
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                </div>
                
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    Forgot Password?
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Securing Access..." : "Enter Protected Zone"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be used for login and emergency alerts
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Display Name
                  </Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Your display name"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters for security
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Activating Protection..." : "Activate Guardian"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}