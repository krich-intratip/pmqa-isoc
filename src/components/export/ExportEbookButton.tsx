'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SAREbookDocument } from './SAREbookDocument';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface ExportEbookButtonProps {
    data: {
        cycleName: string;
        unitName: string;
        sections: {
            id: string;
            title: string;
            content: string;
            evidences: {
                name: string;
                url: string;
            }[];
        }[];
    };
}

export default function ExportEbookButton({ data }: ExportEbookButtonProps) {
    const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
    const [preparing, setPreparing] = useState(false);
    const [ready, setReady] = useState(false);

    // Pre-generate QR Codes
    useEffect(() => {
        const generateQRs = async () => {
            setPreparing(true);
            const codes: Record<string, string> = {};

            for (const section of data.sections) {
                for (const ev of section.evidences) {
                    if (ev.url && !codes[ev.url]) {
                        try {
                            codes[ev.url] = await QRCode.toDataURL(ev.url);
                        } catch (e) {
                            console.error('QR Gen Error', e);
                        }
                    }
                }
            }
            setQrCodes(codes);
            setPreparing(false);
            setReady(true);
        };

        if (data) {
            generateQRs();
        }
    }, [data]);

    if (!ready || preparing) {
        return (
            <Button disabled variant="outline" className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing Interactive eBook...
            </Button>
        );
    }

    return (
        <PDFDownloadLink
            document={<SAREbookDocument data={data} qrCodes={qrCodes} />}
            fileName={`SAR-${data.unitName}-${data.cycleName}.pdf`}
        >
            {/* @ts-ignore - render prop type mismatch in some versions */}
            {({ blob, url, loading, error }) => (
                <Button disabled={loading} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Export Interactive eBook (PDF)
                </Button>
            )}
        </PDFDownloadLink>
    );
}
