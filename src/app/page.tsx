import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Feather, Leaf, Zap, HeartHandshake, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { IndiFarmIcon } from "@/components/icons";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-farm');

  const features = [
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: "AI-Powered Yield Prediction",
      description: "Get accurate crop yield forecasts to make informed decisions and maximize your harvest.",
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Intelligent Agricultural Alerts",
      description: "Receive timely, actionable advice based on weather forecasts to protect your crops.",
    },
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: "Smart Inventory Tracking",
      description: "Manage your farm supplies like seeds and fertilizers with our easy-to-use inventory system.",
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-primary" />,
      title: "Community Forum (कृषि चौपाल)",
      description: "Connect with fellow farmers, ask questions, and share knowledge in our community space.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <IndiFarmIcon className="h-8 w-8 text-primary" />
            <span className="font-headline">IndiFarm AI</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Languages className="h-5 w-5" />
              <span className="sr-only">Toggle language</span>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Login / Register</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div className="container relative z-10 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight font-headline sm:text-5xl md:text-6xl text-foreground">
                Smarter Farming, Bountiful Harvests
              </h1>
              <p className="mt-6 text-lg text-foreground/80 md:text-xl">
                IndiFarm AI empowers Indian farmers with AI-driven tools and data-driven insights to enhance productivity and profitability.
              </p>
              <div className="mt-10">
                <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32 bg-background">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight font-headline sm:text-4xl">
                Everything you need to grow
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our platform provides a suite of tools designed for the modern Indian farmer.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-300">
                  <CardHeader className="items-center">
                    {feature.icon}
                    <CardTitle className="text-center mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <div className="flex items-center gap-2">
            <IndiFarmIcon className="h-6 w-6 text-primary" />
            <p className="text-sm font-medium font-headline">IndiFarm AI</p>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} IndiFarm AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}