
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem } from "@mui/material";
import { Edit, Save, ArrowLeft, User, MapPin, Briefcase, Clock, Home } from 'lucide-react';
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { UserContext } from '../contexts/UserContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import Sidebar from '../sections/Sidebar';
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
    const [nationalityTags, setNationalityTags] = useState([]);
    const [jobTags, setJobTags] = useState([]);
    const [jobTypeTags, setJobTypeTags] = useState([]);
    const [workTimeTags, setWorkTimeTags] = useState([]);
    const [remoteTypeTags, setRemoteTypeTags] = useState([]);
    const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

    useEffect(() => {
        if (userData) {
            setUserId(userData.userId);
            setUserType(userData.userType);
            setUserNationality(userData.userNationality);
            setUserWhereWorks(userData.userWhereWorks);
            setUserJob(userData.userJob);
            setUserJobType(userData.userJobType);
            setUserWorkTime(userData.userWorkTime);
            setUserRemoteType(userData.userRemoteType);
            setNationalityTags(userData.nationalityTags);
            setJobTags(userData.jobTags);
            setJobTypeTags(userData.jobTypeTags);
            setWorkTimeTags(userData.workTimeTags);
            setRemoteTypeTags(userData.remoteTypeTags);
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
                remote_type: userRemoteType.key
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

    const InfoCard = ({ icon, title, value, placeholder }) => (
        <div style={{
            backgroundColor: 'white',
            border: `2px solid ${theme.buttonBackgroundColor}20`,
            borderRadius: '12px',
            padding: isMobileScreen ? '1rem' : '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{
                    backgroundColor: theme.buttonBackgroundColor,
                    borderRadius: '8px',
                    padding: '8px',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {React.cloneElement(icon, { size: 16, color: 'white' })}
                </div>
                <h3 style={{
                    margin: 0,
                    fontSize: isMobileScreen ? '0.9rem' : '1rem',
                    fontWeight: '600',
                    color: 'black'
                }}>
                    {title}
                </h3>
            </div>
            <p style={{
                margin: 0,
                fontSize: isMobileScreen ? '0.85rem' : '0.95rem',
                color: isHidden ? 'black' : (value ? 'black' : '#999'),
                fontWeight: value ? '500' : '400',
                marginLeft: '40px'
            }}>
                {isHidden ? '****' : (value || placeholder)}
            </p>
        </div>
    );

    const SelectField = ({ label, value, onChange, options, placeholder, icon }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{
                    backgroundColor: theme.buttonBackgroundColor,
                    borderRadius: '6px',
                    padding: '6px',
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {React.cloneElement(icon, { size: 14, color: 'white' })}
                </div>
                <label style={{
                    fontWeight: '600',
                    color: 'black',
                    fontSize: isMobileScreen ? '0.9rem' : '1rem'
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
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                }}
                displayEmpty
                renderValue={(val) => val === "" ? placeholder : val}
            >
                <MenuItem value="">
                    <em>{placeholder}</em>
                </MenuItem>
                {options.map((tag) => (
                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                        {tag.translations[language]}
                    </MenuItem>
                ))}
            </Select>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {!isMobileScreen && <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />}

            <Section theme={theme} style={{ marginLeft: '0', width: '100%' }}>
                {isMobileScreen && <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />}

                <StyledSection theme={theme} style={{ 
                    padding: isMobileScreen ? '1rem' : '2rem',
                    paddingTop: isMobileScreen ? '80px' : '2rem'
                }}>
                    {/* Header */}
                    <div style={{
                        marginBottom: isMobileScreen ? '1.5rem' : '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                backgroundColor: theme.buttonBackgroundColor,
                                borderRadius: '12px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <User size={24} color="white" />
                            </div>
                            <h1 style={{
                                margin: 0,
                                fontSize: isMobileScreen ? '1.5rem' : '2rem',
                                fontWeight: '700',
                                color: theme.textColor
                            }}>
                                {languages[language].sidebar.account.title}
                            </h1>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            gap: '0.5rem', 
                            flexDirection: isMobileScreen ? 'column' : 'row' 
                        }}>
                            {!isEditMode ? (
                                <MyButton
                                    theme={theme}
                                    onClick={() => setIsEditMode(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: isMobileScreen ? '0.8rem' : '0.85rem',
                                        padding: isMobileScreen ? '8px 16px' : '8px 16px',
                                        width: isMobileScreen ? 'auto' : 'auto',
                                        maxWidth: isMobileScreen ? '150px' : 'auto'
                                    }}
                                >
                                    <Edit size={14} />
                                    Modifica
                                </MyButton>
                            ) : (
                                <MyButton
                                    theme={theme}
                                    onClick={() => setIsEditMode(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: isMobileScreen ? '0.8rem' : '0.85rem',
                                        padding: isMobileScreen ? '8px 16px' : '8px 16px',
                                        backgroundColor: '#6b7280',
                                        width: isMobileScreen ? 'auto' : 'auto',
                                        maxWidth: isMobileScreen ? '150px' : 'auto'
                                    }}
                                >
                                    <ArrowLeft size={14} />
                                    Annulla
                                </MyButton>
                            )}
                        </div>
                    </div>

                    {/* Success Message */}
                    {showUpdateSuccess && (
                        <div style={{
                            backgroundColor: theme.buttonBackgroundColor,
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            margin: '0 0 2rem 0',
                            textAlign: 'center',
                            fontSize: isMobileScreen ? '0.9rem' : '1rem'
                        }}>
                            {languages[language].sidebar.account.successPopup.message}
                        </div>
                    )}

                    {/* Main Content */}
                    <div style={{
                        maxWidth: isMobileScreen ? '100%' : '800px',
                        margin: '0 auto'
                    }}>
                        {/* Basic Info Card */}
                        <div style={{
                            backgroundColor: 'white',
                            border: `2px solid ${theme.buttonBackgroundColor}`,
                            borderRadius: '16px',
                            padding: isMobileScreen ? '1.5rem' : '2rem',
                            marginBottom: '2rem',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h2 style={{
                                margin: '0 0 1.5rem 0',
                                fontSize: isMobileScreen ? '1.2rem' : '1.4rem',
                                fontWeight: '600',
                                color: 'black',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <User size={20} color={theme.buttonBackgroundColor} />
                                Informazioni Base
                            </h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobileScreen ? '1fr' : '1fr 1fr',
                                gap: '1rem'
                            }}>
                                <div>
                                    <p style={{ margin: '0 0 0.3rem 0', fontWeight: '600', color: '#666', fontSize: '0.85rem' }}>
                                        {languages[language].sidebar.account.id}
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        color: isHidden ? 'black' : (userId ? 'black' : '#999'),
                                        fontWeight: userId ? '500' : '400'
                                    }}>
                                        {isHidden ? '****' : (userId || '-')}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.3rem 0', fontWeight: '600', color: '#666', fontSize: '0.85rem' }}>
                                        {languages[language].sidebar.account.userType}
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        color: isHidden ? 'black' : (userType ? 'black' : '#999'),
                                        fontWeight: userType ? '500' : '400'
                                    }}>
                                        {isHidden ? '****' : (userType || '-')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Data */}
                        {!isEditMode ? (
                            <div>
                                <h2 style={{
                                    margin: '0 0 1.5rem 0',
                                    fontSize: isMobileScreen ? '1.2rem' : '1.4rem',
                                    fontWeight: '600',
                                    color: theme.textColor
                                }}>
                                    I Tuoi Dati
                                </h2>
                                <InfoCard
                                    icon={<MapPin />}
                                    title={languages[language].sidebar.account.nationality}
                                    value={userNationality.value}
                                    placeholder={languages[language].sidebar.account.selectNationality}
                                />
                                <InfoCard
                                    icon={<Home />}
                                    title={languages[language].sidebar.account.whereWork}
                                    value={userWhereWorks.value}
                                    placeholder={languages[language].sidebar.account.selectWhereWork}
                                />
                                <InfoCard
                                    icon={<Briefcase />}
                                    title={languages[language].sidebar.account.work}
                                    value={userJob.value}
                                    placeholder={languages[language].sidebar.account.selectWork}
                                />
                                <InfoCard
                                    icon={<Briefcase />}
                                    title={languages[language].sidebar.account.workType}
                                    value={userJobType.value}
                                    placeholder={languages[language].sidebar.account.selectWorkType}
                                />
                                <InfoCard
                                    icon={<Clock />}
                                    title={languages[language].sidebar.account.hoursContract}
                                    value={userWorkTime.value}
                                    placeholder={languages[language].sidebar.account.selectHoursContract}
                                />
                                <InfoCard
                                    icon={<Home />}
                                    title={languages[language].sidebar.account.remoteWork}
                                    value={userRemoteType.value}
                                    placeholder={languages[language].sidebar.account.selectRemoteWork}
                                />
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile}>
                                <div style={{
                                    backgroundColor: 'white',
                                    border: `2px solid ${theme.buttonBackgroundColor}20`,
                                    borderRadius: '16px',
                                    padding: isMobileScreen ? '1.5rem' : '2rem'
                                }}>
                                    <h2 style={{
                                        margin: '0 0 2rem 0',
                                        fontSize: isMobileScreen ? '1.2rem' : '1.4rem',
                                        fontWeight: '600',
                                        color: theme.textColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Edit size={20} color={theme.buttonBackgroundColor} />
                                        Modifica i Tuoi Dati
                                    </h2>

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
                                        icon={<Home />}
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

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginTop: '2rem'
                                    }}>
                                        <MyButton
                                            type="submit"
                                            theme={theme}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: isMobileScreen ? '0.9rem' : '1rem',
                                                padding: '12px 24px'
                                            }}
                                        >
                                            <Save size={16} />
                                            {languages[language].sidebar.account.saveButton}
                                        </MyButton>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </StyledSection>
            </Section>
        </div>
    );
};

export default AccountPage;
