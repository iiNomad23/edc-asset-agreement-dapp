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
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

const items = [
    { title: "Assets", url: "/", icon: Coins },
    { title: "Agreements", url: "/agreements", icon: FileText },
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <div className={'flex flex-col gap-2'}>
                        <SidebarGroupLabel className="h-10 flex items-center text-lg font-bold">EDC dApp</SidebarGroupLabel>
                        <hr />
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link to={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
