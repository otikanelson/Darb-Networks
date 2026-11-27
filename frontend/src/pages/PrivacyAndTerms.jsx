import React, { useEffect } from 'react';
import UnifiedNavbar from '../components/layout/Navbars';
import Footer from '../components/layout/Footer';

const PrivacyAndTerms = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <UnifiedNavbar variant="default" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Privacy & Terms
          </h1>
          <p className="mt-4 text-primary-100">
            Simple, honest terms for a concept project
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8 prose prose-lg max-w-3xl">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Project</h2>
          <p className="text-gray-700">
            Darb Network is a <strong>non-commercial concept project</strong> built by one developer to explore startup funding models. It is not a licensed financial service, and no real money is handled.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Collect</h2>
          <p className="text-gray-700">We collect the following information when you use this platform:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Name, email address, and phone number during registration</li>
            <li>User type (founder or investor) and company name</li>
            <li>Campaign content, descriptions, and uploaded images (if you create a campaign)</li>
            <li>Profile information and uploaded profile images</li>
            <li>Investment transactions (test mode only)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Where It's Stored</h2>
          <p className="text-gray-700">Your data is stored in:</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Firebase Authentication:</strong> Email and password (encrypted)</li>
            <li><strong>MySQL Database:</strong> User profiles and campaign data</li>
            <li><strong>Cloudinary:</strong> Uploaded images</li>
          </ul>
          <p className="text-gray-700 mt-4">
            This project does not use third-party analytics or advertising services beyond what is listed above.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why We Collect It</h2>
          <p className="text-gray-700">
            We collect your data only to run this demo platform. Data is never sold, shared with third parties, or used for marketing purposes. It is used solely to provide the features you interact with: authentication, campaign management, and transaction history.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo Data & Reset</h2>
          <p className="text-gray-700">
            As this is a concept project, the database may be reset periodically. This means all user accounts and campaign data may be deleted without notice. Do not rely on this platform for storing important information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Deletion</h2>
          <p className="text-gray-700">
            To request account deletion or access to your personal data, email <a href="mailto:otikanelson29@gmail.com" className="text-primary-600 hover:text-primary-700">otikanelson29@gmail.com</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Warranties</h2>
          <p className="text-gray-700">
            This platform is provided <strong>"as is"</strong> without any guarantees. It is a portfolio project, not a production service. Data loss, service interruptions, or security issues may occur without compensation or notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Financial Advice</h2>
          <p className="text-gray-700">
            Nothing on this platform constitutes investment advice, a financial recommendation, or a solicitation to invest. All "investments" happen in test mode with no real money. Do not make real financial decisions based on this demo.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Information</h2>
          <p className="text-gray-700">
            All payments are processed through Paystack in <strong>test mode</strong>. No real money is charged or transferred. Any "transactions" you see in this platform are simulated demonstrations only.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Security</h2>
          <p className="text-gray-700">
            While we implement basic security measures (HTTPS, hashed passwords, JWT tokens), this is a concept project. Do not use this platform for sensitive or high-value operations. Your data may be compromised.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to These Terms</h2>
          <p className="text-gray-700">
            These terms may change at any time without notice. Continued use of the platform constitutes acceptance of updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
          <p className="text-gray-700">
            Email <a href="mailto:otikanelson29@gmail.com" className="text-primary-600 hover:text-primary-700">otikanelson29@gmail.com</a> with any questions.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyAndTerms;
