import { baseApi } from "@/redux/hooks/baseApi";

export interface LearningInteraction {
    id?: number;
    interaction_type: "teaching" | "formative" | "summary";
    ai_prompt: string;
    ai_response: string;
    learner_input: string;
    formative_passed?: boolean;
    created_at?: string;
    interaction_number?: number;
}

export interface LearningSession {
    id: number | string;
    mc_access_id: number;
    competency_id: number;
    competency_name?: string;
    status: "active" | "completed" | "abandoned";
    start_time: string;
    end_time?: string | null;
    interactions: LearningInteraction[];
    final_score?: number | null;
    mastery_achieved?: boolean;
    completed_at?: string;
    started_at?: string;
    interaction_count?: number;
    max_interactions?: number;
}

export interface GetSessionResponse {
    success: boolean;
    message: string;
    session: LearningSession;
}

export interface CompetencyRoadmapItem {
    competency_id: number;
    code: number;
    title: string;
    description: string;
    status: string;
    is_unlocked: boolean;
    mastery_achieved: boolean;
    attempts_used: number;
    total_interactions: number;
    total_points: number;
    current_session_id: number | null;
    current_attempt: number | null;
    current_interaction_count: number | null;
}

export interface GetCompetencyRoadmapResponse {
    success: boolean;
    message: string;
    roadmap: {
        micro_credential: string;
        mc_status: string;
        attempts_used: number;
        max_attempts: number;
        competencies: CompetencyRoadmapItem[];
    };
    error: boolean;
}

export interface StartSessionRequest {
    mc_access_id: number;
    competency_id: number;
}

export interface AssessSessionRequest {
    scenario_question: string;
    learner_response: string;
    rubric_score: number;
    ai_feedback: string;
}

export interface InteractSessionRequest {
    interaction_type: "teaching" | "formative" | "summary";
    ai_prompt: string;
    ai_response: string;
    learner_input: string;
    formative_passed: boolean;
}

export const LearningSessionApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // Get all learning sessions for the authenticated user with optional filters
        getSessions: builder.query<{ success: boolean; message: string; sessions: LearningSession[] }, { micro_credential?: number; status?: string } | void>({
            query: (params) => ({
                url: "/learning/sessions/",
                method: "GET",
                params: params || {},
            }),
            providesTags: ["LearningSession"],
        }),

        // Start a new learning session for a competency
        startSession: builder.mutation<LearningSession, StartSessionRequest>({
            query: (body) => ({
                url: "/learning/sessions/start/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["LearningSession"],
        }),

        // Get details of a specific learning session with all interactions
        getSessionById: builder.query<GetSessionResponse, string | number>({
            query: (sessionId) => ({
                url: `/learning/sessions/${sessionId}/`,
                method: "GET",
            }),
            providesTags: (result, error, sessionId) => [{ type: "LearningSession", id: sessionId }],
        }),

        // Submit final competency assessment for a learning session
        assessSession: builder.mutation<any, { sessionId: string | number; data: AssessSessionRequest }>({
            query: ({ sessionId, data }) => ({
                url: `/learning/sessions/${sessionId}/assess/`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { sessionId }) => [{ type: "LearningSession", id: sessionId }, "Points", "Summary"],
        }),

        // Add an AI teaching interaction to a learning session
        interactWithSession: builder.mutation<LearningInteraction, { sessionId: string | number; data: InteractSessionRequest }>({
            query: ({ sessionId, data }) => ({
                url: `/learning/sessions/${sessionId}/interact/`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { sessionId }) => [{ type: "LearningSession", id: sessionId }],
        }),

        // Get competency roadmap for a micro-credential
        getCompetencyRoadmap: builder.query<GetCompetencyRoadmapResponse, string | number>({
            query: (mcId) => ({
                url: `/learning/sessions/roadmap/${mcId}/`,
                method: "GET",
            }),
            providesTags: (result, error, mcId) => [{ type: "LearningSession", id: `roadmap-${mcId}` }],
        }),
    }),
});

export const {
    useGetSessionsQuery,
    useStartSessionMutation,
    useGetSessionByIdQuery,
    useAssessSessionMutation,
    useInteractWithSessionMutation,
    useGetCompetencyRoadmapQuery,
} = LearningSessionApi;
