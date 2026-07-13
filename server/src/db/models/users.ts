import supabase from "../supabase"

import tags from "./tags"

const userIdLength = 6

const SYNTHETIC_EMAIL_DOMAIN = "users.pacifinance.internal"

const UserType = {
    regular: {name: "regular", value: 0},
    premium: {name: "premium", value: 1},
    test: {name: "test", value: 2},
    demo: {name: "demo", value: 3}
};

/**
 * Builds the internal, synthetic email address used only to satisfy Supabase
 * Auth's email/password flow. It is never shown to the user, never collected
 * via a form, and is not a real, reachable address: login/registration stay
 * ID (6 digits) + password only, exactly as before.
 * @param user_code Public-facing 6-digit user ID
 * @returns Synthetic email address
 */
function emailForUserCode(user_code: string) {
    return `${user_code}@${SYNTHETIC_EMAIL_DOMAIN}`
}

/**
 * Maps a "tags" row (or a null join result) to the public Tag shape used by the frontend
 */
function mapTagRow(row: any) {
    if (!row) return null
    return {label: row.label, index: row.client_index, type: row.type}
}

const TAG_JOIN_FIELDS = `
    age:tags!profiles_age_tag_id_fkey(label, client_index, type),
    living_situation:tags!profiles_living_situation_tag_id_fkey(label, client_index, type),
    housing_type:tags!profiles_housing_type_tag_id_fkey(label, client_index, type),
    children:tags!profiles_children_tag_id_fkey(label, client_index, type),
    country:tags!profiles_country_tag_id_fkey(label, client_index, type),
    job:tags!profiles_job_tag_id_fkey(label, client_index, type),
    job_type:tags!profiles_job_type_tag_id_fkey(label, client_index, type),
    job_country:tags!profiles_job_country_tag_id_fkey(label, client_index, type),
    work_time:tags!profiles_work_time_tag_id_fkey(label, client_index, type),
    remote_type:tags!profiles_remote_type_tag_id_fkey(label, client_index, type),
    years_of_experience:tags!profiles_years_of_experience_tag_id_fkey(label, client_index, type),
    preferred_currency:tags!profiles_preferred_currency_tag_id_fkey(label, client_index, type)
`

/* ==================== Specific queries ==================== */

/**
 * Registers a new user: creates the Supabase Auth account (with a synthetic
 * internal email) and the corresponding profile row.
 * @param user_code Public 6-digit user ID
 * @param password Plain-text password (hashed internally by Supabase Auth)
 * @param type Account type (regular, premium, test, ...)
 * @returns {id, userId} of the new user, or null in case of error
 */
async function insertNew(user_code: string, password: string, type: number = UserType.regular.value) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: emailForUserCode(user_code),
        password,
        email_confirm: true,
        user_metadata: {user_code}
    })
    if (authError) console.error("users.insertNew: failed to create Auth user", authError)
    if (authError || !authData.user)
        return null

    const { data: profile, error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        user_code,
        account_type: type
    }).select("id, user_code").single()

    if (profileError || !profile) {
        console.error("users.insertNew: failed to insert profile row, rolling back Auth user", profileError)
        // Roll back the orphaned Auth user if the profile insert failed
        await supabase.auth.admin.deleteUser(authData.user.id)
        return null
    }
    return {id: profile.id as string, userId: profile.user_code as string}
}

/**
 * Gets the public 6-digit user ID of a user
 * @param user_id uuid of the user
 * @returns Public user ID, or null if not found
 */
async function getUserCodeById(user_id: string) {
    const {data, error} = await supabase.from("profiles")
        .select("user_code")
        .eq("id", user_id)
        .maybeSingle()
    if (error) console.error("users.getUserCodeById: lookup failed", error)
    if (error || !data) return null
    return data.user_code as string
}

/**
 * Checks whether a public user ID is already taken. Backed by the `user_code`
 * unique index, so this is a single indexed point lookup rather than a full
 * table scan.
 * @param user_code Public 6-digit user ID to check
 * @returns true if the ID is already in use, false otherwise
 */
async function userCodeExists(user_code: string) {
    const {data, error} = await supabase.from("profiles")
        .select("user_code")
        .eq("user_code", user_code)
        .maybeSingle()
    if (error) console.error("users.userCodeExists: lookup failed", error)
    return data !== null
}

/**
 * Verifies a user's current password by attempting a Supabase Auth sign-in
 * with it. Used to confirm identity before sensitive operations (change ID,
 * change password) since the backend never has access to the password hash.
 * @param user_id uuid of the user
 * @param password Plain-text password to verify
 * @returns true if the password is correct, false otherwise
 */
async function verifyPassword(user_id: string, password: string) {
    const user_code = await getUserCodeById(user_id)
    if (user_code === null) return false
    const {error} = await supabase.auth.signInWithPassword({
        email: emailForUserCode(user_code),
        password
    })
    return !error
}

