import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem, TextField, Switch, FormControlLabel } from "@mui/material";
import { 
    Edit, 
    Save, 
    ArrowLeft, 
    User, 
    MapPin, 
    Briefcase, 
    Clock, 
    Home, 
    Calendar,
    Users,
    Baby,
    Star
} from 'lucide-react';
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { UserContext } from '../contexts/UserContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import Sidebar from '../sections/Sidebar';
import SEOHead from '../components/SEOHead';
import languages from '../data/languages.json';
import {
    Section,
    MyButton,
    StyledSection
} from '../styles/MyStyled';

// Profile Completion Indicator Component
const ProfileCompletionIndicator = ({ 
    userNationality, userWhereWorks, userJob, userJobType, userWorkTime, 
    userRemoteType, userYearsExperience, userAge, userLivingStatus, 
    userHousingType, userHasChildren, theme, isMobileScreen, language 
}) => {
    const fields = [
        userNationality.value, userWhereWorks.value, userJob.value, 
        userJobType.value, userWorkTime.value, userRemoteType.value, 
        userYearsExperience.value, userAge.value, userLivingStatus.value, 
        userHousingType.value, userHasChildren.value
    ];
    const completedFields = fields.filter(field => field && field !== "").length;
    const totalFields = fields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    
    return (
        <div style={{
            background: theme.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${theme.mode === 'dark' ? theme.buttonBackgroundColor + '20' : theme.buttonBackgroundColor + '15'}`,
            borderRadius: '20px',
            padding: isMobileScreen ? '1.5rem' : '2rem',
            marginBottom: '2rem',
            boxShadow: theme.mode === 'dark' 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'
                    }}>
                        {languages[language].sidebar.account.profileCompletion.title} {completionPercentage}%
                    </h3>
                    <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280'
                    }}>
                        {completedFields} {languages[language].sidebar.account.profileCompletion.of} {totalFields} {languages[language].sidebar.account.profileCompletion.completedFields}
                    </p>
                </div>
                <div style={{
                    fontSize: '2rem',
                    opacity: completionPercentage === 100 ? 1 : 0.5
                }}>
                    {completionPercentage === 100 ? '🎉' : '📋'}
                </div>
            </div>
            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${completionPercentage}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                }} />
            </div>
        </div>
    );
};

const AccountPage = () => {
    const { theme } = useContext(ThemeContext);
    const { isHidden } = useContext(PrivacyContext);
    const { language } = useContext(LanguageContext);
    const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const navigate = useNavigate();

    const [isEditMode, setIsEditMode] = useState(false);
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
    const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

    // Mock data for development/testing - sorted alphabetically
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
        "0-1 anni",
        "2-3 anni", 
        "4-5 anni",
        "6-10 anni",
        "10+ anni"
    ];

    const mockAgeTags = [
        "18-25",
        "26-35", 
        "36-45",
        "46-55",
        "55+"
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

    useEffect(() => {
        if (userData) {
            setUserId(userData.userId || '00000');
            setUserType(userData.userType || 'mockUser');
            setUserNationality(userData.userNationality || { key: "", value: "" });
            setUserWhereWorks(userData.userWhereWorks || { key: "", value: "" });
            setUserJob(userData.userJob || { key: "", value: "" });
            setUserJobType(userData.userJobType || { key: "", value: "" });
            setUserWorkTime(userData.userWorkTime || { key: "", value: "" });
            setUserRemoteType(userData.userRemoteType || { key: "", value: "" });
            setUserYearsExperience(userData.userYearsExperience || { key: "", value: "" });
            setUserAge(userData.userAge || { key: "", value: "" });
            setUserLivingStatus(userData.userLivingStatus || { key: "", value: "" });
            setUserHousingType(userData.userHousingType || { key: "", value: "" });
            setUserHasChildren(userData.userHasChildren || { key: "", value: "" });
            
            // Use mock data if no userData tags are available (development mode)
            setNationalityTags(userData.nationalityTags || mockNationalityTags);
            setJobTags(userData.jobTags || mockJobTags);
            setJobTypeTags(userData.jobTypeTags || mockJobTypeTags);
            setWorkTimeTags(userData.workTimeTags || mockWorkTimeTags);
            setRemoteTypeTags(userData.remoteTypeTags || mockRemoteTypeTags);
            setYearsExperienceTags(userData.yearsExperienceTags || mockYearsExperienceTags);
            setAgeTags(userData.ageTags || mockAgeTags);
            setLivingStatusTags(userData.livingStatusTags || mockLivingStatusTags);
            setHousingTypeTags(userData.housingTypeTags || mockHousingTypeTags);
            setHasChildrenTags(userData.hasChildrenTags || mockHasChildrenTags);
        } else {
            // Mock user when no userData is available
            setUserId('00000');
            setUserType('mockUser');
            
            // Set mock tags
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
        }
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
                years_experience: userYearsExperience.key,
                age: userAge.key,
                living_status: userLivingStatus.key,
                housing_type: userHousingType.key,
                has_children: userHasChildren.key
            };
            const response = await axios.post('/user/set', data, { withCredentials: true });
            if (response.status === 200) {
                handleSetIsUpdated(false);
                setShowUpdateSuccess(true);
                setIsEditMode(false);
                setTimeout(() => setShowUpdateSuccess(false), 3000);
            } else {
                alert(languages[language].sidebar.account.errorUpdateProfile);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Sort all tags by current language
    const sortedNationalityTags = sortTagsByLanguage(nationalityTags, language);
    const sortedJobTags = sortTagsByLanguage(jobTags, language);
    const sortedJobTypeTags = sortTagsByLanguage(jobTypeTags, language);
    const sortedWorkTimeTags = sortTagsByLanguage(workTimeTags, language);
    const sortedRemoteTypeTags = sortTagsByLanguage(remoteTypeTags, language);
    const sortedYearsExperienceTags = [...yearsExperienceTags].sort();
    const sortedAgeTags = [...ageTags].sort();
    const sortedLivingStatusTags = sortTagsByLanguage(livingStatusTags, language);
    const sortedHousingTypeTags = sortTagsByLanguage(housingTypeTags, language);
    const sortedHasChildrenTags = sortTagsByLanguage(hasChildrenTags, language);

    // Modern Card Component with theme support and enhanced styling
    const InfoCard = ({ icon, title, value, isEditable = false }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        const cardBg = theme.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
            
        const valueBg = theme.mode === 'dark'
            ? isHovered ? 'rgba(55, 65, 81, 0.7)' : 'rgba(31, 41, 55, 0.5)'
            : isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(249, 250, 251, 0.8)';
            
        const borderColor = theme.mode === 'dark'
            ? isHovered ? `${theme.buttonBackgroundColor}40` : `${theme.buttonBackgroundColor}20`
            : isHovered ? `${theme.buttonBackgroundColor}25` : `${theme.buttonBackgroundColor}15`;
            
        const textColor = theme.mode === 'dark' ? '#f3f4f6' : '#1f2937';
        const valueTextColor = isHidden ? '#9ca3af' : (value ? textColor : '#6b7280');
        
        return (
            <div 
                style={{
                    background: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '20px',
                    padding: isMobileScreen ? '1.2rem' : '1.5rem',
                    boxShadow: theme.mode === 'dark' 
                        ? isHovered 
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                            : '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        : isHovered 
                            ? '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: theme.mode === 'dark' ? 'blur(16px)' : 'none'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Animated background pattern */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `conic-gradient(from 0deg, transparent, ${theme.buttonBackgroundColor}10, transparent)`,
                    opacity: isHovered ? 0.6 : 0,
                    transition: 'opacity 0.6s ease',
                    animation: isHovered ? 'rotate 8s linear infinite' : 'none'
                }} />
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}cc)`,
                        borderRadius: '16px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isHovered 
                            ? `0 12px 20px -5px ${theme.buttonBackgroundColor}40` 
                            : `0 6px 10px -2px ${theme.buttonBackgroundColor}30`,
                        transition: 'all 0.3s ease',
                        transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'
                    }}>
                        {React.cloneElement(icon, { size: 22, color: 'white' })}
                    </div>
                    <h3 style={{
                        margin: 0,
                        fontSize: isMobileScreen ? '1.1rem' : '1.2rem',
                        fontWeight: '600',
                        color: textColor,
                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}aa)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {title}
                    </h3>
                </div>
                <div style={{
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{
                        margin: 0,
                        fontSize: isMobileScreen ? '1rem' : '1.1rem',
                        color: valueTextColor,
                        fontWeight: value ? '600' : '400',
                        padding: '1.25rem 1.5rem',
                        backgroundColor: valueBg,
                        borderRadius: '16px',
                        border: `1px solid ${theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : '#f3f4f6'}`,
                        transition: 'all 0.3s ease',
                        minHeight: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        backdropFilter: theme.mode === 'dark' ? 'blur(8px)' : 'none',
                        letterSpacing: '0.025em'
                    }}>
                        {isHidden ? '••••••••' : (value || (
                            <span style={{ 
                                color: theme.mode === 'dark' ? '#6b7280' : '#9ca3af',
                                fontStyle: 'italic' 
                            }}>
                                Non specificato
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Modern Select Field Component with theme support and enhanced styling
    const SelectField = ({ label, value, onChange, options, placeholder, icon, isSimpleArray = false }) => {
        const [isHovered, setIsHovered] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        
        const cardBg = theme.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
            
        const borderColor = theme.mode === 'dark'
            ? isFocused ? `${theme.buttonBackgroundColor}60` : (isHovered ? `${theme.buttonBackgroundColor}40` : `${theme.buttonBackgroundColor}20`)
            : isFocused ? `${theme.buttonBackgroundColor}40` : (isHovered ? `${theme.buttonBackgroundColor}25` : `${theme.buttonBackgroundColor}15`);
            
        const textColor = theme.mode === 'dark' ? '#f3f4f6' : '#1f2937';
        
        return (
            <div 
                style={{
                    background: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '24px',
                    padding: isMobileScreen ? '1.5rem' : '2rem',
                    boxShadow: theme.mode === 'dark' 
                        ? isFocused 
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                            : (isHovered 
                                ? '0 15px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                                : '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)')
                        : isFocused 
                            ? '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
                            : (isHovered 
                                ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered || isFocused ? 'translateY(-4px)' : 'translateY(0)',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: theme.mode === 'dark' ? 'blur(16px)' : 'none'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Animated gradient overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}08, transparent)`,
                    opacity: isHovered || isFocused ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    borderRadius: '24px'
                }} />
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}cc)`,
                        borderRadius: '16px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isHovered || isFocused 
                            ? `0 10px 15px -3px ${theme.buttonBackgroundColor}40` 
                            : `0 6px 10px -2px ${theme.buttonBackgroundColor}30`,
                        transition: 'all 0.3s ease',
                        transform: isHovered || isFocused ? 'scale(1.1) rotate(3deg)' : 'scale(1) rotate(0deg)'
                    }}>
                        {React.cloneElement(icon, { size: 20, color: 'white' })}
                    </div>
                    <label style={{
                        fontWeight: '600',
                        color: textColor,
                        fontSize: isMobileScreen ? '1.05rem' : '1.1rem',
                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}aa)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {label}
                    </label>
                </div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <Select
                        value={isHidden ? '****' : (value || "")}
                        onChange={onChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{
                            backgroundColor: theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                            color: textColor,
                            width: '100%',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                            boxShadow: theme.mode === 'dark' 
                                ? isFocused 
                                    ? '0 8px 15px -3px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                : isFocused 
                                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            minHeight: '3.5rem',
                            backdropFilter: theme.mode === 'dark' ? 'blur(12px)' : 'none'
                        }}
                        displayEmpty
                        renderValue={(val) => {
                            if (val === "" || val === null || val === undefined) {
                                return <span style={{ 
                                    color: theme.mode === 'dark' ? '#6b7280' : '#9ca3af', 
                                    fontStyle: 'italic' 
                                }}>{placeholder}</span>;
                            }
                            return isSimpleArray ? val : (typeof val === 'object' ? val.label : val);
                        }}
                    >
                        <MenuItem value="">
                            <em style={{ 
                                color: theme.mode === 'dark' ? '#6b7280' : '#9ca3af', 
                                fontStyle: 'italic' 
                            }}>
                                {placeholder}
                            </em>
                        </MenuItem>
                        {options.map((item, index) => {
                            if (isSimpleArray) {
                                return (
                                    <MenuItem 
                                        key={index} 
                                        value={item}
                                        style={{
                                            fontSize: '1rem',
                                            padding: '1rem 1.25rem',
                                            transition: 'background-color 0.2s ease',
                                            color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'
                                        }}
                                    >
                                        {item}
                                    </MenuItem>
                                );
                            }
                            if (item.key && item.value) {
                                return (
                                    <MenuItem 
                                        key={item.key} 
                                        value={{ key: item.key, label: item.value[language] }}
                                        style={{
                                            fontSize: '1rem',
                                            padding: '1rem 1.25rem',
                                            transition: 'background-color 0.2s ease',
                                            color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'
                                        }}
                                    >
                                        {item.value[language]}
                                    </MenuItem>
                                );
                            }
                            return (
                                <MenuItem 
                                    key={item.index || index} 
                                    value={{ key: item.index || index, label: item.translations[language] }}
                                    style={{
                                        fontSize: '1rem',
                                        padding: '1rem 1.25rem',
                                        transition: 'background-color 0.2s ease',
                                        color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'
                                    }}
                                >
                                    {item.translations ? item.translations[language] : item}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </div>
            </div>
        );
    };

    return (
        <>
            <SEOHead 
                title={`${languages[language].sidebar.account.title} - Pacifinance`}
                description={`${languages[language].sidebar.account.title} - Gestisci il tuo profilo Pacifinance`}
            />
            <Sidebar 
                userData={userData} 
                handleSetIsUpdated={handleSetIsUpdated} 
                handleSetIsAuthenticated={handleSetIsAuthenticated} 
            />

            <div style={{ 
                marginLeft: isMobileScreen ? '0' : '280px',
                width: isMobileScreen ? '100%' : 'calc(100% - 280px)',
                minHeight: '100vh',
                backgroundColor: theme.mode === 'dark' ? theme.primaryDarkBackgroundColor : theme.primaryLightBackgroundColor
            }}>
                <StyledSection theme={theme} style={{ 
                    padding: isMobileScreen ? '1rem' : '2rem',
                    paddingTop: isMobileScreen ? '100px' : '2rem',
                    backgroundColor: theme.mode === 'dark' ? theme.primaryDarkBackgroundColor : theme.primaryLightBackgroundColor,
                    maxWidth: '1600px',
                    margin: '0 auto'
                }}>
                        <style>
                            {`
                                @keyframes slideIn {
                                    from {
                                        opacity: 0;
                                        transform: translateY(-20px);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: translateY(0);
                                    }
                                }
                                
                                @keyframes rotate {
                                    from {
                                        transform: rotate(0deg);
                                    }
                                    to {
                                        transform: rotate(360deg);
                                    }
                                }
                                
                                @keyframes pulse {
                                    0%, 100% {
                                        opacity: 1;
                                    }
                                    50% {
                                        opacity: 0.7;
                                    }
                                }
                            `}
                        </style>
                        {/* Header */}
                        <div style={{
                            marginBottom: '3rem',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem',
                                background: theme.mode === 'dark' 
                                    ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)'
                                    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                padding: '1.5rem 2.5rem',
                                borderRadius: '25px',
                                boxShadow: theme.mode === 'dark'
                                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                    : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                border: `1px solid ${theme.mode === 'dark' ? theme.buttonBackgroundColor + '20' : theme.buttonBackgroundColor + '10'}`,
                                backdropFilter: theme.mode === 'dark' ? 'blur(16px)' : 'none'
                            }}>
                                <div style={{
                                    background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}cc)`,
                                    borderRadius: '20px',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 15px 25px -5px ${theme.buttonBackgroundColor}40`,
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}>
                                    <User size={28} color="white" />
                                </div>
                                <h1 style={{
                                    margin: 0,
                                    fontSize: isMobileScreen ? '1.8rem' : '2.5rem',
                                    fontWeight: '800',
                                    background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}aa)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-0.025em'
                                }}>
                                    Your Account
                                </h1>
                            </div>
                            <p style={{
                                margin: 0,
                                color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280',
                                fontSize: '1.1rem',
                                fontWeight: '500'
                            }}>
                                Gestisci e personalizza le tue informazioni
                            </p>
                        </div>

                        {/* Success Message */}
                        {showUpdateSuccess && (
                            <div style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                padding: '1.5rem 2.5rem',
                                borderRadius: '20px',
                                marginBottom: '3rem',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                animation: 'slideIn 0.6s ease-out',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(12px)',
                                maxWidth: '500px',
                                margin: '0 auto 3rem auto'
                            }}>
                                <div style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    borderRadius: '50%',
                                    padding: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    ✓
                                </div>
                                <span>Profilo aggiornato con successo!</span>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '2rem',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: isMobileScreen ? '1.5rem' : '1.8rem',
                                    fontWeight: '700',
                                    color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                        borderRadius: '12px',
                                        padding: '0.75rem',
                                        boxShadow: `0 8px 15px -3px ${theme.buttonBackgroundColor}30`
                                    }}>
                                        <User size={20} color="white" />
                                    </div>
                                    Informazioni Base
                                </h2>
                                
                                <MyButton
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    theme={theme}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '14px 24px',
                                        borderRadius: '16px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        background: isEditMode 
                                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                            : `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                        boxShadow: isEditMode
                                            ? '0 10px 15px -3px rgba(239, 68, 68, 0.4)'
                                            : `0 10px 15px -3px ${theme.buttonBackgroundColor}40`,
                                        transition: 'all 0.3s ease',
                                        transform: 'translateY(0)',
                                        ':hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: isEditMode
                                                ? '0 15px 20px -3px rgba(239, 68, 68, 0.5)'
                                                : `0 15px 20px -3px ${theme.buttonBackgroundColor}50`
                                        }
                                    }}
                                >
                                    <Edit size={18} />
                                    {isEditMode ? 'Annulla Modifica' : 'Modifica Profilo'}
                                </MyButton>
                            </div>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(2, 1fr)',
                                gap: '2rem'
                            }}>
                                <InfoCard
                                    icon={<User />}
                                    title="User ID"
                                    value={userId}
                                />
                                <InfoCard
                                    icon={<Star />}
                                    title="Tipo Account"
                                    value={userType}
                                />
                            </div>
                        </div>

                        {/* Info Benefits Section */}
                        <div style={{
                            background: theme.mode === 'dark' 
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
                                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
                            border: `1px solid ${theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'}`,
                            borderRadius: '20px',
                            padding: isMobileScreen ? '1.5rem' : '2rem',
                            marginBottom: '3rem',
                            backdropFilter: theme.mode === 'dark' ? 'blur(16px)' : 'none'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1.5rem',
                                flexDirection: isMobileScreen ? 'column' : 'row'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)',
                                    minWidth: '60px'
                                }}>
                                    <Users size={24} color="white" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: '0 0 0.75rem 0',
                                        fontSize: isMobileScreen ? '1.2rem' : '1.4rem',
                                        fontWeight: '700',
                                        color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'
                                    }}>
                                        💡 {languages[language].sidebar.account.benefits.title}
                                    </h3>
                                    <p style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        color: theme.mode === 'dark' ? '#d1d5db' : '#4b5563'
                                    }}>
                                        {languages[language].sidebar.account.benefits.subtitle}
                                    </p>
                                    <p style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '1rem',
                                        lineHeight: '1.6',
                                        color: theme.mode === 'dark' ? '#d1d5db' : '#4b5563'
                                    }}>
                                        <strong>Confronti personalizzati:</strong> {languages[language].sidebar.account.benefits.personalizedComparisons}
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                        color: theme.mode === 'dark' ? '#9ca3af' : '#6b7280'
                                    }}>
                                        🔒 <em>{languages[language].sidebar.account.benefits.anonymousNote}</em>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Data */}
                        {!isEditMode ? (
                            <div>
                                {/* Profile Completion Indicator */}
                                <ProfileCompletionIndicator 
                                    userNationality={userNationality}
                                    userWhereWorks={userWhereWorks}
                                    userJob={userJob}
                                    userJobType={userJobType}
                                    userWorkTime={userWorkTime}
                                    userRemoteType={userRemoteType}
                                    userYearsExperience={userYearsExperience}
                                    userAge={userAge}
                                    userLivingStatus={userLivingStatus}
                                    userHousingType={userHousingType}
                                    userHasChildren={userHasChildren}
                                    theme={theme}
                                    isMobileScreen={isMobileScreen}
                                    language={language}
                                />
                                
                                <h2 style={{
                                    margin: '0 0 2rem 0',
                                    fontSize: isMobileScreen ? '1.5rem' : '1.8rem',
                                    fontWeight: '700',
                                    color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                        borderRadius: '12px',
                                        padding: '0.75rem',
                                        boxShadow: `0 8px 15px -3px ${theme.buttonBackgroundColor}30`
                                    }}>
                                        <Briefcase size={20} color="white" />
                                    </div>
                                    Dettagli Profilo
                                </h2>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobileScreen 
                                        ? '1fr' 
                                        : 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '2rem'
                                }}>
                                    <InfoCard
                                        icon={<MapPin />}
                                        title={languages[language].sidebar.account.nationality}
                                        value={userNationality.value}
                                    />
                                    <InfoCard
                                        icon={<MapPin />}
                                        title={languages[language].sidebar.account.whereWork}
                                        value={userWhereWorks.value}
                                    />
                                    <InfoCard
                                        icon={<Briefcase />}
                                        title={languages[language].sidebar.account.work}
                                        value={userJob.value}
                                    />
                                    <InfoCard
                                        icon={<Briefcase />}
                                        title={languages[language].sidebar.account.workType}
                                        value={userJobType.value}
                                    />
                                    <InfoCard
                                        icon={<Clock />}
                                        title={languages[language].sidebar.account.hoursContract}
                                        value={userWorkTime.value}
                                    />
                                    <InfoCard
                                        icon={<Home />}
                                        title={languages[language].sidebar.account.remoteWork}
                                        value={userRemoteType.value}
                                    />
                                    <InfoCard
                                        icon={<Star />}
                                        title={languages[language].sidebar.account.yearsExperience}
                                        value={userYearsExperience.value}
                                    />
                                    <InfoCard
                                        icon={<Calendar />}
                                        title={languages[language].sidebar.account.age}
                                        value={userAge.value}
                                    />
                                    <InfoCard
                                        icon={<Users />}
                                        title={languages[language].sidebar.account.livingStatus}
                                        value={userLivingStatus.value}
                                    />
                                    <InfoCard
                                        icon={<Home />}
                                        title={languages[language].sidebar.account.housingType}
                                        value={userHousingType.value}
                                    />
                                    <InfoCard
                                        icon={<Baby />}
                                        title={languages[language].sidebar.account.hasChildren}
                                        value={userHasChildren.value}
                                    />
                                </div>
                            </div>
                        ) : (
                            /* Edit Form */
                            <form onSubmit={handleUpdateProfile}>
                                <h2 style={{
                                    margin: '0 0 2.5rem 0',
                                    fontSize: isMobileScreen ? '1.5rem' : '1.8rem',
                                    fontWeight: '700',
                                    color: theme.mode === 'dark' ? '#f3f4f6' : '#1f2937',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    textAlign: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        borderRadius: '12px',
                                        padding: '0.75rem',
                                        boxShadow: '0 8px 15px -3px rgba(239, 68, 68, 0.3)',
                                        animation: 'pulse 2s ease-in-out infinite'
                                    }}>
                                        <Edit size={20} color="white" />
                                    </div>
                                    Modalità Modifica Attiva
                                </h2>
                                
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobileScreen 
                                        ? '1fr' 
                                        : 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <SelectField
                                        label={languages[language].sidebar.account.nationality}
                                        value={userNationality.value}
                                        onChange={(event) => setUserNationality({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedNationalityTags}
                                        placeholder={languages[language].sidebar.account.selectNationality}
                                        icon={<MapPin />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.whereWork}
                                        value={userWhereWorks.value}
                                        onChange={(event) => setUserWhereWorks({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedNationalityTags}
                                        placeholder={languages[language].sidebar.account.selectWhereWork}
                                        icon={<MapPin />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.work}
                                        value={userJob.value}
                                        onChange={(event) => setUserJob({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedJobTags}
                                        placeholder={languages[language].sidebar.account.selectWork}
                                        icon={<Briefcase />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.workType}
                                        value={userJobType.value}
                                        onChange={(event) => setUserJobType({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedJobTypeTags}
                                        placeholder={languages[language].sidebar.account.selectWorkType}
                                        icon={<Briefcase />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.hoursContract}
                                        value={userWorkTime.value}
                                        onChange={(event) => setUserWorkTime({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedWorkTimeTags}
                                        placeholder={languages[language].sidebar.account.selectHoursContract}
                                        icon={<Clock />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.remoteWork}
                                        value={userRemoteType.value}
                                        onChange={(event) => setUserRemoteType({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedRemoteTypeTags}
                                        placeholder={languages[language].sidebar.account.selectRemoteWork}
                                        icon={<Home />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.yearsExperience}
                                        value={userYearsExperience.value}
                                        onChange={(event) => setUserYearsExperience({key: event.target.value, value: event.target.value})}
                                        options={sortedYearsExperienceTags}
                                        placeholder={languages[language].sidebar.account.selectYearsExperience}
                                        icon={<Star />}
                                        isSimpleArray={true}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.age}
                                        value={userAge.value}
                                        onChange={(event) => setUserAge({key: event.target.value, value: event.target.value})}
                                        options={sortedAgeTags}
                                        placeholder={languages[language].sidebar.account.selectAge}
                                        icon={<Calendar />}
                                        isSimpleArray={true}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.livingStatus}
                                        value={userLivingStatus.value}
                                        onChange={(event) => setUserLivingStatus({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedLivingStatusTags}
                                        placeholder={languages[language].sidebar.account.selectLivingStatus}
                                        icon={<Users />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.housingType}
                                        value={userHousingType.value}
                                        onChange={(event) => setUserHousingType({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedHousingTypeTags}
                                        placeholder={languages[language].sidebar.account.selectHousingType}
                                        icon={<Home />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.hasChildren}
                                        value={userHasChildren.value}
                                        onChange={(event) => setUserHasChildren({key: event.target.value.key, value: event.target.value.label})}
                                        options={sortedHasChildrenTags}
                                        placeholder={languages[language].sidebar.account.selectHasChildren}
                                        icon={<Baby />}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: '4rem',
                                    gap: '1rem'
                                }}>
                                    <MyButton
                                        type="button"
                                        onClick={() => setIsEditMode(false)}
                                        theme={theme}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: isMobileScreen ? '1rem' : '1.1rem',
                                            padding: '18px 28px',
                                            borderRadius: '18px',
                                            fontWeight: '600',
                                            background: theme.mode === 'dark' 
                                                ? 'linear-gradient(135deg, #374151, #4b5563)'
                                                : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                                            border: 'none',
                                            color: 'white'
                                        }}
                                    >
                                        <ArrowLeft size={18} />
                                        Annulla
                                    </MyButton>
                                    
                                    <MyButton
                                        type="submit"
                                        theme={theme}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: isMobileScreen ? '1rem' : '1.1rem',
                                            padding: '18px 32px',
                                            borderRadius: '18px',
                                            fontWeight: '600',
                                            background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                            boxShadow: `0 15px 25px -5px ${theme.buttonBackgroundColor}40`,
                                            transform: 'translateY(0)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <Save size={20} />
                                        Salva Modifiche
                                    </MyButton>
                                </div>
                            </form>
                        )}
                </StyledSection>
            </div>
        </>
    );
};

export default AccountPage;