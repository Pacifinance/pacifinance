/**
 * Localized Link Component
 * Wrapper around react-router-dom Link that automatically adds language prefix
 *
 * Belongs in components/ despite reading LanguageContext: it's a generic, cross-feature
 * primitive, not tied to a business domain (see CONTRIBUTING.md's components/ vs sections/ rule).
 */

import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { getLocalizedPath } from '../utils/i18nRouting';

export const LocalizedLink = ({ to, children, ...props }) => {
  const { language } = useContext(LanguageContext);
  
  // Add language prefix to the target path
  const localizedTo = getLocalizedPath(to, language);
  
  return (
    <RouterLink to={localizedTo} {...props}>
      {children}
    </RouterLink>
  );
};

export default LocalizedLink;
