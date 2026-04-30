"use client";

import { useVerifyCertificateQuery, useGetCertificateTemplateQuery } from "@/redux/features/progress/certificateApi";
import { useGetLessonCompetenciesQuery, MicroCredential, DomainHierarchy } from "@/redux/features/lesson/lessonCompetenciesApi";
import { useGetProfileQuery } from "@/redux/features/profile/profileApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRef, useMemo, useState } from "react";
import Image from "next/image";
import certPhoto from "@/assets/cirtificate/Untitled-2.png";
import { Loader2, ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("blob:") || path.startsWith("data:")) {
        return path;
    }
    
    let absoluteUrl = path;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://lifechoice.duckdns.org";
    
    if (path.startsWith(baseUrl)) {
        absoluteUrl = path;
    } else if (path.startsWith("/")) {
        absoluteUrl = `${baseUrl}${path}`;
    } else if (!path.startsWith("http")) {
        absoluteUrl = `${baseUrl}/${path}`;
    }
    
    return `/api/proxy-image?url=${encodeURIComponent(absoluteUrl)}`;
};

interface VerifiedCertificateViewProps {
    id: string;
}

export const VerifiedCertificateView = ({ id }: VerifiedCertificateViewProps) => {
    // 1. Fetch User Profile (Same logic as Certificate.tsx)
    const { data: profileData } = useGetProfileQuery();
    const firstLast = `${profileData?.profile?.first_name || ""} ${profileData?.profile?.last_name || ""}`.trim();
    const userName = firstLast || "Practitioner Name";
    const certRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // 2. Fetch Certificate Details
    const { data: apiResponse, isLoading: certLoading, isError } = useVerifyCertificateQuery({ certificate_number: id });
    const cert = apiResponse?.certificate || (apiResponse as any)?.data || apiResponse;

    // 3. Fetch Micro-Credential Details from API (Same logic as Certificate.tsx)
    // We use either the cert's credential ID or the URL id
    const mcId = Number(cert?.micro_credential_id || id);
    const { data: mcApiResponse, isLoading: mcLoading } = useGetLessonCompetenciesQuery(
        !isNaN(mcId) ? { micro_credential_id: mcId } : skipToken
    );

    const domain: DomainHierarchy | undefined = mcApiResponse?.data?.domains?.[0];
    const mc1: (MicroCredential & { domain_name?: string }) | undefined = domain?.micro_credentials?.[0];

    const isLoading = certLoading || mcLoading;

    const { data: templateData } = useGetCertificateTemplateQuery();
    const rawUrl = templateData?.data?.certificate_template;
    const certificateImageSrc = rawUrl ? getImageUrl(rawUrl) : certPhoto.src;

    const displayUserName = cert?.user_name || cert?.recipient_name || userName;
    const displayDomainName = cert?.domain_name || mc1?.domain_name || "Official IKON Skills Domain";
    const displayCredentialName = cert?.micro_credential_name || mc1?.micro_credential || cert?.credential_name || "Micro-Credential";
    const displayIssueDate = cert?.issued_at || cert?.issue_date ? new Date(cert?.issued_at || cert?.issue_date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : "07 March 2026";
    const displayCertificateNumber = cert?.certificate_number || cert?.id || id;

    const handleDownload = async () => {
        if (!certRef.current) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(certRef.current, { 
                cacheBust: true,
                pixelRatio: 2,
                quality: 1,
                style: {
                    border: 'none',
                    borderRadius: '0',
                    boxShadow: 'none',
                }
            });

            const tempPdf = new jsPDF();
            const imgProps = tempPdf.getImageProperties(dataUrl);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;

            const pdf = new jsPDF({
                orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
                unit: 'px',
                format: [imgWidth, imgHeight]
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Verified-Certificate-${displayCertificateNumber}.pdf`);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download certificate. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-gold" />
                <p className="text-white/60 font-mono text-xs uppercase tracking-widest">Verifying Credential...</p>
            </div>
        );
    }

    // Check if we have enough data to show a certificate
    // We can show it if we have the certificate record OR if we have the MC/Profile data
    const hasEnoughData = (cert && (cert.user_name || cert.recipient_name || cert.micro_credential_name || cert.credential_name)) || (userName !== "Practitioner Name" && mc1);

    if ((isError && !mc1) || (!isLoading && !hasEnoughData)) {
        return (
            <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center gap-4 px-6">
                <div className="text-red-500 text-6xl mb-4 animate-bounce">⚠️</div>
                <h1 className="text-white text-3xl font-serif font-bold tracking-tight">Verification Pending</h1>
                <p className="text-white/60 text-center max-w-md leading-relaxed">
                    We could not find an official record for Certificate ID <span className="text-gold font-mono">#{id}</span> at this time. 
                    Please ensure the ID is correct or try again in a few moments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-gold hover:bg-gold2 text-white font-bold rounded-xl transition-all shadow-lg shadow-gold/20"
                    >
                        Retry Verification
                    </button>
                    <button 
                        onClick={() => window.history.back()}
                        className="px-8 py-3 bg-white/5 text-white/70 hover:text-white rounded-xl border border-white/10 transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6 md:p-12">
            <div className="w-full h-full max-w-[1100px] animate-in fade-in zoom-in-95 duration-1000">
                {/* Certificate Preview Only */}
                <div ref={certRef} className="relative group rounded-none border-none shadow-none">
                    <img src={certificateImageSrc} alt="Certificate Template" className="w-full h-auto rounded-none" />
                    
                    {/* Dynamic Overlays */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Domain Name */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 top-[15.5%] text-[1.6vw] lg:text-[18px] font-serif font-bold text-[#5B5655]/70 tracking-[2px] whitespace-nowrap"
                        >
                            {displayDomainName}
                        </div>
                        
                        {/* Recipient Name */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 top-[28.5%] text-[3.5vw] lg:text-[42px] font-serif font-bold text-[#5B5655] whitespace-nowrap"
                        >
                            {displayUserName}
                        </div>
                        
                        {/* Credential Name */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 top-[44%] text-[3vw] lg:text-[34px] font-serif text-[#5B5655] whitespace-nowrap"
                        >
                            {displayCredentialName}
                        </div>

                        {/* Bottom Info Row */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 top-[62.5%] w-full flex justify-center gap-[19%] text-[1.2vw] lg:text-[16px] font-mono text-[#5B5655]"
                        >
                            <div className="flex gap-2">
                                <span>{displayIssueDate}</span>
                            </div>
                            <div className="flex gap-2 ">
                                <span>{displayCertificateNumber}</span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="absolute top-[75.5%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-white p-[0.5vw] lg:p-[4px] rounded-sm shadow-sm pointer-events-auto">
                           <div className="  max-w-[15vw]  max-h-[15vw]  lg:max-w-[8vw] lg:max-h-[8vw]">
                                <QRCodeSVG 
                                    value={cert?.certificate_file || (typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${id}` : '')} 
                                    size={1000}
                                    style={{ width: '100%', height: '100%' }}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            {/* Hidden canvas for PDF export */}
                            <div style={{ display: 'none' }}>
                                <QRCodeCanvas
                                    id="qr-code-canvas"
                                    value={cert?.certificate_file || (typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${id}` : '')}
                                    size={500}
                                    level="H"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Subtle Download Hover Button */}
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`absolute bottom-6 right-6 bg-gold/90 hover:bg-gold text-white p-3 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center ${isDownloading ? 'opacity-100' : ''}`}
                        title="Download PDF"
                    >
                        {isDownloading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Download size={24} />
                        )}
                    </button>
                </div>

                {/* Optional Verification Badge at bottom */}
                <div className="mt-8 flex flex-col items-center gap-2 opacity-50">
                    <div className="flex items-center gap-2 text-white/60 text-[10px] font-mono uppercase tracking-[3px]">
                        <ShieldCheck size={14} className="text-gold" /> Officially Verified Credential
                    </div>
                    <div className="text-white/30 text-[9px] font-mono uppercase tracking-[2px]">
                        Quality Assured by European International University, Paris
                    </div>
                </div>
            </div>
        </div>
    );
};

