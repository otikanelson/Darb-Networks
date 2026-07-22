import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    Explore: [
      { label: 'Browse Campaigns', to: '/dashboard' },
      { label: 'Tech & Innovation', to: '/dashboard' },
      { label: 'Health & Fitness', to: '/dashboard' },
      { label: 'Creative Works', to: '/dashboard' },
    ],
    Company: [
      { label: 'About Us', to: '/about' },
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
    ],
    Account: [
      { label: 'Sign Up', to: '/register' },
      { label: 'Log In', to: '/login' },
      { label: 'Start a Campaign', to: '/pages/CreateCampaign' },
      { label: 'My Campaigns', to: '/my-campaigns' },
    ],
  };

  const socials = [
    { label: 'Instagram', icon: '/assets/instagram.svg', href: '#' },
    { label: 'Facebook', icon: '/assets/facebook.svg', href: '#' },
    { label: 'Twitter', icon: '/assets/twitter.svg', href: '#' },
    { label: 'LinkedIn', icon: '/assets/linkedin.svg', href: '#' },
  ];

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-16 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <img src="/assets/Logo.png" alt="Darb Network" className="h-12 w-auto" />
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Connecting ambitious Nigerian founders with investors who believe in their vision. Fund the future, one startup at a time.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {socials.map(({ label, icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-9 w-9   bg-white/5 hover:bg-primary-700 flex items-center justify-center transition-colors"
                >
                  <img src={icon} alt={label} className="h-4 w-4 brightness-0 invert" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">
                {heading}
              </h4>
              <ul className="space-y-3">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} Darb Network. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link to="/about" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
