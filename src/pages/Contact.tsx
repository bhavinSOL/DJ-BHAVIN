import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Mail, Instagram, Youtube, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/home">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Music
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-music-gradient p-2 rounded-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-music-gradient bg-clip-text text-transparent">
                DJ Bhavin
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>

          <Card className="bg-card border-border shadow-music">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {/* Email */}
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <a 
                      href="mailto:djbhavinparmar123@gmail.com"
                      className="text-primary hover:underline"
                    >
                      djbhavinparmar123@gmail.com
                    </a>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="bg-music-like/20 p-3 rounded-full">
                    <Instagram className="w-6 h-6 text-music-like" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Instagram</h3>
                    <a 
                      href="https://instagram.com/dj_bhavin_bvn01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-music-like hover:underline"
                    >
                      @dj_bhavin_bvn01
                    </a>
                  </div>
                </div>

                {/* YouTube */}
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="bg-destructive/20 p-3 rounded-full">
                    <Youtube className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold">YouTube</h3>
                    <a 
                      href="https://youtube.com/@djbhavin2888"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-destructive hover:underline"
                    >
                      DJ BHAVIN
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-center pt-6 border-t border-border">
                <h3 className="font-semibold mb-2">Developer</h3>
                <p className="text-muted-foreground">
                  Built with ❤️ by the DJ BHAVIN team
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Making music accessible to everyone, everywhere
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <Link to="/home">
              <Button variant="music" size="lg">
                Back to Music
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;