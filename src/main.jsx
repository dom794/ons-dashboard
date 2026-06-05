import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';

import Layout   from "./components/Layout";
import Home     from "./pages/Home";
import Datasets from "./pages/Datasets";
import NotFound from './pages/NotFound';
import DatasetDashboard from "./components/DatasetDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, 
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/datasets",
        element: <Datasets />,
        children: [
          { index: true, element: <div>Select an ONS dataset from the left sidebar to load the analytics dashboard.</div> },
          { path: ":datasetId", element: <DatasetDashboard /> }
        ]
      },
      {
        path: "*",
        element: <NotFound />,
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
);