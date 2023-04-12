import useAssets from './Assets';
import Web3Modal from './Ethereum/Web3Modal';
import Home from './Views/Home';
import { BrowserRouter as BR, Routes, Route, redirect } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useAssets()
  return (
    <Web3Modal>
      <BR>
        <ToastContainer position='bottom-right' draggable theme='dark' toastStyle={{ boxShadow: '0 0 1px rgba(255,255,255,0.6) inset', borderRadius: 6, overflow: 'hidden' }} />
        <Routes>
          <Route path='' element={<Home />} />
          <Route path='dashboard' element={<Home />} />
          <Route path='*' element={"404 PAGE NOT FOUND"} />
        </Routes>
      </BR>
    </Web3Modal>
  );
}

export default App;
