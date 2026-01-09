import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// TikTok icon component (lucide-react doesn't have TikTok icon)
const TikTokIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer = () => {
  const { t, isRTL } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: t('aboutUs'), href: '/about' },
      { name: t('contactUs'), href: '/contact' },
    ],
    legal: [
      { name: t('privacyPolicy'), href: '/privacy' },
      { name: t('termsOfService'), href: '/terms' },
      { name: t('cookiePolicy'), href: '/cookies' },
      { name: t('refundPolicy'), href: '/refunds' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-3 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center">
                <Image
                  src="/el-2aser-logo.png"
                  alt="ALKASR Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg sm:text-xl">{t('ecommerceStore')}</span>
            </div>
            <p className="text-gray-300 text-sm sm:text-base mb-4 max-w-md">
              {t('trustedShopping')}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+201055661002" className="hover:text-white transition-colors">{t('phone')}</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:nourabdelreheemali@gmail.com" className="hover:text-white transition-colors break-all">{t('email')}</a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm inline-block py-1">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
            <span className="text-gray-300 text-xs sm:text-sm">{t('followUs')}:</span>
            <div className="flex space-x-4 sm:space-x-3">
              <a
                href="https://www.facebook.com/share/1GFfbK7nKB/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://www.instagram.com/elqasr______?igsh=NjRleG9tN3hzb2I1&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://www.tiktok.com/@elqasr0?_r=1&_d=f09841dhgh11m0&sec_uid=MS4wLjABAAAAejsRLCLLLcpivIefi9U1VaRy0Au8esqJ0iLzUKMQ18ujaEuz_LrDbg1xOz4yYk79&share_author_id=6726912282964149254&sharer_language=en&source=h5_m&u_code=d7m1ijggc3aaef&item_author_type=1&utm_source=copy&tt_from=copy&enable_checksum=1&utm_medium=ios&share_link_id=968D0B56-9F22-40E5-B4AA-440D4B8B15C6&user_id=6726912282964149254&sec_user_id=MS4wLjABAAAAejsRLCLLLcpivIefi9U1VaRy0Au8esqJ0iLzUKMQ18ujaEuz_LrDbg1xOz4yYk79&social_share_type=4&ug_btm=b8727,b0&utm_campaign=client_share&share_app_id=1233"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6 text-xs sm:text-sm text-gray-300 text-center">
            <p className="whitespace-nowrap">© {currentYear} {t('allRightsReserved')}</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {footerLinks.legal.map((link) => (
                <Link key={link.name} href={link.href} className="hover:text-white transition-colors py-1 whitespace-nowrap">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
