import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { ArrowRightLeft, FileText, LucideProps, Package, Shield } from 'lucide-react';
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

type PageItem = {
    type: 'page';
    title: string;
    url: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
};
type SeparatorItem = {
    type: 'separator';
};
type SidebarItem = PageItem | SeparatorItem;

const items: SidebarItem[] = [
    { type: 'page', title: 'Assets', url: '/', icon: Package },
    { type: 'page', title: 'Agreements', url: '/agreements', icon: FileText },
    { type: 'separator' },
    { type: 'page', title: 'Transfers', url: '/transfers', icon: ArrowRightLeft },
    { type: 'page', title: 'My NFTs', url: '/nfts', icon: Shield },
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
                                {items.map((item, index) => {
                                    if (item.type === 'separator') {
                                        return <hr key={`sep-${index}`} className="border-border my-1" />;
                                    }

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
