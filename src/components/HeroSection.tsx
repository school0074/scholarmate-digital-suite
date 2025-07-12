import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Users, BookOpen, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-0">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-95"></div>
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-4 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-16 sm:bottom-32 right-4 sm:right-32 w-32 sm:w-48 h-32 sm:h-48 bg-accent/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-16 sm:w-24 h-16 sm:h-24 bg-secondary/20 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          {/* Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6 sm:mb-8">
            <Shield className="h-3 sm:h-4 w-3 sm:w-4 text-white mr-2" />
            <span className="text-white text-xs sm:text-sm font-medium">
              Trusted by 10,000+ Schools
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
            Transform Your
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              School Experience
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Complete digital ecosystem for students, teachers, and
            administrators. Streamline education with our all-in-one platform.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 px-4 sm:px-0">
            <div className="flex items-center space-x-2 text-white/90">
              <Users className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-300" />
              <span className="font-semibold text-sm sm:text-base">
                50+ Features
              </span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-green-300" />
              <span className="font-semibold text-sm sm:text-base">
                3 User Types
              </span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <Shield className="h-4 sm:h-5 w-4 sm:w-5 text-blue-300" />
              <span className="font-semibold text-sm sm:text-base">
                100% Secure
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-2xl w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                Start Learning Today
                <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                Teacher Portal
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="text-white/70 text-xs sm:text-sm px-4 sm:px-0">
            No credit card required • Free 30-day trial • Setup in minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
