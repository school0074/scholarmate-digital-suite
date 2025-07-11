import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Trophy, 
  Bell, 
  FileText,
  BarChart3,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

const StudentDashboard = () => {
  const { profile } = useAuth();

  const quickStats = [
    { title: 'Total Subjects', value: '6', icon: BookOpen, color: 'text-blue-600' },
    { title: 'Attendance', value: '95%', icon: Calendar, color: 'text-green-600' },
    { title: 'Pending Homework', value: '3', icon: FileText, color: 'text-orange-600' },
    { title: 'Overall Grade', value: 'A-', icon: Trophy, color: 'text-purple-600' },
  ];

  const recentActivities = [
    { title: 'Math homework submitted', time: '2 hours ago', type: 'homework' },
    { title: 'Science test scheduled for tomorrow', time: '1 day ago', type: 'exam' },
    { title: 'New announcement from principal', time: '2 days ago', type: 'announcement' },
    { title: 'English assignment due in 3 days', time: '3 days ago', type: 'reminder' },
  ];

  const upcomingEvents = [
    { title: 'Math Test', date: 'Tomorrow, 10:00 AM', subject: 'Mathematics' },
    { title: 'Science Project Due', date: 'Friday, 3:00 PM', subject: 'Physics' },
    { title: 'Literature Essay', date: 'Next Monday', subject: 'English' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.full_name || 'Student'}! 
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your studies today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Recent Activities</span>
              </CardTitle>
              <CardDescription>
                Your latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-border/50">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                View All Activities
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-secondary" />
                <span>Upcoming</span>
              </CardTitle>
              <CardDescription>
                Tests, assignments & deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-all duration-200 hover:shadow-soft">
                  <p className="font-medium text-foreground mb-1">{event.title}</p>
                  <p className="text-sm text-muted-foreground mb-2">{event.date}</p>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                    {event.subject}
                  </span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
                View Full Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access your most used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Submit Homework</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2 hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">View Grades</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 hover:scale-105">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Check Timetable</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105">
              <Users className="h-6 w-6" />
              <span className="text-sm">Ask Teacher</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;