/**
 * Custom hook for i18n-aware navigation
 * Automatically adds language prefix to all navigation paths
 */

import { useNavigate as useReactRouterNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { getLocalizedPath } from '../utils/i18nRouting';

export const useLocalizedNavigate = () => {
  const navigate = useReactRouterNavigate();
  const { language } = useContext(LanguageContext);

  /**
   * Navigate to a path with automatic language prefix
   * @param {string|number} to - Target path or delta (-1 for back)
   * @param {object} options - Navigation options (replace, state, etc.)
   */
  const localizedNavigate = (to, options) => {
    // Handle numeric values (e.g., -1 for back)
    if (typeof to === 'number') {
      navigate(to);
      return;
    }

    // Add language prefix to path
    const localizedPath = getLocalizedPath(to, language);
    navigate(localizedPath, options);
  };

  return localizedNavigate;
};