/**
 * Gets all user IDs. For "similar" (cohort-restricted) users, see
 * server/src/services/similarUsers.ts instead.
 * @param ignore_test_users True if test and demo users must be ignored, false otherwise
 * @returns List of {id, userId} objects
 */
async function getAllUsersIds(ignore_test_users: boolean = false) {
    let query = supabase.from("profiles").select("id, user_code")

    if (ignore_test_users)
        query = query.lt("account_type", UserType.test.value)

    const {data, error} = await query
    if (error || !data) return []
    return data.map((row) => ({id: row.id as string, userId: row.user_code as string}))
}

/**
 * Gets exactly the accounts that explicitly opted in to hosted community
 * benchmarks. Test/demo accounts and non-consenting users are deliberately
 * excluded before any financial metric is read.
 */
async function getAllBenchmarkUserIds() {
    const {data, error} = await supabase.from("profiles")
        .select("id, user_code")
        .lt("account_type", UserType.test.value)
        .eq("benchmark_consent", true)
    if (error || !data) return []
    return data.map((row) => ({id: row.id as string, userId: row.user_code as string}))
}

/**
 * Updates the public 6-digit ID of a user. Also updates the internal synthetic
 * email in Supabase Auth so that future logins with the new ID keep working.
 * @param user_id uuid of the user
 * @param new_user_code New 6-digit ID to set
 */
async function setUserIdByUserId(user_id: string, new_user_code: string) {
    const {error: authError} = await supabase.auth.admin.updateUserById(user_id, {
        email: emailForUserCode(new_user_code)
    })
    if (authError) console.error("users.setUserIdByUserId: failed to update Auth email", authError)
    if (authError) return null
    const {data, error} = await supabase.from("profiles")
        .update({user_code: new_user_code})
        .eq("id", user_id)
        .select("id, user_code")
        .maybeSingle()
    if (error) console.error("users.setUserIdByUserId: failed to update profile row", error)
    if (error || !data) return null
    return data
}

/**
 * Updates the password of a user via the Supabase Auth Admin API
 * @param user_id uuid of the user
 * @param new_password New plain-text password to set
 */
async function setPasswordOfUserId(user_id: string, new_password: string) {
    const {error} = await supabase.auth.admin.updateUserById(user_id, {password: new_password})
    if (error) console.error("users.setPasswordOfUserId: failed to update password", error)
    if (error) return null
    return {id: user_id}
}

/**
 * Gets the account type of a user
 * @param user_id uuid of the user
 * @returns {type} object
 */
async function getTypeOfUserId(user_id: string) {
    const {data, error} = await supabase.from("profiles")
        .select("account_type")
        .eq("id", user_id)
        .maybeSingle()
    if (error) console.error("users.getTypeOfUserId: lookup failed", error)
    if (error || !data) return null
    return {type: data.account_type as number}
}

/**
 * Gets all public information of a user, resolving all tag references
 * @param user_id uuid of the user
 * @returns User profile object, with each tag field resolved to its label/translations
 */
async function getPublicInfoByUserId(user_id: string) {
    const {data, error} = await supabase.from("profiles")
        .select(`
            user_code, nickname, account_type, created_at,
            expenses_limit, savings_percent, emergency_fund_goal, benchmark_consent,
            ${TAG_JOIN_FIELDS}
        `)
        .eq("id", user_id)
        .maybeSingle()
    if (error) console.error("users.getPublicInfoByUserId: lookup failed", error)
    if (error || !data) return null

    const d = data as any
    return {
        userId: d.user_code as string,
        creationDate: d.created_at,
        type: d.account_type as number,
        nickname: d.nickname as string,
        age: mapTagRow(d.age),
        livingSituation: mapTagRow(d.living_situation),
        housingType: mapTagRow(d.housing_type),
        children: mapTagRow(d.children),
        country: mapTagRow(d.country),
        job: mapTagRow(d.job),
        jobType: mapTagRow(d.job_type),
        jobCountry: mapTagRow(d.job_country),
        workTime: mapTagRow(d.work_time),
        remoteType: mapTagRow(d.remote_type),
        yearsOfExperience: mapTagRow(d.years_of_experience),
        preferredCurrency: mapTagRow(d.preferred_currency),
        benchmarkConsent: d.benchmark_consent as boolean,
        goals: {
            expensesLimit: d.expenses_limit as number,
            savingsPercent: d.savings_percent as number,
            emergencyFundGoal: d.emergency_fund_goal as number
        }
    }
}

/** Records explicit hosted-community-benchmark consent or its revocation. */
async function setBenchmarkConsentByUserId(user_id: string, consent: boolean) {
    const now = new Date().toISOString()
    const update = consent
        ? {benchmark_consent: true, benchmark_consent_at: now, benchmark_consent_revoked_at: null}
        : {benchmark_consent: false, benchmark_consent_revoked_at: now}
    const {data, error} = await supabase.from("profiles").update(update).eq("id", user_id)
        .select("id, benchmark_consent").maybeSingle()
    if (error) console.error("users.setBenchmarkConsentByUserId: update failed", error)
    if (error || !data) return null
    return {benchmarkConsent: data.benchmark_consent as boolean}
}

