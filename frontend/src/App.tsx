import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '@/components/AppLayout.tsx';
import AssetsPage from '@/pages/AssetsPage.tsx';
import AgreementsPage from '@/pages/AgreementsPage.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { path: '/', element: <AssetsPage /> },
            { path: '/agreements', element: <AgreementsPage /> },
        ],
    },
]);

const App = (): React.ReactElement => {
    return <RouterProvider router={router} />;
}

export default App;
