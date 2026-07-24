import React, { useEffect, useRef } from 'react';
import { ArrowRight, Heart, Zap, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomNav } from '../../src/hooks/CustomNavigation';

gsap.registerPlugin(ScrollTrigger);

const StartupConnectionSection = () => {
  const navigate = CustomNav();
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const badgeRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Image Parallax & Scale Reveal
      gsap.fromTo(
        imageRef.current,
        { scale: 1.15, y: 40, clipPath: 'inset(10% 10% 10% 10% round 24px)' },
        {
          scale: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0% round 24px)',
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            end: 'bottom bottom',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // 2. Floating Badge Animated Pop
      gsap.fromTo(
        badgeRef.current,
        { scale: 0, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // 3. Staggered Text Slide Up
      gsap.fromTo(
        textRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 sm:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div ref={textRef} className="lg:col-span-6 flex flex-col items-start">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6">
              We give you a connection to a startup you <span className="text-primary-600 underline decoration-primary-200 decoration-wavy underline-offset-8">believe in!</span>
            </h2>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
              Don’t just invest capital—back missions that resonate with your values. Whether it’s clean energy, fintech innovation, or healthcare access, Darb directly bridges high-impact founders with investors who share their vision.
            </p>
          </div>

          {/* Right Image + Interactive Card Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Unsplash Startup Team Image */}
              <div ref={imageRef} className="relative overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1704652070195-61e76e1466db?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Startup team collaborating"
                  className="w-full h-[400px] sm:h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default StartupConnectionSection;