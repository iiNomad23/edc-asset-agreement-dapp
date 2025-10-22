import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout.tsx';
import AssetsPage from '@/pages/AssetsPage.tsx';
import AgreementsPage from '@/pages/AgreementsPage.tsx';
import MyNFTsPage from '@/pages/MyNFTsPage.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { path: '/', element: <AssetsPage /> },
            { path: '/agreements', element: <AgreementsPage /> },
            { path: '/nfts', element: <MyNFTsPage /> },
        ],
    },
]);

const App = (): React.ReactElement => {
    return <RouterProvider router={router} />;
}

export default App;