/**
 * Sets all public information of a user
 * @param user_id uuid of the user
 * @param age Index of the age tag to set
 * @param livingSituation Index of the livingSituation tag to set
 * @param housingType Index of the housingType tag to set
 * @param children Index of the children tag to set
 * @param country Index of the country tag to set
 * @param job Index of the job tag to set
 * @param jobType Index of the jobType tag to set
 * @param jobCountry Index of the jobCountry tag to set
 * @param workTime Index of the workTime tag to set
 * @param remoteType Index of the remoteType tag to set
 * @param yearsOfExperience Index of the yearsOfExperience tag to set
 * @param preferredCurrency Index of the preferredCurrency tag to set
 * @returns Updated profile row, or null in case of error
 */
async function setPublicInfoOfUserId(user_id: string, age: number, livingSituation: number, housingType: number,
    children: number, country: number, job: number, jobType: number, jobCountry: number, workTime: number,
    remoteType: number, yearsOfExperience: number, preferredCurrency: number) {

    const valueToTagMapping = [
        {column: "age_tag_id", tagType: tags.TagType.age.value, newSelection: age},
        {column: "living_situation_tag_id", tagType: tags.TagType.livingSituation.value, newSelection: livingSituation},
        {column: "housing_type_tag_id", tagType: tags.TagType.housingType.value, newSelection: housingType},
        {column: "children_tag_id", tagType: tags.TagType.children.value, newSelection: children},
        {column: "country_tag_id", tagType: tags.TagType.country.value, newSelection: country},
        {column: "job_tag_id", tagType: tags.TagType.job.value, newSelection: job},
        {column: "job_type_tag_id", tagType: tags.TagType.jobType.value, newSelection: jobType},
        {column: "job_country_tag_id", tagType: tags.TagType.country.value, newSelection: jobCountry},
        {column: "work_time_tag_id", tagType: tags.TagType.workTime.value, newSelection: workTime},
        {column: "remote_type_tag_id", tagType: tags.TagType.remoteType.value, newSelection: remoteType},
        {column: "years_of_experience_tag_id", tagType: tags.TagType.yearsOfExperience.value, newSelection: yearsOfExperience},
        {column: "preferred_currency_tag_id", tagType: tags.TagType.currency.value, newSelection: preferredCurrency},
    ]
    const update_object: {[column: string]: number} = {}
    for (const curr of valueToTagMapping) {
        const tag_ref = await tags.getReferenceByIndexAndType(curr.newSelection, curr.tagType)
        if (tag_ref !== null)
            update_object[curr.column] = tag_ref.id
    }
    const {data, error} = await supabase.from("profiles")
        .update(update_object)
        .eq("id", user_id)
        .select("id")
        .maybeSingle()
    if (error) console.error("users.setPublicInfoOfUserId: update failed", error)
    if (error || !data) return null
    return data
}

/**
 * Sets the goals of a user
 * @param user_id uuid of the user
 * @param expensesLimit Limit on expenses
 * @param savingsPercent Goal on savings percentage
 * @param emergencyFundGoal Goal on emergency fund
 * @returns Updated profile row, or null in case of error
 */
async function setGoalsOfUserId(user_id: string, expensesLimit: number,
    savingsPercent: number, emergencyFundGoal: number) {
    const {data, error} = await supabase.from("profiles")
        .update({
            expenses_limit: expensesLimit,
            savings_percent: savingsPercent,
            emergency_fund_goal: emergencyFundGoal
        })
        .eq("id", user_id)
        .select("id")
        .maybeSingle()
    if (error) console.error("users.setGoalsOfUserId: update failed", error)
    if (error || !data) return null
    return data
}

/**
 * Deletes a user via the Supabase Auth Admin API. Cascades automatically to
 * profile/balances/expenses/deletion-queue rows (all FK on delete cascade).
 * @param user_id uuid of the user
 */
async function deleteUserById(user_id: string) {
    const {error} = await supabase.auth.admin.deleteUser(user_id)
    if (error) console.error("users.deleteUserById: failed to delete Auth user", error)
    return error ? null : {id: user_id}
}

export default {
    userIdLength,
    UserType,
    emailForUserCode,
    insertNew,
    getUserCodeById,
    userCodeExists,
    verifyPassword,
    getAllUsersIds,
    getAllBenchmarkUserIds,
    setUserIdByUserId,
    setPasswordOfUserId,
    getTypeOfUserId,
    getPublicInfoByUserId,
    setBenchmarkConsentByUserId,
    setPublicInfoOfUserId,
    setGoalsOfUserId,
    deleteUserById
};
