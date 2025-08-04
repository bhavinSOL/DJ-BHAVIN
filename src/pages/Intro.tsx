import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music, Play, Headphones } from 'lucide-react';

const Intro = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/home');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleEnter = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-music-gradient opacity-20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-music-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center transition-all duration-2000 transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-music-gradient p-6 rounded-full shadow-music">
              <Music className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-music-gradient bg-clip-text text-transparent animate-pulse">
          DJ BHAVIN
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Experience music like never before. Stream, discover, and enjoy your favorite tracks in premium quality.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={handleEnter}
            variant="music" 
            size="xl"
            className="group"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Enter the Music World
          </Button>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Headphones className="w-5 h-5" />
            <span>Put on your headphones for the best experience</span>
          </div>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          Auto-redirecting in 5 seconds...
        </div>
      </div>

      {/* Floating music notes animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 text-primary/30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>♪</div>
        <div className="absolute top-40 right-32 text-music-accent/30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}>♫</div>
        <div className="absolute bottom-32 left-1/3 text-primary/30 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>♪</div>
        <div className="absolute bottom-20 right-20 text-music-accent/30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.8s' }}>♫</div>
      </div>
    </div>
  );
};


export default Intro;
