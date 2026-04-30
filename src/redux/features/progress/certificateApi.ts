import { baseApi } from "@/redux/hooks/baseApi";

export interface Certificate {
    id: string | number;
    certificate_number: string;
    recipient_name?: string;
    user_name?: string;
    credential_name?: string;
    micro_credential_name?: string;
    domain_name?: string;
    eqf_level?: string;
    ects_earned?: number;
    issue_date?: string;
    issued_at?: string;
    expiry_date?: string | null;
    verification_url?: string;
    is_valid?: boolean;
    is_public?: boolean;
    image?: string | null;
    file?: string | null;
    certificate_file?: string | null;
}

export interface CertificateListParams {
    search?: string;
    ordering?: string;
}

export interface CertificateVerifyResponse {
    is_valid: boolean;
    certificate: Certificate;
    verification_time: string;
}

export interface CertificatesResponse {
    success: boolean;
    message: string;
    certificates: Certificate[];
}

export const certificateApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // Get all certificates for current user
        getCertificates: builder.query<CertificatesResponse, CertificateListParams | void>({
            query: (params) => ({
                url: "/progress/user/certificates/",
                method: "GET",
                params: params || {},
            }),
            providesTags: ["Certificate"],
        }),

        // Verify a certificate by certificate number
        verifyCertificate: builder.query<CertificateVerifyResponse, { certificate_number: string; search?: string; ordering?: string }>({
            query: ({ certificate_number, ...params }) => ({
                url: `/progress/user/certificates/verify/${certificate_number}/`,
                method: "GET",
                params,
            }),
            providesTags: (result, error, { certificate_number }) => [{ type: "Certificate", id: certificate_number }],
        }),

        // Get specific certificate details
        getCertificateById: builder.query<Certificate, string | number>({
            query: (id) => ({
                url: `/progress/user/certificates/${id}/`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Certificate", id }],
        }),

        // Get certificate template
        getCertificateTemplate: builder.query<{ success: boolean; message: string; data: { certificate_template: string }; error: boolean }, void>({
            query: () => ({
                url: "/settings/certificate-template/public/",
                method: "GET",
            }),
            providesTags: ["CertificateTemplate"],
        }),

        // Upload certificate file
        uploadCertificateFile: builder.mutation<{ success: boolean; message: string; certificate: Certificate; error: boolean }, { certificate_number: string; formData: FormData }>({
            query: ({ certificate_number, formData }) => ({
                url: `/progress/user/certificates/${certificate_number}/upload-file/`,
                method: "PATCH",
                body: formData,
            }),
            invalidatesTags: ["Certificate"],
        }),
    }),
});

export const {
    useGetCertificatesQuery,
    useVerifyCertificateQuery,
    useGetCertificateByIdQuery,
    useGetCertificateTemplateQuery,
    useUploadCertificateFileMutation,
} = certificateApi;
