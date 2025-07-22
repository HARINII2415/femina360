import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Phone, 
  User, 
  Heart, 
  Trash2, 
  ArrowLeft,
  Shield,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

interface EmergencyContactsProps {
  onBack: () => void;
}

export function EmergencyContacts({ onBack }: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const stored = JSON.parse(localStorage.getItem("femina360_emergency_contacts") || "[]");
    setContacts(stored);
  };

  const saveContacts = (updatedContacts: Contact[]) => {
    localStorage.setItem("femina360_emergency_contacts", JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Missing Information",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(newContact.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    // Get current user's phone number from session
    const session = JSON.parse(localStorage.getItem("femina360_session") || "{}");
    const userPhone = session.phone;

    // Check if emergency contact phone is different from user's phone
    if (userPhone && newContact.phone === userPhone) {
      toast({
        title: "Invalid Contact",
        description: "Emergency contact cannot be your own phone number",
        variant: "destructive",
      });
      return;
    }

    // Check if contact already exists
    if (contacts.find(c => c.phone === newContact.phone)) {
      toast({
        title: "Contact Already Exists",
        description: "This phone number is already in your emergency contacts",
        variant: "destructive",
      });
      return;
    }
    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship || "Emergency Contact",
      isPrimary: contacts.length === 0, // First contact is primary
    };

    const updatedContacts = [...contacts, contact];
    saveContacts(updatedContacts);
    
    setNewContact({ name: "", phone: "", relationship: "" });
    setIsAddingContact(false);
    
    toast({
      title: "Contact Added",
      description: `${contact.name} has been added to your emergency contacts`,
    });
  };

  const removeContact = (id: string) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    
    // If we removed the primary contact, make the first remaining contact primary
    if (updatedContacts.length > 0 && !updatedContacts.some(c => c.isPrimary)) {
      updatedContacts[0].isPrimary = true;
    }
    
    saveContacts(updatedContacts);
    toast({
      title: "Contact Removed",
      description: "Emergency contact has been removed",
    });
  };

  const setPrimary = (id: string) => {
    const updatedContacts = contacts.map(c => ({
      ...c,
      isPrimary: c.id === id
    }));
    saveContacts(updatedContacts);
    toast({
      title: "Primary Contact Updated",
      description: "Primary emergency contact has been changed",
    });
  };

  const testCall = (contact: Contact) => {
    window.open(`tel:${contact.phone}`);
    toast({
      title: "Test Call",
      description: `Calling ${contact.name}...`,
    });
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
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Emergency Contacts</h1>
                  <p className="text-sm text-muted-foreground">Manage your trusted contacts</p>
                </div>
              </div>
            </div>
            
            <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add Emergency Contact
                  </DialogTitle>
                  <DialogDescription>
                    Add a trusted person who can help you in emergencies
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="contact-name"
                      placeholder="Enter contact's full name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact-relationship" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Relationship
                    </Label>
                    <Input
                      id="contact-relationship"
                      placeholder="e.g., Family, Friend, Partner"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button onClick={addContact} variant="hero" className="flex-1">
                      Add Contact
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingContact(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Status Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Contact Status
            </CardTitle>
            <CardDescription>
              Emergency contact management for your safety
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={contacts.length > 0 ? "secondary" : "destructive"}>
                {contacts.length} Emergency Contacts
              </Badge>
              {contacts.length === 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Add at least one contact for protection</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <Card className="bg-card border-dashed border-2 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No Emergency Contacts</h3>
                <p className="text-muted-foreground max-w-md">
                  Add trusted contacts who can help you in emergency situations. 
                  They will be called and receive your location during emergencies.
                </p>
              </div>
              <Button 
                onClick={() => setIsAddingContact(true)} 
                variant="hero" 
                size="lg"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contacts.map((contact, index) => (
              <Card key={contact.id} className="bg-card border-border hover:shadow-primary transition-all duration-300">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{contact.name}</h3>
                        {contact.isPrimary && (
                          <Badge variant="secondary" className="text-xs">
                            Primary
                          </Badge>
                        )}
                        {index === 0 && contacts.length === 1 && (
                          <Badge variant="secondary" className="text-xs">
                            Only Contact
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {contact.relationship}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testCall(contact)}
                      className="gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      Test Call
                    </Button>
                    
                    {!contact.isPrimary && contacts.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(contact.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeContact(contact.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Usage Instructions */}
        <Card className="bg-gradient-secondary border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground">How Emergency Contacts Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">During Emergencies:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Primary contact is called first</li>
                  <li>• All contacts receive your GPS location</li>
                  <li>• Voice and video evidence is sent</li>
                  <li>• Continuous location updates provided</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Best Practices:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Add at least 2-3 trusted contacts</li>
                  <li>• Include family and close friends</li>
                  <li>• Test calls regularly to verify numbers</li>
                  <li>• Keep primary contact most reliable</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}