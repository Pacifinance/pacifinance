
import React from 'react';
import { Select, MenuItem } from "@mui/material";
import { getMuiSelectMenuProps } from './ThemedSelect';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import { translateTag } from '../data/tagTranslations';
import {
    MuiCustomDialog,
    MuiFixedDimDialog,
    MuiCustomButton,
    MuiCustomDialogTitle,
    MuiCustomDialogContent,
    MuiCustomDialogProfileContent,
    MuiCustomDialogContentText,
    MuiCustomDialogActions,
    MuiCustomTextField,
    MuiCustomIconButton,
    MuiCustomInputAdornment,
    EyeVisibility,
    EyeVisibilityOff,
} from "../styles/MyStyled";

const SidebarModals = ({
    theme,
    language,
    translations,
    isHidden,
    // Account Modal
    showAccountModal,
    userId,
    userNationality,
    userWhereWorks,
    userJob,
    userJobType,
    userWorkTime,
    userRemoteType,
    sortedNationalityTags,
    sortedJobTags,
    jobTypeTags,
    workTimeTags,
    remoteTypeTags,
    setUserNationality,
    setUserWhereWorks,
    setUserJob,
    setUserJobType,
    setUserWorkTime,
    setUserRemoteType,
    handleUpdateProfile,
    // Change Username Modal
    showChangeUsernameModal,
    handleGenerateUsername,
    // Change ID Modal
    showChangeIDModal,
    password,
    showPassword,
    handlePasswordInput,
    handleTogglePasswordVisibility,
    handleMouseDownPassword,
    handleGenerateID,
    // Change Password Modal
    showChangePWDModal,
    OldPassword,
    showOldPassword,
    confirmPassword,
    showConfirmPassword,
    handleOldPasswordInput,
    handleToggleOldPasswordVisibility,
    handleConfirmPasswordInput,
    handleToggleConfirmPasswordVisibility,
    handleChangePassword,
    // Success/Error Modals
    showID,
    newID,
    handleCopyToClipboard,
    showUsername,
    newUsername,
    showUpdateProfileSuccess,
    showChangePWDSuccess,
    showChangePWDError,
    // Close handlers
    handleCloseModal,
    handleCloseSecondaryModal,
    handleCloseModalAndLogout,
}) => {
    // Guard to ensure theme and translations are available
    if (!theme || !translations) {
        return null;
    }

    return (
        <>
            {showAccountModal && (
                <MuiFixedDimDialog
                    theme={theme}
                    open={showAccountModal}
                    onClose={handleCloseModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {translations.sidebar.account.title}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogProfileContent theme={theme}>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            {translations.sidebar.account.id}{" "}
                            {isHidden ? "****" : userId} <br></br>
                            {
                                translations.sidebar.account
                                    .nationality
                            }{" "}
                            <Select
                                value={
                                    isHidden
                                        ? "****"
                                        : userNationality.value
                                }
                                onChange={(event) => {
                                    setUserNationality({
                                        key: event.target.value.key,
                                        value: event.target.value.label,
                                    });
                                }}
                                style={{
                                    height: "2em",
                                    marginBottom: "0.5em",
                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                    color: theme.textColor,
                                }}
                                MenuProps={getMuiSelectMenuProps(theme)}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") {
                                        return `${translations.sidebar.account.selectNationality}`;
                                    }
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>
                                        {
                                            translations.sidebar
                                                .account
                                                .selectNationality
                                        }
                                    </em>
                                </MenuItem>
                                {sortedNationalityTags.map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: translateTag(tag.label, language, 'country'),
                                        }}
                                    >
                                        {translateTag(tag.label, language, 'country')}
                                    </MenuItem>
                                ))}
                            </Select>{" "}
                            <br></br>
                            {
                                translations.sidebar.account
                                    .whereWork
                            }{" "}
                            <Select
                                value={
                                    isHidden
                                        ? "****"
                                        : userWhereWorks.value
                                }
                                onChange={(event) => {
                                    setUserWhereWorks({
                                        key: event.target.value.key,
                                        value: event.target.value.label,
                                    });
                                }}
                                style={{
                                    height: "2em",
                                    marginBottom: "0.5em",
                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                    color: theme.textColor,
                                }}
                                MenuProps={getMuiSelectMenuProps(theme)}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") {
                                        return `${translations.sidebar.account.selectWhereWork}`;
                                    }
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>
                                        {
                                            translations.sidebar
                                                .account.selectWhereWork
                                        }
                                    </em>
                                </MenuItem>
                                {sortedNationalityTags.map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: translateTag(tag.label, language, 'country'),
                                        }}
                                    >
                                        {translateTag(tag.label, language, 'country')}
                                    </MenuItem>
                                ))}
                            </Select>{" "}
                            <br></br>
                            {
                                translations.sidebar.account.work
                            }{" "}
                            <Select
                                value={
                                    isHidden ? "****" : userJob.value
                                }
                                onChange={(event) => {
                                    setUserJob({
                                        key: event.target.value.key,
                                        value: event.target.value.label,
                                    });
                                }}
                                style={{
                                    height: "2em",
                                    marginBottom: "0.5em",
                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                    color: theme.textColor,
                                }}
                                MenuProps={getMuiSelectMenuProps(theme)}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") {
                                        return `${translations.sidebar.account.selectWork}`;
                                    }
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>
                                        {
                                            translations.sidebar
                                                .account.selectWork
                                        }
                                    </em>
                                </MenuItem>
                                {sortedJobTags.map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: translateTag(tag.label, language, 'job'),
                                        }}
                                    >
                                        {translateTag(tag.label, language, 'job')}
                                    </MenuItem>
                                ))}
                            </Select>{" "}
                            <br></br>
                            {
                                translations.sidebar.account
                                    .workType
                            }{" "}
                            <Select
                                value={
                                    isHidden
                                        ? "****"
                                        : userJobType.value
                                }
                                onChange={(event) => {
                                    setUserJobType({
                                        key: event.target.value.key,
                                        value: event.target.value.label,
                                    });
                                }}
                                style={{
                                    height: "2em",
                                    marginBottom: "0.5em",
                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                    color: theme.textColor,
                                }}
                                MenuProps={getMuiSelectMenuProps(theme)}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "") {
                                        return `${translations.sidebar.account.selectWorkType}`;
                                    }
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>
                                        {
                                            translations.sidebar
                                                .account.selectWorkType
                                        }
                                    </em>
                                </MenuItem>
                                {sortTagsByLanguage(jobTypeTags, language, 'jobType').map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: translateTag(tag.label, language, 'jobType'),
                                        }}
                                    >
                                        {translateTag(tag.label, language, 'jobType')}
                                    </MenuItem>
                                ))}
                            </Select>{" "}
                            <br></br>
                            {
                                translations.sidebar.account
                                    .hoursContract
                            }{" "}
                            <Select
                                value={
                                    isHidden
                                        ? "****"
                                        : userWorkTime.value
                                }
                                onChange={(event) => {
                                    setUserWorkTime({
                                        key: event.target.value.key,
                                        value: event.target.value.label,
                                    });
                                }}
                                style={{
                                    height: "2em",
                                    marginBottom: "0.5em",
                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                    color: theme.textColor,
                                }}
                                MenuProps={getMuiSelectMenuProps(theme)}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "")
                                        return `${translations.sidebar.account.selectHoursContract}`;
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>
                                        {
                                            translations.sidebar
                                                .account
                                                .selectHoursContract
                                        }
                                    </em>
                                </MenuItem>
                                {sortTagsByLanguage(workTimeTags, language, 'workTime').map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: translateTag(tag.label, language, 'workTime'),
                                        }}
                                    >
                                        {translateTag(tag.label, language, 'workTime')}
                                    </MenuItem>
                                ))}
                            </Select>{" "}
                            <br></br>
                            {
                                translations.sidebar.account
                                    .remoteWork
                            }{" "}
                            <Select
                                value={
                                    isHidden
                                        ? "****"
                                        : userRemoteType.value
                                }
                                onChange={(event) => {
                                    setUserRemoteType({
                                        key: event.target.value.key,
                                        value: event.target.value.label,
                                    });
                                }}
                                style={{
                                    height: "2em",
                                    marginBottom: "0.5em",
                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                    color: theme.textColor,
                                }}
                                MenuProps={getMuiSelectMenuProps(theme)}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === "")
                                        return `${translations.sidebar.account.selectRemoteWork}`;
                                    return value;
                                }}
                            >
                                <MenuItem value="">
                                    <em>
                                        {
                                            translations.sidebar
                                                .account
                                                .selectRemoteWork
                                        }
                                    </em>
                                </MenuItem>
                                {sortTagsByLanguage(remoteTypeTags, language, 'remoteType').map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: translateTag(tag.label, language, 'remoteType'),
                                        }}
                                    >
                                        {translateTag(tag.label, language, 'remoteType')}
                                    </MenuItem>
                                ))}
                            </Select>{" "}
                            <br></br>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogProfileContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            data-umami-event="profileUpdate"
                            onClick={handleUpdateProfile}
                            autoFocus
                        >
                            {
                                translations.sidebar.account
                                    .saveButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiFixedDimDialog>
            )}

            {showChangeUsernameModal && (
                <MuiCustomDialog
                    theme={theme}
                    open={showChangeUsernameModal}
                    onClose={handleCloseModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {
                            translations.sidebar.changeUsername
                                .title
                        }
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            {translations.sidebar.changeID.info}{" "}
                            <br></br>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            data-umami-event="usernameChange"
                            onClick={handleGenerateUsername}
                            autoFocus
                        >
                            {
                                translations.sidebar.changeID
                                    .confirmButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            {showChangeIDModal && (
                <MuiCustomDialog
                    theme={theme}
                    open={showChangeIDModal}
                    onClose={handleCloseModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {translations.sidebar.changeID.title}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            {translations.sidebar.changeID.info}{" "}
                            <br></br>
                            <form
                                id="changeID"
                                onSubmit={handleGenerateID}
                            >
                                <MuiCustomTextField
                                    id="passwordChangeID"
                                    theme={theme}
                                    label="Password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={handlePasswordInput}
                                    required
                                    fullWidth
                                    className="w-3/5"
                                    InputProps={{
                                        endAdornment: (
                                            <MuiCustomInputAdornment position="end">
                                                <MuiCustomIconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={
                                                        handleTogglePasswordVisibility
                                                    }
                                                    onMouseDown={
                                                        handleMouseDownPassword
                                                    }
                                                    className=""
                                                >
                                                    {showPassword ? (
                                                        <EyeVisibility />
                                                    ) : (
                                                        <EyeVisibilityOff />
                                                    )}
                                                </MuiCustomIconButton>
                                            </MuiCustomInputAdornment>
                                        ),
                                    }}
                                />
                            </form>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            data-umami-event="IDChange"
                            onClick={handleGenerateID}
                            autoFocus
                        >
                            {
                                translations.sidebar.changeID
                                    .confirmButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            {showChangePWDModal && (
                <MuiCustomDialog
                    theme={theme}
                    open={showChangePWDModal}
                    onClose={handleCloseModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle
                        theme={theme}
                        id="alert-dialog-title"
                    >
                        {
                            translations.sidebar.changePassword
                                .title
                        }
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText
                            theme={theme}
                            id="alert-dialog-description"
                        >
                            {
                                translations.sidebar
                                    .changePassword.info
                            }{" "}
                            <br></br>
                            <form
                                id="changePWD"
                                onSubmit={handleChangePassword}
                            >
                                <MuiCustomTextField
                                    id="oldPasswordChangePWD"
                                    theme={theme}
                                    label={
                                        translations.sidebar
                                            .changePassword.oldPassword
                                    }
                                    type={
                                        showOldPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={OldPassword}
                                    onChange={handleOldPasswordInput}
                                    required
                                    fullWidth
                                    className="w-3/4"
                                    InputProps={{
                                        endAdornment: (
                                            <MuiCustomInputAdornment
                                                theme={theme}
                                                position="end"
                                            >
                                                <MuiCustomIconButton
                                                    theme={theme}
                                                    aria-label="toggle password visibility"
                                                    onClick={
                                                        handleToggleOldPasswordVisibility
                                                    }
                                                    onMouseDown={
                                                        handleMouseDownPassword
                                                    }
                                                    className=""
                                                >
                                                    {showOldPassword ? (
                                                        <EyeVisibility />
                                                    ) : (
                                                        <EyeVisibilityOff />
                                                    )}
                                                </MuiCustomIconButton>
                                            </MuiCustomInputAdornment>
                                        ),
                                    }}
                                />
                                <br></br>
                                <MuiCustomTextField
                                    id="passwordChangePWD"
                                    theme={theme}
                                    label={
                                        translations.sidebar
                                            .changePassword.newPassword
                                    }
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={handlePasswordInput}
                                    required
                                    fullWidth
                                    className="w-3/4"
                                    InputProps={{
                                        endAdornment: (
                                            <MuiCustomInputAdornment position="end">
                                                <MuiCustomIconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={
                                                        handleTogglePasswordVisibility
                                                    }
                                                    onMouseDown={
                                                        handleMouseDownPassword
                                                    }
                                                    className=""
                                                >
                                                    {showPassword ? (
                                                        <EyeVisibility />
                                                    ) : (
                                                        <EyeVisibilityOff />
                                                    )}
                                                </MuiCustomIconButton>
                                            </MuiCustomInputAdornment>
                                        ),
                                    }}
                                />
                                <br></br>
                                <MuiCustomTextField
                                    id="confirmPasswordChangePWD"
                                    theme={theme}
                                    label={
                                        translations.sidebar
                                            .changePassword
                                            .confirmPassword
                                    }
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={
                                        handleConfirmPasswordInput
                                    }
                                    required
                                    fullWidth
                                    className="w-3/4"
                                    InputProps={{
                                        endAdornment: (
                                            <MuiCustomInputAdornment position="end">
                                                <MuiCustomIconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={
                                                        handleToggleConfirmPasswordVisibility
                                                    }
                                                    onMouseDown={
                                                        handleMouseDownPassword
                                                    }
                                                    className=""
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeVisibility />
                                                    ) : (
                                                        <EyeVisibilityOff />
                                                    )}
                                                </MuiCustomIconButton>
                                            </MuiCustomInputAdornment>
                                        ),
                                    }}
                                />
                            </form>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            data-umami-event="changePassword"
                            onClick={handleChangePassword}
                            autoFocus
                        >
                            {
                                translations.sidebar
                                    .changePassword.confirmButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            {showID && (
                <MuiCustomDialog
                    theme={theme}
                    open={showID}
                    onClose={handleCopyToClipboard(newID)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {translations.sidebar.changeID
                            .successPopup.message + newID}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText
                            id="alert-dialog-description"
                            dangerouslySetInnerHTML={{
                                __html: translations.sidebar
                                    .changeID.successPopup
                                    .securityMessage,
                            }}
                        ></MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            onClick={handleCopyToClipboard(newID)}
                            autoFocus
                        >
                            {
                                translations.sidebar.changeID
                                    .successPopup.toCopy
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            {showUsername && (
                <MuiCustomDialog
                    theme={theme}
                    open={showUsername}
                    onClose={handleCloseSecondaryModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {translations.sidebar.changeUsername
                            .successPopup.message + newUsername}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            {
                                translations.sidebar
                                    .changeUsername.successPopup
                                    .securityMessage
                            }{" "}
                            <br></br>
                            {
                                translations.sidebar
                                    .changeUsername.successPopup
                                    .redirectMessage
                            }{" "}
                            <br></br>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            onClick={handleCloseSecondaryModal}
                            autoFocus
                        >
                            {
                                translations.sidebar
                                    .changeUsername.successPopup
                                    .okButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            {showUpdateProfileSuccess && (
                <MuiCustomDialog
                    theme={theme}
                    open={showUpdateProfileSuccess}
                    onClose={handleCloseModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {
                            translations.sidebar.account
                                .successPopup.title
                        }
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            {
                                translations.sidebar.account
                                    .successPopup.message
                            }{" "}
                            <br></br>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            onClick={handleCloseModal}
                            autoFocus
                        >
                            {
                                translations.sidebar.account
                                    .successPopup.okButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            {showChangePWDSuccess && (
                <MuiCustomDialog
                    theme={theme}
                    open={showChangePWDSuccess}
                    onClose={handleCloseModalAndLogout}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {
                            translations.sidebar.changePassword
                                .successPopup.title
                        }
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            {
                                translations.sidebar
                                    .changePassword.successPopup.message
                            }{" "}
                            <br></br>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            onClick={handleCloseModalAndLogout}
                            autoFocus
                        >
                            {
                                translations.sidebar
                                    .changePassword.successPopup
                                    .okButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            {showChangePWDError && (
                <MuiCustomDialog
                    theme={theme}
                    open={showChangePWDError}
                    onClose={handleCloseSecondaryModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {
                            translations.sidebar.changePassword
                                .errorPopup.title
                        }
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent>
                        <MuiCustomDialogContentText
                            id="alert-dialog-description"
                            dangerouslySetInnerHTML={{
                                __html: translations.sidebar
                                    .changePassword.errorPopup.message,
                            }}
                        ></MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            onClick={handleCloseSecondaryModal}
                            autoFocus
                        >
                            {
                                translations.sidebar
                                    .changePassword.errorPopup.okButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

        </>
    );
};

export default SidebarModals;
