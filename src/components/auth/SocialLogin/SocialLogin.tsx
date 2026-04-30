"use client";

import React, { useState } from "react";
import { useSocialLoginMutation } from "@/redux/features/auth/authApi";
import { setCredentials } from "@/store/Slices/AuthSlice/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
    Apple,
    Loader2
} from "lucide-react";

// Social Icons SVGs
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const GithubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const TwitterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DA1F2" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const providers = [
    { name: "google", icon: <GoogleIcon />, color: "#4285F4" },
    // { name: "github", icon: <GithubIcon />, color: "#333" },
    // { name: "facebook", icon: <FacebookIcon />, color: "#1877F2" },
    // { name: "twitter", icon: <TwitterIcon />, color: "#1DA1F2" },
    // { name: "linkedin", icon: <LinkedInIcon />, color: "#0A66C2" },
    // { name: "apple", icon: <Apple size={18} />, color: "#fff" },
];

export const SocialLogin = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [socialLogin, { isLoading }] = useSocialLoginMutation();
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const handleSocialLogin = async (provider: string) => {
        setLoadingProvider(provider);
        toast.info(`Attempting to sign in with ${provider}...`);

        try {
            const formData = new FormData();
            formData.append("provider", provider);

            if (provider === "google") {
                formData.append("email", "rmdkayesur@gmail.com");
                formData.append("first_name", "kayesur");
                formData.append("last_name", "Rahman");
                formData.append("provider_id", "3");
            } else {
                formData.append("email", "user@example.com");
                formData.append("first_name", "Social");
                formData.append("last_name", "User");
                formData.append("provider_id", "social_id_123");
            }

            const result = await socialLogin(formData).unwrap();

            if (result.data) {
                const { user: completeUser, accessToken: token, refreshToken } = result.data;

                dispatch(setCredentials({
                    user: completeUser,
                    token: token || ""
                }));

                if (token) Cookies.set("accessToken", token, { expires: 7 });
                if (refreshToken) Cookies.set("refreshToken", refreshToken, { expires: 30 });

                toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful!`);
                router.push("/dashboard");
            } else {
                toast.error(result.message || "Social login failed. Please try again.");
            }
        } catch (err: any) {
            console.error(`${provider} login error:`, err);
            toast.error(err?.data?.message || err?.data?.detail || `${provider} authentication failed.`);
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="bg-[#0a1628] px-4 text-white/30">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {providers.map((p) => (
                    <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSocialLogin(p.name)}
                        disabled={isLoading}
                        title={`Login with ${p.name}`}
                        className="flex items-center justify-center p-4 rounded-[18px] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-110 active:scale-95 transition-all duration-300 group shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
                    >
                        {isLoading && loadingProvider === p.name ? (
                            <Loader2 size={18} className="animate-spin text-white/30" />
                        ) : (
                            <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                {p.icon}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
