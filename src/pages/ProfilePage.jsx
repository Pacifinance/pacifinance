import React, { useContext, useState, useEffect } from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { Select, MenuItem } from "@mui/material";
import { 
    Edit, 
    Save, 
    ArrowLeft, 
    MapPin, 
    Briefcase, 
    Clock, 
    Home, 
    Calendar,
    Users,
    Baby,
    Star,
    ChevronDown,
    Trophy,
    User,
    RefreshCw,
    Coins
} from 'lucide-react';
import styled from 'styled-components';

// Import userDataSelectors
import {
    getUserNationality,
    getUserWhereWorks,
    getUserJob,
    getUserJobType,
    getUserWorkTime,
    getUserRemoteType,
    getUserAge,
    getUserLivingSituation,
    getUserHousingType,
    getUserChildren,
    getUserYearsOfExperience,
    getUserPreferredCurrency,
    getNationalityTags,
    getJobTags,
    getJobTypeTags,
    getWorkTimeTags,
    getRemoteTypeTags,
    getAgeTags,
    getLivingSituationTags,
    getHousingTypeTags,
    getChildrenTags,
    getYearsOfExperienceTags,
    getCurrencyTags,
    getProfileCompletionPercentage
} from '../utils/userDataSelectors';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { useGamification } from '../hooks/useGamification';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import { CURRENCIES } from '../data/currencyConfig';
import Sidebar from '../sections/Sidebar';
import SEOHead from '../components/SEOHead';
import {
    MyButton
} from '../styles/MyStyled';

import GamificationSection from '../components/GamificationSection';
import AvatarIcon from '../components/AvatarIcon';
import { canRegenerateAvatar, regenerateAvatar } from '../utils/avatarGenerator';
import { useToast } from '../contexts/ToastContext';
import { useServices } from '../contexts/ServiceContext';

// ─── Styled Components ───────────────────────────────────────────────

const PageWrapper = styled.div`
  width: ${props => props.$isMobile ? '100%' : 'calc(100% - 5.5rem)'};
  min-height: 100vh;
  background-color: ${props => props.theme.backgroundColor};
  margin-left: ${props => props.$isMobile ? '0' : '5.5rem'};
  max-width: 100vw;
  overflow-x: hidden;
`;

const ContentSection = styled.div`
  font-family: Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-height: 100vh;
  background-color: ${props => props.theme.backgroundColor};
  padding: ${props => props.$isMobile ? '1rem' : '2rem 3rem'};
  padding-top: ${props => props.$isMobile ? '100px' : '2rem'};
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: hidden;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: ${props => props.$isMobile ? '1.5rem' : '1.75rem'};
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TabBar = styled.div`
  display: flex;
  gap: 0.25rem;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
  padding: 0.25rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  width: fit-content;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.2s ease;
  background: ${props => props.$active 
    ? (props.theme.mode === 'dark' 
        ? 'rgba(255,255,255,0.12)' 
        : '#ffffff')
    : 'transparent'};
  color: ${props => props.$active 
    ? (props.theme.mode === 'dark' ? '#f3f4f6' : '#1f2937')
    : (props.theme.mode === 'dark' ? '#9ca3af' : '#6b7280')};
  box-shadow: ${props => props.$active 
    ? (props.theme.mode === 'dark' 
        ? '0 1px 3px rgba(0,0,0,0.3)' 
        : '0 1px 3px rgba(0,0,0,0.1)')
    : 'none'};
  
  &:hover {
    color: ${props => props.theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'};
    background: ${props => !props.$active && (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)')};
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 0.625rem 0.75rem;
    font-size: 0.85rem;
  }
`;

const CompletionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
`;

const CompletionTrack = styled.div`
  flex: 1;
  height: 6px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb'};
  border-radius: 3px;
  overflow: hidden;
`;

const CompletionFill = styled.div`
  height: 100%;
  width: ${props => props.$percent}%;
  background: linear-gradient(90deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}cc);
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const CompletionLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#d1d5db' : '#4b5563'};
  white-space: nowrap;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuickInfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255,255,255,0.04)' 
    : '#ffffff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
  border-radius: 12px;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.buttonBackgroundColor}30;
  }
`;

const QuickInfoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.$bg || `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}, ${props.theme.buttonBackgroundColor}cc)`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const QuickInfoContent = styled.div`
  min-width: 0;
  flex: 1;
`;

const QuickInfoLabel = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
`;

const QuickInfoValue = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SectionCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255,255,255,0.03)' 
    : '#ffffff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
  border-radius: 16px;
  padding: ${props => props.$isMobile ? '1.25rem' : '1.5rem'};
  margin-bottom: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#d1d5db' : '#374151'};
  }
`;

const SectionIcon = styled.div`
  font-size: 1.1rem;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const ProfileField = styled.div`
  padding: 0.75rem 1rem;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'};
  border-radius: 10px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
`;

const FieldLabel = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const FieldValue = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.$empty 
    ? (props.theme.mode === 'dark' ? '#6b7280' : '#9ca3af')
    : (props.theme.mode === 'dark' ? '#f3f4f6' : '#1f2937')};
  font-style: ${props => props.$empty ? 'italic' : 'normal'};
`;

const BenefitsToggle = styled.div`
  padding: 0.875rem 1rem;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.03)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)'};
  border-radius: 12px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(34,197,94,0.25);
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  animation: profileSlideIn 0.4s ease-out;
  
  @keyframes profileSlideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const EditFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EditFieldCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
  border-radius: 12px;
  padding: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus-within {
    border-color: ${props => props.theme.buttonBackgroundColor}40;
  }
`;

const EditFieldLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#d1d5db' : '#374151'};
`;

const EditFieldIconWrap = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${props => `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}, ${props.theme.buttonBackgroundColor}cc)`};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
`;

