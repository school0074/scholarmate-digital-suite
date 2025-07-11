import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Download, Share, Mail, Phone, MapPin, Calendar, GraduationCap } from 'lucide-react';

const StudentIDCard = () => {
  const { profile } = useAuth();

  const studentInfo = {
    id: 'STU001234',
    rollNumber: '10A-25',
    class: 'Grade 10-A',
    session: '2024-2025',
    bloodGroup: 'O+',
    emergencyContact: '+1-555-0123',
    address: '123 Student Lane, Education City'
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Digital ID Card</h1>
        <p className="text-muted-foreground">Your official digital student identification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ID Card Display */}
        <div className="space-y-6">
          <Card className="overflow-hidden bg-gradient-primary text-white border-0 shadow-glow">
            <CardContent className="p-0">
              {/* Card Header */}
              <div className="bg-white/10 backdrop-blur-sm p-4 text-center border-b border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <GraduationCap className="h-6 w-6" />
                  <h3 className="text-lg font-bold">ScholarMate Academy</h3>
                </div>
                <p className="text-sm opacity-90">Student Identification Card</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Profile Photo */}
                  <div className="w-24 h-28 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Student Photo" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-4xl font-bold">
                        {profile?.full_name?.charAt(0) || 'S'}
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="text-xl font-bold">{profile?.full_name || 'Student Name'}</h4>
                      <p className="text-sm opacity-90">Student ID: {studentInfo.id}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="opacity-75">Roll No.</p>
                        <p className="font-medium">{studentInfo.rollNumber}</p>
                      </div>
                      <div>
                        <p className="opacity-75">Class</p>
                        <p className="font-medium">{studentInfo.class}</p>
                      </div>
                      <div>
                        <p className="opacity-75">Session</p>
                        <p className="font-medium">{studentInfo.session}</p>
                      </div>
                      <div>
                        <p className="opacity-75">Blood Group</p>
                        <p className="font-medium">{studentInfo.bloodGroup}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
                  <div className="text-xs opacity-75">
                    <p>Valid until: July 2025</p>
                    <p>Emergency: {studentInfo.emergencyContact}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <QrCode className="h-10 w-10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Share className="h-4 w-4" />
              <span>Share ID</span>
            </Button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{profile?.address || studentInfo.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Academic Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Admission Date</p>
                  <p className="font-medium">April 2024</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Academic Year</p>
                  <p className="font-medium">{studentInfo.session}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Section</p>
                  <p className="font-medium">A</p>
                </div>
                <div>
                  <p className="text-muted-foreground">House</p>
                  <p className="font-medium">Blue House</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Emergency Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Parent/Guardian</p>
                  <p className="font-medium">John Doe (Father)</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emergency Number</p>
                  <p className="font-medium">{studentInfo.emergencyContact}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Medical Info</p>
                  <p className="font-medium">Blood Group: {studentInfo.bloodGroup}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentIDCard;