'use client';

import { useState, useEffect, useCallback } from 'react';

const API = '';

// SVG Icons
const TruckIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const PackageIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const HistoryIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 8v4l3 3" />
    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
  </svg>
);

const PinIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CheckIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowLeftIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ClockIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const NavigationIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

const ClipboardIcon = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [factory, setFactory] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [step, setStep] = useState('choose');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [tab, setTab] = useState('deliver');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const w = window.Telegram.WebApp;
      w.ready();
      w.expand();
      w.setHeaderColor('#ffffff');
      w.setBackgroundColor('#ffffff');
      setUser(w.initDataUnsafe?.user || null);
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/api/branches`, { method: 'POST' })
      .then(r => r.json())
      .then(d => { setBranches(d.branches || []); setFactory(d.factory); setDriverInfo(d.driver); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setLocError('Геолокация не поддерживается'); return; }
    const id = navigator.geolocation.watchPosition(
      p => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocError(''); },
      () => setLocError('Включите геолокацию'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const loadHistory = useCallback(() => {
    const id = user?.id || 0;
    if (!id) return;
    fetch(`${API}/api/my-deliveries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: id }),
    }).then(r => r.json()).then(d => setDeliveries(d.deliveries || [])).catch(() => {});
  }, [user]);

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab, loadHistory]);

  const submit = async (type, branchId) => {
    if (!location) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await fetch(`${API}/api/deliver`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: user?.id || 0,
          driver_name: user?.first_name || user?.username || 'Развозчик',
          branch_id: branchId, lat: location.lat, lng: location.lng, type,
        }),
      });
      const d = await r.json();
      if (d.ok) { setResult(d); setStep('done'); }
      else setError(d.message || d.error || 'Ошибка');
    } catch { setError('Ошибка соединения'); }
    setLoading(false);
  };

  const reset = () => { setStep('choose'); setSelectedBranch(null); setResult(null); setError(''); };

  const statusStyles = {
    confirmed: {
      color: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      label: 'Подтверждено',
      icon: (size = 14) => <CheckIcon size={size} color="#16a34a" />
    },
    rejected: {
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      label: 'Отклонено',
      icon: (size = 14) => <CloseIcon size={size} color="#dc2626" />
    },
    pending: {
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      label: 'Ожидает',
      icon: (size = 14) => <ClockIcon size={size} color="#d97706" />
    }
  };

  return (
    <main style={c.container}>
      <div style={c.header}>
        <div style={c.headerTitleContainer}>
          <TruckIcon size={22} style={c.headerTitleIcon} />
          <div style={c.headerTitle}>Трекер доставок</div>
        </div>
        <div style={c.headerSub}>{user ? user.first_name || user.username : driverInfo?.name || 'Развозчик'}</div>
      </div>

      <div style={c.tabsContainer}>
        <div style={c.tabs}>
          <button style={tab === 'deliver' ? c.tabActive : c.tab} onClick={() => { setTab('deliver'); reset(); }}>
            <PackageIcon size={16} />
            <span>Доставка</span>
          </button>
          <button style={tab === 'history' ? c.tabActive : c.tab} onClick={() => setTab('history')}>
            <HistoryIcon size={16} />
            <span>История</span>
          </button>
        </div>
      </div>

      {tab === 'deliver' ? (
        <div style={c.content}>
          <div style={location ? c.locOk : c.locBad}>
            <PinIcon size={15} />
            <span>{location ? 'Геолокация активна' : (locError || 'Определяем геопозицию...')}</span>
          </div>

          {step === 'choose' && (
            <>
              <div style={c.label}>Выберите действие</div>
              <div style={c.btnStack}>
                <button style={location ? c.bigBtn : c.bigOff} disabled={!location} onClick={() => submit('pickup', 0)}>
                  <div style={location ? c.bigIconContainer : c.bigIconContainerOff}>
                    <PackageIcon size={20} />
                  </div>
                  <span style={c.bigBtnTitle}>Забрал с фабрики</span>
                  <span style={c.bigSub}>{factory?.name} · {factory?.address}</span>
                </button>
                <button style={location ? c.bigBtn : c.bigOff} disabled={!location} onClick={() => setStep('deliver')}>
                  <div style={location ? c.bigIconContainer : c.bigIconContainerOff}>
                    <TruckIcon size={20} />
                  </div>
                  <span style={c.bigBtnTitle}>Доставка на филиал</span>
                  <span style={c.bigSub}>Выберите филиал назначения</span>
                </button>
              </div>
            </>
          )}

          {step === 'deliver' && (
            <>
              <div style={c.label}>Выберите филиал</div>
              <div style={c.branchList}>
                {branches.map(b => (
                  <button key={b.id} style={selectedBranch === b.id ? c.brA : c.br}
                    onClick={() => setSelectedBranch(b.id)}>
                    <div style={c.brName}>{b.name}</div>
                    <div style={c.brAddr}>{b.address}</div>
                  </button>
                ))}
              </div>
              <button style={selectedBranch && !loading ? c.submit : c.submitOff}
                disabled={!selectedBranch || loading}
                onClick={() => selectedBranch && submit('delivery', selectedBranch)}>
                {loading ? 'Отправка...' : (
                  <>
                    <CheckIcon size={16} />
                    <span>Подтвердить доставку</span>
                  </>
                )}
              </button>
              <button style={c.back} onClick={reset}>
                <ArrowLeftIcon size={16} />
                <span>Назад</span>
              </button>
            </>
          )}

          {step === 'done' && result && (
            <div style={c.resOk}>
              <div style={c.resOkIcon}>
                <CheckIcon size={22} color="#16a34a" />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>Отправлено!</div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{result.branch_name}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 1 }}>{result.distance} м от точки</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 12, lineHeight: 1.4 }}>Ожидайте подтверждения управляющего</div>
              <button style={c.again} onClick={reset}>Новая доставка</button>
            </div>
          )}

          {error && (
            <div style={c.resErr}>
              <div style={c.resErrIcon}>
                <CloseIcon size={22} color="#dc2626" />
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>{error}</div>
              <button style={c.againR} onClick={() => setError('')}>Понятно</button>
            </div>
          )}
        </div>
      ) : (
        <div style={c.content}>
          {deliveries.length === 0 ? (
            <div style={c.empty}>
              <ClipboardIcon size={28} style={{ marginBottom: 4 }} />
              <div>Нет доставок</div>
            </div>
          ) : (
            <div style={c.histList}>
              {deliveries.map(d => {
                const status = statusStyles[d.status] || statusStyles.pending;
                return (
                  <div key={d.id} style={c.histCard}>
                    <div style={c.histTop}>
                      <span style={c.histTypeIcon}>
                        {d.type === 'pickup' ? <PackageIcon size={15} /> : <TruckIcon size={15} />}
                      </span>
                      <span style={{ 
                        ...c.histStatusContainer, 
                        color: status.color,
                        background: status.bg,
                        border: `1px solid ${status.border}`
                      }}>
                        {status.icon(12)}
                        <span>{status.label}</span>
                      </span>
                    </div>
                    <div style={c.histBr}>{d.branch_name}</div>
                    <div style={c.histMeta}>
                      <div style={c.histMetaItem}>
                        <ClockIcon size={12} />
                        <span>{d.created_at}</span>
                      </div>
                      <div style={c.histMetaItem}>
                        <NavigationIcon size={12} />
                        <span>{d.distance} м</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

const c = {
  container: { 
    minHeight: '100vh', 
    background: '#ffffff', 
    color: '#18181b', 
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
    paddingBottom: 40 
  },
  header: { 
    padding: '24px 20px 16px', 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4
  },
  headerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  headerTitleIcon: {
    color: '#18181b'
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 700, 
    color: '#18181b', 
    letterSpacing: '-0.5px' 
  },
  headerSub: { 
    fontSize: 13, 
    color: '#71717a', 
    marginTop: 2,
    fontWeight: 500
  },
  tabsContainer: {
    padding: '0 20px 20px'
  },
  tabs: { 
    display: 'flex', 
    background: '#f4f4f5',
    padding: 4,
    borderRadius: 12,
    gap: 4
  },
  tab: { 
    flex: 1, 
    padding: '8px 0', 
    border: 'none', 
    borderRadius: 8, 
    background: 'transparent', 
    color: '#71717a', 
    fontSize: 13, 
    fontWeight: 600, 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s ease'
  },
  tabActive: { 
    flex: 1, 
    padding: '8px 0', 
    border: 'none', 
    borderRadius: 8, 
    background: '#ffffff', 
    color: '#18181b', 
    fontSize: 13, 
    fontWeight: 600, 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)',
    transition: 'all 0.2s ease'
  },
  content: { 
    padding: '0 20px' 
  },
  locOk: { 
    padding: '10px 14px', 
    borderRadius: 10, 
    background: '#f0fdf4', 
    border: '1px solid #bbf7d0', 
    color: '#16a34a', 
    fontSize: 13, 
    fontWeight: 500,
    marginBottom: 20, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  locBad: { 
    padding: '10px 14px', 
    borderRadius: 10, 
    background: '#fef2f2', 
    border: '1px solid #fecaca', 
    color: '#dc2626', 
    fontSize: 13, 
    fontWeight: 500,
    marginBottom: 20, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  label: { 
    fontSize: 11, 
    color: '#71717a', 
    marginBottom: 10, 
    fontWeight: 700, 
    textTransform: 'uppercase', 
    letterSpacing: '1px' 
  },
  btnStack: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 12 
  },
  bigBtn: { 
    padding: '18px 16px', 
    borderRadius: 14, 
    border: '1px solid #e4e4e7', 
    background: '#ffffff', 
    color: '#18181b', 
    cursor: 'pointer', 
    textAlign: 'left', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 4,
    transition: 'all 0.2s ease',
    alignItems: 'flex-start'
  },
  bigIconContainer: {
    background: '#f4f4f5',
    color: '#18181b',
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  bigBtnTitle: {
    fontSize: 15,
    fontWeight: 600
  },
  bigSub: { 
    fontSize: 12, 
    color: '#71717a', 
    marginTop: 2,
    lineHeight: 1.4
  },
  bigOff: { 
    padding: '18px 16px', 
    borderRadius: 14, 
    border: '1px solid #e4e4e7', 
    background: '#fafafa', 
    color: '#a1a1aa', 
    cursor: 'not-allowed', 
    textAlign: 'left', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 4,
    opacity: 0.65
  },
  bigIconContainerOff: {
    background: '#f4f4f5',
    color: '#a1a1aa',
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  branchList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 8, 
    marginBottom: 20 
  },
  br: { 
    padding: '14px 16px', 
    borderRadius: 10, 
    border: '1px solid #e4e4e7', 
    background: '#ffffff', 
    color: '#18181b', 
    cursor: 'pointer', 
    textAlign: 'left',
    transition: 'all 0.2s ease'
  },
  brA: { 
    padding: '14px 16px', 
    borderRadius: 10, 
    border: '2px solid #18181b', 
    background: '#ffffff', 
    color: '#18181b', 
    cursor: 'pointer', 
    textAlign: 'left', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.2s ease'
  },
  brName: { 
    fontSize: 14, 
    fontWeight: 600 
  },
  brAddr: { 
    fontSize: 12, 
    color: '#71717a', 
    marginTop: 3 
  },
  submit: { 
    width: '100%', 
    padding: 16, 
    borderRadius: 12, 
    border: 'none', 
    background: '#18181b', 
    color: '#ffffff', 
    fontSize: 15, 
    fontWeight: 600, 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 0.2s ease'
  },
  submitOff: { 
    width: '100%', 
    padding: 16, 
    borderRadius: 12, 
    border: 'none', 
    background: '#f4f4f5', 
    color: '#a1a1aa', 
    fontSize: 15, 
    fontWeight: 600, 
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  back: { 
    width: '100%', 
    padding: 12, 
    borderRadius: 10, 
    border: 'none', 
    background: 'transparent', 
    color: '#71717a', 
    fontSize: 14, 
    fontWeight: 500,
    cursor: 'pointer', 
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  resOk: { 
    padding: '24px 20px', 
    borderRadius: 14, 
    background: '#f0fdf4', 
    border: '1px solid #bbf7d0', 
    color: '#166534', 
    fontSize: 14, 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6
  },
  resOkIcon: {
    color: '#16a34a',
    background: '#ffffff',
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.1)',
    marginBottom: 6
  },
  resErr: { 
    padding: 20, 
    borderRadius: 14, 
    background: '#fef2f2', 
    border: '1px solid #fecaca', 
    color: '#991b1b', 
    fontSize: 14, 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6
  },
  resErrIcon: {
    color: '#dc2626',
    background: '#ffffff',
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)',
    marginBottom: 6
  },
  again: { 
    marginTop: 16, 
    padding: '10px 20px', 
    borderRadius: 10, 
    border: '1px solid #bbf7d0', 
    background: '#ffffff', 
    color: '#166534', 
    fontSize: 14, 
    fontWeight: 600, 
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  againR: { 
    marginTop: 12, 
    padding: '8px 16px', 
    borderRadius: 10, 
    border: '1px solid #fecaca', 
    background: '#ffffff', 
    color: '#991b1b', 
    fontSize: 14, 
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  empty: { 
    textAlign: 'center', 
    color: '#71717a', 
    padding: '60px 20px', 
    fontSize: 14,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8
  },
  histList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 10 
  },
  histCard: { 
    padding: '14px 16px', 
    borderRadius: 12, 
    border: '1px solid #e4e4e7', 
    background: '#ffffff'
  },
  histTop: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 8 
  },
  histTypeIcon: {
    color: '#71717a',
    background: '#f4f4f5',
    padding: 6,
    borderRadius: 8,
    display: 'inline-flex'
  },
  histStatusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600
  },
  histBr: { 
    fontSize: 14, 
    fontWeight: 600, 
    color: '#18181b', 
    marginBottom: 8 
  },
  histMeta: { 
    display: 'flex', 
    gap: 12,
    fontSize: 12, 
    color: '#71717a',
    borderTop: '1px solid #f4f4f5',
    paddingTop: 8,
    marginTop: 4
  },
  histMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  }
};
