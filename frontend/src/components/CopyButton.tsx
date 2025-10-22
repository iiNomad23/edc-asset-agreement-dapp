import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const fallbackCopy = () => {
            const userCopied = prompt('Copy the text below to clipboard:', text);
            if (userCopied !== null) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        };

        if (navigator.clipboard == null) {
            fallbackCopy();
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            fallbackCopy();
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center w-5 h-5 ml-1 text-muted-foreground hover:text-foreground transition-colors"
        >
            {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
                <Copy className="w-3.5 h-3.5" />
            )}
        </button>
    );
};

export default CopyButton;
