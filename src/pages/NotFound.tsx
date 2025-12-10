import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-accent-foreground">404</span>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-foreground">Page Not Found</h1>
        <p className="mb-6 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 gradient-accent text-accent-foreground font-medium rounded-lg hover:shadow-accent transition-all duration-300"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;