
import React from 'react';
import { Link } from 'react-router-dom';
import { Select, MenuItem } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FaBullseye } from 'react-icons/fa';
import { sortTagsByLanguage } from '../utils/sortingUtils';
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
    SidebarToggleModeButton,
    SidebarPrivacyToggleModeButton,
    SettingsToggleButton,
} from "../styles/MyStyled";

const SidebarModals = ({
    theme,
    language,
    translations,
    isHidden,
    userType,
    mode,
    toggleMode,
    toggleHidden,
    toggleLanguage,
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
    showModalDeleteAccount,
    handleDeleteAccount,
    showSuccessDeleteAccount,
    showChangePWDSuccess,
    showChangePWDError,
    showSettingsPopup,
    handleShowModalDeleteAccount,
    // Close handlers
    handleCloseModal,
    handleCloseSecondaryModal,
    handleCloseModalAndLogout,
}) => {
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
                                    backgroundColor: "white",
                                    height: "2em",
                                    marginBottom: "0.5em",
                                }}
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
                                            label: tag.translations[
                                                language
                                            ],
                                        }}
                                    >
                                        {tag.translations[language]}
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
                                    backgroundColor: "white",
                                    height: "2em",
                                    marginBottom: "0.5em",
                                }}
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
                                            label: tag.translations[
                                                language
                                            ],
                                        }}
                                    >
                                        {tag.translations[language]}
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
                                    backgroundColor: "white",
                                    height: "2em",
                                    marginBottom: "0.5em",
                                }}
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
                                            label: tag.translations[
                                                language
                                            ],
                                        }}
                                    >
                                        {tag.translations[language]}
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
                                    backgroundColor: "white",
                                    height: "2em",
                                    marginBottom: "0.5em",
                                }}
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
                                {sortTagsByLanguage(jobTypeTags, language).map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: tag.translations[
                                                language
                                            ],
                                        }}
                                    >
                                        {tag.translations[language]}
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
                                    backgroundColor: "white",
                                    height: "2em",
                                    marginBottom: "0.5em",
                                }}
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
                                {sortTagsByLanguage(workTimeTags, language).map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: tag.translations[
                                                language
                                            ],
                                        }}
                                    >
                                        {tag.translations[language]}
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
                                    backgroundColor: "white",
                                    height: "2em",
                                    marginBottom: "0.5em",
                                }}
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
                                {sortTagsByLanguage(remoteTypeTags, language).map((tag) => (
                                    <MenuItem
                                        key={tag.index}
                                        value={{
                                            key: tag.index,
                                            label: tag.translations[
                                                language
                                            ],
                                        }}
                                    >
                                        {tag.translations[language]}
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

            {showModalDeleteAccount && (
                <MuiCustomDialog
                    theme={theme}
                    open={showModalDeleteAccount}
                    onClose={handleCloseModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {
                            translations.sidebar.deleteAccount
                                .title
                        }
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            {
                                translations.sidebar
                                    .deleteAccount.info
                            }{" "}
                            <br></br>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            onClick={handleDeleteAccount}
                            autoFocus
                        >
                            {
                                translations.sidebar
                                    .deleteAccount.confirmButton
                            }
                        </MuiCustomButton>
                        <MuiCustomButton
                            onClick={handleCloseModal}
                            autoFocus
                        >
                            {
                                translations.sidebar
                                    .deleteAccount.cancelButton
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            {showSuccessDeleteAccount && (
                <MuiCustomDialog
                    theme={theme}
                    open={showSuccessDeleteAccount}
                    onClose={handleCloseModalAndLogout}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {
                            translations.sidebar.deleteAccount
                                .successPopup.title
                        }
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            {
                                translations.sidebar
                                    .deleteAccount.successPopup.message
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
                                    .deleteAccount.successPopup.okButton
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

            {showSettingsPopup && (
                <MuiCustomDialog
                    theme={theme}
                    open={showSettingsPopup}
                    onClose={handleCloseModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {translations.sidebar.settings.title}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <div>
                            <label>
                                {
                                    translations.sidebar.settings
                                        .light
                                }
                            </label>
                            <SettingsToggleButton
                                title={
                                    translations.sidebar.settings
                                        .light
                                }
                                data-umami-event="setTheme-settings"
                            >
                                <SidebarToggleModeButton
                                    theme={theme}
                                    mode={mode}
                                    toggleMode={toggleMode}
                                />
                            </SettingsToggleButton>
                        </div>

                        <div>
                            <label>
                                {
                                    translations.sidebar.settings
                                        .privacy
                                }
                            </label>
                            <SettingsToggleButton
                                title={
                                    translations.sidebar.settings
                                        .privacy
                                }
                                data-umami-event="setPrivacy-settings"
                            >
                                <SidebarPrivacyToggleModeButton
                                    theme={theme}
                                    mode={mode}
                                    toggleHidden={toggleHidden}
                                    isHidden={isHidden}
                                />
                            </SettingsToggleButton>
                        </div>

                        <div>
                            <label>
                                {
                                    translations.sidebar.settings
                                        .language
                                }
                            </label>
                            <SettingsToggleButton
                                data-umami-event="setLanguage-settings"
                                onClick={toggleLanguage}
                            >
                                {language === "it" ? "IT" : "EN"}
                            </SettingsToggleButton>
                        </div>

                        <div>
                            <label>
                                {language === 'it' ? 'Obiettivi e Limiti' : 'Goals & Limits'}
                            </label>
                            <Link to="/goals-limits" style={{ textDecoration: 'none' }}>
                                <SettingsToggleButton
                                    data-umami-event="goalsSettings-settings"
                                    title="goalsSettingsButton"
                                    onClick={handleCloseModal}
                                >
                                    <FaBullseye />
                                </SettingsToggleButton>
                            </Link>
                        </div>

                        <div
                            style={{ color: "red", marginTop: "20px" }}
                        >
                            <label>
                                {" "}
                                {
                                    translations.sidebar.settings
                                        .deleteAccount
                                }
                            </label>
                            <SettingsToggleButton
                                data-umami-event="deleteAccount-settings"
                                title="deleteAccountButton"
                                onClick={() => {
                                    if (
                                        !["test", "demo"].includes(
                                            userType,
                                        )
                                    ) {
                                        handleShowModalDeleteAccount();
                                    }
                                }}
                                style={{
                                    backgroundColor: [
                                        "test",
                                        "demo",
                                    ].includes(userType)
                                        ? "#d3d3d3"
                                        : "",
                                    color: ["test", "demo"].includes(
                                        userType,
                                    )
                                        ? "#a9a9a9"
                                        : "",
                                    cursor: ["test", "demo"].includes(
                                        userType,
                                    )
                                        ? "not-allowed"
                                        : "pointer",
                                }}
                                disabled={["test", "demo"].includes(
                                    userType,
                                )}
                            >
                                <FontAwesomeIcon icon={faTrashCan} />
                            </SettingsToggleButton>
                        </div>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton
                            data-umami-event="saveSettings"
                            onClick={handleCloseModal}
                            autoFocus
                        >
                            {
                                translations.sidebar.settings
                                    .saveSettings
                            }
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}
        </>
    );
};

export default SidebarModals;
