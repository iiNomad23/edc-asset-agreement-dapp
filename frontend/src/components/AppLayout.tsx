import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar.tsx';

const AppLayout = (): React.ReactNode => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 overflow-y-auto p-2">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <SidebarTrigger />
                        <ConnectButton />
                    </div>
                    <hr />
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
};

export default AppLayout;