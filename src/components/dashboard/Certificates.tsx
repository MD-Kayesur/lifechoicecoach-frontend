"use client";

import { useGetCertificatesQuery, Certificate } from "@/redux/features/progress/certificateApi";
import { Loader2, Award, Download, ExternalLink, ShieldCheck, Share2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { FaLinkedin, FaFacebook } from "react-icons/fa";
import Image from "next/image";
import certPhoto from "@/assets/cirtificate/Untitled-2.png";
import { QRCodeSVG } from "qrcode.react";

export const Certificates = () => {
    const router = useRouter();
    const { data, isLoading } = useGetCertificatesQuery();
    const certificates = data?.certificates || [];

    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSocialOptions, setShowSocialOptions] = useState(false);

    const handleShare = (cert: Certificate) => {
        setSelectedCert(cert);
        setShowShareModal(true);
        setShowSocialOptions(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-gold" />
                <h2 className="text-[20px] font-bold text-white italic font-serif">Verified Certificates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.length > 0 ? (
                    certificates.map((cert) => (
                        <div key={cert.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group hover:border-gold/30 transition-all duration-500">
                            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-radial-gradient from-gold/10 to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                            
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="w-16 h-20 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                                    {cert.image ? (
                                        <img src={cert.image} alt="Certificate Thumbnail" className="w-full h-full object-cover" />
                                    ) : (
                                        <Award className="w-8 h-8 text-white/10" />
                                    )}
                                    <div className="absolute inset-0 bg-gold/5 group-hover:bg-transparent transition-colors"></div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ShieldCheck className="w-3 h-3 text-gold" />
                                        <span className="text-[9px] font-bold text-gold uppercase tracking-widest font-mono">Official EIU-Paris Credential</span>
                                    </div>
                                     <h3 className="text-white text-[16px] font-bold mb-0.5 leading-tight group-hover:text-gold transition-colors">{cert.micro_credential_name || (cert as any).credential_name}</h3>
                                    <div className="text-gold/60 text-[10px] font-medium mb-1 tracking-wide">{cert.domain_name}</div>
                                    <div className="text-white/40 text-[11px] mb-4 italic">Issued on {new Date(cert.issued_at || (cert as any).issue_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        <button 
                                            onClick={() => router.push(`/certificate?certData=${encodeURIComponent(JSON.stringify(cert))}`)}
                                            className="flex items-center gap-1.5 bg-gold/10 hover:bg-gold text-gold hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-gold/20"
                                        >
                                            <Download className="w-3 h-3" /> Download PDF
                                        </button>
                                        <button 
                                            onClick={() => handleShare(cert)}
                                            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-white/10"
                                        >
                                            <Share2 className="w-3 h-3" /> Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/30 uppercase tracking-[1px]">
                                <span>Certificate ID: {cert.certificate_number}</span>
                                <span className={cert.is_valid !== false ? 'text-green-500/60' : 'text-red-500/60'}>{cert.is_valid !== false ? 'Status: Valid' : 'Status: Invalid'}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-[2rem]">
                        <Award className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/40 text-[14px]">No certificates issued yet. Complete a micro-credential to earn your first award.</p>
                    </div>
                )}
            </div>

            {/* Premium Share Modal */}
            <Dialog open={showShareModal} onOpenChange={(open) => {
                setShowShareModal(open);
                if (!open) setShowSocialOptions(false);
            }}>
                <DialogContent className="max-w-md bg-[#0a1628] border-gold/30 p-0 overflow-hidden rounded-2xl shadow-2xl">
                    <div className="relative">
                        {/* Modal Header/Top Accent */}
                        <div className="h-2 bg-gradient-to-r from-gold via-[#f3d07d] to-gold"></div>
                        
                        <div className="p-6">
                            {!showSocialOptions ? (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold mb-4">
                                            <Share2 size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Share Your Achievement</h3>
                                        <p className="text-white/60 text-sm">Congratulations! Your IKON SKILLS™ Micro-Credential is ready to be shared with your professional network.</p>
                                    </div>

                                    <div className="relative overflow-hidden shadow-lg aspect-[1.414/1] bg-white group">
                                        <Image 
                                            src={certPhoto} 
                                            alt="Certificate Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {/* Dynamic Overlays for Share Preview */}
                                        {selectedCert && (
                                            <div className="absolute inset-0 flex flex-col items-center pointer-events-none" style={{ paddingTop: '15.5%' }}>
                                                {/* Domain Name Placeholder - using a generic domain if not available */}
                                                <div className="text-[6px] font-serif font-bold text-[#5B5655]/70 uppercase tracking-[0.5px] mb-[1%]">
                                                    {selectedCert.domain_name || "Official IKON Skills Domain"}
                                                </div>
                                                <div className="text-[12px] font-serif font-bold text-[#5B5655]">
                                                    {selectedCert.user_name || (selectedCert as any).recipient_name}
                                                </div>
                                                <div className="text-[10px] font-serif text-[#5B5655] mt-[2%]">
                                                    {selectedCert.micro_credential_name || (selectedCert as any).credential_name}
                                                </div>
                                                <div className="absolute top-[59%] left-[23%] text-[4px] font-mono text-[#5B5655]">
                                                    {new Date(selectedCert.issued_at || (selectedCert as any).issue_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                                <div className="absolute top-[59%] left-[41.5%] text-[4px] font-mono text-[#5B5655]">
                                                    {selectedCert.certificate_number}
                                                </div>

                                                {/* QR Code - Positioned exactly in the red marked area */}
                                                <div className="absolute top-[52%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-white p-[2px] rounded-sm shadow-sm pointer-events-auto">
                                                    <QRCodeSVG 
                                                        value={typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${selectedCert.certificate_number}` : ''} 
                                                        size={35}
                                                        level="H"
                                                        includeMargin={false}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                            <div className="text-[10px] text-gold font-bold uppercase tracking-wider mb-1">Preview</div>
                                            <div className="text-white font-bold text-xs truncate">{selectedCert?.micro_credential_name || (selectedCert as any)?.credential_name}</div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setShowSocialOptions(true)}
                                        className="w-full bg-gold text-white font-bold py-3.5 rounded-xl hover:bg-gold2 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                                    >
                                        <ExternalLink size={18} /> Share to Social Media
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center">
                                        <button 
                                            onClick={() => setShowSocialOptions(false)}
                                            className="text-white/40 hover:text-white text-xs mb-4 flex items-center gap-1 mx-auto transition-colors"
                                        >
                                            ← Back to preview
                                        </button>
                                        <h3 className="text-xl font-bold text-white mb-2">Choose Platform</h3>
                                        <p className="text-white/60 text-sm">Select where you'd like to showcase your Proof of Skill.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <a 
                                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(selectedCert?.certificate_file || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-xl bg-[#0077b5]/10 border border-[#0077b5]/30 hover:bg-[#0077b5]/20 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#0077b5] flex items-center justify-center text-white">
                                                <FaLinkedin size={20} fill="currentColor" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-bold text-sm">Share on LinkedIn</div>
                                                <div className="text-white/40 text-[10px]">Reach your professional network</div>
                                            </div>
                                            <ExternalLink size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                                        </a>

                                        <a 
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedCert?.certificate_file || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-xl bg-[#1877f2]/10 border border-[#1877f2]/30 hover:bg-[#1877f2]/20 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#1877f2] flex items-center justify-center text-white">
                                                <FaFacebook size={20} fill="currentColor" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-bold text-sm">Share on Facebook</div>
                                                <div className="text-white/40 text-[10px]">Share with friends and family</div>
                                            </div>
                                            <ExternalLink size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                                        </a>

                                        <button 
                                            onClick={() => {
                                                const url = selectedCert?.certificate_file || '';
                                                navigator.clipboard.writeText(url);
                                                alert("Certificate PDF link copied to clipboard!");
                                            }}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group w-full text-left"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                                                <Share2 size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-bold text-sm">Copy Link</div>
                                                <div className="text-white/40 text-[10px]">Direct link to verified certificate</div>
                                            </div>
                                            <div className="text-gold text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Copy</div>
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 text-center">
                                        <p className="text-[10px] text-white/30 italic">Note: Sharing works best when your profile is public.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
