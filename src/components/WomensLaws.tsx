import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Scale, 
  Send, 
  ArrowLeft, 
  BookOpen, 
  Shield, 
  Users,
  AlertTriangle,
  MessageCircle,
  Bot
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface WomensLawsProps {
  onBack: () => void;
}

const lawsDatabase = {
  "domestic violence": {
    title: "Domestic Violence Protection",
    content: "You have the right to protection from domestic violence. Laws include restraining orders, emergency protective orders, and safe housing assistance. Contact local authorities immediately if you're in danger.",
    resources: ["National Domestic Violence Hotline: 1-800-799-7233", "Local women's shelters", "Legal aid services"]
  },
  "workplace harassment": {
    title: "Workplace Sexual Harassment",
    content: "Sexual harassment in the workplace is illegal. You have rights to a safe work environment, to report harassment without retaliation, and to seek legal remedies including compensation.",
    resources: ["EEOC complaint filing", "HR department reporting", "Employment attorneys"]
  },
  "reproductive rights": {
    title: "Reproductive Rights",
    content: "You have fundamental rights regarding reproductive choices, including access to contraception, pregnancy-related medical care, and protection from pregnancy discrimination.",
    resources: ["Planned Parenthood", "ACLU Reproductive Freedom Project", "Local health clinics"]
  },
  "equal pay": {
    title: "Equal Pay Rights",
    content: "Women have the right to equal pay for equal work. The Equal Pay Act and Title VII protect against wage discrimination based on gender.",
    resources: ["Department of Labor", "AAUW salary negotiation resources", "Employment law attorneys"]
  },
  "education": {
    title: "Education Rights (Title IX)",
    content: "Title IX protects against sex discrimination in education, including sexual harassment and assault on campus. Schools must provide safe learning environments.",
    resources: ["Title IX coordinators", "Campus advocacy centers", "Legal aid for students"]
  },
  "property rights": {
    title: "Property and Financial Rights",
    content: "Women have equal rights to own property, enter contracts, access credit, and make financial decisions. Marital property laws vary by state.",
    resources: ["Legal aid societies", "Financial planning services", "Real estate attorneys"]
  }
};

export function WomensLaws({ onBack }: WomensLawsProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Women's Rights Legal Assistant. I can help you understand your rights and legal protections. What would you like to know about?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(inputMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Check for specific law topics
    for (const [key, law] of Object.entries(lawsDatabase)) {
      if (lowerQuery.includes(key) || lowerQuery.includes(key.replace(" ", ""))) {
        return `**${law.title}**\n\n${law.content}\n\n**Resources:**\n${law.resources.map(r => `• ${r}`).join('\n')}\n\nIs there anything specific about this topic you'd like to know more about?`;
      }
    }

    // General responses
    if (lowerQuery.includes("help") || lowerQuery.includes("emergency")) {
      return "If you're in immediate danger, please call emergency services (911) right away. For non-emergency legal help, I can assist with information about domestic violence protection, workplace rights, reproductive rights, and more. What specific area would you like to learn about?";
    }

    if (lowerQuery.includes("rights")) {
      return "Women have many fundamental rights protected by law, including:\n\n• Protection from violence and harassment\n• Equal treatment in workplace and education\n• Reproductive autonomy\n• Equal pay for equal work\n• Property and financial rights\n\nWhich area would you like to explore?";
    }

    if (lowerQuery.includes("lawyer") || lowerQuery.includes("attorney")) {
      return "To find legal representation:\n\n• Contact your local bar association for referrals\n• Look for legal aid societies in your area\n• Many organizations offer free or low-cost legal services for women\n• Consider contacting specialized women's rights organizations\n\nWould you like information about a specific legal issue?";
    }

    // Default response
    return "I understand you're looking for legal information. I can help you with topics like:\n\n• Domestic violence protection\n• Workplace harassment and discrimination\n• Reproductive rights\n• Equal pay issues\n• Education rights (Title IX)\n• Property and financial rights\n\nPlease tell me more about your specific situation or question.";
  };

  const quickTopics = [
    { text: "Domestic Violence", icon: Shield },
    { text: "Workplace Rights", icon: Users },
    { text: "Reproductive Rights", icon: Heart },
    { text: "Equal Pay", icon: Scale },
    { text: "Education Rights", icon: BookOpen },
    { text: "Emergency Help", icon: AlertTriangle }
  ];

  const handleQuickTopic = (topic: string) => {
    setInputMessage(topic);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Women's Laws & Rights</h1>
                  <p className="text-sm text-muted-foreground">AI-powered legal guidance</p>
                </div>
              </div>
            </div>
            
            <Badge variant="secondary" className="gap-2">
              <Bot className="h-3 w-3" />
              AI Assistant Active
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 h-[calc(100vh-88px)] flex flex-col">
        {/* Quick Topics */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Quick Topics
            </CardTitle>
            <CardDescription>
              Click on any topic to get instant legal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {quickTopics.map((topic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTopic(topic.text)}
                  className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-primary/10 hover:border-primary"
                >
                  <topic.icon className="h-4 w-4" />
                  <span className="text-xs">{topic.text}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 bg-card border-border flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Legal Assistant Chat
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-gradient-primary text-white'
                          : 'bg-muted text-foreground border border-border'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.text}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.isUser ? 'text-white/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground border border-border rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="ml-2 text-xs text-muted-foreground">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your legal rights..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 bg-input border-border"
                />
                <Button 
                  onClick={sendMessage} 
                  variant="hero" 
                  size="icon"
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                This AI assistant provides general legal information only. For specific legal advice, consult with a qualified attorney.
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}