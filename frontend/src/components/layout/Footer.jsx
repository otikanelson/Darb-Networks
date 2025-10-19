import {Link} from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="px-2 sm:px-6 lg:px-3 py-1">
      <footer className="bg-green-700 text-white rounded-t-xl rounded-b-xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-5 py-3">
          {/* Main Footer Content */}
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-16">
              {/* Brand Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/src/assets/Logo.png" 
                    alt="StartupFund Logo" 
                    className="w-24 h-14 object-contain"
                  />
                </div>
                <p className="text-gray-400 text-1xl font-semibold leading-relaxed">
                  Elevating Experience & Seize <br />
                  Control Of Your Smart Home!
                </p>
              </div>

              {/* Donate Links */}
              <div>
                <h3 className="font-bold mb-8">Donate</h3>
                <ul className="space-y-4">
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white font-semibold">
                      Tech & Innovation
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white font-semibold">
                      Creative Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white font-semibold">
                      Community Projects
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white font-semibold">
                      Disaster
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Help Links */}
              <div>
                <h3 className="font-bold mb-8">Help</h3>
                <ul className="space-y-4">
                  <li>
                    <Link to="/faq" className="text-gray-400 hover:text-white font-semibold">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy" className="text-gray-400 hover:text-white font-semibold">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="text-gray-400 hover:text-white font-semibold">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="font-bold mb-8">Company</h3>
                <ul className="space-y-4">
                  <li>
                    <Link to="/about" className="text-gray-400 hover:text-white font-semibold">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="text-gray-400 hover:text-white font-semibold">
                      Services
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright and Social Links */}
          <div className="border-t border-green-900">
            <div className="py-5 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                © Fund Inc. {currentYear}
                <br />
                All Rights Reserved.
              </p>
              
              <div className="flex space-x-6 mt-6 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white flex items-center border-x-2 border-y-2 border-green-900 rounded-b-3xl rounded-t-3xl px-1">
                  <img src="/src/assets/instagram.svg" alt="Instagram" className="h-5 w-5" />
                  <p className="text-stone-950 text-sm m-2">Instagram</p>
                </a>
                <a href="#" className="text-gray-400 hover:text-white flex items-center border-x-2 border-y-2 border-green-900 rounded-b-3xl rounded-t-3xl px-1">
                  <img src="/src/assets/facebook.svg" alt="Facebook" className="h-5 w-5" />
                  <p className="text-stone-950 text-sm m-2">Facebook</p>
                </a>
                <a href="#" className="text-gray-400 hover:text-white flex items-center border-x-2 border-y-2 border-green-900 rounded-b-3xl rounded-t-3xl px-1">
                  <img src="/src/assets/twitter.svg" alt="Twitter" className="h-5 w-5" />
                  <p className="text-stone-950 text-sm m-2">Twitter</p>
                </a>
                <a href="#" className="text-gray-400 hover:text-white flex items-center border-x-2 border-y-2 border-green-900 rounded-b-3xl rounded-t-3xl px-1">
                  <img src="/src/assets/linkedin.svg" alt="LinkedIn" className="h-5 w-5" />
                  <p className="text-stone-950 text-sm m-2">Linkedin</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;