// ─── Main Component ──────────────────────────────────────────────────

const ProfilePage = () => {
    const { theme } = useContext(ThemeContext);
    const { isHidden } = useContext(PrivacyContext);
    const { language, translations } = useContext(LanguageContext);
    const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useAuth();
    const { isMobileScreen } = useContext(MediaQueryContext);
    useLocalizedNavigate();
    const { showSuccess, showError } = useToast();
    const { userService } = useServices();

    const [activeTab, setActiveTab] = useState('details');
    const [isEditMode, setIsEditMode] = useState(false);
    const [avatarKey, setAvatarKey] = useState(0);
    const [canRegen, setCanRegen] = useState(canRegenerateAvatar());
    const [showBenefitsInfo, setShowBenefitsInfo] = useState(false);
    const [userId, setUserId] = useState('');
    const [userType, setUserType] = useState('');
    const [userNationality, setUserNationality] = useState({ key: "", value: "" });
    const [userWhereWorks, setUserWhereWorks] = useState({ key: "", value: "" });
    const [userJob, setUserJob] = useState({ key: "", value: "" });
    const [userJobType, setUserJobType] = useState({ key: "", value: "" });
    const [userWorkTime, setUserWorkTime] = useState({ key: "", value: "" });
    const [userRemoteType, setUserRemoteType] = useState({ key: "", value: "" });
    const [userYearsExperience, setUserYearsExperience] = useState({ key: "", value: "" });
    const [userAge, setUserAge] = useState({ key: "", value: "" });
    const [userLivingStatus, setUserLivingStatus] = useState({ key: "", value: "" });
    const [userHousingType, setUserHousingType] = useState({ key: "", value: "" });
    const [userHasChildren, setUserHasChildren] = useState({ key: "", value: "" });
    const [userPreferredCurrency, setUserPreferredCurrency] = useState({ key: "", value: "" });
    const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
    
    const [nationalityTags, setNationalityTags] = useState([]);
    const [jobTags, setJobTags] = useState([]);
    const [jobTypeTags, setJobTypeTags] = useState([]);
    const [workTimeTags, setWorkTimeTags] = useState([]);
    const [remoteTypeTags, setRemoteTypeTags] = useState([]);
    const [yearsExperienceTags, setYearsExperienceTags] = useState([]);
    const [ageTags, setAgeTags] = useState([]);
    const [livingStatusTags, setLivingStatusTags] = useState([]);
    const [housingTypeTags, setHousingTypeTags] = useState([]);
    const [hasChildrenTags, setHasChildrenTags] = useState([]);
    const [currencyTagsList, setCurrencyTagsList] = useState([]);
    const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

    const handleRegenerateAvatar = () => {
        if (!canRegenerateAvatar()) {
            showSuccess(translations?.avatar?.limitReached || 'You can regenerate your avatar once a day');
            return;
        }
        const result = regenerateAvatar();
        if (result.success) {
            setAvatarKey(prev => prev + 1);
            setCanRegen(false);
            showSuccess(translations?.avatar?.regenerated || 'New avatar generated!');
        }
    };

    // Gamification data for achievements tab
    const gamification = useGamification(userData);

    // Mock data for development/testing
    const mockNationalityTags = [
        { index: 0, translations: { it: "Italia", en: "Italy" } },
        { index: 1, translations: { it: "Francia", en: "France" } },
        { index: 2, translations: { it: "Germania", en: "Germany" } },
        { index: 3, translations: { it: "Spagna", en: "Spain" } },
        { index: 4, translations: { it: "Regno Unito", en: "United Kingdom" } },
        { index: 5, translations: { it: "Stati Uniti", en: "United States" } },
        { index: 6, translations: { it: "Canada", en: "Canada" } },
        { index: 7, translations: { it: "Australia", en: "Australia" } },
        { index: 8, translations: { it: "Giappone", en: "Japan" } },
        { index: 9999, translations: { it: "Altro", en: "Other" } }
    ];
    const mockJobTags = [
        { index: 0, translations: { it: "Sviluppatore Software", en: "Software Developer" } },
        { index: 1, translations: { it: "Designer", en: "Designer" } },
        { index: 2, translations: { it: "Manager", en: "Manager" } },
        { index: 3, translations: { it: "Consulente", en: "Consultant" } },
        { index: 4, translations: { it: "Analista Dati", en: "Data Analyst" } },
        { index: 5, translations: { it: "Marketing", en: "Marketing" } },
        { index: 6, translations: { it: "Vendite", en: "Sales" } },
        { index: 7, translations: { it: "Contabile", en: "Accountant" } },
        { index: 8, translations: { it: "Insegnante", en: "Teacher" } },
        { index: 9999, translations: { it: "Altro", en: "Other" } }
    ];
    const mockJobTypeTags = [
        { index: 0, translations: { it: "Tempo Pieno", en: "Full Time" } },
        { index: 1, translations: { it: "Tempo Parziale", en: "Part Time" } },
        { index: 2, translations: { it: "Freelance", en: "Freelance" } },
        { index: 3, translations: { it: "Contratto", en: "Contract" } },
        { index: 4, translations: { it: "Stage", en: "Internship" } },
        { index: 9999, translations: { it: "Altro", en: "Other" } }
    ];
    const mockWorkTimeTags = [
        { index: 0, translations: { it: "8 ore", en: "8 hours" } },
        { index: 1, translations: { it: "6 ore", en: "6 hours" } },
        { index: 2, translations: { it: "4 ore", en: "4 hours" } },
        { index: 3, translations: { it: "Flessibile", en: "Flexible" } },
        { index: 9999, translations: { it: "Altro", en: "Other" } }
    ];
    const mockRemoteTypeTags = [
        { index: 0, translations: { it: "Completamente Remoto", en: "Fully Remote" } },
        { index: 1, translations: { it: "Ibrido", en: "Hybrid" } },
        { index: 2, translations: { it: "In Presenza", en: "On-site" } },
        { index: 9999, translations: { it: "Altro", en: "Other" } }
    ];
    const mockYearsExperienceTags = [
        { index: 0, translations: { it: "0-1 anni", en: "0-1 years" } },
        { index: 1, translations: { it: "2-3 anni", en: "2-3 years" } },
        { index: 2, translations: { it: "4-5 anni", en: "4-5 years" } },
        { index: 3, translations: { it: "6-10 anni", en: "6-10 years" } },
        { index: 4, translations: { it: "10+ anni", en: "10+ years" } }
    ];
    const mockAgeTags = [
        { index: 0, translations: { it: "18-25", en: "18-25" } },
        { index: 1, translations: { it: "26-35", en: "26-35" } },
        { index: 2, translations: { it: "36-45", en: "36-45" } },
        { index: 3, translations: { it: "46-55", en: "46-55" } },
        { index: 4, translations: { it: "55+", en: "55+" } }
    ];
    const mockLivingStatusTags = [
        { index: 0, translations: { it: "Single", en: "Single" } },
        { index: 1, translations: { it: "In Coppia", en: "In a Relationship" } },
        { index: 2, translations: { it: "Sposato/a", en: "Married" } },
        { index: 3, translations: { it: "Convivente", en: "Cohabiting" } },
        { index: 9999, translations: { it: "Altro", en: "Other" } }
    ];
    const mockHousingTypeTags = [
        { index: 0, translations: { it: "Appartamento in Affitto", en: "Rental Apartment" } },
        { index: 1, translations: { it: "Casa Propria", en: "Own House" } },
        { index: 2, translations: { it: "Casa dei Genitori", en: "Parents' House" } },
        { index: 3, translations: { it: "Casa Condivisa", en: "Shared Housing" } },
        { index: 9999, translations: { it: "Altro", en: "Other" } }
    ];
    const mockHasChildrenTags = [
        { index: 0, translations: { it: "Sì", en: "Yes" } },
        { index: 1, translations: { it: "No", en: "No" } },
        { index: 2, translations: { it: "In Attesa", en: "Expecting" } }
    ];
    const mockCurrencyTags = [
        { label: "eur", index: 0, translations: { it: "EUR (€)", en: "EUR (€)" } },
        { label: "usd", index: 1, translations: { it: "USD ($)", en: "USD ($)" } },
        { label: "gbp", index: 2, translations: { it: "GBP (£)", en: "GBP (£)" } },
        { label: "chf", index: 3, translations: { it: "CHF", en: "CHF" } },
        { label: "jpy", index: 4, translations: { it: "JPY (¥)", en: "JPY (¥)" } },
    ];

    useEffect(() => {
        if (userData) {
            setUserId(userData.userId || '00000');
            setUserType(userData.userType || 'mockUser');
            setUserNationality(getUserNationality(userData));
            setUserWhereWorks(getUserWhereWorks(userData));
            setUserJob(getUserJob(userData));
            setUserJobType(getUserJobType(userData));
            setUserWorkTime(getUserWorkTime(userData));
            setUserRemoteType(getUserRemoteType(userData));
            setUserYearsExperience(getUserYearsOfExperience(userData));
            setUserAge(getUserAge(userData));
            setUserLivingStatus(getUserLivingSituation(userData));
            setUserHousingType(getUserHousingType(userData));
            setUserHasChildren(getUserChildren(userData));
            setUserPreferredCurrency(getUserPreferredCurrency(userData));
            setProfileCompletionPercentage(getProfileCompletionPercentage(userData));
            
            setNationalityTags(getNationalityTags(userData) || mockNationalityTags);
            setJobTags(getJobTags(userData) || mockJobTags);
            setJobTypeTags(getJobTypeTags(userData) || mockJobTypeTags);
            setWorkTimeTags(getWorkTimeTags(userData) || mockWorkTimeTags);
            setRemoteTypeTags(getRemoteTypeTags(userData) || mockRemoteTypeTags);
            setYearsExperienceTags(getYearsOfExperienceTags(userData) || mockYearsExperienceTags);
            setAgeTags(getAgeTags(userData) || mockAgeTags);
            setLivingStatusTags(getLivingSituationTags(userData) || mockLivingStatusTags);
            setHousingTypeTags(getHousingTypeTags(userData) || mockHousingTypeTags);
            setHasChildrenTags(getChildrenTags(userData) || mockHasChildrenTags);
            setCurrencyTagsList(getCurrencyTags(userData) || mockCurrencyTags);
        } else {
            setUserId('00000');
            setUserType('mockUser');
            setNationalityTags(mockNationalityTags);
            setJobTags(mockJobTags);
            setJobTypeTags(mockJobTypeTags);
            setWorkTimeTags(mockWorkTimeTags);
            setRemoteTypeTags(mockRemoteTypeTags);
            setYearsExperienceTags(mockYearsExperienceTags);
            setAgeTags(mockAgeTags);
            setLivingStatusTags(mockLivingStatusTags);
            setHousingTypeTags(mockHousingTypeTags);
            setHasChildrenTags(mockHasChildrenTags);
            setCurrencyTagsList(mockCurrencyTags);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData]);

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        try {
            const data = {
                country: userNationality.key,
                job: userJob.key,
                job_type: userJobType.key,
                job_country: userWhereWorks.key,
                work_time: userWorkTime.key,
                remote_type: userRemoteType.key,
                years_of_experience: userYearsExperience.key,
                age: userAge.key,
                living_situation: userLivingStatus.key,
                housing_type: userHousingType.key,
                children: userHasChildren.key,
                preferred_currency: userPreferredCurrency.key
            };
            const response = await userService.updateProfile(data);
            if (response.status === 200) {
                handleSetIsUpdated(false);
                setShowUpdateSuccess(true);
                setIsEditMode(false);
                setTimeout(() => setShowUpdateSuccess(false), 3000);
            } else {
                showError(translations.sidebar.account.errorUpdateProfile);
            }
        } catch (_error) {
            showError(translations.sidebar.account.errorUpdateProfile);
        }
    };

    // Sort all tags
    const sortedNationalityTags = sortTagsByLanguage(nationalityTags, language);
    const sortedJobTags = sortTagsByLanguage(jobTags, language);
    const sortedJobTypeTags = sortTagsByLanguage(jobTypeTags, language);
    const sortedWorkTimeTags = sortTagsByLanguage(workTimeTags, language);
    const sortedRemoteTypeTags = sortTagsByLanguage(remoteTypeTags, language);
    const sortedYearsExperienceTags = sortTagsByLanguage(yearsExperienceTags, language);
    const sortedAgeTags = sortTagsByLanguage(ageTags, language);
    const sortedLivingStatusTags = sortTagsByLanguage(livingStatusTags, language);
    const sortedHousingTypeTags = sortTagsByLanguage(housingTypeTags, language);
    const sortedHasChildrenTags = sortTagsByLanguage(hasChildrenTags, language);
    // Build enriched currency options: map DB tags (label: "eur", index: 0) to CURRENCIES config for display
    const sortedCurrencyTags = currencyTagsList.map(tag => {
        const code = tag.label?.toUpperCase();
        const config = CURRENCIES[code];
        if (config) {
            const displayLabel = `${config.flag} ${config.code} (${config.symbol})`;
            return {
                ...tag,
                translations: { it: displayLabel, en: displayLabel },
                _currencyCode: config.code
            };
        }
        // Fallback: use tag label as-is
        const fallbackLabel = code || tag.label;
        return {
            ...tag,
            translations: { it: fallbackLabel, en: fallbackLabel },
            _currencyCode: code
        };
    });

    // Helper to translate values
    const translateValue = (currentValue, tagsArray) => {
        if (!currentValue || !tagsArray || tagsArray.length === 0) return currentValue;
        const match = tagsArray.find(tag => 
            tag.translations && Object.values(tag.translations).includes(currentValue)
        );
        return match?.translations?.[language] || currentValue;
    };

    const t = translations?.sidebar?.account || {};
    const tProfile = translations?.profile || {};
    const notSpecified = tProfile?.notSpecified || (language === 'it' ? 'Non specificato' : 'Not specified');

    // ─── Render Helpers ──────────────────────────────────────────────

    const renderField = (icon, label, value) => (
        <ProfileField theme={theme}>
            <FieldLabel theme={theme}>
                {React.cloneElement(icon, { size: 12 })}
                {label}
            </FieldLabel>
            <FieldValue theme={theme} $empty={!value || isHidden}>
                {isHidden ? '••••' : (value || notSpecified)}
            </FieldValue>
        </ProfileField>
    );

    const renderEditField = (icon, label, value, onChange, options, placeholder) => (
        <EditFieldCard theme={theme}>
            <EditFieldLabel theme={theme}>
                <EditFieldIconWrap theme={theme}>
                    {React.cloneElement(icon, { size: 14, color: 'white' })}
                </EditFieldIconWrap>
                {label}
            </EditFieldLabel>
            <Select
                value={isHidden ? '****' : (value || "")}
                onChange={onChange}
                style={{
                    backgroundColor: theme.mode === 'dark' ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.95)',
                    color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937',
                    width: '100%',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    minHeight: '2.5rem',
                }}
                displayEmpty
                renderValue={(val) => {
                    if (!val) return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>{placeholder}</span>;
                    if (typeof val === 'object') return val.label || val.value || String(val);
                    return String(val);
                }}
            >
                <MenuItem value="">
                    <em style={{ color: '#9ca3af', fontStyle: 'italic' }}>{placeholder}</em>
                </MenuItem>
                {options.map((item, index) => (
                    <MenuItem 
                        key={item.index ?? index} 
                        value={{ key: item.index ?? index, label: item.translations[language] }}
                        style={{ fontSize: '0.875rem', padding: '0.625rem 1rem' }}
                    >
                        {item.translations ? item.translations[language] : item}
                    </MenuItem>
                ))}
            </Select>
        </EditFieldCard>
    );

    // ─── Details Tab ─────────────────────────────────────────────────

    const renderDetailsTab = () => (
        <>
            {/* Profile Completion */}
            <CompletionBar theme={theme}>
                <span style={{ fontSize: '1.1rem' }}>{profileCompletionPercentage === 100 ? '🎉' : '📋'}</span>
                <CompletionTrack theme={theme}>
                    <CompletionFill theme={theme} $percent={profileCompletionPercentage} />
                </CompletionTrack>
                <CompletionLabel theme={theme}>
                    {t.profileCompletion?.title || 'Profile'} {profileCompletionPercentage}%
                </CompletionLabel>
            </CompletionBar>

            {/* Success Message */}
            {showUpdateSuccess && (
                <SuccessMessage>
                    ✓ {tProfile?.updateSuccess || (language === 'it' ? 'Profilo aggiornato con successo!' : 'Profile updated successfully!')}
                </SuccessMessage>
            )}

            {/* Quick Info Cards */}
            <InfoGrid>
                <QuickInfoCard theme={theme}>
                    <QuickInfoIcon theme={theme}>
                        <User size={16} color="white" />
                    </QuickInfoIcon>
                    <QuickInfoContent>
                        <QuickInfoLabel theme={theme}>{t.id || 'User ID'}</QuickInfoLabel>
                        <QuickInfoValue theme={theme}>{isHidden ? '••••' : userId}</QuickInfoValue>
                    </QuickInfoContent>
                </QuickInfoCard>
                <QuickInfoCard theme={theme}>
                    <QuickInfoIcon theme={theme} $bg="linear-gradient(135deg, #f59e0b, #d97706)">
                        <Star size={16} color="white" />
                    </QuickInfoIcon>
                    <QuickInfoContent>
                        <QuickInfoLabel theme={theme}>{t.accountType || 'Account Type'}</QuickInfoLabel>
                        <QuickInfoValue theme={theme}>{isHidden ? '••••' : userType}</QuickInfoValue>
                    </QuickInfoContent>
                </QuickInfoCard>
            </InfoGrid>

            {/* Benefits toggle */}
            <BenefitsToggle theme={theme} onClick={() => setShowBenefitsInfo(!showBenefitsInfo)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>💡</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937' }}>
                            {t.benefits?.title || (language === 'it' ? 'Perché completare il profilo?' : 'Why complete your profile?')}
                        </span>
                    </div>
                    <ChevronDown size={14} color={theme.mode === 'dark' ? '#9ca3af' : '#6b7280'} 
                        style={{ transition: 'transform 0.2s', transform: showBenefitsInfo ? 'rotate(180deg)' : 'none' }} />
                </div>
                {showBenefitsInfo && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', lineHeight: 1.5, color: theme.mode === 'dark' ? '#d1d5db' : '#4b5563' }}>
                            {t.benefits?.subtitle || ''}
                        </p>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', lineHeight: 1.5, color: theme.mode === 'dark' ? '#d1d5db' : '#4b5563' }}>
                            <strong>{t.benefits?.personalizedComparisonsLabel || ''}</strong> {t.benefits?.personalizedComparisons || ''}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            🔒 <em>{t.benefits?.anonymousNote || ''}</em>
                        </p>
                    </div>
                )}
            </BenefitsToggle>

            {/* View / Edit Mode */}
            {!isEditMode ? (
                <>
                    {/* Edit Button */}
                    <div style={{ display: 'flex', justifyContent: isMobileScreen ? 'center' : 'flex-end', marginBottom: '1rem' }}>
                        <MyButton
                            onClick={() => setIsEditMode(true)}
                            theme={theme}
                            data-umami-event="profile-edit-click"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.625rem 1.25rem', borderRadius: '10px',
                                fontSize: '0.85rem', fontWeight: '600',
                                background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                            }}
                        >
                            <Edit size={15} />
                            {t.buttons?.editProfile || 'Edit Profile'}
                        </MyButton>
                    </div>

                    {/* Financial Preferences */}
                    <SectionCard theme={theme} $isMobile={isMobileScreen}>
                        <SectionHeader theme={theme}>
                            <SectionIcon>💱</SectionIcon>
                            <h3>{t.sections?.financialPreferences || (language === 'it' ? 'Preferenze Finanziarie' : 'Financial Preferences')}</h3>
                        </SectionHeader>
                        <ProfileGrid>
                            {renderField(<Coins />, t.preferredCurrency || 'Preferred Currency', (() => {
                                const code = userPreferredCurrency.value;
                                const config = CURRENCIES[code];
                                return config ? `${config.flag} ${config.code} (${config.symbol})` : code;
                            })())}
                        </ProfileGrid>
                    </SectionCard>

                    {/* Professional Profile */}
                    <SectionCard theme={theme} $isMobile={isMobileScreen}>
                        <SectionHeader theme={theme}>
                            <SectionIcon>💼</SectionIcon>
                            <h3>{t.sections?.profileProfessional || (language === 'it' ? 'Profilo Professionale' : 'Professional Profile')}</h3>
                        </SectionHeader>
                        <ProfileGrid>
                            {renderField(<MapPin />, t.nationality || 'Nationality', translateValue(userNationality.value, nationalityTags))}
                            {renderField(<MapPin />, t.whereWork || 'Where you work', translateValue(userWhereWorks.value, nationalityTags))}
                            {renderField(<Briefcase />, t.work || 'Job', translateValue(userJob.value, jobTags))}
                            {renderField(<Briefcase />, t.workType || 'Job Type', translateValue(userJobType.value, jobTypeTags))}
                            {renderField(<Clock />, t.hoursContract || 'Hours', translateValue(userWorkTime.value, workTimeTags))}
                            {renderField(<Home />, t.remoteWork || 'Remote', translateValue(userRemoteType.value, remoteTypeTags))}
                            {renderField(<Star />, t.yearsExperience || 'Experience', userYearsExperience.value)}
                        </ProfileGrid>
                    </SectionCard>

                    {/* Personal Situation */}
                    <SectionCard theme={theme} $isMobile={isMobileScreen}>
                        <SectionHeader theme={theme}>
                            <SectionIcon>🏠</SectionIcon>
                            <h3>{t.sections?.personalSituation || (language === 'it' ? 'Situazione Personale' : 'Personal Situation')}</h3>
                        </SectionHeader>
                        <ProfileGrid>
                            {renderField(<Calendar />, t.age || 'Age', userAge.value)}
                            {renderField(<Users />, t.livingStatus || 'Living Status', translateValue(userLivingStatus.value, livingStatusTags))}
                            {renderField(<Home />, t.housingType || 'Housing', translateValue(userHousingType.value, housingTypeTags))}
                            {renderField(<Baby />, t.hasChildren || 'Children', translateValue(userHasChildren.value, hasChildrenTags))}
                        </ProfileGrid>
                    </SectionCard>
                </>
            ) : (
                /* Edit Form */
                <form onSubmit={handleUpdateProfile}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Edit size={16} color={theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'} />
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937' }}>
                            {t.sections?.editMode || 'Edit Mode'}
                        </h2>
                    </div>

                    {/* Financial Preferences */}
                    <SectionCard theme={theme} $isMobile={isMobileScreen}>
                        <SectionHeader theme={theme}>
                            <SectionIcon>💱</SectionIcon>
                            <h3>{t.sections?.financialPreferences || (language === 'it' ? 'Preferenze Finanziarie' : 'Financial Preferences')}</h3>
                        </SectionHeader>
                        <EditFormGrid>
                            {renderEditField(<Coins />, t.preferredCurrency || 'Preferred Currency',
                                (() => {
                                    const code = userPreferredCurrency.value;
                                    const config = CURRENCIES[code];
                                    return config ? `${config.flag} ${config.code} (${config.symbol})` : code;
                                })(),
                                (e) => {
                                    const selected = e.target.value;
                                    // Find the matching enriched tag to get the actual currency code
                                    const matchedTag = sortedCurrencyTags.find(t => t.index === selected.key);
                                    const currencyCode = matchedTag?._currencyCode || selected.label;
                                    setUserPreferredCurrency({ key: selected.key, value: currencyCode });
                                }, sortedCurrencyTags, t.selectPreferredCurrency)}
                        </EditFormGrid>
                    </SectionCard>

                    {/* Professional */}
                    <SectionCard theme={theme} $isMobile={isMobileScreen}>
                        <SectionHeader theme={theme}>
                            <SectionIcon>💼</SectionIcon>
                            <h3>{t.sections?.profileProfessional || (language === 'it' ? 'Profilo Professionale' : 'Professional Profile')}</h3>
                        </SectionHeader>
                        <EditFormGrid>
                            {renderEditField(<MapPin />, t.nationality || 'Nationality', userNationality.value, 
                                (e) => setUserNationality({ key: e.target.value.key, value: e.target.value.label }), sortedNationalityTags, t.selectNationality)}
                            {renderEditField(<MapPin />, t.whereWork || 'Where you work', userWhereWorks.value,
                                (e) => setUserWhereWorks({ key: e.target.value.key, value: e.target.value.label }), sortedNationalityTags, t.selectWhereWork)}
                            {renderEditField(<Briefcase />, t.work || 'Job', userJob.value,
                                (e) => setUserJob({ key: e.target.value.key, value: e.target.value.label }), sortedJobTags, t.selectWork)}
                            {renderEditField(<Briefcase />, t.workType || 'Job Type', userJobType.value,
                                (e) => setUserJobType({ key: e.target.value.key, value: e.target.value.label }), sortedJobTypeTags, t.selectWorkType)}
                            {renderEditField(<Clock />, t.hoursContract || 'Hours', userWorkTime.value,
                                (e) => setUserWorkTime({ key: e.target.value.key, value: e.target.value.label }), sortedWorkTimeTags, t.selectHoursContract)}
                            {renderEditField(<Home />, t.remoteWork || 'Remote', userRemoteType.value,
                                (e) => setUserRemoteType({ key: e.target.value.key, value: e.target.value.label }), sortedRemoteTypeTags, t.selectRemoteWork)}
                            {renderEditField(<Star />, t.yearsExperience || 'Experience', userYearsExperience.value,
                                (e) => setUserYearsExperience({ key: e.target.value.key, value: e.target.value.label }), sortedYearsExperienceTags, t.selectYearsExperience)}
                        </EditFormGrid>
                    </SectionCard>

                    {/* Personal */}
                    <SectionCard theme={theme} $isMobile={isMobileScreen}>
                        <SectionHeader theme={theme}>
                            <SectionIcon>🏠</SectionIcon>
                            <h3>{t.sections?.personalSituation || (language === 'it' ? 'Situazione Personale' : 'Personal Situation')}</h3>
                        </SectionHeader>
                        <EditFormGrid>
                            {renderEditField(<Calendar />, t.age || 'Age', userAge.value,
                                (e) => setUserAge({ key: e.target.value.key, value: e.target.value.label }), sortedAgeTags, t.selectAge)}
                            {renderEditField(<Users />, t.livingStatus || 'Living Status', userLivingStatus.value,
                                (e) => setUserLivingStatus({ key: e.target.value.key, value: e.target.value.label }), sortedLivingStatusTags, t.selectLivingStatus)}
                            {renderEditField(<Home />, t.housingType || 'Housing', userHousingType.value,
                                (e) => setUserHousingType({ key: e.target.value.key, value: e.target.value.label }), sortedHousingTypeTags, t.selectHousingType)}
                            {renderEditField(<Baby />, t.hasChildren || 'Children', userHasChildren.value,
                                (e) => setUserHasChildren({ key: e.target.value.key, value: e.target.value.label }), sortedHasChildrenTags, t.selectHasChildren)}
                        </EditFormGrid>
                    </SectionCard>

                    <ButtonGroup>
                        <MyButton
                            type="button"
                            onClick={() => setIsEditMode(false)}
                            theme={theme}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontSize: '0.85rem', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '600',
                                background: theme.mode === 'dark' ? 'linear-gradient(135deg, #374151, #4b5563)' : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                                border: 'none', color: 'white'
                            }}
                        >
                            <ArrowLeft size={15} />
                            {t.buttons?.cancel || 'Cancel'}
                        </MyButton>
                        <MyButton
                            type="submit"
                            theme={theme}
                            data-umami-event="profile-save-click"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontSize: '0.85rem', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '600',
                                background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                            }}
                        >
                            <Save size={15} />
                            {t.buttons?.saveChanges || 'Save Changes'}
                        </MyButton>
                    </ButtonGroup>
                </form>
            )}
        </>
    );

    // ─── Achievements Tab ────────────────────────────────────────────

    const renderAchievementsTab = () => (
        <GamificationSection theme={theme} userData={userData} isHidden={false} gamificationData={gamification} />
    );

    // ─── Main Render ─────────────────────────────────────────────────

    return (
        <>
            <SEOHead 
                title={`${t.title || 'Profile'} - Pacifinance`}
                description={`${t.title || 'Profile'} - Pacifinance`}
            />
            <Sidebar 
                userData={userData} 
                handleSetIsUpdated={handleSetIsUpdated} 
                handleSetIsAuthenticated={handleSetIsAuthenticated} 
            />

            <PageWrapper theme={theme} $isMobile={isMobileScreen}>
                <ContentSection 
                    theme={theme} 
                    $isMobile={isMobileScreen}
                >
                    {/* Page Header with Avatar */}
                    <div style={{
                        display: 'flex',
                        alignItems: isMobileScreen ? 'center' : 'flex-start',
                        gap: isMobileScreen ? '1rem' : '1.5rem',
                        marginBottom: '1.5rem',
                        flexDirection: isMobileScreen ? 'column' : 'row',
                    }}>
                        {/* Avatar with regenerate */}
                        <div style={{
                            position: 'relative',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: isMobileScreen ? '80px' : '90px',
                                height: isMobileScreen ? '80px' : '90px',
                                borderRadius: '50%',
                                border: `3px solid ${theme.buttonBackgroundColor}`,
                                padding: '3px',
                                background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                boxShadow: `0 2px 12px ${theme.buttonBackgroundColor}20`,
                            }}>
                                <AvatarIcon
                                    key={avatarKey}
                                    size={isMobileScreen ? 74 : 84}
                                    theme={theme}
                                    title={translations?.avatar?.tooltip || ''}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                            <button
                                onClick={handleRegenerateAvatar}
                                data-umami-event="profile-avatar-regenerate"
                                title={translations?.avatar?.regenerate || 'Generate new avatar'}
                                style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-2px',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    border: `2px solid ${theme.mode === 'dark' ? '#1f2937' : '#ffffff'}`,
                                    background: canRegen 
                                        ? `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`
                                        : (theme.mode === 'dark' ? 'rgba(75,85,99,0.8)' : 'rgba(209,213,219,0.9)'),
                                    color: canRegen ? 'white' : (theme.mode === 'dark' ? '#9ca3af' : '#6b7280'),
                                    cursor: canRegen ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                }}
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>

                        {/* Title + subtitle */}
                        <div style={{ textAlign: isMobileScreen ? 'center' : 'left' }}>
                            <PageTitle theme={theme} $isMobile={isMobileScreen} style={{ marginBottom: '0.25rem' }}>
                                {t.title || 'Profile'}
                            </PageTitle>
                            <p style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280',
                            }}>
                                {t.subtitle || (language === 'it' ? 'Gestisci e personalizza le tue informazioni personali' : 'Manage and customize your personal information')}
                            </p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <TabBar theme={theme}>
                        <TabButton 
                            theme={theme} 
                            $active={activeTab === 'details'}
                            onClick={() => { setActiveTab('details'); setIsEditMode(false); }}
                            data-umami-event="profile-tab-details"
                        >
                            <User size={16} />
                            {tProfile?.detailsTab || (language === 'it' ? 'Dettagli Account' : 'Account Details')}
                        </TabButton>
                        <TabButton 
                            theme={theme} 
                            $active={activeTab === 'achievements'}
                            onClick={() => { setActiveTab('achievements'); setIsEditMode(false); }}
                            data-umami-event="profile-tab-achievements"
                        >
                            <Trophy size={16} />
                            {tProfile?.achievementsTab || (language === 'it' ? 'Traguardi' : 'Achievements')}
                            {gamification?.stats?.unlockedCount > 0 && (
                                <span style={{
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    padding: '0.125rem 0.4rem',
                                    borderRadius: '6px',
                                    marginLeft: '0.125rem'
                                }}>
                                    {gamification.stats.unlockedCount}
                                </span>
                            )}
                        </TabButton>
                    </TabBar>

                    {/* Tab Content */}
                    {activeTab === 'details' ? renderDetailsTab() : renderAchievementsTab()}

                </ContentSection>
            </PageWrapper>
        </>
    );
};

export default ProfilePage;
