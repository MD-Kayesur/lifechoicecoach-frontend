import { baseApi } from "@/redux/hooks/baseApi";

export interface EarnedCredential {
    id: number;
    micro_credential_id: number;
    micro_credential_name: string;
    domain_name: string;
    ects_earned: number;
    eqf_level: string;
    certificate_number: string;
    verification_url: string;
    issued_at: string;
    badge_url: string | null;
    certificate_file: string | null;
    badge_count: number;
}

export interface ECTSAccumulation {
    total_ects: number;
    degree_progress_percentage: number;
    required_ects: number;
    remaining_ects: number;
}

export interface InProgressMC {
    id: number;
    micro_credential_name: string;
    micro_credential_id: number;
    domain_name: string;
    status: string;
    attempts_used: number;
    max_attempts: number;
    attempts_remaining: number;
    enrolled_at: string;
    progress_percentage: number;
    passed_competencies: number;
    total_competencies: number;
    access_expires_at?: string | null;
    last_accessed?: string;
    current_competency?: string;
}

export interface DashboardOverview {
    practitioner_id: string;
    practitioner_name: string;
    credentials_earned: number;
    ects_accumulated: number;
    in_progress_count: number;
    competencies_verified: number;
    points?: number;
    rank?: string;
    subscription_status?: string;
}

export interface SessionHistory {
    id: number;
    mc_name: string;
    competency_name: string;
    date: string;
    score: number;
    status: string;
}

export interface SubscriptionStatus {
    is_active: boolean;
    plan_name: string;
    start_date: string;
    expiry_date: string;
    auto_renew: boolean;
}

export interface EnrolledMC {
    id: number;
    name: string;
    status: string;
    passed_competency_count: number;
    total_competency_count: number;
    enrollment_date: string;
}

export interface EnrolledCredentialWithState {
    micro_credential_id: number;
    micro_credential_name: string;
    status: string;
    attempts_used: number;
    max_attempts: number;
    attempts_remaining: number;
    passed_competencies: number;
    total_competencies: number;
    access_expires_at: string | null;
    enrolled_at: string;
    completed_at: string | null;
    is_active: boolean;
    gamification_points: number;
}

export interface DegreePathwayProgress {
    degree_id: number;
    degree_type: string;
    degree_name: string;
    eqf_level: number;
    completed_micro_credentials: number;
    total_micro_credentials: number;
    degree_pathway_progress: string;
    progress_percentage: number;
    is_completed: boolean;
    completed_at: string | null;
}

export interface PractitionerCertificate {
    id: number | string;
    certificate_number: string;
    recipient_name: string;
    credential_name: string;
    issue_date: string;
    expiry_date?: string | null;
    verification_url?: string;
    is_valid: boolean;
    image?: string | null;
    file?: string | null;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    total_count?: number;
    [key: string]: any;
}

export interface EarnedCredentialsResponse extends ApiResponse<EarnedCredential[]> {
    credentials: EarnedCredential[];
}

export interface CompletedCredentialsResponse extends ApiResponse<any[]> {
    credentials: any[];
}

export interface ECTSAccumulationResponse extends ApiResponse<ECTSAccumulation> {
    ects_data: ECTSAccumulation;
}

export interface EnrolledMCsResponse extends ApiResponse<EnrolledMC[]> {
    micro_credentials: EnrolledMC[];
}

export interface InProgressMCsResponse extends ApiResponse<InProgressMC[]> {
    in_progress: InProgressMC[];
}

export interface EnrolledCredentialsWithStateResponse extends ApiResponse<EnrolledCredentialWithState[]> {
    micro_credentials: EnrolledCredentialWithState[];
}

export interface DegreePathwayProgressResponse extends ApiResponse<DegreePathwayProgress[]> {
    degree_pathways: DegreePathwayProgress[];
}

export interface PractitionerCertificatesResponse extends ApiResponse<PractitionerCertificate[]> {
    certificates: PractitionerCertificate[];
}

export interface DashboardOverviewResponse extends ApiResponse<DashboardOverview> {
    dashboard: DashboardOverview;
}

export interface SessionHistoryResponse extends ApiResponse<SessionHistory[]> {
    sessions: SessionHistory[];
}

export const PractitionerManagementApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // Get all earned micro-credentials with certificates and badges
        getEarnedCredentials: builder.query<EarnedCredentialsResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/earned-credentials/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get all micro-credentials where user passed all competencies
        getCompletedCredentials: builder.query<CompletedCredentialsResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/completed-credentials/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get total ECTS accumulated and degree progress
        getECTSAccumulation: builder.query<ECTSAccumulationResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/ects-accumulation/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get all micro-credentials bought or enrolled by the user
        getEnrolledMCs: builder.query<EnrolledMCsResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/enrolled-mcs/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get all micro-credentials currently in progress
        getInProgressMCs: builder.query<InProgressMCsResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/in-progress/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get complete dashboard overview with key statistics
        getDashboardOverview: builder.query<DashboardOverviewResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/overview/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get recent learning session history
        getSessionHistory: builder.query<SessionHistoryResponse, { limit?: number } | void>({
            query: (params) => ({
                url: "/practitioner/dashboard/session-history/",
                method: "GET",
                params: params || {},
            }),
            providesTags: ["Practitioner"],
        }),

        // Get current subscription status and details
        getSubscriptionStatus: builder.query<SubscriptionStatus, void>({
            query: () => ({
                url: "/practitioner/dashboard/subscription-status/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get all enrolled credentials with current state
        getEnrolledCredentialsWithState: builder.query<EnrolledCredentialsWithStateResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/track-management/enrolled-credentials/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get degree pathway progress for current user
        getDegreePathwayProgress: builder.query<DegreePathwayProgressResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/track-management/degree-pathways/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),

        // Get all certificates for current user
        getPractitionerCertificates: builder.query<PractitionerCertificatesResponse, void>({
            query: () => ({
                url: "/practitioner/dashboard/track-management/certificates/",
                method: "GET",
            }),
            providesTags: ["Practitioner"],
        }),
    }),
});

export const {
    useGetEarnedCredentialsQuery,
    useGetCompletedCredentialsQuery,
    useGetECTSAccumulationQuery,
    useGetEnrolledMCsQuery,
    useGetInProgressMCsQuery,
    useGetDashboardOverviewQuery,
    useGetSessionHistoryQuery,
    useGetSubscriptionStatusQuery,
    useGetEnrolledCredentialsWithStateQuery,
    useGetDegreePathwayProgressQuery,
    useGetPractitionerCertificatesQuery,
} = PractitionerManagementApi;

