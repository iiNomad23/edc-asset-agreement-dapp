import React from 'react';
import { TransferProcess } from '@/types/transfer.ts';
import { ArrowDownToLine, ArrowRightLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { cn, formatTimestamp } from '@/lib/utils.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

interface DataTransferCardProps {
    transfer: TransferProcess;
    onFetchData: (transfer: TransferProcess) => void;
    isFetching: boolean;
}

const DataTransferCard: React.FC<DataTransferCardProps> = ({ transfer, onFetchData, isFetching }) => {
    const formattedDate = formatTimestamp(transfer.stateTimestamp);
    const isInStartedState = transfer.state === 'STARTED';
    const isInErrorState = transfer.state === 'TERMINATED' || transfer.state === 'ERROR';

    return (
        <Card className={cn('min-w-[320px]', isInErrorState && 'opacity-60 border-red-200')}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-purple-500" />
                            Data Transfer
                        </CardTitle>
                        <CardDescription className="mt-1">
                            <p className="text-muted-foreground break-all">
                                Type: {transfer['@type']}
                            </p>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 h-7">
                        {transfer.errorDetail ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="destructive" className="cursor-help">
                                        {transfer.state}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {transfer.errorDetail}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Badge variant="secondary">
                                {transfer.state}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground mb-1">Transfer ID</p>
                            <p className="font-mono text-xs break-all">{transfer['@id']}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">State Updated</p>
                            <p className="font-mono text-xs">{formattedDate}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground mb-1">Asset ID</p>
                            <p className="font-mono text-xs break-all">{transfer.assetId}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Type</p>
                            <p className="font-mono text-xs">{transfer.type}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-muted-foreground mb-1">Agreement ID</p>
                            <p className="font-mono text-xs break-all">{transfer.contractId}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Correlation ID</p>
                            <p className="font-mono text-xs break-all">{transfer.correlationId ?? 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => onFetchData(transfer)}
                    disabled={!isInStartedState || isFetching}
                    variant="outline"
                    size="sm"
                    className="w-full"
                >
                    {isFetching ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Fetching Data...
                        </>
                    ) : (
                        <>
                            <ArrowDownToLine className="w-4 h-4 mr-2" />
                            Fetch Data
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default DataTransferCard;
