"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { MCS, DOMAINS } from "@/lib/data";
import Image from "next/image";
import certPhoto from "@/assets/cirtificate/Untitled-2.png";
import ikonLogo from "@/assets/images/ikon_logo.png";
import jsPDF from "jspdf";
import { useRef, useMemo, useState, useEffect } from "react";
import { useGetLessonCompetenciesQuery, MicroCredential, DomainHierarchy } from "@/redux/features/lesson/lessonCompetenciesApi";
import { useGetProfileQuery } from "@/redux/features/profile/profileApi";
import { useGetCertificateTemplateQuery, useUploadCertificateFileMutation } from "@/redux/features/progress/certificateApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("blob:") || path.startsWith("data:")) {
        return path;
    }
    
    let absoluteUrl = path;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://lifechoice.duckdns.org";
    
    // If it's a relative path starting with the base URL string, strip it to get the raw path
    if (path.startsWith(baseUrl)) {
        absoluteUrl = path;
    } else if (path.startsWith("/")) {
        absoluteUrl = `${baseUrl}${path}`;
    } else if (!path.startsWith("http")) {
        absoluteUrl = `${baseUrl}/${path}`;
    }
    
    return `/api/proxy-image?url=${encodeURIComponent(absoluteUrl)}`;
};

export const Certificate = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isDownloading, setIsDownloading] = useState(false);
    const id = searchParams.get("id");
     
    // Fetch User Profile
    const { data: profileData } = useGetProfileQuery();
    const { data: templateData } = useGetCertificateTemplateQuery();
    console.log("Template Data:", templateData);
    const rawUrl = templateData?.data?.certificate_template;
    console.log("Raw URL:", rawUrl);

    const certificateImageSrc = rawUrl ? getImageUrl(rawUrl) : certPhoto.src;

    const certDataStr = searchParams.get("certData");
    const certData = useMemo(() => {
        if (!certDataStr) return null;
        try {
            return JSON.parse(certDataStr);
        } catch (e) {
            return null;
        }
    }, [certDataStr]);

    console.log("Profile Data:", profileData);
    const firstLast = `${profileData?.profile?.first_name || ""} ${profileData?.profile?.last_name || ""}`.trim();
    const userName = certData?.user_name || firstLast || "Practitioner Name";

    // Fetch Micro-Credential Details from API
    const mcId = Number(id);
    const { data: apiResponse } = useGetLessonCompetenciesQuery(
        !isNaN(mcId) ? { micro_credential_id: mcId } : skipToken
    );
    console.log("API Response:", apiResponse);
    const domain: DomainHierarchy | undefined = apiResponse?.data?.domains?.[0];
    const mc1: (MicroCredential & { domain_name?: string }) | undefined = domain?.micro_credentials?.[0];
    
    if (mc1) {
        console.log(mc1.domain_name);        // "AI & Automaiton"
        console.log(mc1.micro_credential); 
    }
    console.log("ID:", id);
    // Extract dynamic data
    const { dynamicMC, dynamicDomain } = useMemo(() => {
        if (!apiResponse?.data?.domains || apiResponse.data.domains.length === 0) {
            return { dynamicMC: null, dynamicDomain: null };
        }
        const domain = apiResponse.data.domains[0];
        const mc = domain.micro_credentials?.[0] || null;
        return { dynamicMC: mc, dynamicDomain: domain };
    }, [apiResponse]);

    // Fallback to static data if API not available or for static IDs
    const mc = dynamicMC ? {
        id: dynamicMC.id.toString(),
        name: dynamicMC.micro_credential,
        level: dynamicMC.level || "6",
        ects: 10,
        cat: dynamicDomain?.domain || "01"
    } : (MCS.find(item => item.id === (id || "01-01")) || MCS[0]);

    const category = dynamicDomain ? {
        id: dynamicDomain.domain,
        name: dynamicDomain.name
    } : (DOMAINS.find(d => d.id === mc.cat) || DOMAINS[0]);

    const certRef = useRef<HTMLDivElement>(null);

    const [uploadCertificateFile] = useUploadCertificateFileMutation();

    const handleDownload = async () => {
        if (!certRef.current) {
            alert("Certificate template not ready yet.");
            return;
        }

        setIsDownloading(true);
        try {
            // Give the browser a moment to ensure images are fully rendered
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

            // Use a temporary instance to get image properties
            const tempPdf = new jsPDF();
            const imgProps = tempPdf.getImageProperties(dataUrl);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;

            // Create the final PDF with exact image dimensions to remove white space
            const pdf = new jsPDF({
                orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
                unit: 'px',
                format: [imgWidth, imgHeight]
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);

            // Upload the generated PDF to the server
            if (certData?.certificate_number) {
                const pdfBlob = pdf.output('blob');
                const formData = new FormData();
                formData.append('certificate_file', pdfBlob, `IKON-Certificate-${certData.certificate_number}.pdf`);
                formData.append('ects_earned', (certData.ects_earned || 10).toString());
                formData.append('is_public', 'true');

                try {
                    await uploadCertificateFile({
                        certificate_number: certData.certificate_number,
                        formData
                    }).unwrap();
                    console.log("Certificate file uploaded to server successfully");
                } catch (uploadError) {
                    console.error("Failed to upload certificate file:", uploadError);
                }
            }

            pdf.save(`IKON-Skills-Certificate-${mc.name.replace(/\s+/g, '-')}.pdf`);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download the certificate. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div id="page-certificate" className="page active pt-[62px] min-h-screen bg-[#0a1628]">
            <div className="cert-layout max-w-[1200px] mx-auto px-8 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    {/* <div 
                        className="cert-bc text-sm text-white/50 hover:text-white mb-6 cursor-pointer flex items-center gap-2 transition-colors" 
                        onClick={() => router.push(`/sample-mc?id=${id}`)}
                    >
                        ← Back to Credential
                    </div> */}
                    <div className="header mb-8">
                        <div className="eyebrow text-gold font-bold text-[10.5px] tracking-[2px] uppercase font-mono mb-2">Sample Micro-Credential Certificate</div>
                        <h2 className="sec-h font-serif font-bold text-[26px] text-white leading-tight mb-4 ml-0">This is what your Proof of Skill looks like.</h2>
                        <p className="text-[13.5px] text-white/60 leading-relaxed max-w-[520px]">
                            Every IKON SKILLS™ Micro-Credential you earn generates a formal digital certificate quality assured by European International University, Paris — together with a digital badge for your IKON SKILLS™ Passport.
                        </p>
                    </div>

                    {/* Certificate Card with Dynamic Overlays */}
                    <div ref={certRef} className="relative group rounded-none border-none shadow-none">
                        <img src={certificateImageSrc} alt="Certificate Template" className="w-full h-auto rounded-none" />
                        
                        {/* Dynamic Overlays */}
                        {certData && (
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Domain Name */}
                                <div 
                                    className="absolute left-1/2 -translate-x-1/2 top-[15.5%] text-[1.9vw] lg:text-[22px] font-serif font-bold text-[#5B5655] tracking-[2px] whitespace-nowrap"
                                >
                                    {certData.domain_name || mc1?.domain_name || category.name || "Official IKON Skills Domain"}
                                </div>

                                {/* User Name */}
                                <div 
                                    className="absolute left-1/2 -translate-x-1/2 top-[23%] lg:top-[21.5%] text-[3.5vw] lg:text-[42px] font-serif font-bold text-[#5b5655] whitespace-nowrap"
                                >
                                    {userName}
                                </div>
                                
                                {/* Micro-Credential Name */}
                                <div 
                                    className="absolute left-1/2 -translate-x-1/2 top-[32%] lg:top-[31%] text-[3vw] lg:text-[36px] font-serif text-[#5b5655] whitespace-nowrap"
                                >
                                    {certData.micro_credential_name || mc1?.micro_credential || mc.name}
                                </div>

                                {/* Bottom Info Row (Issued Date & Certificate ID) */}
                                <div 
                                    className="absolute  left-[61%] lg:left-8/13 -translate-x-1/2 lg:top-[39.5%] top-[39.5%] w-full flex justify-center gap-[16%] lg:gap-[16%] text-[1.6vw] lg:text-[14px] font-mono text-[#5b5655]"
                                >
                                    <div className="flex gap-2">
                                        <span>{certData.issued_at ? new Date(certData.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '07 March 2026'}</span>
                                    </div>
                                    <div className="flex gap-2 ">
                                        <span>{certData.certificate_number || `IKS-${mc.id}-2026-4201-XKPM7`}</span>
                                    </div>
                                </div>

                                {/* QR Code Container */}
                                <div className="absolute top-[49.5%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-white p-[0.5vw] lg:p-[4px] shadow-sm pointer-events-auto">
                                    <div className="  max-w-[15vw]  max-h-[15vw]  lg:max-w-[10vw] lg:max-h-[10vw]">
                                        <QRCodeSVG 
                                            value={typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${certData.certificate_number || id}` : ''} 
                                            size={1000}
                                            style={{ width: '100%', height: '100%' }}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <div style={{ display: 'none' }}>
                                        <QRCodeCanvas
                                            id="qr-code-canvas-sample"
                                            value={typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${certData.certificate_number || id}` : ''}
                                            size={500}
                                            level="H"
                                        />
                                    </div>
                                </div>
                                {/* TWBF Logo Overlay - Only show for Domain 10 (Brand Leadership) */}
                                {!(Number(mc.cat) === 10 || category.name?.toLowerCase().includes("brand leadership")) && (
                                    <div 
                                        className="absolute right-[3%] top-[12.5%] w-[18%] h-[18%] bg-white z-[5]"
                                        style={{ backgroundColor: '#FFFFFF' }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="cv-sidebar sticky top-[92px] animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="cv-panel bg-white border border-gold/20 rounded-2xl p-6 mb-4 shadow-xl">
                        <div className="cv-t text-[13px] font-bold text-[#0B1F3A] mb-4 flex items-center gap-2">
                            <span>🔒</span> Credential Verification
                        </div>

                        <div className="cv-profile-box flex items-center gap-4 mb-6 pb-6 border-b border-[#0B1F3A]/5">
                            <div className="w-[60px] h-[60px] rounded-full border-2 border-gold overflow-hidden bg-gold/5 shrink-0">
                                <img
                                    src={certificateImageSrc}
                                    alt={userName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="text-[14px] font-bold text-[#0B1F3A]">{userName}</div>
                                <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider">✓ Verified Identity</div>
                            </div>
                        </div>

                        <div className="cv-id bg-[#F9F5EE] border border-gold/10 rounded-lg p-3 text-[11.5px] font-mono text-[#1A1A1E] break-all mb-4">
                            {certData?.certificate_number || `IKS-${mc.id}-2026-4201-XKPM7`}
                        </div>
                        <div className="space-y-3">
                            {[
                                { l: 'Practitioner', v: userName },
                                { l: 'Credential', v: certData?.micro_credential_name || mc.name },
                                { l: 'Domain', v: certData?.domain_name || `Cat ${mc.cat} · ${category?.name}` },
                                { l: 'ECTS', v: `${certData?.ects_earned || mc.ects} ECTS · EQF ${certData?.eqf_level ? certData.eqf_level.replace('EQF ', '') : mc.level}` },
                                { l: 'Date Issued', v: certData?.issued_at ? new Date(certData.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '07 March 2026' },
                                { l: 'Quality Assured By', v: 'EIU-Paris' },
                                { l: 'Status', v: '✓ Verified', color: '#0A6B45' },
                            ].map((row, i) => (
                                <div key={i} className="cv-row flex justify-between text-[12px] pb-2 border-b border-[#0B1F3A]/5 last:border-0 last:pb-0">
                                    <span className="cv-l text-[#74798A]">{row.l}</span>
                                    <span className="cv-v font-bold text-[#0B1F3A]" style={row.color ? { color: row.color } : {}}>{row.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleDownload} 
                        disabled={isDownloading}
                        className={`btn-dl w-full bg-gold text-white font-bold text-[13.5px] py-3 rounded-xl shadow-[0_4px_0_#9a7e3a] hover:bg-gold2 hover:translate-y-[2px] hover:shadow-[0_2px_0_#9a7e3a] active:shadow-none active:translate-y-[4px] transition-all mb-3 flex items-center justify-center gap-2 ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isDownloading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download size={18} /> Download Certificate (PDF)
                            </>
                        )}
                    </button>

                    <div className="note bg-[#F9F5EE] border border-gold/15 rounded-2xl p-4">
                        <div className="text-[12px] font-bold text-[#0B1F3A] mb-2">What this certificate proves</div>
                        <div className="text-[12px] text-[#3D4556] leading-relaxed">
                            This IKON SKILLS™ Micro-Credential certificate is quality assured by European International University, Paris (UAI 0756213W) and verifies mastery of 10 EQF-aligned competencies. It carries 10 ECTS and is stackable toward full degree programs at EIU-Paris.
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    );
};
