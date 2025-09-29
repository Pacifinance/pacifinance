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

    useEffect(() => {
        if (userData) {
            setUserId(userData.userId);
            setUserType(userData.userType);
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
            
            setNationalityTags(userData.nationalityTags || []);
            setJobTags(userData.jobTags || []);
            setJobTypeTags(userData.jobTypeTags || []);
            setWorkTimeTags(userData.workTimeTags || []);
            setRemoteTypeTags(userData.remoteTypeTags || []);
            setYearsExperienceTags(userData.yearsExperienceTags || []);
            setAgeTags(userData.ageTags || []);
            setLivingStatusTags(userData.livingStatusTags || []);
            setHousingTypeTags(userData.housingTypeTags || []);
            setHasChildrenTags(userData.hasChildrenTags || []);
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

    // Modern Card Component
    const InfoCard = ({ icon, title, value, isEditable = false }) => (
        <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${theme.buttonBackgroundColor}15`,
            borderRadius: '16px',
            padding: isMobileScreen ? '1.5rem' : '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px -1px rgba(0, 0, 0, 0.15)'
            }
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{
                    background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                    borderRadius: '12px',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {React.cloneElement(icon, { size: 18, color: 'white' })}
                </div>
                <h3 style={{
                    margin: 0,
                    fontSize: isMobileScreen ? '1rem' : '1.1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}cc)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    {title}
                </h3>
            </div>
            <p style={{
                margin: 0,
                fontSize: isMobileScreen ? '0.95rem' : '1rem',
                color: isHidden ? '#6b7280' : (value ? '#374151' : '#9ca3af'),
                fontWeight: value ? '500' : '400',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(249, 250, 251, 0.8)',
                borderRadius: '8px',
                border: '1px solid #f3f4f6'
            }}>
                {isHidden ? '••••••••' : (value || '—')}
            </p>
        </div>
    );

    // Modern Select Field Component
    const SelectField = ({ label, value, onChange, options, placeholder, icon, isSimpleArray = false }) => (
        <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${theme.buttonBackgroundColor}15`,
            borderRadius: '16px',
            padding: isMobileScreen ? '1.5rem' : '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
            }}>
                <div style={{
                    background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                    borderRadius: '10px',
                    padding: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {React.cloneElement(icon, { size: 16, color: 'white' })}
                </div>
                <label style={{
                    fontWeight: '600',
                    color: '#1f2937',
                    fontSize: isMobileScreen ? '0.95rem' : '1rem'
                }}>
                    {label}
                </label>
            </div>
            <Select
                value={isHidden ? '****' : value}
                onChange={onChange}
                style={{
                    backgroundColor: 'white',
                    width: '100%',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
                displayEmpty
                renderValue={(val) => val === "" ? placeholder : val}
            >
                <MenuItem value="">
                    <em>{placeholder}</em>
                </MenuItem>
                {options.map((item, index) => {
                    if (isSimpleArray) {
                        return (
                            <MenuItem key={index} value={item}>
                                {item}
                            </MenuItem>
                        );
                    }
                    if (item.key && item.value) {
                        return (
                            <MenuItem key={item.key} value={{ key: item.key, label: item.value[language] }}>
                                {item.value[language]}
                            </MenuItem>
                        );
                    }
                    return (
                        <MenuItem key={item.index || index} value={{ key: item.index || index, label: item.translations[language] }}>
                            {item.translations ? item.translations[language] : item}
                        </MenuItem>
                    );
                })}
            </Select>
        </div>
    );

    return (
        <>
            <SEOHead 
                title={`${languages[language].sidebar.account.title} - Pacifinance`}
                description={`${languages[language].sidebar.account.title} - Gestisci il tuo profilo Pacifinance`}
            />
            <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
                {!isMobileScreen && (
                    <Sidebar 
                        userData={userData} 
                        handleSetIsUpdated={handleSetIsUpdated} 
                        handleSetIsAuthenticated={handleSetIsAuthenticated} 
                    />
                )}

                <Section theme={theme} style={{ 
                    marginLeft: isMobileScreen ? '0' : '280px', 
                    width: isMobileScreen ? '100%' : 'calc(100% - 280px)',
                    backgroundColor: '#f9fafb'
                }}>
                    {isMobileScreen && (
                        <Sidebar 
                            userData={userData} 
                            handleSetIsUpdated={handleSetIsUpdated} 
                            handleSetIsAuthenticated={handleSetIsAuthenticated} 
                        />
                    )}

                    <StyledSection theme={theme} style={{ 
                        padding: isMobileScreen ? '1rem' : '2rem',
                        paddingTop: isMobileScreen ? '100px' : '2rem',
                        backgroundColor: 'transparent',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '2rem',
                            padding: '2rem',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            borderRadius: '20px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            border: `1px solid ${theme.buttonBackgroundColor}10`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <User size={24} color="white" />
                                </div>
                                <div>
                                    <h1 style={{
                                        margin: 0,
                                        fontSize: isMobileScreen ? '1.5rem' : '2rem',
                                        fontWeight: '700',
                                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}cc)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        {languages[language].sidebar.account.title}
                                    </h1>
                                    <p style={{
                                        margin: '0.25rem 0 0 0',
                                        color: '#6b7280',
                                        fontSize: '0.95rem'
                                    }}>
                                        Gestisci le tue informazioni personali
                                    </p>
                                </div>
                            </div>
                            <MyButton
                                onClick={() => setIsEditMode(!isEditMode)}
                                theme={theme}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    fontWeight: '600'
                                }}
                            >
                                <Edit size={16} />
                                {isEditMode ? 'Annulla' : 'Modifica'}
                            </MyButton>
                        </div>

                        {/* Success Message */}
                        {showUpdateSuccess && (
                            <div style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                padding: '1rem 1.5rem',
                                borderRadius: '12px',
                                marginBottom: '2rem',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                            }}>
                                ✓ Profilo aggiornato con successo!
                            </div>
                        )}

                        {/* Basic Information */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{
                                margin: '0 0 1.5rem 0',
                                fontSize: isMobileScreen ? '1.3rem' : '1.5rem',
                                fontWeight: '600',
                                color: '#1f2937',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <div style={{
                                    background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                    borderRadius: '8px',
                                    padding: '0.5rem'
                                }}>
                                    <User size={18} color="white" />
                                </div>
                                Informazioni Base
                            </h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                <InfoCard
                                    icon={<User />}
                                    title={languages[language].sidebar.account.id}
                                    value={userId}
                                />
                                <InfoCard
                                    icon={<Star />}
                                    title={languages[language].sidebar.account.userType}
                                    value={userType}
                                />
                            </div>
                        </div>

                        {/* Profile Data */}
                        {!isEditMode ? (
                            <div>
                                <h2 style={{
                                    margin: '0 0 1.5rem 0',
                                    fontSize: isMobileScreen ? '1.3rem' : '1.5rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <div style={{
                                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                        borderRadius: '8px',
                                        padding: '0.5rem'
                                    }}>
                                        <Briefcase size={18} color="white" />
                                    </div>
                                    Informazioni Profilo
                                </h2>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '1.5rem'
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
                                    margin: '0 0 2rem 0',
                                    fontSize: isMobileScreen ? '1.3rem' : '1.5rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <div style={{
                                        background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                        borderRadius: '8px',
                                        padding: '0.5rem'
                                    }}>
                                        <Edit size={18} color="white" />
                                    </div>
                                    Modifica Profilo
                                </h2>
                                
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
                                    gap: '2rem'
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
                                        options={yearsExperienceTags}
                                        placeholder={languages[language].sidebar.account.selectYearsExperience}
                                        icon={<Star />}
                                        isSimpleArray={true}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.age}
                                        value={userAge.value}
                                        onChange={(event) => setUserAge({key: event.target.value, value: event.target.value})}
                                        options={ageTags}
                                        placeholder={languages[language].sidebar.account.selectAge}
                                        icon={<Calendar />}
                                        isSimpleArray={true}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.livingStatus}
                                        value={userLivingStatus.value}
                                        onChange={(event) => setUserLivingStatus({key: event.target.value.key, value: event.target.value.label})}
                                        options={livingStatusTags}
                                        placeholder={languages[language].sidebar.account.selectLivingStatus}
                                        icon={<Users />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.housingType}
                                        value={userHousingType.value}
                                        onChange={(event) => setUserHousingType({key: event.target.value.key, value: event.target.value.label})}
                                        options={housingTypeTags}
                                        placeholder={languages[language].sidebar.account.selectHousingType}
                                        icon={<Home />}
                                    />

                                    <SelectField
                                        label={languages[language].sidebar.account.hasChildren}
                                        value={userHasChildren.value}
                                        onChange={(event) => setUserHasChildren({key: event.target.value.key, value: event.target.value.label})}
                                        options={hasChildrenTags}
                                        placeholder={languages[language].sidebar.account.selectHasChildren}
                                        icon={<Baby />}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: '3rem'
                                }}>
                                    <MyButton
                                        type="submit"
                                        theme={theme}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: isMobileScreen ? '1rem' : '1.1rem',
                                            padding: '16px 32px',
                                            borderRadius: '16px',
                                            fontWeight: '600',
                                            background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}dd)`,
                                            boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        <Save size={18} />
                                        {languages[language].sidebar.account.saveButton}
                                    </MyButton>
                                </div>
                            </form>
                        )}
                    </StyledSection>
                </Section>
            </div>
        </>
    );
};

export default AccountPage;