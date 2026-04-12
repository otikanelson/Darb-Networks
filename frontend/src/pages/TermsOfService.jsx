import { FileText, Scale, AlertCircle, Shield, Users, Ban } from "lucide-react";
import { useEffect } from "react";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";

const TermsOfService = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sections = [
    {
      id: "acceptance",
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using Darb Network's P2P lending platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
        "These terms apply to all users, including founders seeking funding and investors providing capital.",
      ],
    },
    {
      id: "eligibility",
      icon: Users,
      title: "2. Eligibility",
      content: [
        "To use our platform, you must:",
        [
          "Be at least 18 years of age",
          "Be a resident of Nigeria or have a registered Nigerian business",
          "Provide accurate and complete registration information",
          "Have the legal capacity to enter into binding contracts",
          "Not be prohibited from using the platform under Nigerian law",
        ],
      ],
    },
    {
      id: "accounts",
      icon: Shield,
      title: "3. User Accounts",
      content: [
        "Account Registration:",
        [
          "You must provide accurate, current, and complete information during registration",
          "You are responsible for maintaining the confidentiality of your account credentials",
          "You must notify us immediately of any unauthorized access to your account",
          "You are responsible for all activities that occur under your account",
        ],
        "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.",
      ],
    },
    {
      id: "borrowers",
      icon: FileText,
      title: "4. Terms for Borrowers (Founders)",
      content: [
        "Campaign Requirements:",
        [
          "All campaign information must be accurate, complete, and not misleading",
          "You must provide required documentation including CAC registration and BVN",
          "You agree to use funds only for the stated campaign purposes",
          "You must meet defined milestones before receiving disbursements",
          "You are responsible for repaying loans according to agreed terms",
        ],
        "Failure to meet repayment obligations may result in legal action, credit reporting, and platform suspension.",
      ],
    },
    {
      id: "investors",
      icon: Scale,
      title: "5. Terms for Investors",
      content: [
        "Investment Risks:",
        [
          "All investments carry risk, including potential loss of principal",
          "Past performance does not guarantee future results",
          "You should only invest amounts you can afford to lose",
          "Darb Network does not guarantee returns or repayment",
          "You are responsible for conducting your own due diligence",
        ],
        "By investing, you acknowledge understanding these risks and accept full responsibility for your investment decisions.",
      ],
    },
    {
      id: "fees",
      icon: AlertCircle,
      title: "6. Fees and Payments",
      content: [
        "Platform Fees:",
        [
          "Borrowers: 3% origination fee on successfully funded campaigns",
          "Interest rates: 8-25% per annum based on risk assessment",
          "Late payment penalty: 1% of outstanding amount",
          "Investors: No fees for investing or receiving repayments",
        ],
        "All fees are clearly disclosed before transactions. We reserve the right to modify fees with 30 days notice.",
      ],
    },
    {
      id: "prohibited",
      icon: Ban,
      title: "7. Prohibited Activities",
      content: [
        "Users may not:",
        [
          "Provide false or misleading information",
          "Use the platform for illegal activities or money laundering",
          "Manipulate or attempt to manipulate the platform",
          "Harass, threaten, or abuse other users",
          "Circumvent platform fees or payment systems",
          "Create multiple accounts to evade restrictions",
          "Use automated systems to access the platform without permission",
        ],
        "Violation of these prohibitions may result in immediate account termination and legal action.",
      ],
    },
    {
      id: "liability",
      icon: Shield,
      title: "8. Limitation of Liability",
      content: [
        "Darb Network acts as an intermediary platform and:",
        [
          "Does not guarantee loan repayment or investment returns",
          "Is not responsible for disputes between borrowers and investors",
          "Does not provide financial, legal, or investment advice",
          "Is not liable for losses resulting from user decisions",
          "Makes no warranties about platform availability or accuracy",
        ],
        "Our total liability is limited to the fees paid by you in the 12 months preceding any claim.",
      ],
    },
    {
      id: "termination",
      icon: AlertCircle,
      title: "9. Termination",
      content: [
        "We may suspend or terminate your account if:",
        [
          "You violate these Terms of Service",
          "You engage in fraudulent or illegal activity",
          "Your account remains inactive for an extended period",
          "Required by law or regulatory authorities",
        ],
        "Upon termination, you remain responsible for outstanding obligations including loan repayments.",
      ],
    },
    {
      id: "changes",
      icon: FileText,
      title: "10. Changes to Terms",
      content: [
        "We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to the platform.",
        "Continued use of the platform after changes constitutes acceptance of the modified terms.",
        "We will notify users of material changes via email or platform notification.",
      ],
    },
    {
      id: "governing",
      icon: Scale,
      title: "11. Governing Law",
      content: [
        "These Terms of Service are governed by the laws of the Federal Republic of Nigeria.",
        "Any disputes arising from these terms or use of the platform shall be subject to the exclusive jurisdiction of Nigerian courts.",
        "You agree to resolve disputes through good faith negotiation before pursuing legal action.",
      ],
    },
    {
      id: "contact",
      icon: FileText,
      title: "12. Contact Information",
      content: [
        "For questions about these Terms of Service, please contact us:",
        [
          "Email: legal@darbnetwork.com",
          "Phone: +234 (0) 123-456-7890",
          "Address: Lagos, Nigeria",
        ],
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="default" />

      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mt-4 text-gray-600">
              Last updated: February 14, 2025
            </p>
            <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
              Please read these terms carefully before using our platform. By using Darb Network, you agree to be bound by these terms.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 overflow-x-auto pb-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap transition-colors"
              >
                {section.title.split(".")[1]?.trim() || section.title}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-xl shadow-sm p-6 md:p-8 scroll-mt-24"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <section.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.content.map((item, index) =>
                  typeof item === "string" ? (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {item}
                    </p>
                  ) : (
                    <ul
                      key={index}
                      className="list-disc list-inside text-gray-700 space-y-2 ml-4"
                    >
                      {item.map((listItem, listIndex) => (
                        <li key={listIndex} className="leading-relaxed">
                          {listItem}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="max-w-4xl mx-auto mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Important Notice</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                These Terms of Service constitute a legally binding agreement. If you do not agree to these terms, 
                you must not use the Darb Network platform. For questions or concerns, please contact our legal team 
                before proceeding.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
