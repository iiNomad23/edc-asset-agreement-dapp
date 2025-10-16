import React from 'react';
import { Check, Copy } from 'lucide-react';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
