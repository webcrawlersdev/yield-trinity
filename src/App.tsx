import useAssets from './Assets';
import Web3Modal from './Ethereum/Web3Modal';
import { BrowserRouter as BR, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import E404Page from './Views/E404Page';
import SharedWallet from './Views/SharedWallet';
import Dashboard from './Views/Dashoard';
import Explorer from './Views/Explorer';
import Info from './Views/Info';
import Snipper from './Views/Snipper';


function App() {
  useAssets()
  return (
    <Web3Modal>
      <BR>
        <ToastContainer position='bottom-right' draggable theme='dark' toastStyle={{ boxShadow: '0 0 1px rgba(255,255,255,0.6) inset', borderRadius: 6, overflow: 'hidden' }} />
        <Routes>
          <Route path='' element={<Dashboard />} />
          <Route path='shared-wallet' element={<SharedWallet />} />
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='explorer' element={<Explorer />} />
          <Route path='snipper' element={<Snipper />} />
          <Route path='info' element={<Info />} />
          <Route path='*' element={<E404Page />} />
        </Routes>
      </BR>
    </Web3Modal>
  );
}

export default App;
