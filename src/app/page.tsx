"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/splash/SplashScreen";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Contact } from "../components/marketing/Contact";
import { Features } from "@/components/marketing/Features";
import { Benefits } from "@/components/marketing/Benefits";
import { Modules } from "@/components/marketing/Modules";
import { Pricing } from "@/components/marketing/Pricing";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check both localStorage and cookies for the token to prevent false redirects
    const localToken = localStorage.getItem("pos_token");
    const hasCookieToken = document.cookie.includes("pos_token=");

    if (localToken && hasCookieToken) {
      router.push("/dashboard");
      return;
    }

    // Clean up invalid local storage if cookie is missing
    if (localToken && !hasCookieToken) {
      localStorage.removeItem("pos_token");
    }

    // Show splash for 2.5 seconds then reveal marketing page
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Benefits />
      <Modules />
      <Pricing />
      <Testimonials />
      <FAQ />
      {/* <CTA /> */}
      <Contact />
      <Footer />
    </>
  );
}
