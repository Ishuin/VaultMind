import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ghost-canvas p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-midnight-navy mx-auto mb-6">
          <Brain className="h-8 w-8 text-chartreuse" />
        </div>
        <h1 className="font-display text-6xl font-bold text-midnight-navy mb-2">404</h1>
        <p className="text-lg text-slate-ink mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button className="btn-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
