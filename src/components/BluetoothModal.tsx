import React, { useState } from 'react';
import { Bluetooth, X, Info, Activity, CheckCircle2, AlertTriangle, RefreshCcw } from 'lucide-react';

interface BluetoothModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BluetoothModal: React.FC<BluetoothModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'connecting' | 'connected' | 'error' | 'unsupported'>('idle');
  const [deviceName, setDeviceName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const checkSupport = () => {
    return (navigator as any).bluetooth !== undefined;
  };

  const handleConnect = async () => {
    if (!checkSupport()) {
      setStatus('unsupported');
      return;
    }

    try {
      setStatus('requesting');
      // Request a generic bluetooth device (heart rate profile as an example)
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'heart_rate', 'health_thermometer']
      });

      setDeviceName(device.name || 'Unknown Device');
      setStatus('connecting');

      if (device.gatt) {
        await device.gatt.connect();
        setStatus('connected');
        
        device.addEventListener('gattserverdisconnected', () => {
          setStatus('idle');
        });
      } else {
        throw new Error('GATT Server not available');
      }
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotFoundError') {
        setStatus('idle'); // User cancelled
      } else {
        setErrorMessage(error.message || 'Failed to connect');
        setStatus('error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center">
            <Bluetooth className="w-6 h-6 text-cyan-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Bluetooth Sync</h3>
            <p className="text-xs text-slate-500">Real Web Bluetooth API</p>
          </div>
        </div>

        {status === 'unsupported' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">
              Bluetooth is not supported on this device/browser. Try Chrome on Android or Desktop.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">
              Connection failed: {errorMessage}
            </p>
          </div>
        )}

        {status === 'connected' && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex gap-3 flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mb-2" />
            <div>
              <h4 className="font-bold text-green-900 text-lg">Connected!</h4>
              <p className="text-sm text-green-800">Paired with: {deviceName}</p>
            </div>
            <p className="text-xs text-green-700 mt-2">Listening for health data...</p>
          </div>
        )}

        {(status === 'requesting' || status === 'connecting') && (
          <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-cyan-800 font-bold">
              {status === 'requesting' ? 'Requesting device permission...' : 'Connecting to GATT Server...'}
            </p>
          </div>
        )}

        {(status === 'idle' || status === 'error' || status === 'unsupported') && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                Connect to compatible Bluetooth medical devices (BP monitor, Oximeter) to automatically sync vitals.
              </p>
            </div>

            <button
              onClick={handleConnect}
              className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Bluetooth className="w-5 h-5" />
              Connect Bluetooth Device
            </button>
          </div>
        )}
        
        {(status === 'connected') && (
           <button
             onClick={() => setStatus('idle')}
             className="w-full py-3 mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
           >
             Disconnect
           </button>
        )}
      </div>
    </div>
  );
};

