import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, Mic, Clock } from "lucide-react";

interface EmergencyRecorderProps {
  isActive: boolean;
  onRecordingComplete: (blob: Blob) => void;
}

export function EmergencyRecorder({ isActive, onRecordingComplete }: EmergencyRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isRecording) {
      startRecording();
    } else if (!isActive && isRecording) {
      stopRecording();
    }

    return () => {
      cleanup();
    };
  }, [isActive]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onRecordingComplete(blob);
        cleanup();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      setProgress(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          setProgress((newTime / 30) * 100);
          
          if (newTime >= 30) {
            stopRecording();
            return 30;
          }
          
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    cleanup();
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);
    setProgress(0);
  };

  if (!isRecording) {
    return null;
  }

  return (
    <Card className="border-primary bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 animate-pulse" />
            <Mic className="h-5 w-5 animate-pulse" />
          </div>
          Emergency Evidence Recording
        </CardTitle>
        <CardDescription>
          Capturing 30-second video and audio evidence for your safety
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {30 - recordingTime}s remaining
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="text-xs text-muted-foreground">
          Recording will automatically stop after 30 seconds and be securely uploaded
        </div>
      </CardContent>
    </Card>
  );
}