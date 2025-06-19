import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem } from "@mui/material";
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { UserContext } from '../contexts/UserContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import Sidebar from '../sections/Sidebar';
import languages from '../data/languages.json';
import {
    Section,
    TitleDashboard,
    MyButton,
    StyledSection,
    TitleSection
} from '../styles/MyStyled';

const AccountPage = () => {
    const { theme } = useContext(ThemeContext);
    const { isHidden } = useContext(PrivacyContext);
    const { language } = useContext(LanguageContext);
    const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const navigate = useNavigate();

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
                setTimeout(() => setShowUpdateSuccess(false), 3000);
            } else {
                alert(languages[language].sidebar.account.errorUpdateProfile);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Filter and sort nationality tags
    const otherNationalityOption = nationalityTags.find(tag => tag.index === 9999);
    const otherNationalityTags = nationalityTags.filter(tag => tag.index !== 9999);
    const sortedNationalityTags = otherNationalityTags.sort((a, b) => a.translations.it.localeCompare(b.translations.it));
    if (otherNationalityOption) {
        sortedNationalityTags.push(otherNationalityOption);
    }

    // Filter and sort job tags
    const otherJobOption = jobTags.find(tag => tag.index === 9999);
    const otherJobTags = jobTags.filter(tag => tag.index !== 9999);
    const sortedJobTags = otherJobTags.sort((a, b) => a.translations.it.localeCompare(b.translations.it));
    if (otherJobOption) {
        sortedJobTags.push(otherJobOption);
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {!isMobileScreen && <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />}

            <Section theme={theme} style={{ marginLeft: isMobileScreen ? '0' : '6vw', width: '100%' }}>
                {isMobileScreen && <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />}

                <StyledSection theme={theme}>
                    <TitleDashboard theme={theme} style={{ fontSize: isMobileScreen ? '1.2rem' : '1.5rem' }}>
                        {languages[language].sidebar.account.title}
                    </TitleDashboard>

                    {showUpdateSuccess && (
                        <div style={{
                            backgroundColor: theme.buttonBackgroundColor,
                            color: 'white',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            margin: '0.8rem 0',
                            textAlign: 'center'
                        }}>
                            {languages[language].sidebar.account.successPopup.message}
                        </div>
                    )}

                    <div style={{
                        maxWidth: isMobileScreen ? '95%' : '600px',
                        margin: '0 auto',
                        padding: isMobileScreen ? '1rem' : '1.5rem',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: `2px solid ${theme.buttonBackgroundColor}`,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <TitleSection theme={theme} style={{ fontSize: isMobileScreen ? '1rem' : '1.2rem', marginBottom: '1rem' }}>
                            {languages[language].sidebar.account.title}
                        </TitleSection>

                        <div style={{ marginBottom: '1rem', fontSize: isMobileScreen ? '0.9rem' : '1rem', color: '#333' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong>{languages[language].sidebar.account.id}:</strong> {isHidden ? '****' : userId}</p>
                            <p style={{ marginBottom: '0.5rem' }}><strong>{languages[language].sidebar.account.userType}:</strong> {userType}</p>
                        </div>

                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: isMobileScreen ? '1rem' : '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 'bold', color: '#333', fontSize: isMobileScreen ? '0.9rem' : '1rem' }}>
                                    {languages[language].sidebar.account.nationality}
                                </label>
                            <Select
                                value={isHidden ? '****' : userNationality.value}
                                onChange={(event) => {
                                    setUserNationality({key: event.target.value.key, value: event.target.value.label});
                                }}
                                style={{ backgroundColor: 'white', width: '100%' }}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") {
                                        return `${languages[language].sidebar.account.selectNationality}`;
                                    }
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>{languages[language].sidebar.account.selectNationality}</em>
                                </MenuItem>
                                {sortedNationalityTags.map((tag) => (
                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                        {tag.translations[language]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 'bold', color: '#333', fontSize: isMobileScreen ? '0.9rem' : '1rem' }}>
                                    {languages[language].sidebar.account.whereWork}
                                </label>
                            <Select
                                value={isHidden ? '****' : userWhereWorks.value}
                                onChange={(event) => {
                                    setUserWhereWorks({key: event.target.value.key, value: event.target.value.label});
                                }}
                                style={{ backgroundColor: 'white', width: '100%' }}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") {
                                        return `${languages[language].sidebar.account.selectWhereWork}`;
                                    }
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>{languages[language].sidebar.account.selectWhereWork}</em>
                                </MenuItem>
                                {sortedNationalityTags.map((tag) => (
                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                        {tag.translations[language]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 'bold', color: '#333', fontSize: isMobileScreen ? '0.9rem' : '1rem' }}>
                                    {languages[language].sidebar.account.work}
                                </label>
                            <Select
                                value={isHidden ? '****' : userJob.value}
                                onChange={(event) => {
                                    setUserJob({key: event.target.value.key, value: event.target.value.label});
                                }}
                                style={{ backgroundColor: 'white', width: '100%' }}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") {
                                        return `${languages[language].sidebar.account.selectWork}`;
                                    }
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>{languages[language].sidebar.account.selectWork}</em>
                                </MenuItem>
                                {sortedJobTags.map((tag) => (
                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                        {tag.translations[language]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 'bold', color: '#333', fontSize: isMobileScreen ? '0.9rem' : '1rem' }}>
                                    {languages[language].sidebar.account.workType}
                                </label>
                            <Select
                                value={isHidden ? '****' : userJobType.value}
                                onChange={(event) => {
                                    setUserJobType({key: event.target.value.key, value: event.target.value.label});
                                }}
                                style={{ backgroundColor: 'white', width: '100%' }}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") {
                                        return `${languages[language].sidebar.account.selectWorkType}`;
                                    }
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>{languages[language].sidebar.account.selectWorkType}</em>
                                </MenuItem>
                                {jobTypeTags.map((tag) => (
                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                        {tag.translations[language]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 'bold', color: '#333', fontSize: isMobileScreen ? '0.9rem' : '1rem' }}>
                                    {languages[language].sidebar.account.hoursContract}
                                </label>
                            <Select
                                value={isHidden ? '****' : userWorkTime.value}
                                onChange={(event) => {
                                    setUserWorkTime({key: event.target.value.key, value: event.target.value.label});
                                }}
                                style={{ backgroundColor: 'white', width: '100%' }}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") return `${languages[language].sidebar.account.selectHoursContract}`;
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>{languages[language].sidebar.account.selectHoursContract}</em>
                                </MenuItem>
                                {workTimeTags.map((tag) => (
                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                        {tag.translations[language]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 'bold', color: '#333', fontSize: isMobileScreen ? '0.9rem' : '1rem' }}>
                                    {languages[language].sidebar.account.remoteWork}
                                </label>
                            <Select
                                value={isHidden ? '****' : userRemoteType.value}
                                onChange={(event) => {
                                    setUserRemoteType({key: event.target.value.key, value: event.target.value.label});
                                }}
                                style={{ backgroundColor: 'white', width: '100%' }}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") return `${languages[language].sidebar.account.selectRemoteWork}`;
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>{languages[language].sidebar.account.selectRemoteWork}</em>
                                </MenuItem>
                                {remoteTypeTags.map((tag) => (
                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                        {tag.translations[language]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div style={{ display: 'flex', gap: isMobileScreen ? '0.5rem' : '1rem', justifyContent: 'center', marginTop: isMobileScreen ? '1.5rem' : '2rem', flexDirection: isMobileScreen ? 'column' : 'row' }}>
                                <MyButton type="submit" theme={theme} style={{ fontSize: isMobileScreen ? '0.9rem' : '1rem' }}>
                                    {languages[language].sidebar.account.saveButton}
                                </MyButton>
                                <MyButton type="button" theme={theme} onClick={() => navigate('/dashboard')} style={{ fontSize: isMobileScreen ? '0.9rem' : '1rem' }}>
                                    {languages[language].sidebar.settings.backToDashboard || 'Torna alla Dashboard'}
                                </MyButton>
                            </div>
                        </form>
                    </div>
                </StyledSection>
            </Section>
        </div>
    );
};

export default AccountPage;