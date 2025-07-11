import FeatureCard from "@/components/FeatureCard";
import studentIcon from "@/assets/student-icon.png";
import teacherIcon from "@/assets/teacher-icon.png";
import adminIcon from "@/assets/admin-icon.png";

const FeaturesSection = () => {
  const features = [
    {
      icon: "🎓",
      title: "Student Portal",
      description:
        "Comprehensive digital platform designed to enhance student learning experience with modern tools and seamless connectivity.",
      userType: "student" as const,
      image: studentIcon,
      features: [
        "Digital ID Card",
        "Attendance Tracker",
        "Homework Upload System",
        "Assignment Reminders",
        "Timetable with Alerts",
        "Exam Schedule & Countdown",
        "Gradebook & Marks Report",
        "Ask a Doubt Chat",
        "Progress Tracker",
        "Quiz & Brain Games",
        "E-Learning Access",
        "Achievement Wall",
      ],
    },
    {
      icon: "📚",
      title: "Teacher Dashboard",
      description:
        "Powerful teaching tools that streamline classroom management, content delivery, and student assessment processes.",
      userType: "teacher" as const,
      image: teacherIcon,
      features: [
        "Create & Assign Homework",
        "Digital Attendance",
        "Upload Study Materials",
        "Manage Timetable",
        "Broadcast Announcements",
        "Review & Grade Assignments",
        "Private Student Notes",
        "Class Communication",
        "Performance Analytics",
        "Resource Library",
        "Video Messaging",
        "Parent Communication",
      ],
    },
    {
      icon: "⚙️",
      title: "Admin Control",
      description:
        "Complete administrative oversight with advanced analytics, user management, and system-wide control capabilities.",
      userType: "admin" as const,
      image: adminIcon,
      features: [
        "Manage Teachers & Students",
        "Add/Remove Classes",
        "Approve Content",
        "Track Performance",
        "Attendance Analytics",
        "Push Notifications",
        "Event Calendar",
        "Exam Management",
        "Fee Management",
        "System Settings",
        "Reports & Analytics",
        "Security Controls",
      ],
    },
  ];

  return (
    <section
      id="features"
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background to-muted/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
            <span className="text-primary text-sm font-medium">
              ✨ Complete Digital Suite
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Built for Every Role in
            <span className="block text-primary">Modern Education</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From students to administrators, our comprehensive platform provides
            tailored tools and features that enhance productivity and learning
            outcomes.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              features={feature.features}
              userType={feature.userType}
              image={feature.image}
            />
          ))}
        </div>

        {/* Additional Features Preview */}
        <div className="mt-16 text-center">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Plus Many More Features
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div>💬 Communication Hub</div>
              <div>🎉 Engagement Tools</div>
              <div>💸 Payment System</div>
              <div>📱 Mobile PWA</div>
              <div>🌙 Dark Mode</div>
              <div>🌍 Multilingual</div>
              <div>☁️ Cloud Backup</div>
              <div>🔔 Push Notifications</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
