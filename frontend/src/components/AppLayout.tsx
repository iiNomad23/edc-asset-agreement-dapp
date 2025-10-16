import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';

const AppLayout = (): React.ReactNode => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="flex-shrink-0 bg-background border-b p-2">
                    <div className="flex justify-between items-center">
                        <SidebarTrigger />
                        <ConnectButton />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4">
                    <Outlet />
                </main>
                <Toaster />
            </div>
        </SidebarProvider>
    );
};

export default AppLayout;