import React, { useState } from 'react';
import { Menu, Bell, Search, User, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguageMenu(false);
  };

  const getRoleText = (role: string) => {
    return t(`roles.${role}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('header.searchProjects')}
              className="w-80 pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm">{i18n.language === 'ar' ? 'العربية' : 'English'}</span>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button 
                  onClick={() => changeLanguage('ar')}
                  className={`block w-full text-right px-4 py-2 text-sm hover:bg-gray-50 ${i18n.language === 'ar' ? 'font-bold text-blue-600' : ''}`}
                >
                  العربية
                </button>
                <button 
                  onClick={() => changeLanguage('en')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${i18n.language === 'en' ? 'font-bold text-blue-600' : ''}`}
                >
                  English
                </button>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.role ? getRoleText(user.role) : t('common.user')}
              </p>
            </div>
            <div className="relative group">
              <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
              
              <div className="absolute left-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <Link to="/settings" className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md block">
                    {t('header.profile')}
                  </Link>
                  <Link to="/settings" className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md block">
                    {t('header.settings')}
                  </Link>
                  <hr className="my-1" />
                  <button 
                    onClick={logout}
                    className="w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    {t('header.logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};