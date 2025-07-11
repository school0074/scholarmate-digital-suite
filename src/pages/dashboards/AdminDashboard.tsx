import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  School, 
  BarChart3, 
  Settings, 
  Bell, 
  LogOut,
  UserPlus,
  BookOpen,
  TrendingUp,
  Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();

  const quickStats = [
    { title: 'Total Students', value: '1,248', icon: Users, color: 'text-blue-600' },
    { title: 'Total Teachers', value: '85', icon: School, color: 'text-green-600' },
    { title: 'Active Classes', value: '48', icon: BookOpen, color: 'text-purple-600' },
    { title: 'System Usage', value: '94%', icon: TrendingUp, color: 'text-orange-600' },
  ];

  const recentActivities = [
    { title: 'New teacher invitation sent to john@email.com', time: '1 hour ago', type: 'invite' },
    { title: 'Grade 12 results published', time: '3 hours ago', type: 'announcement' },
    { title: 'System backup completed successfully', time: '6 hours ago', type: 'system' },
    { title: 'Monthly attendance report generated', time: '1 day ago', type: 'report' },
    { title: 'New student enrolled in Grade 9-B', time: '2 days ago', type: 'enrollment' },
  ];

  const systemAlerts = [
    { title: 'Server maintenance scheduled', message: 'Scheduled for this Sunday 2AM-4AM', priority: 'medium' },
    { title: 'Low storage warning', message: 'Student files storage at 85% capacity', priority: 'high' },
    { title: 'Backup verification needed', message: 'Weekly backup requires verification', priority: 'low' },
  ];

  const pendingApprovals = [
    { title: 'Teacher application - Sarah Johnson', type: 'teacher', time: '2 hours ago' },
    { title: 'New homework assignment - Math Grade 10', type: 'content', time: '4 hours ago' },
    { title: 'Student transfer request - Mike Chen', type: 'transfer', time: '1 day ago' },
    { title: 'Study material upload - Physics Notes', type: 'content', time: '2 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || 'Administrator'}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Recent Activities</span>
              </CardTitle>
              <CardDescription>
                Latest system activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
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

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>System Alerts</span>
              </CardTitle>
              <CardDescription>
                Important system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-foreground text-sm">{alert.title}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      alert.priority === 'medium' ? 'bg-accent/10 text-accent' :
                      'bg-secondary/10 text-secondary'
                    }`}>
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Pending Approvals</span>
            </CardTitle>
            <CardDescription>
              Items requiring administrative approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovals.map((item, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-foreground text-sm">{item.title}</p>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{item.time}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="default" className="flex-1">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Administrative tools and functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">Invite Teacher</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <School className="h-6 w-6" />
                <span className="text-sm">Manage Classes</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;