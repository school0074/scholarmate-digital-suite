import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Tablet, Monitor } from "lucide-react";

const MobileNavInfo = () => {
  return (
    <div className="lg:hidden p-4">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mobile Navigation</h3>
            <p className="text-sm text-muted-foreground">
              Bottom nav is now active!
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quick Access</span>
            <Badge variant="secondary" className="text-xs">
              5 Key Pages
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Smartphone className="h-3 w-3" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center space-x-1">
              <Tablet className="h-3 w-3" />
              <span>Tablet</span>
            </div>
            <div className="flex items-center space-x-1">
              <Monitor className="h-3 w-3 opacity-50" />
              <span className="opacity-50">Desktop</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            On desktop, use the full sidebar for complete navigation. Bottom nav
            appears only on mobile & tablet devices.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MobileNavInfo;
