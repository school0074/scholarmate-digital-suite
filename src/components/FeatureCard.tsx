import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  features: string[];
  userType: "student" | "teacher" | "admin";
  image: string;
}

const FeatureCard = ({ icon, title, description, features, userType, image }: FeatureCardProps) => {
  const getGradient = () => {
    switch (userType) {
      case "student":
        return "from-blue-500 to-purple-600";
      case "teacher":
        return "from-green-500 to-blue-500";
      case "admin":
        return "from-purple-500 to-pink-500";
      default:
        return "from-blue-500 to-purple-600";
    }
  };

  const getBadgeColor = () => {
    switch (userType) {
      case "student":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "teacher":
        return "bg-green-100 text-green-700 border-green-200";
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-large transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/80">
      {/* Header with gradient */}
      <div className={`h-32 bg-gradient-to-r ${getGradient()} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4">
          <img src={image} alt={title} className="w-16 h-16 object-contain opacity-90" />
        </div>
        <div className="absolute bottom-4 left-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor()}`}>
            {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Title and description */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Features list */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Key Features:</h4>
          <ul className="space-y-2">
            {features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                {feature}
              </li>
            ))}
            {features.length > 4 && (
              <li className="text-sm text-primary font-medium">
                +{features.length - 4} more features
              </li>
            )}
          </ul>
        </div>

        {/* CTA */}
        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          Explore {title}
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

export default FeatureCard;