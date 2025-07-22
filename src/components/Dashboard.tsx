import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Phone, 
  MapPin, 
  Mic, 
  Camera, 
  Users, 
  Settings, 
  LogOut,
  AlertTriangle,
  Heart,
  Eye,
  Smartphone,
  StopCircle,
  Upload,
  Wifi,
  WifiOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmergencyRecorder } from "@/components/EmergencyRecorder";

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onNavigateToLaws: () => void;
  onNavigateToContacts: () => void;
}

export function Dashboard({ user, onLogout, onNavigateToLaws, onNavigateToContacts }: DashboardProps) {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [voiceHelpCount, setVoiceHelpCount] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [shakeDetectionEnabled, setShakeDetectionEnabled] = useState(true);
  const [voiceDetectionEnabled, setVoiceDetectionEnabled] = useState(true);
  const [showStopButton, setShowStopButton] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize emergency systems
  useEffect(() => {
    initializeGPS();
    if (voiceDetectionEnabled) {
      initializeVoiceRecognition();
    }
    if (shakeDetectionEnabled) {
      initializeShakeDetection();
    }
    loadEmergencyContacts();
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      cleanup();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [voiceDetectionEnabled, shakeDetectionEnabled]);

  const initializeGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "GPS Active",
            description: "Location tracking enabled for your safety",
          });
        },
        (error) => {
          console.error("GPS Error:", error);
          toast({
            title: "GPS Warning",
            description: "Please enable location services for full protection",
            variant: "destructive",
          });
        }
      );
    }
  };

  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          
          if (transcript.includes('help')) {
            setVoiceHelpCount(prev => {
              const newCount = prev + 1;
              if (newCount >= 5) {
                startEmergencyCountdown('voice');
                return 0;
              }
              return newCount;
            });
          }
        }
      };
      
      recognitionRef.current.start();
      setIsListening(true);
      
      toast({
        title: "Voice Guard Active",
        description: "Say 'Help' 5 times to trigger emergency",
      });
    }
  };

  const initializeShakeDetection = () => {
    if (window.DeviceMotionEvent) {
      let lastShake = 0;
      let shakeCounter = 0;
      
      const handleMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;
        
        const totalAcceleration = Math.sqrt(
          Math.pow(acceleration.x || 0, 2) +
          Math.pow(acceleration.y || 0, 2) +
          Math.pow(acceleration.z || 0, 2)
        );
        
        const now = Date.now();
        if (totalAcceleration > 20 && now - lastShake > 100) {
          lastShake = now;
          shakeCounter++;
          setShakeCount(shakeCounter);
          
          if (shakeTimeoutRef.current) {
            clearTimeout(shakeTimeoutRef.current);
          }
          
          shakeTimeoutRef.current = setTimeout(() => {
            shakeCounter = 0;
            setShakeCount(0);
          }, 2000);
          
          if (shakeCounter >= 3) {
            startEmergencyCountdown('shake');
            shakeCounter = 0;
            setShakeCount(0);
          }
        }
      };
      
      window.addEventListener('devicemotion', handleMotion);
      
      toast({
        title: "Shake Detection Active",
        description: "Shake device 3 times rapidly for emergency",
      });
      
      return () => {
        window.removeEventListener('devicemotion', handleMotion);
      };
    }
  };

  const loadEmergencyContacts = () => {
    const contacts = JSON.parse(localStorage.getItem("femina360_emergency_contacts") || "[]");
    setEmergencyContacts(contacts);
  };

  const startEmergencyCountdown = (trigger: 'shake' | 'voice') => {
    setShowStopButton(true);
    setEmergencyCountdown(10);
    
    toast({
      title: "🚨 EMERGENCY DETECTED",
      description: `${trigger} trigger activated - 10 seconds to cancel`,
      variant: "destructive",
    });

    let countdown = 10;
    countdownRef.current = setInterval(() => {
      countdown--;
      setEmergencyCountdown(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownRef.current!);
        setShowStopButton(false);
        triggerEmergency(trigger);
      }
    }, 1000);
  };

  const cancelEmergency = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setShowStopButton(false);
    setEmergencyCountdown(0);
    
    toast({
      title: "Emergency Cancelled",
      description: "False alarm cancelled successfully",
    });
  };

  const triggerEmergency = async (trigger: 'shake' | 'voice') => {
    setIsEmergencyActive(true);
    
    toast({
      title: "🚨 EMERGENCY ACTIVATED",
      description: `Triggered by ${trigger} detection - Sending alerts...`,
      variant: "destructive",
    });

    // Start recording
    await startEmergencyRecording();
    
    // Send location updates
    if (location) {
      await sendLocationToContacts();
    }
    
    // Upload evidence and notify contacts
    await uploadEvidenceAndNotify();
  };

  const startEmergencyRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      setIsRecording(true);
      
      const chunks: Blob[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await uploadEvidence(blob);
      };
      
      mediaRecorderRef.current.start();
      
      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 30000);
      
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Recording Warning",
        description: "Could not start emergency recording",
        variant: "destructive",
      });
    }
  };

  const uploadEvidence = async (videoBlob: Blob) => {
    setUploadStatus('uploading');
    
    try {
      // Simulate upload to Supabase Storage
      const fileName = `emergency_${Date.now()}_${user.username}.webm`;
      
      // In real implementation, this would upload to Supabase Storage
      // const { data, error } = await supabase.storage
      //   .from('emergency-evidence')
      //   .upload(fileName, videoBlob);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const evidenceUrl = `https://your-supabase-url.com/storage/v1/object/public/emergency-evidence/${fileName}`;
      
      setUploadStatus('success');
      
      // Call edge function to send SMS and make calls
      await callEmergencyEdgeFunction(evidenceUrl);
      
      toast({
        title: "Evidence Uploaded",
        description: "Emergency evidence secured and contacts notified",
      });
      
    } catch (error) {
      setUploadStatus('error');
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Evidence could not be uploaded. Trying alternative methods...",
        variant: "destructive",
      });
      
      // Fallback to direct contact methods
      await callEmergencyContacts();
      await sendEmergencySMS();
    }
  };

  const callEmergencyEdgeFunction = async (evidenceUrl: string) => {
    try {
      // Call Supabase Edge Function
      const response = await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.phone,
          userName: user.username || user.phone,
          location: location,
          evidenceUrl: evidenceUrl,
          emergencyContacts: emergencyContacts,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Edge function call failed');
      }
      
      const result = await response.json();
      console.log('Emergency alert sent:', result);
      
    } catch (error) {
      console.error('Edge function error:', error);
      throw error;
    }
  };

  const uploadEvidenceAndNotify = async () => {
    // This will be handled by the recording stop event
    toast({
      title: "Processing Emergency",
      description: "Recording evidence and notifying contacts...",
    });
  };

  const sendLocationToContacts = async () => {
    if (!location || emergencyContacts.length === 0) return;
    
    const locationMessage = `EMERGENCY ALERT: ${user.username || user.phone} needs help! Location: https://maps.google.com/?q=${location.lat},${location.lng}`;
    
    // Simulate SMS sending
    emergencyContacts.forEach(contact => {
      console.log(`Sending location to ${contact.name} (${contact.phone}): ${locationMessage}`);
    });
    
    toast({
      title: "Location Shared",
      description: `GPS coordinates sent to ${emergencyContacts.length} contacts`,
    });
  };

  const callEmergencyContacts = async () => {
    if (emergencyContacts.length === 0) {
      toast({
        title: "No Emergency Contacts",
        description: "Please add emergency contacts for protection",
        variant: "destructive",
      });
      return;
    }
    
    // Try to call the first emergency contact
    const primaryContact = emergencyContacts[0];
    if (primaryContact) {
      window.open(`tel:${primaryContact.phone}`);
      toast({
        title: "Calling Emergency Contact",
        description: `Calling ${primaryContact.name}...`,
      });
    }
  };

  const sendEmergencySMS = async () => {
    // Simulate SMS with evidence
    toast({
      title: "Evidence Collected",
      description: "Voice & video evidence being sent to contacts",
    });
  };

  const stopEmergency = () => {
    setIsEmergencyActive(false);
    setIsRecording(false);
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    toast({
      title: "Emergency Deactivated",
      description: "You are safe. Guardian mode restored",
    });
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Welcome, {user.username || user.phone}
                </h1>
                <p className="text-sm text-muted-foreground">Your guardian is active</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={isEmergencyActive ? "destructive" : "secondary"} className="animate-pulse-glow">
                {isEmergencyActive ? "🚨 EMERGENCY" : "🛡️ PROTECTED"}
              </Badge>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Emergency Status */}
        {isEmergencyActive && (
          <Card className="border-destructive bg-destructive/10 animate-pulse-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                EMERGENCY MODE ACTIVE
              </CardTitle>
              <CardDescription>
                Emergency protocols activated. Evidence being processed...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadStatus !== 'idle' && (
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      {uploadStatus === 'uploading' && 'Uploading evidence...'}
                      {uploadStatus === 'success' && 'Evidence uploaded successfully'}
                      {uploadStatus === 'error' && 'Upload failed - using backup methods'}
                    </span>
                  </div>
                )}
                <Button onClick={stopEmergency} variant="destructive" size="lg">
                  I'm Safe - Deactivate Emergency
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Countdown */}
        {showStopButton && (
          <Card className="border-emergency bg-emergency/10 animate-pulse-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emergency">
                <StopCircle className="h-5 w-5" />
                EMERGENCY COUNTDOWN: {emergencyCountdown}s
              </CardTitle>
              <CardDescription>
                Emergency will activate automatically. Press STOP to cancel false alarm.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={cancelEmergency} 
                variant="outline" 
                size="lg"
                className="w-full border-emergency text-emergency hover:bg-emergency hover:text-white"
              >
                <StopCircle className="mr-2 h-5 w-5" />
                STOP - False Alarm
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Detection Controls */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Detection Settings
            </CardTitle>
            <CardDescription>
              Control your emergency detection features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Shake Detection</div>
                <div className="text-sm text-muted-foreground">
                  Detect 3 rapid shakes to trigger emergency
                </div>
              </div>
              <Switch
                checked={shakeDetectionEnabled}
                onCheckedChange={setShakeDetectionEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Voice Detection</div>
                <div className="text-sm text-muted-foreground">
                  Say "Help" 5 times to trigger emergency
                </div>
              </div>
              <Switch
                checked={voiceDetectionEnabled}
                onCheckedChange={setVoiceDetectionEnabled}
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              {isOnline ? (
                <div className="flex items-center gap-2 text-green-500">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Online - Full protection active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Offline - Limited functionality</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Dashboard */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                GPS Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={location ? "secondary" : "destructive"}>
                  {location ? "Active" : "Disabled"}
                </Badge>
                {location && (
                  <span className="text-xs text-muted-foreground">
                    Ready for tracking
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mic className="h-4 w-4 text-primary" />
                Voice Guard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant={isListening && voiceDetectionEnabled ? "secondary" : "destructive"}>
                  {isListening && voiceDetectionEnabled ? "Listening" : "Disabled"}
                </Badge>
                {voiceHelpCount > 0 && (
                  <Progress value={(voiceHelpCount / 5) * 100} className="h-2" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Smartphone className="h-4 w-4 text-primary" />
                Shake Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant={shakeDetectionEnabled ? "secondary" : "destructive"}>
                  {shakeDetectionEnabled ? "Active" : "Disabled"}
                </Badge>
                {shakeCount > 0 && (
                  <div>
                    <Progress value={(shakeCount / 3) * 100} className="h-2" />
                    <span className="text-xs text-muted-foreground">
                      {shakeCount}/3 shakes
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={emergencyContacts.length > 0 ? "secondary" : "destructive"}>
                {emergencyContacts.length} contacts
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card border-border hover:shadow-primary transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                Manage your trusted emergency contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onNavigateToContacts} variant="outline" className="w-full">
                Manage Contacts
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-primary transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Women's Laws
              </CardTitle>
              <CardDescription>
                AI-powered guidance on women's rights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onNavigateToLaws} variant="outline" className="w-full">
                Get Legal Guidance
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-primary transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Manual Emergency
              </CardTitle>
              <CardDescription>
                Trigger emergency protocols manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => startEmergencyCountdown('voice')} 
                variant="emergency" 
                className="w-full"
                disabled={isEmergencyActive || showStopButton}
              >
                EMERGENCY ALERT
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <Card className="border-primary bg-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Camera className="h-5 w-5 animate-pulse" />
                Emergency Recording Active
              </CardTitle>
              <CardDescription>
                30-second voice and video evidence is being captured and will be uploaded securely
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Emergency Recorder Component */}
        <EmergencyRecorder 
          isActive={isEmergencyActive}
          onRecordingComplete={(blob) => uploadEvidence(blob)}
        />
      </main>
    </div>
  );
}