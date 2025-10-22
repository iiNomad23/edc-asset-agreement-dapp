import { Coins, FileText } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar.tsx';
import { Link, useLocation } from 'react-router-dom';

const items = [
    { title: "Assets", url: "/", icon: Coins },
    { title: "Agreements", url: "/agreements", icon: FileText },
    { title: "My NFTs", url: "/nfts", icon: FileText },
];

function isActivePath(pathname: string, url: string) {
    if (url === '/') {
        return pathname === '/';
    }

    return pathname === url || pathname.startsWith(url + '/');
}

export function AppSidebar() {
    const location = useLocation();

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <div className={'flex flex-col gap-2'}>
                        <SidebarGroupLabel className="h-10 flex items-center text-lg font-bold">EDC dApp</SidebarGroupLabel>
                        <hr />
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => {
                                    const isActive = isActivePath(location.pathname, item.url);
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className={`${
                                                    isActive
                                                        ? 'bg-accent text-accent-foreground'
                                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <Link to={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
