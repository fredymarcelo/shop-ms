import {createRoot} from 'react-dom/client'
import './index.css'
import MainPage from '@/app/page.tsx'
import ProductsPage from '@/app/products/page.tsx'
import SalesPage from '@/app/sales/page.tsx'
import {BrowserRouter, Route, Routes} from "react-router";
import {Toaster} from "@/components/ui/sonner"
import {AlertDialogs} from "@/providers/alert-dialogs.tsx";
import {QueryClientProvider} from "@/providers/query-client-provider.tsx";
import {ThemeProvider} from "@/providers/theme-provider.tsx";
import Layout from "@/app/layout.tsx";

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider>
    <ThemeProvider>
      <Toaster/>
      <AlertDialogs/>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<MainPage/>}/>
            <Route path="/products" element={<ProductsPage/>}/>
            <Route path="/sales" element={<SalesPage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
)
