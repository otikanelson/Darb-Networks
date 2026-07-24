import {
  ArrowRight,
  Users,
  Target,
  Award,
  BookOpen,
  Mail,
  Phone,
} from "lucide-react";
import { useEffect } from "react";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";

const About = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resources = [
    {
      title: "Educational Guides",
      description:
        "Comprehensive guides on fundraising, scaling, and investment strategies",
      icon: BookOpen,
    },
    {
      title: "Investor Network",
      description: "Connect with verified investors aligned with your industry",
      icon: Users,
    },
    {
      title: "Success Stories",
      description: "Learn from startups that achieved their funding goals",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <UnifiedNavbar variant="default" />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-700/90" />
        </div>
        <div className="relative px-4 py-16 sm:py-24 md:py-32 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Transforming Startup Funding
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-primary-100 px-2">
              We're revolutionizing how startups access capital through our
              innovative P2P lending platform. Join thousands of successful
              ventures that have found their perfect funding match.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          <div className="bg-primary-50 p-6 sm:p-8 rounded-xl">
            <Target className="h-10 w-10 sm:h-12 sm:w-12 text-primary-700 mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Mission
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              To democratize startup funding by creating a transparent,
              accessible, and efficient platform that connects visionary
              entrepreneurs with forward-thinking investors. We break down
              traditional barriers to ensure brilliant ideas receive the support
              they deserve, regardless of background or location.
            </p>
          </div>
          <div className="bg-primary-50 p-6 sm:p-8 rounded-xl">
            <Award className="h-10 w-10 sm:h-12 sm:w-12 text-primary-700 mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Vision
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              To become the world's leading P2P lending platform for startups,
              fostering innovation and economic growth across all sectors. We're
              building a future where access to funding is determined by merit
              and potential, not connections or location.
            </p>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Resources for Success
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 px-2">
              Everything you need to make informed decisions and achieve your
              funding goals
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                <resource.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary-700 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Get in Touch</h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">
            Our team is here to help you succeed
          </p>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
            <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-primary-700 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Email Us
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">For general inquiries:</p>
            <a
              href="mailto:legaldarbnetwork@gmail.com"
              className="text-sm sm:text-base text-purple-700 hover:text-purple-800 break-all"
            >
              legaldarbnetwork@gmail.com
            </a>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
            <Phone className="h-7 w-7 sm:h-8 sm:w-8 text-primary-700 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Call Us
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Support available 24/7:</p>
            <a
              href="tel:+2349156219654"
              className="text-sm sm:text-base text-purple-700 hover:text-purple-800"
            >
              +234 915 621 9654
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
