import useAssets from './Assets';
import Web3Modal from './Ethereum/Web3Modal';
import { HashRouter as HR, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import E404Page from './Views/E404Page';
import SharedWallet from './Views/SharedWallet';
import Dashboard from './Views/Dashoard';
import Explorer from './Views/Explorer';
import Info from './Views/Info';
import Snipper from './Views/Snipper';
import Arbitrage from './Views/Arbitrage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function App() {
  useAssets()
  return (
    <QueryClientProvider client={new QueryClient}>
      <Web3Modal>
        <HR>
          <ToastContainer position='bottom-right' draggable theme='dark' toastStyle={{ boxShadow: '0 0 1px rgba(255,255,255,0.6) inset', borderRadius: 6, overflow: 'hidden' }} />
          <Routes>
            <Route path='' element={<Dashboard />} />
            <Route path='shared-wallet' element={<SharedWallet />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='explorer' element={<Explorer />} />
            <Route path='snipper' element={<Snipper />} />
            <Route path='info' element={<Info />} />
            <Route path='arbitrade' element={<Arbitrage />} />
            <Route path='*' element={<E404Page />} />
          </Routes>
        </HR>
      </Web3Modal>
    </QueryClientProvider>

  );
}

export default App;
