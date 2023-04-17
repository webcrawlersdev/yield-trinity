import useAssets from './Assets';
import Web3Modal from './Ethereum/Web3Modal';
import { BrowserRouter as BR, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import E404Page from './Views/E404Page';
import Home from './Views/Home';
import Dashboard from './Views/Dashoard';
import Page from './Views/Pages';
import Info from './Views/Info';


function App() {
  useAssets()
  return (
    <Web3Modal>
      <BR>
        <ToastContainer position='bottom-right' draggable theme='dark' toastStyle={{ boxShadow: '0 0 1px rgba(255,255,255,0.6) inset', borderRadius: 6, overflow: 'hidden' }} />
        <Routes>
          <Route path='' element={<Home />} />
          <Route path='account' element={<Home />} />
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='recto' element={<Page />} />
          <Route path='info' element={<Info />} />
          <Route path='*' element={<E404Page />} />
        </Routes>
      </BR>
    </Web3Modal>
  );
}

export default App;
