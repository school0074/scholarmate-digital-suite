import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  BookOpen,
  Clock,
  CheckCircle
} from 'lucide-react';

const TeacherDashboard = () => {
  const { profile, signOut } = useAuth();

  const quickStats = [
    { title: 'Total Students', value: '180', icon: Users, color: 'text-blue-600' },
    { title: 'Classes Today', value: '6', icon: Calendar, color: 'text-green-600' },
    { title: 'Pending Grading', value: '12', icon: FileText, color: 'text-orange-600' },
    { title: 'Assignments Created', value: '45', icon: BookOpen, color: 'text-purple-600' },
  ];

  const todaySchedule = [
    { time: '9:00 AM', subject: 'Mathematics', class: 'Grade 10-A', room: 'Room 201' },
    { time: '10:30 AM', subject: 'Mathematics', class: 'Grade 10-B', room: 'Room 201' },
    { time: '1:00 PM', subject: 'Algebra', class: 'Grade 11-A', room: 'Room 203' },
    { time: '2:30 PM', subject: 'Geometry', class: 'Grade 9-C', room: 'Room 201' },
  ];

  const recentActivities = [
    { title: 'Grade 10-A homework submissions reviewed', time: '1 hour ago', status: 'completed' },
    { title: 'Math test scheduled for Grade 11-A', time: '2 hours ago', status: 'scheduled' },
    { title: 'New announcement posted', time: '1 day ago', status: 'posted' },
    { title: 'Attendance marked for Grade 10-B', time: '2 days ago', status: 'completed' },
  ];

  const pendingTasks = [
    { title: 'Grade Math Quiz - Grade 10-A', due: 'Due tomorrow', priority: 'high' },
    { title: 'Prepare lesson plan for Algebra', due: 'Due in 2 days', priority: 'medium' },
    { title: 'Review homework submissions', due: 'Due today', priority: 'high' },
    { title: 'Update student progress reports', due: 'Due this week', priority: 'low' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-secondary rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || 'Teacher'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
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
          {/* Today's Schedule */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Today's Schedule</span>
                </CardTitle>
                <CardDescription>
                  Your classes for today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySchedule.map((schedule, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-foreground">{schedule.subject}</p>
                      <span className="text-sm text-muted-foreground">{schedule.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{schedule.class}</p>
                    <p className="text-xs text-accent">{schedule.room}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View Full Schedule
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Recent Activities</span>
                </CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Activities
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tasks */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Pending Tasks</span>
                </CardTitle>
                <CardDescription>
                  Tasks that need your attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingTasks.map((task, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="font-medium text-foreground text-sm mb-1">{task.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{task.due}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      task.priority === 'medium' ? 'bg-accent/10 text-accent' :
                      'bg-secondary/10 text-secondary'
                    }`}>
                      {task.priority} priority
                    </span>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access your most used teaching tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Mark Attendance</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Create Assignment</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Grade Homework</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Bell className="h-6 w-6" />
                  <span className="text-sm">Send Announcement</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;