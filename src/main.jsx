// Check saved preference first
const savedTheme = localStorage.getItem("theme");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const root = document.documentElement;

if (savedTheme === "dark" || (!savedTheme && prefersDarkMode)) {
  root.classList.add("dark");
  root.setAttribute("data-theme", "dark");
} else {
  root.classList.remove("dark");
  root.setAttribute("data-theme", "light");
}


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './Router/router.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}> </RouterProvider>
  </StrictMode>,
)
