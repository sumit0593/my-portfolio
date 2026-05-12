"use client";

import { X, Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <h2 className="text-xl font-semibold">Resume Preview</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <a href="/resume/Sumit_Kumar_GenAI_Full_Stack.pdf" target="_blank" rel="noopener noreferrer">
                <Maximize2 className="w-4 h-4 mr-2" /> Open Full Screen
              </a>
            </Button>
            <Button size="sm" asChild>
              <a href="/resume/Sumit_Kumar_GenAI_Full_Stack.pdf" download>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </a>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <a href="/resume/Sumit_Kumar_GenAI_Full_Stack.docx" download>
                <Download className="w-4 h-4 mr-2" /> Download DOCX
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content - PDF Viewer */}
        <div className="flex-1 bg-muted/20 relative">
          {/* Mobile fallback message */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center sm:hidden bg-background gap-3">
             <p className="mb-4 text-muted-foreground">PDF preview may not work well on mobile browsers.</p>
             <div className="flex flex-col w-full max-w-xs gap-3">
               <Button asChild>
                <a href="/resume/Sumit_Kumar_GenAI_Full_Stack.pdf" download>
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </a>
               </Button>
               <Button variant="secondary" asChild>
                <a href="/resume/Sumit_Kumar_GenAI_Full_Stack.docx" download>
                  <Download className="w-4 h-4 mr-2" /> Download DOCX
                </a>
               </Button>
             </div>
          </div>
          
          <iframe 
            src="/resume/Sumit_Kumar_GenAI_Full_Stack.pdf#toolbar=0" 
            className="w-full h-full hidden sm:block border-0"
            title="Resume PDF Preview"
          />
        </div>
      </div>
    </div>
  );
}
