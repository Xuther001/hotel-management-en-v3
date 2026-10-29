import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode, useRef } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, CalendarDays, Users, Wallet, Package, Wrench,
  ChartNoAxesCombined, Settings, Bell, Search, Menu, Plus, ArrowUpRight, ArrowDownRight,
  CheckCircle2, AlertTriangle, Clock3, ChevronDown, Building2, LogOut, X, RefreshCw,
  UserRound, CalendarCheck, ClipboardList, FileText, CircleDollarSign, Sparkles, BookOpen
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { api, money, API_URL, clearAuthToken } from './api';
import { LanguageToggle, initializeAccountLanguage, clearAccountLanguage, useLanguage } from './i18n';

async function downloadBackup(
  url: string,
  filename: string,
  setMessage: (message: string) => void,
  setState: (state: 'idle' | 'sending' | 'success' | 'error') => void
) {
  setState('sending');
  setMessage('Preparing download...');

  try {
    const token = localStorage.getItem('hotel_auth_token');
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      let message = `Download failed (${response.status}).`;
      try {
        const body = await response.json();
        if (body.error) message = body.error;
      } catch {
        // Keep the HTTP status message if the response isn't JSON.
      }
      throw new Error(message);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);

    setState('success');
    setMessage(`Download started: ${filename}`);
  } catch (error) {
    setState('error');
    setMessage(error instanceof Error ? error.message : 'Download failed.');
  }
}

type AnyRow = Record<string, any>;
type AuthUser = {
  id: string;
  username: string;
  name: string;
  role: string;
  propertyIds?: string[];
  language?: 'en' | 'vi';
};
const navGroups: { label: string; items: { to: string; label: string; icon: any; nested?: boolean }[] }[] = [
  { label: 'WORKSPACE', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/reservations', label: 'Reservations', icon: CalendarDays },
    { to: '/reservation-calendar', label: 'Reservation Calendar', icon: CalendarCheck },
    { to: '/rooms', label: 'Room management', icon: BedDouble },
  ]},
  { label: 'OPERATIONS', items: [
    { to: '/employees', label: 'Human resources', icon: Users },
    { to: '/finance', label: 'Finance & expenses', icon: Wallet },
    { to: '/finance/billing', label: 'Guest billing register', icon: FileText, nested: true },
    { to: '/finance/installments', label: 'Monthly installment breakdown', icon: CalendarDays, nested: true },
    { to: '/finance/payments', label: 'Payment history', icon: CircleDollarSign, nested: true },
    { to: '/finance/expenses', label: 'Expenses', icon: Wallet, nested: true },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },

  ]},
  { label: 'MANAGEMENT', items: [
    { to: '/reports', label: 'Reports & analytics', icon: ChartNoAxesCombined },
    { to: '/help', label: 'Help & User Guide', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]}
];
const titleMap: Record<string, string> = {
  '/': 'Business overview', '/reservations': 'Reservations', '/reservation-calendar': 'Reservation Calendar', '/rooms': 'Room management',
  '/employees': 'Human resources', '/finance': 'Finance & expenses',
  '/finance/billing': 'Guest billing register',
  '/finance/installments': 'Monthly installment breakdown',
  '/finance/payments': 'Payment history',
  '/finance/expenses': 'Expenses',
  '/inventory': 'Inventory',
  '/maintenance': 'Maintenance', '/reports': 'Reports & analytics', '/help': 'Help & User Guide', '/settings': 'Settings'
};
function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false }: { children: ReactNode; onClick?: () => void; variant?: string; type?: 'button'|'submit'; disabled?: boolean }) {
  return <button type={type} className={`button ${variant}`} onClick={onClick} disabled={disabled}>{children}</button>;
}
function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="panel"><div className="panel-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty"><ClipboardList size={24}/><strong>{title}</strong><span>{text}</span></div>;
}

function LoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await api.login(username.trim(), password);
      const authenticatedUser = result.data.user as AuthUser;
      await initializeAccountLanguage(authenticatedUser.language);
      onLogin(authenticatedUser);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-screen"><LanguageToggle />
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-brand"><div className="brand-mark"><Building2 size={22}/></div>
        <div><strong>Haven Group</strong><span>HOTEL MANAGEMENT</span></div>
      </div>
      <h1>Welcome back</h1>
      <p>Sign in to access your hotel management workspace.</p>
      <label htmlFor="login-username">Username</label>
      <input id="login-username" autoComplete="username" value={username}
        onChange={e => setUsername(e.target.value)} required />
      <label htmlFor="login-password">Password</label>
      <input id="login-password" type="password" autoComplete="current-password"
        value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button className="button primary auth-submit" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <span className="auth-footnote">Authorized staff only</span>
    </form>
  </div>;
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;
    api.me()
      .then(async result => {
        const authenticatedUser = result.data as AuthUser;
        if (active) {
          await initializeAccountLanguage(authenticatedUser.language);
          if (active) setUser(authenticatedUser);
        }
      })
      .catch(() => {
        clearAuthToken();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });
    return () => { active = false; };
  }, []);

  if (!authChecked) {
    return <div className="auth-screen"><div className="loading"><RefreshCw className="spin"/> Checking sign-in…</div></div>;
  }

  if (!user) return <LoginScreen onLogin={setUser}/>;

  return <AuthenticatedApp user={user} onLogout={() => {
    void api.logout().catch(error => {
      console.error('Server logout failed:', error);
    }).finally(() => {
      clearAuthToken();
      clearAccountLanguage();
      setUser(null);
    });
  }}/>;
}

function AuthenticatedApp({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [property, setProperty] = useState('all');
  const [properties, setProperties] = useState<AnyRow[]>([]);
  const [search, setSearch] = useState('');
  const [reservationCount, setReservationCount] = useState<number | null>(null);

  const refreshReservationCount = useCallback(async () => {
    try {
      const r = await api.reservations('', property);
      const activeStatuses = ['Confirmed', 'Arriving today', 'Checked in'];
      setReservationCount(
        (r.data || []).filter((reservation: AnyRow) =>
          activeStatuses.includes(reservation.status)
        ).length
      );
    } catch {
      setReservationCount(null);
    }
  }, [property]);

  useEffect(() => {
    let active = true;
    const activeStatuses = ['Confirmed', 'Arriving today', 'Checked in'];
    api.reservations('', property)
      .then(r => {
        if (active) {
          setReservationCount(
            (r.data || []).filter((reservation: AnyRow) =>
              activeStatuses.includes(reservation.status)
            ).length
          );
        }
      })
      .catch(() => {
        if (active) setReservationCount(null);
      });
    return () => { active = false; };
  }, [property]);
  const location = useLocation();
  const isVietnamese = useLanguage() === 'vi';
  const pageTitle = isVietnamese
    ? ({ '/help': 'Hướng dẫn sử dụng' }[location.pathname] || titleMap[location.pathname] || 'Quản lý doanh nghiệp')
    : (titleMap[location.pathname] || 'Business management');
  useEffect(() => { api.properties().then(r => setProperties(r.data)).catch(() => {}); }, []);
  return <div className="app-shell">
    <div aria-hidden="true" style={{ display: 'none' }}>
      <LanguageToggle />
    </div>
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Building2 size={20}/></div><div><strong>Haven Group</strong><span>BUSINESS MANAGEMENT</span></div><button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="workspace-select"><div className="workspace-icon"><Building2 size={17}/></div><div><span>WORKSPACE</span><strong>Hospitality Group</strong></div><ChevronDown size={15}/></div>
      <nav>{navGroups.map(group => <div className="nav-group" key={group.label}><span className="nav-label">{group.label}</span>{group.items.map(item => { const Icon = item.icon; return <NavLink end={item.to === '/' || item.to === '/finance'} to={item.to} key={item.to} onClick={() => setSidebarOpen(false)} className={({isActive}) => `nav-link ${item.nested ? 'nav-sub-link' : ''} ${isActive ? 'active' : ''}`}><Icon size={item.nested ? 16 : 18}/><span>{item.to === '/help' && isVietnamese ? 'Hướng dẫn sử dụng' : item.label}</span>{item.to === '/reservations' && <small className="nav-count">{reservationCount === null ? "—" : reservationCount}</small>}</NavLink>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="user-mini"><div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.role}</span></div><button className="icon-button" title="Sign out" onClick={onLogout}><LogOut size={16}/></button></div></div>
    </aside>
    {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button><div className="breadcrumbs">Workspace <span>/</span> <strong>{pageTitle}</strong></div></div><div className="top-actions"><label className="property-filter"><Building2 size={16}/><select value={property} onChange={e => setProperty(e.target.value)}><option value="all">All hotels</option>{properties.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select><ChevronDown size={14}/></label><button className="icon-button top-search" onClick={() => document.getElementById('global-search')?.focus()} title="Search"><Search size={18}/></button><button className="icon-button notification" title="Notifications" onClick={() => alert('Demo notifications: 3 maintenance tasks and 2 contract renewals require attention.')}><Bell size={18}/><i/></button><div className="top-divider"/><div className="top-user"><div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.role}</span></div><ChevronDown size={14}/></div></div></header>
      <div className="page-wrap"><Routes>
        <Route path="/" element={<Dashboard property={property}/>} />
        <Route path="/reservations" element={<Reservations property={property} onReservationCountChange={refreshReservationCount} />} />
        <Route path="/reservation-calendar" element={<ReservationCalendar property={property} />} />
        <Route path="/rooms" element={<Rooms property={property} isAdmin={user.role === 'Admin'}/>} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/finance" element={<Navigate to="/finance/billing" replace />} />
        <Route path="/finance/billing" element={<Finance section="billing" />} />
        <Route path="/finance/installments" element={<Finance section="installments" />} />
        <Route path="/finance/payments" element={<Finance section="payments" />} />
        <Route path="/finance/expenses" element={<Finance section="expenses" />} />
        <Route path="/inventory" element={<ComingSoon title="Inventory management" description="Track supplies, stock levels, purchase orders, and transfers between your properties." icon={<Package/>}/>} />
        <Route path="/maintenance" element={<Maintenance />} />

        <Route path="/reports" element={<Reports property={property}/>} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes><footer>© 2026 Haven Group <span>Internal management system · Local API data</span></footer></div>
    </main>
  </div>;
}
function HelpPage() {
  const vi = useLanguage() === 'vi';

  const topics = [
    {
      title: vi ? '1. Tổng quan và chọn khách sạn' : '1. Dashboard and hotel selection',
      summary: vi ? 'Xem hoạt động và chọn phạm vi khách sạn.' : 'Review operations and choose the hotel scope.',
      steps: vi
        ? [
            'Mở Tổng quan để xem thông tin hoạt động hiện có.',
            'Dùng bộ chọn khách sạn ở thanh trên cùng để chọn một khách sạn hoặc Tất cả khách sạn.',
            'Kiểm tra phạm vi khách sạn trước khi xem số liệu hoặc báo cáo.'
          ]
        : [
            'Open Dashboard to review the available operational information.',
            'Use the hotel selector in the top bar to choose one hotel or All hotels.',
            'Check the hotel scope before reviewing figures or reports.'
          ]
    },
    {
      title: vi ? '2. Đặt phòng và lịch đặt phòng' : '2. Reservations and calendar',
      summary: vi ? 'Theo dõi đặt phòng, thông tin khách và ngày lưu trú.' : 'Review bookings, guest details, and stay dates.',
      steps: vi
        ? [
            'Mở Đặt phòng để xem và thao tác với các đặt phòng.',
            'Kiểm tra tên khách, phòng, ngày nhận phòng, ngày trả phòng và trạng thái trước khi lưu.',
            'Mở Lịch đặt phòng để xem lịch nhận và trả phòng.',
            'Kiểm tra khách sạn và dữ liệu đã chọn trước khi xuất Excel.'
          ]
        : [
            'Open Reservations to review and manage bookings.',
            'Check the guest name, room, arrival date, departure date, and status before saving.',
            'Open Reservation Calendar to review scheduled arrivals and departures.',
            'Verify the selected hotel and data before exporting to Excel.'
          ]
    },
    {
      title: vi ? '3. Quản lý phòng' : '3. Room management',
      summary: vi ? 'Theo dõi tình trạng phòng, vệ sinh và ghi chú.' : 'Track occupancy, housekeeping, and room notes.',
      steps: vi
        ? [
            'Mở Quản lý phòng và xác nhận đúng số phòng, khách sạn.',
            'Trạng thái sử dụng phòng gồm Có khách, Trống hoặc Bảo trì.',
            'Trạng thái vệ sinh là riêng biệt: Sạch hoặc Bẩn.',
            'Đọc ghi chú phòng trước khi bàn giao hoặc cập nhật.'
          ]
        : [
            'Open Room Management and confirm the room number and hotel.',
            'Occupancy statuses are Occupied, Vacant, and Maintenance.',
            'Housekeeping status is separate: Clean or Dirty.',
            'Review room notes before handover or updates.'
          ]
    },
    {
      title: vi ? '4. Nhân sự' : '4. Human resources',
      summary: vi ? 'Xem và cập nhật thông tin nhân viên theo quyền được cấp.' : 'Review and update employee information according to your permissions.',
      steps: vi
        ? [
            'Mở Nhân sự để xem danh sách nhân viên.',
            'Kiểm tra thông tin và chức danh trước khi chỉnh sửa.',
            'Chỉ cập nhật thông tin bạn được phép quản lý.'
          ]
        : [
            'Open Human Resources to review the employee list.',
            'Check employee information and job titles before editing.',
            'Only update information you are authorized to manage.'
          ]
    },
    {
      title: vi ? '5. Hóa đơn và thanh toán' : '5. Billing and payments',
      summary: vi ? 'Phân biệt hóa đơn, lịch thanh toán và lịch sử thanh toán.' : 'Understand billing, installment schedules, and payment history.',
      steps: vi
        ? [
            'Mở Sổ ghi nhận hóa đơn khách để xem các khoản thu và số dư hiển thị.',
            'Mở Phân tích thanh toán theo tháng để xem lịch thanh toán theo đợt.',
            'Mở Lịch sử thanh toán để kiểm tra các khoản đã ghi nhận.',
            'Kiểm tra thông tin trước khi ghi nhận thanh toán hoặc thay đổi cấu hình tính phí.'
          ]
        : [
            'Open Guest Billing Register to review displayed charges and balances.',
            'Open Monthly Installment Breakdown to review installment schedules.',
            'Open Payment History to check recorded payments.',
            'Verify details before recording payments or changing billing configuration.'
          ]
    },
    {
      title: vi ? '6. Chi phí' : '6. Expenses',
      summary: vi ? 'Theo dõi chi phí hoạt động.' : 'Review operating expenses.',
      steps: vi
        ? [
            'Mở Chi phí để xem các khoản chi đã được ghi nhận.',
            'Kiểm tra số tiền, ngày và thông tin liên quan trước khi thêm hoặc chỉnh sửa dữ liệu.',
            'Đối chiếu chứng từ thực tế theo quy trình của khách sạn.'
          ]
        : [
            'Open Expenses to review recorded operating costs.',
            'Verify amounts, dates, and related details before adding or editing records.',
            'Reconcile entries with actual supporting documents according to hotel procedures.'
          ]
    },
    {
      title: vi ? '7. Bảo trì và kho vật tư' : '7. Maintenance and inventory',
      summary: vi ? 'Kiểm tra công việc bảo trì và trạng thái tính năng kho.' : 'Review maintenance work and inventory feature availability.',
      steps: vi
        ? [
            'Mở Bảo trì để xem các công việc được theo dõi.',
            'Kiểm tra nội dung và trạng thái trước khi cập nhật.',
            'Kho vật tư hiện có thể hiển thị thông báo đang phát triển; không xem đó là xác nhận tồn kho thực tế.'
          ]
        : [
            'Open Maintenance to review tracked maintenance work.',
            'Check task details and status before updating.',
            'Inventory may currently show a coming-soon message; do not treat it as confirmation of actual stock levels.'
          ]
    },
    {
      title: vi ? '8. Báo cáo và phân tích' : '8. Reports and analytics',
      summary: vi ? 'Xem báo cáo trong phạm vi khách sạn đã chọn.' : 'Review reports for the selected hotel scope.',
      steps: vi
        ? [
            'Mở Báo cáo & phân tích.',
            'Kiểm tra khách sạn và kỳ báo cáo trước khi diễn giải số liệu.',
            'Xác minh dữ liệu nguồn và quy tắc tính toán trước khi dùng số liệu cho kế toán hoặc quyết định kinh doanh.'
          ]
        : [
            'Open Reports & Analytics.',
            'Check the selected hotel and reporting period before interpreting figures.',
            'Verify source data and calculation rules before relying on figures for accounting or business decisions.'
          ]
    },
    {
      title: vi ? '9. Cài đặt và thông báo' : '9. Settings and notifications',
      summary: vi ? 'Kiểm tra tùy chọn ứng dụng và thông báo.' : 'Review application settings and notifications.',
      steps: vi
        ? [
            'Mở Cài đặt để xem các tùy chọn hiện có.',
            'Dùng nút ngôn ngữ nếu có để chuyển giữa tiếng Việt và English.',
            'Nếu thông báo không xuất hiện, kiểm tra quyền thông báo của trình duyệt và thiết bị.',
            'Không chia sẻ thông tin đăng nhập với người khác.'
          ]
        : [
            'Open Settings to review the available options.',
            'Use the language control, when available, to switch between Vietnamese and English.',
            'If notifications do not appear, check browser and device notification permissions.',
            'Do not share login credentials with others.'
          ]
    },
    {
      title: vi ? '10. Quy trình làm việc hằng ngày' : '10. Recommended daily workflow',
      summary: vi ? 'Danh sách kiểm tra đầu ca, nhận phòng, trả phòng và cuối ca.' : 'A checklist for shift start, guest arrivals, departures, and shift end.',
      steps: vi
        ? [
            'Đầu ca: chọn đúng khách sạn, xem đặt phòng và lịch nhận/trả phòng.',
            'Khách đến: xác minh đặt phòng, thông tin khách và phòng trước khi làm thủ tục.',
            'Khách trả phòng: xác minh đặt phòng, thông tin thanh toán và tình trạng phòng.',
            'Cuối ca: kiểm tra cập nhật đặt phòng, tình trạng phòng, khoản thanh toán và công việc còn tồn.',
            'Báo quản lý nếu dữ liệu không khớp hoặc thao tác chưa hoàn tất.'
          ]
        : [
            'Start of shift: select the correct hotel and review reservations and the arrival/departure calendar.',
            'Guest arrival: verify the booking, guest details, and room before completing check-in.',
            'Guest departure: verify the booking, payment information, and room condition.',
            'End of shift: review reservation updates, room conditions, recorded payments, and outstanding work.',
            'Tell a manager if records do not match or an operation remains incomplete.'
          ]
    }
  ];

  return <>
    <PageHeader
      eyebrow={vi ? 'TRỢ GIÚP' : 'HELP & SUPPORT'}
      title={vi ? 'Hướng dẫn sử dụng' : 'Help & User Guide'}
      description={vi
        ? 'Hướng dẫn nhanh cho nhân viên lễ tân, vận hành và quản lý khách sạn.'
        : 'A practical guide for front desk staff, hotel operations, and management.'}
    />
    <Panel
      title={vi ? 'Bắt đầu tại đây' : 'Start here'}
      subtitle={vi ? 'Chọn một chủ đề để xem hướng dẫn.' : 'Select a topic to read its instructions.'}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        {topics.map((topic, index) => (
          <details
            key={topic.title}
            open={index === 0 ? undefined : false}
            style={{
              border: '1px solid var(--border, #e2e8f0)',
              borderRadius: 10,
              padding: '13px 15px',
              background: 'var(--panel, #fff)'
            }}
          >
            <summary style={{
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              lineHeight: 1.5
            }}>
              {topic.title}
              <div style={{
                fontWeight: 400,
                fontSize: 12,
                color: 'var(--muted, #718096)',
                marginTop: 4
              }}>
                {topic.summary}
              </div>
            </summary>
            <ol style={{
              paddingLeft: 22,
              margin: '14px 0 2px',
              fontSize: 12.5,
              lineHeight: 1.8
            }}>
              {topic.steps.map((step, i) => (
                <li key={i} style={{ paddingLeft: 3, marginBottom: 7 }}>{step}</li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </Panel>
    <div style={{
      marginTop: 16,
      border: '1px solid var(--border, #e2e8f0)',
      borderRadius: 10,
      padding: 15,
      fontSize: 12,
      lineHeight: 1.7
    }}>
      <strong>{vi ? 'Lưu ý về dữ liệu' : 'Data reminder'}</strong>
      <p style={{ margin: '6px 0 0' }}>
        {vi
          ? 'Kiểm tra thông tin trước khi lưu thay đổi. Xác minh dữ liệu nguồn và quy tắc tính toán trước khi sử dụng số liệu báo cáo. Chỉ chia sẻ thông tin khách trong phạm vi được phép.'
          : 'Verify information before saving changes. Check source data and calculation rules before relying on report figures. Share guest information only through authorized channels.'}
      </p>
    </div>
  </>;
}

function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow || 'OVERVIEW'}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="header-actions">{actions}</div>}</div>;
}
function StatCard({ title, value, change, icon, positive = true, note }: { title: string; value: string; change?: string; icon: ReactNode; positive?: boolean; note?: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{title}</span><div className="stat-icon">{icon}</div></div><strong className="stat-value">{value}</strong><div className="stat-bottom">{change && <span className={positive ? 'trend up' : 'trend down'}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {change}</span>}<span>{note || 'vs. previous period'}</span></div></div>;
}
function Dashboard({ property }: { property: string }) {
  const language = useLanguage();
  const isVietnamese = language === 'vi';
  const [data, setData] = useState<AnyRow | null>(null);
  const [activityMonth, setActivityMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [popularityPeriod, setPopularityPeriod] = useState('30');
  const [popularity, setPopularity] = useState<AnyRow | null>(null);
  const [popularityLoading, setPopularityLoading] = useState(true);
  const [popularityError, setPopularityError] = useState('');
  useEffect(() => { api.overview(property).then(r => {setData(r.data); setError('');}).catch(e => setError(e.message)); }, [property, refresh]);
  useEffect(() => {
    let active = true;
    setPopularityLoading(true);
    api.roomPopularity(property, popularityPeriod)
      .then(r => {
        if (active) {
          setPopularity(r.data);
          setPopularityError('');
        }
      })
      .catch(e => {
        if (active) setPopularityError(e.message || 'Could not load room popularity.');
      })
      .finally(() => {
        if (active) setPopularityLoading(false);
      });
    return () => { active = false; };
  }, [property, popularityPeriod, refresh]);
  if (error) return <ErrorState error={error} retry={() => setRefresh(x => x + 1)}/>;
  if (!data) return <div className="loading"><RefreshCw className="spin"/> Loading dashboard…</div>;
  return <>
    <PageHeader eyebrow={new Intl.DateTimeFormat(isVietnamese ? 'vi-VN' : 'en-US', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()} title="Dashboard" description="A live overview based on your saved hotel records." actions={<Button variant="secondary" onClick={() => setRefresh(x => x + 1)}><RefreshCw size={15}/> Refresh</Button>}/>

    <div className="stat-grid">
      <StatCard title="Completed stay revenue" value={money(data.revenue)} icon={<CircleDollarSign size={19}/>} note="completed checkouts this month"/>
      <StatCard title="Operating profit" value={data.operatingProfit == null ? "—" : money(data.operatingProfit)} icon={<ChartNoAxesCombined size={19}/>} note="unavailable · reconcile expenses"/>
      <StatCard title="Room occupancy" value={`${data.occupancy}%`} icon={<BedDouble size={19}/>} note="occupied rooms / available rooms"/>
      <StatCard title="Active employees" value={String(data.employeeCount)} icon={<Users size={19}/>} note="active staff records"/>
    </div>
    <div className="content-grid two-one">
      <Panel title="Revenue performance" subtitle="Completed stay amounts by checkout month · VND millions" action={<button className="text-button" onClick={() => window.location.href='/reports'}>View report <ArrowUpRight size={14}/></button>}>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.revenueTrend.map((item: AnyRow) => {
          if (!isVietnamese) return item;
          const months: Record<string, string> = {
            Jan: 'Th1', Feb: 'Th2', Mar: 'Th3', Apr: 'Th4',
            May: 'Th5', Jun: 'Th6', Jul: 'Th7', Aug: 'Th8',
            Sep: 'Th9', Oct: 'Th10', Nov: 'Th11', Dec: 'Th12',
            January: 'Tháng 1', February: 'Tháng 2', March: 'Tháng 3',
            April: 'Tháng 4', June: 'Tháng 6', July: 'Tháng 7',
            August: 'Tháng 8', September: 'Tháng 9', October: 'Tháng 10',
            November: 'Tháng 11', December: 'Tháng 12'
          };
          return { ...item, month: months[item.month] || item.month };
        })} margin={{top:12,right:10,left:0,bottom:0}}><defs><linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4779ed" stopOpacity={0.18}/><stop offset="95%" stopColor="#4779ed" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5"/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8a94a6'}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8a94a6'}} width={36}/><Tooltip formatter={(v:any) => [`₫${v}M`, 'Revenue']}/><Area type="monotone" dataKey="hotelA" name="Hotel A" stroke="#4779ed" fill="url(#blueArea)" strokeWidth={2.5}/><Area type="monotone" dataKey="hotelB" name="Hotel B" stroke="#25b99a" fill="transparent" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div>
        <div className="legend"><span><i className="blue-dot"/> Hotel A</span><span><i className="green-dot"/> Hotel B</span></div>
      </Panel>
      <Panel title="Hotel performance" subtitle="Current occupancy" action={<button className="icon-button" title="Details" onClick={() => window.location.href='/rooms'}><ArrowUpRight size={17}/></button>}>
        <div className="property-list">{data.properties.map((p: AnyRow) => <div className="property-row" key={p.id}><div className="property-symbol"><Building2 size={18}/></div><div className="property-info"><strong>{p.name}</strong><span>{p.rooms} {isVietnamese ? 'phòng' : 'rooms'} · {p.city}</span><div className="progress"><i style={{width:`${p.occupancy}%`}}/></div></div><div className="property-number"><strong>{p.occupancy}%</strong><span>{isVietnamese ? 'đang có khách' : 'occupied'}</span></div></div>)}</div>
        <div className="property-footer"><span>Combined monthly revenue</span><strong>{money(data.revenue)}</strong></div>
      </Panel>
    </div>
    <Panel title="Room popularity" subtitle="Actual occupied nights by room · check-out date is exclusive" action={
      <label className="popularity-period">Period
        <select value={popularityPeriod} onChange={e => setPopularityPeriod(e.target.value)}>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All available history</option>
        </select>
      </label>
    }>
      {popularityLoading ? <div className="loading popularity-message">Loading room history…</div>
        : popularityError ? <div className="popularity-message error">{popularityError}</div>
        : !popularity?.rooms?.length ? <EmptyState title="No rooms in this selection" text="Choose a hotel with rooms to view popularity."/>
        : <>
          <div className="popularity-summary">
            <div><span>Total occupied room-nights</span><strong>{popularity.totalOccupiedDays.toLocaleString()}</strong></div>
            <div><span>Most popular room{popularity.mostPopular?.length === 1 ? '' : 's'}</span><strong>{popularity.mostPopular?.length ? `${popularity.mostPopular.map((room: AnyRow) => room.room).join(', ')} · ${popularity.mostPopular[0].occupiedDays} days` : 'No stays recorded'}</strong></div>
            <div><span>Least popular room{popularity.leastPopular?.length === 1 ? '' : 's'}</span><strong>{popularity.leastPopular?.length ? `${popularity.leastPopular.map((room: AnyRow) => room.room).join(', ')} · ${popularity.leastPopular[0].occupiedDays} days` : '—'}</strong></div>
          </div>
          <div className="popularity-scroll">
            <div className="room-popularity-chart" style={{width: `${Math.max(760, popularity.rooms.length * 43)}px`}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularity.rooms} margin={{top:12,right:12,left:0,bottom:58}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5"/>
                  <XAxis dataKey="room" interval={0} angle={-45} textAnchor="end" height={68} tickLine={false} axisLine={false} tick={{fontSize:10,fill:'#7e899b'}}/>
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={38} tick={{fontSize:10,fill:'#7e899b'}}/>
                  <Tooltip formatter={(value: any) => [`${value} ${isVietnamese ? 'đêm' : (Number(value) === 1 ? 'night' : 'nights')}`, isVietnamese ? 'Đang có khách' : 'Occupied']} labelFormatter={(label: any) => `${isVietnamese ? 'Phòng' : 'Room'} ${label}`}/>
                  <Bar dataKey="occupiedDays" name="Occupied nights" fill="#4779ed" radius={[4,4,0,0]} maxBarSize={25}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="popularity-footnote">{isVietnamese ? 'Khoảng thời gian báo cáo:' : 'Reporting window:'} {popularity.startDate} {isVietnamese ? 'đến' : 'to'} {popularity.endDate}. {isVietnamese ? 'Các kỳ lưu trú đã xác nhận nhưng chưa hoàn tất, đã hủy, khách không đến và kỳ lưu trú trong tương lai không được tính.' : 'Confirmed, cancelled, no-show, and future stays are excluded.'}</div>
        </>}
    </Panel>
    <div className="content-grid two-one lower-grid">
      <Panel title="Reservation activity" subtitle="Recent and upcoming bookings" action={<button className="text-button" onClick={() => window.location.href='/reservations'}>All reservations <ArrowUpRight size={14}/></button>}>
        <ReservationTable rows={data.reservations.slice(0,4)} compact/>
      </Panel>
      <Panel title="Needs attention" subtitle="Tasks that may need action" action={<Badge tone="warning">{data.tasks.length} items</Badge>}>
        <div className="attention-list">{data.tasks.map((task: AnyRow) => <div className="attention-item" key={task.id}><div className={`attention-icon ${task.priority === 'High' ? 'urgent' : ''}`}><AlertTriangle size={16}/></div><div className="attention-text"><strong>{task.title}</strong><span>{task.property} · {task.assignee}</span></div><Badge tone={task.status === 'Overdue' ? 'danger' : 'warning'}>{task.status}</Badge></div>)}</div>
      </Panel>
    </div>
    <Panel title="Recent activity" subtitle="Latest updates across your business">
      {(() => {
        const activities = Array.isArray(data.activity) ? data.activity : [];
        const getActivityDate = (a: AnyRow): Date | null => {
          if (a.timestamp) {
            const parsed = new Date(a.timestamp);
            if (!Number.isNaN(parsed.getTime())) return parsed;
          }
          const id = Number(a.id);
          if (Number.isFinite(id) && id >= 1000000000000) {
            const parsed = new Date(id);
            if (!Number.isNaN(parsed.getTime())) return parsed;
          }
          return null;
        };
        const now = new Date();
        const months = Array.from({ length: 12 }, (_, index) => {
          const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        });
        const filteredActivities = activities.filter((a: AnyRow) => {
          const date = getActivityDate(a);
          if (!date) return false;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const key = `${year}-${month}`;
          return months.includes(key) && key === activityMonth;
        });
        return <>
          <div className="activity-filter">
            <label htmlFor="activity-month-filter">View</label>
            <select
              id="activity-month-filter"
              value={activityMonth}
              onChange={e => setActivityMonth(e.target.value)}
            >

              {months.map(month => {
                const [year, number] = month.split('-');
                const label = new Date(Number(year), Number(number) - 1, 1)
                  .toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
                return <option key={month} value={month}>{label}</option>;
              })}
            </select>
          </div>
          {filteredActivities.length > 0
            ? <div className="activity-list">{filteredActivities.map((a: AnyRow) => <div className="activity-item" key={a.id}><div className="activity-dot"><CheckCircle2 size={16}/></div><div className="activity-content"><strong>{a.text}</strong>{Array.isArray(a.details) && a.details.length > 0 && <div className="activity-details">{a.details.map((change: AnyRow, index: number) => <div className="activity-change" key={`${a.id}-${index}`}><strong>{change.field}:</strong> <span>{change.from} → {change.to}</span></div>)}</div>}<span className="activity-by">{a.by}</span></div><time>{a.time}</time></div>)}</div>
            : <div className="activity-filter-empty">No activity recorded for this month.</div>}
        </>;
      })()}
    </Panel>
  </>;
}
function SearchBar({ value, onChange, placeholder = 'Search records...' }: { value: string; onChange: (v:string)=>void; placeholder?: string }) {
  return <label className="search-box"><Search size={17}/><input id="global-search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>{value && <button type="button" onClick={() => onChange('')}><X size={14}/></button>}</label>;
}
function formatLengthOfStay(checkIn: string, checkOut: string): string {
  const isVietnamese = document.documentElement.lang === 'vi';
  const parseDate = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const timestamp = Date.UTC(year, month - 1, day);
    const date = new Date(timestamp);

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) return null;

    return { year, month, day, timestamp };
  };

  const start = parseDate(checkIn);
  const end = parseDate(checkOut);

  if (!start || !end || end.timestamp <= start.timestamp) return '—';

  const nights = Math.round(
    (end.timestamp - start.timestamp) / 86400000
  );
  const months =
    (end.year - start.year) * 12 + end.month - start.month;

  if (months >= 1 && start.day === end.day) {
    return `${months} ${isVietnamese ? 'tháng' : (months === 1 ? 'month' : 'months')}`;
  }

  return `${nights} ${isVietnamese ? 'đêm' : (nights === 1 ? 'night' : 'nights')}`;
}

function ReservationTable({ rows, compact = false, onStatusChange, onDelete, onEdit }: { rows: AnyRow[]; compact?: boolean; onStatusChange?: (id: string, status: string) => void; onDelete?: (id: string, guest: string) => void; onEdit?: (row: AnyRow) => void }) {
  const isVietnamese = useLanguage() === "vi";
  if (!rows.length) return <EmptyState title="No reservations found" text="Try changing your search or add a reservation."/>;
  const statuses = ['Confirmed', 'Arriving today', 'Checked in', 'Checked out', 'Cancelled', 'No-show'];
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return <div className={`table-scroll reservation-table${compact ? " compact" : ""}`}><table>
    <thead><tr><th>BOOKING / GUEST</th><th>HOTEL</th><th>ROOM</th><th>STAY</th><th>LENGTH OF STAY</th><th>STATUS</th>{!compact && (onDelete || onEdit) && <th>ACTIONS</th>}</tr></thead>
    <tbody>{rows.map(r => {
      const expired = r.checkOut < today;
      return <tr key={r.id}>
        <td data-label={isVietnamese ? "KHÁCH" : "GUEST"}>
          <strong>{r.guest}</strong>
          <span className="cell-sub">{r.id} · {r.source}</span>
          {String(r.note || '').trim() && <div className="reservation-note-content">
            <span className="reservation-note-icon" aria-hidden="true">📝</span>
            {String(r.note).trim()}
          </div>}
        </td>
        <td data-label={isVietnamese ? "KHÁCH SẠN" : "HOTEL"}>{r.propertyId === "hotel-a" ? "Hotel A" : r.propertyId === "hotel-b" ? "Hotel B" : (r.property || "Unknown hotel")}</td>
        <td data-label={isVietnamese ? "PHÒNG" : "ROOM"}>{r.room}</td>
        <td data-label={isVietnamese ? "NGÀY NHẬN / TRẢ PHÒNG" : "CHECK-IN / CHECK-OUT"}><span>{r.checkIn}</span><span className="cell-sub">{isVietnamese ? "đến" : "to"} {r.checkOut}</span></td>
        <td data-label={isVietnamese ? "THỜI LƯỢNG LƯU TRÚ" : "LENGTH OF STAY"}>{formatLengthOfStay(r.checkIn, r.checkOut)}</td>
        <td data-label={isVietnamese ? "TRẠNG THÁI" : "STATUS"}>{!compact && onStatusChange && !expired
          ? <select aria-label={`Status for ${r.guest}`} value={statuses.includes(r.status) ? r.status : 'Confirmed'} onChange={e => onStatusChange(r.id, e.target.value)}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select>
          : <><Badge tone={r.status === 'Checked in' ? 'success' : r.status === 'Arriving today' ? 'info' : 'neutral'}>{r.status}</Badge>{!compact && expired && <span className="cell-sub">Status locked: stay has ended</span>}</>}
        </td>

        {!compact && (onDelete || onEdit) && <td data-label={isVietnamese ? "THAO TÁC" : "ACTIONS"}>
          {onEdit && !expired && !['checked out', 'cancelled', 'canceled', 'no-show', 'no show'].includes(String(r.status || '').toLowerCase()) &&
            <button type="button" className="reservation-edit-btn" onClick={() => onEdit(r)}>Edit</button>}
          {onDelete && <button type="button" className="reservation-delete-btn" onClick={() => onDelete(r.id, r.guest)}>Delete</button>}
        </td>}
      </tr>;
    })}</tbody>
  </table></div>;
}

function ReservationCalendar({ property }: { property: string }) {
  const language = useLanguage();
  const isVietnamese = language === 'vi';
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEventList, setSelectedEventList] = useState<{
    date: string;
    type: 'in' | 'out' | 'all';
    rows: { row: AnyRow; type: 'in' | 'out' }[];
  } | null>(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.reservations('', property)
      .then(r => {
        if (active) {
          setRows(r.data || []);
          setError('');
        }
      })
      .catch(e => {
        if (active) setError(e.message || 'Could not load reservations.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [property]);

  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const today = dateKey(new Date());
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    1 - ((firstDay.getDay() + 6) % 7)
  );
  const days = Array.from({ length: 42 }, (_, i) =>
    new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
  );

  const calendarRows = rows.filter(r =>
    !['cancelled', 'no-show', 'noshow'].includes(String(r.status || '').toLowerCase())
  );

  const activeRows = calendarRows.filter(r =>
    ['confirmed', 'arriving today', 'checked in'].includes(
      String(r.status || 'Confirmed').toLowerCase()
    )
  );

  const eventsFor = (date: string) => {
    const events: { row: AnyRow; type: 'in' | 'out' }[] = [];
    calendarRows.forEach(r => {
      if (r.checkIn === date) events.push({ row: r, type: 'in' });
      if (r.checkOut === date) events.push({ row: r, type: 'out' });
    });
    return events.sort((a, b) =>
      String(a.row.room || '').localeCompare(String(b.row.room || ''), undefined, { numeric: true })
    );
  };

  const monthLabel = month.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-GB', {
    month: 'long',
    year: 'numeric'
  });
  const weekdayLabels = isVietnamese
    ? ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return <>
    <PageHeader
      eyebrow="FRONT DESK"
      title="Reservation Calendar"
      description={isVietnamese ? "Theo dõi khách nhận phòng và trả phòng theo ngày, phòng và khách sạn đã chọn." : "See guest arrivals and departures by date and room across your selected hotels."}
      actions={
        <Button variant="secondary" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
          <CalendarDays size={15}/> {isVietnamese ? "Hôm nay" : "Today"}
        </Button>
      }
    />

    <Panel title={monthLabel} subtitle={isVietnamese ? "Mỗi mục hiển thị số phòng và tên khách." : "Each entry shows the room number and guest name."}
      action={
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            {isVietnamese ? "← Tháng trước" : "← Previous"}
          </Button>
          <Button variant="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            {isVietnamese ? "Tháng sau →" : "Next →"}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16, fontSize: 13 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#2563eb' }}/>
          {isVietnamese ? 'Nhận phòng' : 'Check-in'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#ea580c' }}/>
          {isVietnamese ? 'Trả phòng' : 'Check-out'}
        </span>
        <span style={{ color: 'var(--muted, #64748b)' }}>{isVietnamese ? "Sử dụng bộ chọn khách sạn ở phía trên để lọc lịch." : "Use the hotel selector at the top to filter the calendar."}</span>
      </div>

      {error && <div className="notice error">{error}</div>}
      {loading ? <div className="loading"><RefreshCw className="spin"/> {isVietnamese ? "Đang tải đặt phòng…" : "Loading reservations…"}</div> : (
        <>
          <div className="reservation-calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1, background: 'var(--border, #e2e8f0)', border: '1px solid var(--border, #e2e8f0)' }}>
            {weekdayLabels.map(day => (
              <div key={day} style={{ background: 'var(--panel, #f8fafc)', padding: '10px 4px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
                {day}
              </div>
            ))}
            {days.map(day => {
              const key = dateKey(day);
              const inMonth = day.getMonth() === month.getMonth();
              const isToday = key === today;
              const events = eventsFor(key);
              return (
                <div key={key} className="reservation-calendar-day" style={{
                  background: isToday ? '#f3e8ff' : 'var(--surface, white)',
                  minWidth: 0,
                  minHeight: 112,
                  padding: 5,
                  opacity: inMonth ? 1 : 0.48,
                  border: isToday ? '3px solid #7e22ce' : undefined,
                  outline: isToday ? '2px solid #7e22ce' : undefined,
                  outlineOffset: -2,
                  boxShadow: 'none',
                  position: 'relative',
                  zIndex: isToday ? 1 : undefined
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: isToday ? 800 : 600,
                    marginBottom: 5,
                    color: isToday ? '#6b21a8' : 'inherit'
                  }}>
                    {day.getDate()}{isToday ? (isVietnamese ? ' · Hôm nay' : ' · Today') : ''}
                  </div>
                  <div className="calendar-day-counts" aria-label={isVietnamese ? `Sự kiện ngày ${key}` : `Events on ${key}`}>
                    {(['in', 'out'] as const).map(type => {
                      const count = events.filter(event => event.type === type).length;
                      if (!count) return null;
                      return (
                        <button
                          key={type}
                          type="button"
                          className={`calendar-day-count ${type === 'in' ? 'check-in' : 'check-out'}`}
                          aria-label={isVietnamese ? `${count} lượt ${type === 'in' ? 'nhận phòng' : 'trả phòng'} ngày ${key}` : `${count} check-${type === 'in' ? 'ins' : 'outs'} on ${key}`}
                          title={isVietnamese ? `${count} lượt ${type === 'in' ? 'nhận phòng' : 'trả phòng'}` : `${count} check-${type === 'in' ? 'ins' : 'outs'}`}
                          onClick={() => setSelectedEventList({
                            date: key,
                            type,
                            rows: events.filter(event => event.type === type)
                          })}
                        >
                          <span aria-hidden="true">{type === 'in' ? '↓' : '↑'}</span>
                          <strong>{count}</strong>
                        </button>
                      );
                    })}
                  </div>
                  <div className="calendar-count-buttons">
                    {(['in', 'out'] as const).map(type => {
                      const count = events.filter(event => event.type === type).length;
                      if (!count) return null;
                      return (
                        <button
                          key={type}
                          type="button"
                          className={`calendar-count-button ${type === 'in' ? 'check-in' : 'check-out'} ${isVietnamese ? 'vietnamese' : ''}`}
                          aria-label={`${count} check-${type === 'in' ? 'ins' : 'outs'} on ${key}`}
                          onClick={() => setSelectedEventList({
                            date: key,
                            type,
                            rows: events.filter(event => event.type === type)
                          })}
                        >
                          <span aria-hidden="true">{type === 'in' ? '↓' : '↑'}</span>
                          <strong>{count}</strong>
                          <span>{isVietnamese ? (type === 'in' ? 'Nhận phòng' : 'Trả phòng') : (type === 'in' ? 'In' : 'Out')}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="calendar-day-events" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {events.slice(0, 4).map((event, index) => (
                      <div className="calendar-day-event" key={`${event.row.id}-${event.type}-${index}`} title={isVietnamese ? `${event.type === 'in' ? 'Nhận phòng' : 'Trả phòng'} · Phòng ${event.row.room} · ${event.row.guest}` : `${event.type === 'in' ? 'Check-in' : 'Check-out'} · Room ${event.row.room} · ${event.row.guest}`} style={{
                        background: event.type === 'in' ? '#dbeafe' : '#ffedd5',
                        color: event.type === 'in' ? '#1d4ed8' : '#9a3412',
                        borderLeft: `3px solid ${event.type === 'in' ? '#2563eb' : '#ea580c'}`,
                        borderRadius: 3,
                        padding: '4px 3px',
                        fontSize: 11,
                        lineHeight: 1.35,
                        overflowWrap: 'anywhere'
                      }}>
                        <strong>{isVietnamese ? (event.type === 'in' ? 'NHẬN' : 'TRẢ') : (event.type === 'in' ? 'IN' : 'OUT')} · {event.row.room}</strong>
                        <div>{event.row.guest}</div>
                      </div>
                    ))}
                    {events.length > 0 && (
                      <button
                        type="button"
                        className="calendar-more-events"
                        onClick={() => setSelectedEventList({
                          date: key,
                          type: 'all',
                          rows: events
                        })}
                        aria-label={isVietnamese ? `Xem tất cả ${events.length} lượt nhận và trả phòng ngày ${key}` : `Show all ${events.length} arrivals and departures on ${key}`}
                      >
                        {events.length > 4 ? `+${events.length - 4} ${isVietnamese ? 'mục khác' : 'more'}` : (isVietnamese ? 'Xem chi tiết' : 'View Details')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedEventList && (
            <Modal
              title={`${selectedEventList.type === 'all' ? (isVietnamese ? 'Nhận và trả phòng' : 'Arrivals & departures') : selectedEventList.type === 'in' ? (isVietnamese ? 'Lượt nhận phòng' : 'Check-ins') : (isVietnamese ? 'Lượt trả phòng' : 'Check-outs')} · ${selectedEventList.rows.length}`}
              onClose={() => setSelectedEventList(null)}
            >
              <div className="calendar-popup">
                <p className="calendar-popup-date">
                  {new Date(`${selectedEventList.date}T00:00:00`).toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {selectedEventList.rows.map(({ row, type }, index) => (
                  <div className="calendar-popup-row" key={`${row.id}-${type}-${index}`}>
                    <div className="calendar-popup-guest">
                      <strong>{row.guest || (isVietnamese ? 'Không có tên khách' : 'Guest name unavailable')}</strong>
                      <span>{isVietnamese ? 'Phòng' : 'Room'} {row.room || '—'} · {row.propertyId === 'hotel-a' ? 'Hotel A' : row.propertyId === 'hotel-b' ? 'Hotel B' : (row.property || (isVietnamese ? 'Khách sạn không xác định' : 'Unknown hotel'))}</span>
                      <span className={`calendar-popup-event-type ${type === 'in' ? 'check-in' : 'check-out'}`}>
                        {isVietnamese ? (type === 'in' ? '↓ Nhận phòng' : '↑ Trả phòng') : (type === 'in' ? '↓ Check-in' : '↑ Check-out')}
                      </span>
                      <span className="calendar-popup-booking">{row.id}</span>
                    </div>
                    <Badge tone={row.status === 'Checked in' ? 'success' : row.status === 'Arriving today' ? 'info' : 'neutral'}>
                      {row.status || 'Confirmed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Modal>
          )}
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted, #64748b)' }}>
            {isVietnamese ? `${activeRows.length} đặt phòng đang hoạt động · ${calendarRows.filter(r => r.checkIn === today).length} lượt nhận phòng hôm nay · ${calendarRows.filter(r => r.checkOut === today).length} lượt trả phòng hôm nay` : `${activeRows.length} active reservations · ${calendarRows.filter(r => r.checkIn === today).length} check-ins today · ${calendarRows.filter(r => r.checkOut === today).length} check-outs today`}
          </div>
        </>
      )}
    </Panel>
  </>;
}

function Reservations({ property, onReservationCountChange }: { property: string; onReservationCountChange: () => Promise<void> }) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState('');
  const [reservationTab, setReservationTab] = useState<'active' | 'inactive'>('active');
  const [expandedReservationYears, setExpandedReservationYears] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<AnyRow | null>(null);
  const reservationScrollPosition = useRef({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const [selectedProperty, setSelectedProperty] = useState('hotel-a');
  useEffect(() => {
    if (property !== 'all') {
      setSelectedProperty(property);
      setSelectedRoom('');
    }
  }, [property]);

  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [selectedRoom, setSelectedRoom] = useState('');
  const [roomOptions, setRoomOptions] = useState<AnyRow[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.reservations(query, property);
      setRows(r.data);
    } catch (e: any) {
      setError(e.message || 'Could not load reservations.');
    } finally {
      setLoading(false);
    }
  };

  async function changeReservationStatus(id: string, status: string) {
    if (status === 'Checked in' || status === 'Checked out') {
      const guest = rows.find((row: AnyRow) => row.id === id);
      const action = status === 'Checked in' ? 'check in' : 'check out';
      const roomAction = status === 'Checked in'
        ? 'Occupancy will become Occupied. Housekeeping will remain unchanged.'
        : 'Occupancy will become Vacant and housekeeping will become Dirty.';

      const confirmed = window.confirm(
        `Are you sure you want to ${action}${guest ? ` ${guest.guest}` : ''}?\n\n${roomAction}`
      );

      if (!confirmed) {
        return;
      }
    }

    // Refresh data without replacing the table with the loading screen.
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    try {
      setError('');
      await api.updateReservation(id, { status });
      const result = await api.reservations(query, property);
      setRows(result.data);

      requestAnimationFrame(() => {
        window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
      });
    } catch (e: any) {
      setError(e.message || 'Could not update reservation status.');

      try {
        const result = await api.reservations(query, property);
        setRows(result.data);
      } catch {
        // Keep the existing rows visible if the refresh also fails.
      }

      requestAnimationFrame(() => {
        window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
      });
    }
  }

  async function deleteReservation(id: string, guest: string) {
    const confirmed = window.confirm(
      `Permanently delete reservation ${id} for ${guest}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setError('');
      await api.deleteReservation(id);
      await Promise.all([load(), onReservationCountChange()]);
    } catch (e: any) {
      setError(e.message || 'Could not delete reservation.');
    }
  }

  useEffect(() => { load(); }, [query, property]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    api.rooms()
      .then(roomResult => {
        if (!active) return;

        // Show every room in the selected hotel.
        // Booking conflicts and maintenance restrictions are validated by the backend.
        const rooms = roomResult.data.filter(
          (room: AnyRow) => room.propertyId === selectedProperty
        );

        setRoomOptions(rooms);
        setSelectedRoom(current =>
          rooms.some((room: AnyRow) => String(room.number) === current)
            ? current
            : ''
        );
      })
      .catch(e => {
        if (active) setError(e.message);
      });

    return () => { active = false; };
  }, [open, selectedProperty]);

  function startEditing(row: AnyRow) {
    reservationScrollPosition.current = { x: window.scrollX, y: window.scrollY };
    setEditingReservation(row);
    setSelectedProperty(row.propertyId);
    setSelectedRoom(String(row.room));
    setCheckInDate(String(row.checkIn).slice(0, 10));
    setCheckOutDate(String(row.checkOut).slice(0, 10));
    setError('');
    setOpen(true);
  }

  function startCreating() {
    setEditingReservation(null);
    setSelectedRoom('');
    setCheckInDate(today);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCheckOutDate(`${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`);
    setError('');
    setOpen(true);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      guest: String(f.get('guest') || '').trim(),
      propertyId: String(f.get('propertyId') || ''),
      room: String(f.get('room') || ''),
      checkIn: String(f.get('checkIn') || ''),
      checkOut: String(f.get('checkOut') || ''),
      guests: Number(f.get('guests') || 1),
      source: String(f.get('source') || 'Direct'),
      note: String(f.get('note') || '').trim()
    };


    try {
      setError('');
      if (editingReservation) {
        await api.updateReservation(editingReservation.id, data);
      } else {
        await api.createReservation(data);
      }
      setOpen(false);
      setEditingReservation(null);
      await Promise.all([load(), onReservationCountChange()]);

      const restorePosition = () => {
        const { x, y } = reservationScrollPosition.current;
        window.scrollTo(x, y);
        document.documentElement.scrollTop = y;
        document.body.scrollTop = y;
      };

      requestAnimationFrame(() => {
        restorePosition();
        requestAnimationFrame(restorePosition);
        window.setTimeout(restorePosition, 100);
        window.setTimeout(restorePosition, 300);
        window.setTimeout(restorePosition, 600);
      });
    } catch (e: any) {
      setError(e.message || 'Could not save reservation.');
    }
  }

  const visibleRows = rows.filter((row: AnyRow) =>
    reservationTab === 'active'
      ? ['Confirmed', 'Arriving today', 'Checked in'].includes(row.status)
      : ['Checked out', 'Cancelled', 'No-show'].includes(row.status)
  );

  const inactiveYearGroups = Object.entries(
    visibleRows
      .filter((row: AnyRow) => reservationTab === 'inactive')
      .reduce((groups: Record<string, AnyRow[]>, row: AnyRow) => {
        const rawDate = row.status === 'Checked out'
          ? row.checkOut
          : row.checkIn;
        const date = String(rawDate ?? '').trim();
        const match = date.match(/(\d{4})/);
        const year = match ? match[1] : 'Unknown year';
        (groups[year] ||= []).push(row);
        return groups;
      }, {})
  ).sort(([a], [b]) => {
    if (a === 'Unknown year') return 1;
    if (b === 'Unknown year') return -1;
    return Number(b) - Number(a);
  });

  return <><PageHeader eyebrow="HOTEL OPERATIONS" title="Reservations" description="Manage guest bookings, stay dates, and booking status." actions={<Button onClick={startCreating}><Plus size={16}/> New reservation</Button>}/><div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search guest, booking ID, source…"/><div className="toolbar-right"><Badge tone="info">{visibleRows.length} bookings</Badge><Button variant="secondary" onClick={load}><RefreshCw size={15}/> Refresh</Button></div></div>{error && <div className="notice error">{error}</div>}<div className="reservation-tabs" role="tablist" aria-label="Reservation status"><Button variant={reservationTab === 'active' ? 'primary' : 'secondary'} onClick={() => setReservationTab('active')}>Active Reservations</Button><Button variant={reservationTab === 'inactive' ? 'primary' : 'secondary'} onClick={() => setReservationTab('inactive')}>Inactive Reservations</Button></div><Panel title={reservationTab === 'active' ? 'Active reservations' : 'Inactive reservations'} subtitle={reservationTab === 'active' ? 'Confirmed bookings, arrivals, and current stays' : 'Archived by year — checked-out stays use checkout year; cancelled and no-show bookings use check-in year'}>{loading ? <div className="loading">Loading reservations…</div> : reservationTab === 'active' ? <ReservationTable rows={visibleRows} onStatusChange={changeReservationStatus} onDelete={deleteReservation} onEdit={startEditing}/> : inactiveYearGroups.length === 0 ? <ReservationTable rows={visibleRows} onDelete={deleteReservation} onEdit={startEditing}/> : <div className="reservation-year-list">{inactiveYearGroups.map(([year, yearRows], index) => { const expanded = expandedReservationYears[year] ?? index === 0; return <section className="reservation-year-group" key={year}><button type="button" className="reservation-year-toggle" aria-expanded={expanded} onClick={() => setExpandedReservationYears(current => ({ ...current, [year]: !expanded }))}><span className="reservation-year-label"><strong>{year}</strong><span>{yearRows.length} {yearRows.length === 1 ? 'reservation' : 'reservations'}</span></span><span className="reservation-year-chevron" aria-hidden="true">{expanded ? '−' : '+'}</span></button>{expanded && <div className="reservation-year-content"><ReservationTable rows={yearRows} onDelete={deleteReservation} onEdit={startEditing}/></div>}</section>; })}</div>}</Panel>{open && <Modal title={editingReservation ? 'Edit reservation' : 'Create reservation'} onClose={() => { setOpen(false); setEditingReservation(null); }}><form key={editingReservation?.id || 'new-reservation'} className="form-grid" onSubmit={submit}><label className="span-2">Guest full name<input name="guest" required defaultValue={editingReservation?.guest || ''} placeholder="Enter guest name"/></label><label>Hotel<select name="propertyId" value={selectedProperty} onChange={e => { setSelectedProperty(e.target.value); setSelectedRoom(""); }}><option value="hotel-a">Hotel A</option><option value="hotel-b">Hotel B</option></select></label><label>Room number<select name="room" required value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}><option value="">Select an available room</option>{roomOptions.map((room: AnyRow) => <option key={room.id} value={room.number}>{room.number} · {room.type} · Floor {room.floor}</option>)}</select>{roomOptions.length === 0 && <small>No rooms available for these dates.</small>}</label><label>Check-in<input type="date" name="checkIn" required min={editingReservation ? undefined : new Date(Date.parse(`${today}T00:00:00Z`) - 86400000).toISOString().slice(0, 10)} value={checkInDate} onChange={e => setCheckInDate(e.target.value)} /></label><label>Check-out<input type="date" name="checkOut" required min={checkInDate || undefined} value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} /></label><label>Guest(s)<input type="number" name="guests" min="1" step="1" required defaultValue={editingReservation?.guests ?? ''}/></label><label className="span-2">Booking source<select name="source" defaultValue={editingReservation?.source || 'Direct'}><option>Direct</option><option>Phone</option><option>Walk-in</option><option>Booking.com</option><option>Agoda</option><option>Travel agent</option></select></label><label className="span-2">Reservation note<textarea name="note" rows={3} maxLength={2000} defaultValue={editingReservation?.note || ''} placeholder="Optional note for this reservation only"/></label><div className="form-actions span-2"><Button variant="secondary" onClick={() => { setOpen(false); setEditingReservation(null); }}>Cancel</Button><Button type="submit">{editingReservation ? 'Save changes' : 'Create reservation'}</Button></div></form></Modal>}</>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

function Rooms({ property, isAdmin }: { property: string; isAdmin: boolean }) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [reservations, setReservations] = useState<AnyRow[]>([]);
  const [roomProperties, setRoomProperties] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState('');
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomError, setAddRoomError] = useState('');
  const [savingRoom, setSavingRoom] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [selectedNoteRoom, setSelectedNoteRoom] = useState<AnyRow | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<{ title: string; field: 'occupancyStatus' | 'housekeepingStatus'; value: string } | null>(null);
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [pushState, setPushState] = useState('');
  const [pushBusy, setPushBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const load = () => Promise.all([
    api.rooms(query),
    api.reservations('', property)
  ]).then(([roomResult, reservationResult]) => {
    const filtered = roomResult.data.filter((x: AnyRow) => property === 'all' || x.propertyId === property);
    setRows(filtered);
    setReservations(reservationResult.data || []);
    setNoteDrafts(prev => {
      const next = { ...prev };
      filtered.forEach((room: AnyRow) => {
        if (next[room.id] === undefined) next[room.id] = room.note || '';
      });
      return next;
    });
  }).catch(() => {});

  useEffect(() => { load(); }, [query, property]);

  useEffect(() => {
    api.properties().then(result => setRoomProperties(result.data || [])).catch(() => {});
  }, []);

  async function createRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (savingRoom) return;

    const values = new FormData(e.currentTarget);
    const payload = {
      propertyId: String(values.get('propertyId') || ''),
      number: String(values.get('number') || '').trim(),
      type: String(values.get('type') || '').trim(),
      floor: String(values.get('floor') || '').trim()
    };

    setSavingRoom(true);
    setAddRoomError('');
    try {
      await api.createRoom(payload);
      setAddRoomOpen(false);
      setQuery('');
      await load();
    } catch (error) {
      setAddRoomError(error instanceof Error ? error.message : 'Could not create room.');
    } finally {
      setSavingRoom(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function checkPushSubscription() {
      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
      ) {
        if (!cancelled) setPushEnabled(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!cancelled) {
          setPushEnabled(Boolean(subscription));
        }
      } catch {
        if (!cancelled) setPushEnabled(false);
      }
    }

    void checkPushSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  async function changeStatus(
    id: string,
    field: 'occupancyStatus' | 'housekeepingStatus',
    status: string
  ) {
    try {
      await api.updateRoomStatus(id, field, status);
      load();
    } catch (e: any) {
      alert(e.message || 'Could not update room status.');
    }
  }


  async function enableNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPushState('Push notifications are not supported by this browser.');
      return;
    }

    setPushBusy(true);
    setPushState('');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushState('Notifications were not allowed. Check your browser or iPhone settings.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      let subscription: PushSubscription | null = await registration.pushManager.getSubscription();

      if (!subscription) {
        const keyResponse = await fetch(`${API_URL}/push/public-key`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('hotel_auth_token') || ''}` }
        });
        const keyData = await keyResponse.json();
        if (!keyResponse.ok || !keyData.publicKey) {
          throw new Error(keyData.error || 'Could not get the push notification key.');
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
        });
      }

      const saveResponse = await fetch(`${API_URL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hotel_auth_token') || ''}`
        },
        body: JSON.stringify(subscription)
      });
      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.error || 'Could not save this device subscription.');
      }

      setPushEnabled(true);
      setPushState('Notifications enabled on this device.');
    } catch (e: any) {
      setPushState(e.message || 'Could not enable notifications.');
    } finally {
      setPushBusy(false);
    }
  }

  async function disableNotifications() {
    setPushBusy(true);
    setPushState('');

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const response = await fetch(`${API_URL}/push/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('hotel_auth_token') || ''}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Could not disable notifications on the server.');
        }

        await subscription.unsubscribe();
      }

      setPushEnabled(false);
      setPushState('Notifications disabled on this device.');
    } catch (e: any) {
      setPushState(e.message || 'Could not disable notifications.');
    } finally {
      setPushBusy(false);
    }
  }

  async function saveNote(room: AnyRow) {
    setSavingNotes(prev => ({ ...prev, [room.id]: true }));
    try {
      await api.updateRoomNote(room.id, noteDrafts[room.id] || '');
      setSelectedNoteRoom(null);
      load();
    } catch (e: any) {
      alert(e.message || 'Could not save room note.');
    } finally {
      setSavingNotes(prev => ({ ...prev, [room.id]: false }));
    }
  }

  const counts = useMemo(() => ({
    vacant: rows.filter(r => r.occupancyStatus === 'Vacant').length,
    occupied: rows.filter(r => r.occupancyStatus === 'Occupied').length,
    maintenance: rows.filter(r => r.occupancyStatus === 'Maintenance').length,
    clean: rows.filter(r => r.housekeepingStatus === 'Clean').length,
    dirty: rows.filter(r => r.housekeepingStatus === 'Dirty').length
  }), [rows]);

  return <>
    <PageHeader eyebrow="HOTEL OPERATIONS" title="Room management" description="View room availability, update operational status, and maintain room notes." actions={<>{isAdmin && <Button onClick={() => { setAddRoomOpen(true); setAddRoomError(''); }}><Plus size={15}/> Add room</Button>}<Button variant="secondary" onClick={load}><RefreshCw size={15}/> Refresh</Button><Button variant={pushEnabled ? "secondary" : "primary"} onClick={() => { if (!pushBusy) void (pushEnabled ? disableNotifications() : enableNotifications()); }}><Bell size={15}/> {pushBusy ? "Please wait…" : pushEnabled ? "Notifications Enabled" : "Enable Notifications"}</Button></>}/>
    <div className="mini-stat-grid room-status-summary">
      {([
        { title: 'Vacant', value: counts.vacant, field: 'occupancyStatus', status: 'Vacant' },
        { title: 'Occupied', value: counts.occupied, field: 'occupancyStatus', status: 'Occupied' },
        { title: 'Maintenance', value: counts.maintenance, field: 'occupancyStatus', status: 'Maintenance' },
        { title: 'Clean', value: counts.clean, field: 'housekeepingStatus', status: 'Clean' },
        { title: 'Dirty', value: counts.dirty, field: 'housekeepingStatus', status: 'Dirty' }
      ] as const).map(card => (
        <button
          type="button"
          key={card.title}
          className={`room-status-summary-card room-status-summary-${card.title.toLowerCase()}`}
          onClick={() => setSelectedStatus({
            title: card.title,
            field: card.field,
            value: card.status
          })}
          aria-label={`Show ${card.value} rooms with status ${card.title}`}
        >
          <span>{card.title}</span>
          <strong>{card.value}</strong>
          <small>View rooms ›</small>
        </button>
      ))}
    </div>
    <div className="toolbar">
      <SearchBar value={query} onChange={setQuery} placeholder="Search room number or type…"/>
      <span className="muted">{rows.length} rooms</span>
    </div>
    {pushState && <p role="status" className="muted">{pushState}</p>}
    <div className="room-grid">
      {rows.map(room => <div className="room-card" key={room.id}>
        <div className="room-card-top">
          <div className="room-number">{room.number}</div>
          <div className="room-status-controls">
            <select
              className={"room-status-select status-" + room.occupancyStatus.toLowerCase()}
              aria-label={"Update occupancy for room " + room.number}
              value={room.occupancyStatus}
              onChange={e => changeStatus(room.id, 'occupancyStatus', e.target.value)}
            >
              <option value="Vacant">Vacant</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <select
              className={"room-status-select status-" + room.housekeepingStatus.toLowerCase()}
              aria-label={"Update housekeeping for room " + room.number}
              value={room.housekeepingStatus}
              onChange={e => changeStatus(room.id, 'housekeepingStatus', e.target.value)}
            >
              <option value="Clean">Clean</option>
              <option value="Dirty">Dirty</option>
            </select>
          </div>
        </div>
        <span>{room.propertyId === 'hotel-a' ? 'Hotel A' : 'Hotel B'} · Floor {room.floor}</span>

        <div className="room-notes">
          <p className="room-note-text">{room.note || 'No note added.'}</p>
          <Button variant="secondary" onClick={() => {
            setNoteDrafts(prev => ({ ...prev, [room.id]: room.note || '' }));
            setSelectedNoteRoom(room);
          }}>
            {room.note ? 'Edit note' : 'Add note'}
          </Button>
        </div>
      </div>)}
    </div>
    {selectedStatus && <Modal
      title={`${selectedStatus.title} rooms · ${rows.filter(room => room[selectedStatus.field] === selectedStatus.value).length}`}
      onClose={() => setSelectedStatus(null)}
    >
      <div className="room-status-popup">
        <p className="muted">
          {property === 'all' ? 'All hotels' : property === 'hotel-a' ? 'Hotel A' : 'Hotel B'}
          {' · '} Rooms with {selectedStatus.field === 'occupancyStatus' ? 'occupancy' : 'housekeeping'} status {selectedStatus.value}
        </p>
        {rows.filter(room => room[selectedStatus.field] === selectedStatus.value).length === 0 ? (
          <p className="room-status-empty">No rooms currently have this status.</p>
        ) : rows
          .filter(room => room[selectedStatus.field] === selectedStatus.value)
          .slice()
          .sort((a, b) => String(a.propertyId).localeCompare(String(b.propertyId)) || String(a.number).localeCompare(String(b.number), undefined, { numeric: true }))
          .map(room => (
            <div className="room-status-popup-row" key={room.id}>
              <div className="room-status-popup-main">
                <strong>Room {room.number}</strong>
                <span>{room.propertyId === 'hotel-a' ? 'Hotel A' : 'Hotel B'} · Floor {room.floor}</span>
              </div>
              <div className="room-status-popup-badges">
                <span className={`room-status-popup-badge status-${String(room.occupancyStatus).toLowerCase()}`}>{room.occupancyStatus}</span>
                <span className={`room-status-popup-badge status-${String(room.housekeepingStatus).toLowerCase()}`}>{room.housekeepingStatus}</span>
                {reservations.some(reservation =>
                  String(reservation.propertyId) === String(room.propertyId) &&
                  String(reservation.room) === String(room.number) &&
                  reservation.status === 'Confirmed' &&
                  String(reservation.checkIn || '') === (() => {
                    const now = new Date();
                    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                  })()
                ) && (
                  <span className="room-status-popup-badge status-confirmed">Confirmed</span>
                )}
              </div>
            </div>
          ))}
      </div>
    </Modal>}
    {selectedNoteRoom && <Modal
      title={`Room ${selectedNoteRoom.number} notes`}
      onClose={() => {
        if (!savingNotes[selectedNoteRoom.id]) {
          setNoteDrafts(prev => ({
            ...prev,
            [selectedNoteRoom.id]: selectedNoteRoom.note || ''
          }));
          setSelectedNoteRoom(null);
        }
      }}
    >
      <div className="form-grid">
        <p className="muted span-2">
          {selectedNoteRoom.propertyId === 'hotel-a' ? 'Hotel A' : 'Hotel B'}
          {' · '} {selectedNoteRoom.type} · Floor {selectedNoteRoom.floor}
        </p>
        <label className="span-2">
          Room notes
          <textarea
            autoFocus
            value={noteDrafts[selectedNoteRoom.id] ?? ''}
            onChange={e => setNoteDrafts(prev => ({
              ...prev,
              [selectedNoteRoom.id]: e.target.value
            }))}
            maxLength={2000}
            rows={6}
            placeholder="Add information about this room…"
          />
        </label>
        <span className="muted span-2">
          {(noteDrafts[selectedNoteRoom.id] || '').length}/2000 characters
        </span>
        <div className="form-actions span-2">
          <Button
            variant="secondary"
            onClick={() => {
              setNoteDrafts(prev => ({
                ...prev,
                [selectedNoteRoom.id]: selectedNoteRoom.note || ''
              }));
              setSelectedNoteRoom(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => saveNote(selectedNoteRoom)}
          >
            {savingNotes[selectedNoteRoom.id] ? 'Saving…' : 'Save note'}
          </Button>
        </div>
      </div>
    </Modal>}
    {addRoomOpen && isAdmin && <Modal
      title="Add room"
      onClose={() => {
        if (!savingRoom) {
          setAddRoomOpen(false);
          setAddRoomError('');
        }
      }}
    >
      <form className="form-grid" onSubmit={createRoom}>
        <label className="span-2">
          Hotel
          <select
            name="propertyId"
            required
            defaultValue={property !== 'all' ? property : (roomProperties[0]?.id || '')}
          >
            <option value="" disabled>Select a hotel</option>
            {roomProperties.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          Room number
          <input name="number" required maxLength={30} placeholder="e.g. 107" />
        </label>
        <label>
          Floor
          <input name="floor" required maxLength={20} placeholder="e.g. 1 or G" />
        </label>
        <label className="span-2">
          Room type
          <input name="type" required maxLength={100} defaultValue="Standard Room" placeholder="e.g. Standard Room" />
        </label>
        <p className="muted span-2">
          New rooms start as Vacant and Clean. Room numbers must be unique within the selected hotel.
        </p>
        {addRoomError && <p className="span-2" role="alert">{addRoomError}</p>}
        <div className="form-actions span-2">
          <Button variant="secondary" disabled={savingRoom} onClick={() => {
            setAddRoomOpen(false);
            setAddRoomError('');
          }}>Cancel</Button>
          <Button type="submit" disabled={savingRoom}>
            {savingRoom ? 'Saving…' : 'Create room'}
          </Button>
        </div>
      </form>
    </Modal>}
  </>;
}
function Employees() {
  const isVietnamese = useLanguage() === 'vi';
  const [rows, setRows] = useState<AnyRow[]>([]); const [query, setQuery] = useState(''); const [open,setOpen] = useState(false); const [department, setDepartment] = useState(''); const jobTitleByDepartment: Record<string, string> = { 'Front Office': 'Receptionist', Housekeeping: 'Housekeeper', Management: 'Hotel Manager', Finance: 'Accountant' };
  const load = () => api.employees(query).then(r => setRows(r.data)).catch(() => {});
  useEffect(() => { load(); }, [query]);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = new FormData(e.currentTarget); await api.createEmployee({name:f.get('name'), jobTitle:f.get('jobTitle'), property:f.get('property'), department:f.get('department'), salary:f.get('salary')}); setOpen(false); load(); }
  async function deleteEmployee(employee: AnyRow) {
    const confirmed = window.confirm(`Delete employee "${employee.name}" (${employee.id})? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await api.deleteEmployee(employee.id);
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not delete employee.');
    }
  }
  return <><PageHeader eyebrow="PEOPLE & CULTURE" title="Human resources" description="Employee directory and staffing overview." actions={<Button onClick={() => setOpen(true)}><Plus size={16}/> Add employee</Button>}/><div className="mini-stat-grid"><div><span>Total employees</span><strong>{rows.length}</strong></div><div><span>On shift</span><strong>{rows.filter(r=>r.status==='On shift').length}</strong></div><div><span>Departments</span><strong>{new Set(rows.map(r=>r.department)).size}</strong></div><div><span>Monthly base salaries</span><strong>{money(rows.reduce((s,r)=>s+Number(r.salary||0),0))}</strong></div></div><div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder={isVietnamese ? "Tìm nhân viên, chức vụ, phòng ban…" : "Search employees, roles, departments…"}/></div><Panel title="Employee directory" subtitle="Demo records; salary data is shown for prototyping only"><div className="table-scroll"><table><thead><tr><th>EMPLOYEE</th><th>ROLE / DEPARTMENT</th><th>PROPERTY</th><th>STATUS</th><th>MONTHLY BASE</th><th>ACTIONS</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><div className="employee-cell"><div className="avatar">{r.name.split(' ').slice(-1)[0].slice(0,1)}{r.name.split(' ')[0].slice(0,1)}</div><div><strong>{r.name}</strong><span className="cell-sub">{r.id}</span></div></div></td><td><strong>{r.jobTitle}</strong><span className="cell-sub">{r.department}</span></td><td>{r.property}</td><td><Badge tone={r.status==='On shift'?'success':'neutral'}>{r.status}</Badge></td><td className="amount-cell">{money(r.salary)}</td><td><Button variant="secondary" onClick={() => deleteEmployee(r)}>Delete</Button></td></tr>)}</tbody></table></div></Panel>{open && <Modal title="Add employee" onClose={() => setOpen(false)}><form className="form-grid" onSubmit={submit}><label className="span-2">Full name<input name="name" required placeholder="Employee full name"/></label><label>Department<select name="department" value={department} onChange={e => setDepartment(e.target.value)} required><option value="">Select department</option><option value="Front Office">Front Office</option><option value="Housekeeping">Housekeeping</option><option value="Management">Management</option><option value="Finance">Finance</option></select></label><label>Job title<select name="jobTitle" value={department ? jobTitleByDepartment[department] : ""} required disabled={!department}><option value="">Select department first</option>{department && <option value={jobTitleByDepartment[department]}>{jobTitleByDepartment[department]}</option>}</select></label><label>Property<select name="property"><option>Hotel A</option><option>Hotel B</option><option>Group</option></select></label><label>Monthly base salary (VND)<input type="number" name="salary" min="0" defaultValue="9000000"/></label><div className="form-actions span-2"><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save employee</Button></div></form></Modal>}</>;
}
function Finance({section = 'billing'}: {section?: 'billing'|'installments'|'payments'|'expenses'}) {
  const isVietnamese = useLanguage() === 'vi';
  const [rows,setRows] = useState<AnyRow[]>([]);
  const [bills,setBills] = useState<AnyRow[]>([]);
  const [query,setQuery] = useState('');
  const [billingStatusFilter, setBillingStatusFilter] = useState('Overdue');
  const [open,setOpen] = useState(false);
  const [modal,setModal] = useState<'configure'|'payment'|'editPayment'|null>(null);
  const [selected,setSelected] = useState<AnyRow|null>(null);
  const [configRentalType,setConfigRentalType] = useState<'Daily'|'Monthly'>('Daily');
  const [selectedPayment,setSelectedPayment] = useState<AnyRow|null>(null);
  const [error,setError] = useState('');
  const [period,setPeriod] = useState(() => new Date().toISOString().slice(0,7));
  const today = new Date().toISOString().slice(0,10);
  const monthOptions = Array.from({length:36},(_,index)=>{
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth()-index);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`,
      label: date.toLocaleDateString(document.documentElement.lang === 'vi' ? 'vi-VN' : 'en-US',{month:'long',year:'numeric'})
    };
  });
  const periodStart = period === 'all' ? '' : `${period}-01`;
  const monthEnd = period === 'all' ? '' : new Date(
    Number(period.slice(0,4)),Number(period.slice(5,7)),0
  ).toISOString().slice(0,10);
  const cutoffDate = period === 'all' ? '' : (monthEnd < today ? monthEnd : today);
  const inPeriod = (date:any) => Boolean(date) && date >= periodStart && date <= cutoffDate;
  const load=()=>api.expenses(query).then(r=>setRows(r.data)).catch(()=>{});
  const loadBills=()=>api.billing().then(r=>setBills(r.data)).catch(()=>{});
  useEffect(()=>{load();},[query]);
  useEffect(()=>{loadBills();},[]);

  // BILLING REGISTER STICKY HEADER
  useEffect(() => {
    if (section !== 'billing' && section !== 'installments') return;

    const wrapper = document.querySelector<HTMLElement>(
      section === 'billing' ? '.billing-register-scroll' : '.installment-breakdown-scroll'
    );
    const table = wrapper?.querySelector<HTMLTableElement>(
      section === 'billing' ? '.billing-register-table' : '.installment-breakdown-table'
    );
    const sourceHead = table?.tHead;
    const topbar = document.querySelector<HTMLElement>('.topbar');

    if (!wrapper || !table || !sourceHead || !topbar) return;

    const floating = document.createElement('div');
    floating.className = 'finance-sticky-floating';
    floating.setAttribute('aria-hidden', 'true');

    const floatingTable = document.createElement('table');
    floatingTable.className = table.className;
    floatingTable.style.width = `${table.scrollWidth}px`;

    const floatingHead = sourceHead.cloneNode(true) as HTMLTableSectionElement;
    floatingTable.appendChild(floatingHead);
    floating.appendChild(floatingTable);
    document.body.appendChild(floating);

    const syncHeader = () => {
      if (window.innerWidth <= 560) {
        floating.style.display = 'none';
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const navBottom = topbar.getBoundingClientRect().bottom;

      const shouldShow =
        tableRect.top < navBottom &&
        tableRect.bottom > navBottom &&
        wrapperRect.bottom > navBottom;

      if (!shouldShow) {
        floating.style.display = 'none';
        return;
      }

      floating.style.display = 'block';
      floating.style.top = `${navBottom}px`;
      floating.style.left = `${wrapperRect.left}px`;
      floating.style.width = `${wrapper.clientWidth}px`;

      floatingTable.style.width = `${table.scrollWidth}px`;
      floatingTable.style.transform = `translateX(-${wrapper.scrollLeft}px)`;

      const originalCells = Array.from(sourceHead.querySelectorAll('th'));
      const clonedCells = Array.from(floatingHead.querySelectorAll('th'));

      originalCells.forEach((cell, index) => {
        const clone = clonedCells[index];
        if (!clone) return;
        const width = cell.getBoundingClientRect().width;
        clone.style.width = `${width}px`;
        clone.style.minWidth = `${width}px`;
        clone.style.maxWidth = `${width}px`;
      });
    };

    wrapper.addEventListener('scroll', syncHeader, { passive: true });
    window.addEventListener('scroll', syncHeader, { passive: true });
    window.addEventListener('resize', syncHeader);
    syncHeader();

    return () => {
      wrapper.removeEventListener('scroll', syncHeader);
      window.removeEventListener('scroll', syncHeader);
      window.removeEventListener('resize', syncHeader);
      floating.remove();
    };
  }, [section]);

  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);await api.createExpense({description:f.get('description'),category:f.get('category'),property:f.get('property'),amount:f.get('amount'),date:f.get('date')});setOpen(false);load();}
  async function saveConfig(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!selected)return;const f=new FormData(e.currentTarget);try{await api.updateBillingSettings(selected.reservationId,{rentalType:f.get('rentalType'),dailyRate:f.get('dailyRate'),monthlyRate:f.get('monthlyRate')});setModal(null);setSelected(null);setError('');loadBills();}catch(err:any){setError(err.message||'Could not save settings.');}}
  async function savePayment(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!selected)return;const f=new FormData(e.currentTarget);try{await api.recordPayment({reservationId:selected.reservationId,amount:f.get('amount'),date:f.get('date'),method:f.get('method'),notes:f.get('notes')});setModal(null);setSelected(null);setError('');loadBills();}catch(err:any){setError(err.message||'Could not record payment.');}}
  async function deletePayment(p:AnyRow){
    const confirmed = window.confirm(
      `Delete payment ${p.id} for ${p.reservationId} (${money(p.amount)})?\n\nThis cannot be undone. The reservation and its charges will remain unchanged.`
    );
    if(!confirmed)return;
    setError('');
    try{
      await api.deletePayment(p.id);
      await loadBills();
    }catch(err:any){
      setError(err.message||'Could not delete payment.');
      window.alert(err.message||'Could not delete payment.');
    }
  }
  async function saveEditedPayment(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!selectedPayment)return;
    const f=new FormData(e.currentTarget);
    try{
      await api.updatePayment(selectedPayment.id,{
        amount:f.get('amount'),
        date:f.get('date'),
        method:f.get('method'),
        notes:f.get('notes')
      });
      setModal(null);
      setSelectedPayment(null);
      setError('');
      await loadBills();
    }catch(err:any){
      setError(err.message||'Could not update payment.');
    }
  }
  const expenseRows = period === 'all' ? rows : rows.filter(r=>inPeriod(String(r.date||'')));
  const total = expenseRows.reduce((sum,r)=>sum+Number(r.amount||0),0);
  const paymentRows = bills.flatMap(r=>(r.payments||[]).map((p:any)=>({...p,guest:r.guest})));
  const paymentsInPeriod = period === 'all'
    ? paymentRows
    : paymentRows.filter(p=>inPeriod(String(p.date||'')));
  const chargesInPeriod = period === 'all' ? 0 : bills.reduce((sum,r)=>
    sum+(r.installments||[]).filter((i:any)=>inPeriod(String(i.dueDate||'')))
      .reduce((sub:number,i:any)=>sub+Number(i.charge||0),0),0);

  // Rebuild historical installment balances using only payments recorded
  // by the selected cutoff. The current All-time view remains unchanged.
  const historicalBills: AnyRow[] = period === 'all' ? bills : bills.map(r=>{
    const installments = (r.installments||[])
      .map((i:any)=>({...i,paid:0,balance:Math.max(0,Number(i.charge||0))}))
      .sort((a:any,b:any)=>String(a.dueDate).localeCompare(String(b.dueDate)));
    const historicalPayments = (r.payments||[])
      .filter((p:any)=>String(p.date||'')<=cutoffDate)
      .sort((a:any,b:any)=>String(a.date||'').localeCompare(String(b.date||'')));

    for (const payment of historicalPayments) {
      let remaining = Math.max(0,Number(payment.amount||0));

      if (r.rentalType === 'Monthly') {
        const eligible = installments.filter(
          (item:any) => String(item.dueDate||'') <= String(payment.date||'')
        );
        const installment = eligible.length ? eligible[eligible.length-1] : null;
        if (!installment) continue;
        const applied = Math.min(Number(installment.balance||0),remaining);
        installment.paid += applied;
        installment.balance -= applied;
        continue;
      }

      for (const installment of installments) {
        if (remaining<=0) break;
        const applied = Math.min(Number(installment.balance||0),remaining);
        installment.paid += applied;
        installment.balance -= applied;
        remaining -= applied;
      }
    }

    const dueInstallments = installments.filter((i:any)=>String(i.dueDate||'')<=cutoffDate);
    const charge = dueInstallments.reduce((sum:number,i:any)=>sum+Number(i.charge||0),0);
    const balance = dueInstallments.reduce((sum:number,i:any)=>sum+Number(i.balance||0),0);
    const overdueAmount = dueInstallments.reduce((sum:number,i:any)=>{
      if (Number(i.balance||0)<=0) return sum;
      const due = String(i.dueDate||'');
      if (r.rentalType!=='Monthly') return due<cutoffDate ? sum+Number(i.balance) : sum;
      const parts = due.split('-').map(Number);
      if (parts.length!==3 || !parts[0] || !parts[1] || !parts[2]) return sum;
      const graceEnd = new Date(Date.UTC(parts[0],parts[1]-1,parts[2]+4))
        .toISOString().slice(0,10);
      return graceEnd<=cutoffDate ? sum+Number(i.balance) : sum;
    },0);
    const paid = Math.max(0,charge-balance);
    const status = charge<=0
      ? (Number(r.charge || 0) > 0 ? 'Upcoming' : 'Setup needed')
      : balance<=0 ? 'Paid'
      : overdueAmount>0 ? 'Overdue' : 'Due';
    return {
      ...r, charge, paid, balance, dueNow:charge, overdueAmount,
      dueDate:dueInstallments.find((i:any)=>Number(i.balance||0)>0)?.dueDate
        || dueInstallments[0]?.dueDate || r.checkIn,
      status,
      installments:dueInstallments,
      payments:historicalPayments
    };
  });

  const charges = period === 'all'
    ? bills.reduce((sum,r)=>sum+Number(r.charge||0),0)
    : chargesInPeriod;
  const paid = period === 'all'
    ? bills.reduce((sum,r)=>sum+Number(r.paid||0),0)
    : paymentsInPeriod.reduce((sum,p)=>sum+Number(p.amount||0),0);
  const balance = historicalBills.reduce((sum,r)=>sum+Number(r.balance||0),0);
  const dueNow = historicalBills.reduce((sum,r)=>sum+Number(r.dueNow||0),0);
  const overdueAmount = historicalBills.reduce((sum,r)=>sum+Number(r.overdueAmount||0),0);
  const monthlyInstallments=bills.flatMap(r=>(r.rentalType==='Monthly'
    ? (r.installments||[]).filter((i:any)=>period==='all'||inPeriod(String(i.dueDate||'')))
      .map((i:any)=>({...i,reservationId:r.reservationId,guest:r.guest,room:r.room}))
    : [])).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  return <>
    <PageHeader eyebrow="FINANCE" title={section==='billing'?'Guest billing register':section==='installments'?'Monthly installment breakdown':section==='payments'?'Payment history':'Expenses'} description="Manage guest charges, installment schedules, recorded payments, and operating expenses." actions={section==='expenses'?<Button onClick={()=>setOpen(true)}><Plus size={16}/> Record expense</Button>:undefined}/>
    <div className="toolbar finance-period-toolbar">
      <label>Reporting period
        <select value={period} onChange={e=>setPeriod(e.target.value)}>
          <option value="all">All-time</option>
          {monthOptions.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </label>
      {period!=='all'&&<span className="cell-sub">Figures through {cutoffDate}</span>}
    </div>
    {section==='expenses'?<>
      <div className="mini-stat-grid"><div><span>{period==='all'?'Total expenses':'Expenses this period'}</span><strong>{money(total)}</strong></div><div><span>Awaiting approval</span><strong>{expenseRows.filter(r=>r.status==='Pending').length}</strong></div><div><span>Approved</span><strong>{expenseRows.filter(r=>r.status==='Approved').length}</strong></div><div><span>Records</span><strong>{expenseRows.length}</strong></div></div>
      <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search expense records…"/></div>
      <Panel title="Expense register" subtitle="Existing expense records are preserved"><div className="table-scroll"><table><thead><tr><th>DATE / REFERENCE</th><th>DESCRIPTION</th><th>CATEGORY</th><th>PROPERTY</th><th>STATUS</th><th>AMOUNT</th></tr></thead><tbody>{expenseRows.map(r=><tr key={r.id}><td><strong>{r.date}</strong><span className="cell-sub">{r.id}</span></td><td>{r.description}</td><td>{r.category}</td><td>{r.property}</td><td><Badge tone={r.status==='Approved'?'success':'warning'}>{r.status}</Badge></td><td className="amount-cell">{money(r.amount)}</td></tr>)}{!expenseRows.length&&<tr><td colSpan={6}>No expenses recorded in this period.</td></tr>}</tbody></table></div></Panel>
    </>:<>
      {section==='billing' && <>
      {period === 'all' ? (
        <div className="mini-stat-grid">
          <div><span>Guest charges</span><strong>{money(charges)}</strong></div>
          <div><span>Payments recorded</span><strong>{money(paid)}</strong></div>
          <div><span>Outstanding balance</span><strong>{money(balance)}</strong></div>
                <div><span>Overdue amount</span><strong>{money(overdueAmount)}</strong></div>
          <div><span>Overdue accounts</span><strong>{historicalBills.filter(r=>r.overdueAmount>0).length}</strong></div>
        </div>
      ) : (
        <div className="mini-stat-grid">
          <div><span>Charges due this period</span><strong>{money(charges)}</strong></div>
          <div><span>Payments recorded this period</span><strong>{money(paid)}</strong></div>
          <div><span>Outstanding at period end</span><strong>{money(balance)}</strong></div>
          <div><span>Overdue amount at cutoff</span><strong>{money(overdueAmount)}</strong></div>
          <div><span>Overdue accounts</span><strong>{historicalBills.filter(r=>r.overdueAmount>0).length}</strong></div>
        </div>
      )}
      <div className="notice"><AlertTriangle size={17}/><div><strong>Billing rules</strong><span>Daily stays are charged at the configured nightly rate multiplied by the number of nights, due on check-in. Monthly stays are prorated by actual calendar-month days and billed on each monthly check-in anniversary. Unpaid monthly bills have a grace period through noon on the fifth calendar day, Ho Chi Minh City time. Check-in night counts; checkout date does not. Existing reservations default to Daily, and no booking is assumed paid.</span></div></div>
      <div className="reservation-tabs billing-status-tabs" role="tablist" aria-label="Filter billing entries by status">
        {['Overdue', 'Due', 'Upcoming', 'Paid', 'Setup needed', 'All'].map(status => (
          <Button
            key={status}
            variant={billingStatusFilter === status ? 'primary' : 'secondary'}
            onClick={() => setBillingStatusFilter(status)}
          >
            {status}
            <span className="billing-status-count">
              {status === 'All' ? historicalBills.length : historicalBills.filter(r => r.status === status).length}
            </span>
          </Button>
        ))}
      </div>
      <Panel title="Guest billing register" subtitle="Billing settings and payments are stored separately from reservations."><div className="table-scroll billing-register-scroll"><table className="billing-register-table"><thead><tr><th>{isVietnamese ? "ĐẶT PHÒNG / KHÁCH" : "RESERVATION / GUEST"}</th><th>{isVietnamese ? "PHÒNG" : "ROOM"}</th><th>{isVietnamese ? "LOẠI LƯU TRÚ" : "TYPE"}</th><th>{isVietnamese ? "THỜI GIAN LƯU TRÚ" : "STAY"}</th><th>{isVietnamese ? "CÁC KHOẢN PHẢI THU" : "CHARGES"}</th><th>{isVietnamese ? "ĐÃ THANH TOÁN" : "PAID"}</th><th>{isVietnamese ? "SỐ DƯ CÒN LẠI" : "BALANCE"}</th><th>{isVietnamese ? "ĐẾN HẠN HIỆN TẠI" : "DUE NOW"}</th><th>{isVietnamese ? "QUÁ HẠN" : "OVERDUE"}</th><th>{isVietnamese ? "NGÀY ĐẾN HẠN CHƯA THANH TOÁN CŨ NHẤT" : "OLDEST UNPAID DUE DATE"}</th><th>{isVietnamese ? "TRẠNG THÁI" : "STATUS"}</th><th>{isVietnamese ? "THAO TÁC" : "ACTIONS"}</th></tr></thead><tbody>
         {historicalBills.filter(r => billingStatusFilter === 'All' || r.status === billingStatusFilter).map(r=><tr key={r.reservationId}><td><strong>{r.reservationId}</strong><span className="cell-sub">{r.guest}</span><details className="billing-mobile-details"><summary>{isVietnamese ? "Xem chi tiết" : "View details"}</summary><div className="billing-mobile-detail-content"><span><strong>Stay:</strong> {r.checkIn} to {r.checkOut}</span><span><strong>Overdue:</strong> {money(r.overdueAmount)}</span><span><strong>Oldest unpaid due date:</strong> {r.dueDate || '—'}</span></div></details></td><td className="billing-room-number">{r.room}</td><td>{r.rentalType}{r.rentalType==='Monthly'&&r.monthlyRate>0?<span className="cell-sub">{money(r.monthlyRate)}/month</span>:null}</td><td>{r.checkIn}<span className="cell-sub">to {r.checkOut}</span></td><td className="amount-cell">{money(r.charge)}</td><td className="amount-cell">{money(r.paid)}</td><td className="amount-cell"><strong>{money(r.balance)}</strong></td><td className="amount-cell">{money(r.dueNow)}</td><td className="amount-cell">{money(r.overdueAmount)}</td><td>{r.dueDate}</td><td><Badge tone={r.status==='Paid'?'success':r.status==='Overdue'||r.status==='Setup needed'?'warning':'neutral'}>{r.status}</Badge></td><td><div className="table-actions"><Button variant="secondary" onClick={()=>{setSelected(r);setConfigRentalType(r.rentalType==='Monthly'?'Monthly':'Daily');setError('');setModal('configure');}}>Configure</Button><Button onClick={()=>{setSelected(r);setError('');setModal('payment');}} disabled={r.status==='Setup needed'}>Record payment</Button></div></td></tr>)}
        {!historicalBills.filter(r => billingStatusFilter === 'All' || r.status === billingStatusFilter).length&&<tr><td colSpan={12}>No billing entries for this status.</td></tr>}
      </tbody></table></div></Panel>
      </>}
      {section==='installments' && <Panel title="Monthly installment breakdown" subtitle="Each monthly charge is prorated by calendar days. Monthly payments are allocated to the anniversary-based period matching the payment date."><div className="table-scroll installment-breakdown-scroll"><table className="installment-breakdown-table"><thead><tr><th>DUE DATE</th><th>RESERVATION / GUEST</th><th>ROOM</th><th>CHARGE</th><th>ALLOCATED PAID</th><th>REMAINING</th><th>STATUS</th></tr></thead><tbody>
        {monthlyInstallments.map((i:any)=><tr key={`${i.reservationId}-${i.dueDate}`}><td>{i.dueDate}</td><td><strong>{i.reservationId}</strong><span className="cell-sub">{i.guest}</span></td><td>{i.room}</td><td className="amount-cell">{money(i.charge)}</td><td className="amount-cell">{money(i.paid)}</td><td className="amount-cell"><strong>{money(i.balance)}</strong></td><td><Badge tone={i.status==='Paid'?'success':i.status==='Overdue'?'warning':i.status==='Due'?'neutral':'info'}>{i.status}</Badge></td></tr>)}
        {!monthlyInstallments.length&&<tr><td colSpan={7}>No monthly installments configured.</td></tr>}
      </tbody></table></div></Panel>}
      {section==='payments' && <Panel title="Payment history" subtitle="Actual recorded payments; existing bookings have no assumed payments."><div className="table-scroll payment-history-scroll"><table className="payment-history-table"><thead><tr><th>DATE / PAYMENT</th><th>RESERVATION</th><th>METHOD</th><th>NOTES</th><th>AMOUNT</th><th>ACTIONS</th></tr></thead><tbody>
        {paymentsInPeriod.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map((p:AnyRow)=><tr key={p.id}><td><strong>{p.date}</strong><span className="cell-sub">{p.id}</span></td><td>{p.reservationId}<span className="payment-guest-name">{p.guest}</span></td><td>{p.method}</td><td>{p.notes||'—'}</td><td className="amount-cell">{money(p.amount)}</td><td><button type="button" className="reservation-edit-btn" onClick={()=>{setSelectedPayment(p);setError('');setModal('editPayment');}}>Edit</button><span className="payment-delete-button"><Button variant="secondary" onClick={()=>deletePayment(p)}>Delete</Button></span></td></tr>)}
        {!paymentsInPeriod.length&&<tr><td colSpan={6}>No payments recorded in this period.</td></tr>}
      </tbody></table></div></Panel>}
    </>}
    {open&&<Modal title="Record an expense" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={submit}><label className="span-2">Description<input name="description" required placeholder="What was purchased or paid for?"/></label><label>Category<select name="category"><option>Utilities</option><option>Supplies</option><option>Maintenance</option><option>Payroll</option><option>Marketing</option><option>Other</option></select></label><label>Business unit<select name="property"><option>Hotel A</option><option>Hotel B</option></select></label><label>Amount (VND)<input type="number" name="amount" min="1" required/></label><label>Date<input type="date" name="date" defaultValue={today}/></label><div className="form-actions span-2"><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit">Save expense</Button></div></form></Modal>}
    {modal==='configure'&&selected&&<Modal title={`Billing settings · ${selected.reservationId}`} onClose={()=>{setModal(null);setSelected(null);setError('');}}><form className="form-grid" onSubmit={saveConfig}><p className="span-2">Guest: <strong>{selected.guest}</strong>, room {selected.room}. Billing rates are stored separately from reservation details.</p><label className="span-2">Rental type<select name="rentalType" value={configRentalType} onChange={(e)=>setConfigRentalType(e.target.value as 'Daily'|'Monthly')}><option value="Daily">Daily — rate per night</option><option value="Monthly">Monthly — calendar-day proration</option></select></label>{configRentalType==='Daily'&&<label className="span-2">Daily rate (VND per night)<input name="dailyRate" type="number" min="1" step="any" defaultValue={selected.dailyRate ?? ''} placeholder="Enter daily rate" required/></label>}{configRentalType==='Monthly'&&<label className="span-2">Monthly rent (VND)<input name="monthlyRate" type="number" min="1" step="1" defaultValue={selected.monthlyRate||''} placeholder="Enter monthly rent" required/></label>}{error&&<p className="span-2">{error}</p>}<div className="form-actions span-2"><Button variant="secondary" onClick={()=>{setModal(null);setSelected(null);}}>Cancel</Button><Button type="submit">Save settings</Button></div></form></Modal>}
    {modal==='payment'&&selected&&<Modal title={`Record payment · ${selected.reservationId}`} onClose={()=>{setModal(null);setSelected(null);setError('');}}><form className="form-grid" onSubmit={savePayment}><p className="span-2">Guest: <strong>{selected.guest}</strong>. Balance: <strong>{money(selected.balance)}</strong></p><label>Amount (VND)<input name="amount" type="number" min="1" max={selected.rentalType==='Monthly' ? undefined : Math.max(1,selected.balance)} defaultValue={selected.balance>0?selected.balance:''} required/></label><label>Payment date<input name="date" type="date" defaultValue={today} required/></label><label>Method<select name="method"><option>Cash</option><option>Bank transfer</option><option>Card</option><option>Other</option></select></label><label>Notes<input name="notes" maxLength={500} placeholder="Optional reference"/></label>{error&&<p className="span-2">{error}</p>}<div className="form-actions span-2"><Button variant="secondary" onClick={()=>{setModal(null);setSelected(null);}}>Cancel</Button><Button type="submit">Save payment</Button></div></form></Modal>}
    {modal==='editPayment'&&selectedPayment&&<Modal title={`Edit payment · ${selectedPayment.id}`} onClose={()=>{setModal(null);setSelectedPayment(null);setError('');}}><form className="form-grid" onSubmit={saveEditedPayment}><p className="span-2">Reservation: <strong>{selectedPayment.reservationId}</strong>. Editing updates this payment rather than creating a new one.</p><label>Amount (VND)<input name="amount" type="number" min="1" step="1" defaultValue={selectedPayment.amount} required/></label><label>Payment date<input name="date" type="date" defaultValue={selectedPayment.date} required/></label><label>Method<select name="method" defaultValue={selectedPayment.method}><option>Cash</option><option>Bank transfer</option><option>Card</option><option>Other</option></select></label><label>Notes<input name="notes" maxLength={500} defaultValue={selectedPayment.notes||''} placeholder="Optional reference"/></label>{error&&<p className="span-2">{error}</p>}<div className="form-actions span-2"><Button variant="secondary" onClick={()=>{setModal(null);setSelectedPayment(null);setError('');}}>Cancel</Button><Button type="submit">Save changes</Button></div></form></Modal>}
  </>;
}
function Maintenance() {
  const [tasks,setTasks]=useState<AnyRow[]>([]); useEffect(()=>{api.tasks().then(r=>setTasks(r.data)).catch(()=>{});},[]);
  return <><PageHeader eyebrow="PROPERTY OPERATIONS" title="Maintenance" description="Monitor repairs, service requests, and property tasks." actions={<Button onClick={()=>alert('Task creation endpoint can be added next.')}><Plus size={16}/> New request</Button>}/><div className="mini-stat-grid"><div><span>Open tasks</span><strong>{tasks.length}</strong></div><div><span>High priority</span><strong>{tasks.filter(t=>t.priority==='High').length}</strong></div><div><span>Overdue</span><strong>{tasks.filter(t=>t.status==='Overdue').length}</strong></div><div><span>Completed today</span><strong>4</strong></div></div><Panel title="Maintenance & operational tasks" subtitle="Sample task register"><div className="table-scroll"><table><thead><tr><th>TASK</th><th>PROPERTY</th><th>ASSIGNED TO</th><th>PRIORITY</th><th>STATUS</th></tr></thead><tbody>{tasks.map(t=><tr key={t.id}><td><strong>{t.title}</strong><span className="cell-sub">{t.id}</span></td><td>{t.property}</td><td>{t.assignee}</td><td><Badge tone={t.priority==='High'?'danger':'neutral'}>{t.priority}</Badge></td><td><Badge tone={t.status==='Overdue'?'warning':'info'}>{t.status}</Badge></td></tr>)}</tbody></table></div></Panel></>;
}
function Reports({property}:{property:string}) {
  const [data,setData]=useState<AnyRow|null>(null);useEffect(()=>{api.overview(property).then(r=>setData(r.data));},[property]);
  return <><PageHeader eyebrow="BUSINESS INTELLIGENCE" title="Reports & analytics" description="Explore the performance indicators used in the owner dashboard." actions={<Button variant="secondary" onClick={()=>window.print()}><FileText size={16}/> Print report</Button>}/><div className="stat-grid"><StatCard title="Revenue" value={money(data?.revenue||0)} icon={<CircleDollarSign size={19}/>} note="sample month"/><StatCard title="Operating profit" value={money(data?.operatingProfit||0)} icon={<ChartNoAxesCombined size={19}/>} note="illustrative estimate"/><StatCard title="Occupancy" value={`${data?.occupancy||0}%`} icon={<BedDouble size={19}/>} note="selected properties"/><StatCard title="Staff" value={String(data?.employeeCount||0)} icon={<Users size={19}/>} note="group-wide sample"/></div><Panel title="Revenue comparison" subtitle="VND millions · sample values"><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={(data?.revenueTrend || []).map((item: AnyRow) => {
  if (!document.documentElement.lang.toLowerCase().startsWith('vi')) return item;
  const months: Record<string, string> = {
    Jan: 'Tháng 1', January: 'Tháng 1',
    Feb: 'Tháng 2', February: 'Tháng 2',
    Mar: 'Tháng 3', March: 'Tháng 3',
    Apr: 'Tháng 4', April: 'Tháng 4',
    May: 'Tháng 5',
    Jun: 'Tháng 6', June: 'Tháng 6',
    Jul: 'Tháng 7', July: 'Tháng 7',
    Aug: 'Tháng 8', August: 'Tháng 8',
    Sep: 'Tháng 9', September: 'Tháng 9',
    Oct: 'Tháng 10', October: 'Tháng 10',
    Nov: 'Tháng 11', November: 'Tháng 11',
    Dec: 'Tháng 12', December: 'Tháng 12'
  };
  return { ...item, month: months[item.month] || item.month };
})} margin={{top:12,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5"/><XAxis dataKey="month" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Bar dataKey="hotelA" name="Hotel A" fill="#4779ed" radius={[5,5,0,0]}/><Bar dataKey="hotelB" name="Hotel B" fill="#25b99a" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></Panel><div className="notice"><AlertTriangle size={17}/><div><strong>Reporting note</strong><span>Operating profit is a demonstration estimate, not a formal accounting calculation. Connect verified transactions and accounting rules before relying on reports.</span></div></div></>;
}
function SettingsPage() {
  const [selectedSection, setSelectedSection] = useState('');
  const [backupState, setBackupState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [backupMessage, setBackupMessage] = useState('');

  async function sendBackup() {
    if (backupState === 'sending') return;
    setBackupState('sending');
    setBackupMessage('Creating the Excel workbook and sending email...');
    try {
      const result = await api.backupEmail();
      setBackupState('success');
      setBackupMessage(`${result.message} Sent to ${result.recipient}. ${result.collections} collections and ${result.records} records included.`);
    } catch (error) {
      setBackupState('error');
      setBackupMessage(error instanceof Error ? error.message : 'Backup email failed.');
    }
  }

  if (selectedSection === "users") return <UserManagement onBack={() => setSelectedSection("")}/>;

  return <><PageHeader eyebrow="ADMINISTRATION" title="Settings" description="Configure how your business management system is organized."/><div className="settings-language"><h3>Language</h3><p>Choose the language used throughout the app.</p><LanguageToggle /></div><div className="backup-panel">
      <div className="backup-copy">
        <div className="settings-icon"><FileText size={22} /></div>
        <div>
          <h3>Email Excel data backup</h3>
          <p>Send a formatted Excel workbook containing all properties and stored records to xuther86@gmail.com.</p>
          <span>Includes properties, reservations, rooms, employees, expenses, tasks, and activity logs.</span>
        </div>
      </div>
      <div className="backup-actions">
        <Button onClick={() => { void downloadBackup(`${API_URL}/backup/download`, 'hospitality-group-data-backup.xlsx', setBackupMessage, setBackupState); }}>
          Download All Data
        </Button>
        <Button onClick={() => { void downloadBackup(`${API_URL}/backup/reservations/download`, 'hospitality-group-reservations.xlsx', setBackupMessage, setBackupState); }}>
          Download Reservations Data
        </Button>
        <Button variant="secondary" onClick={sendBackup} disabled={backupState === 'sending'}>
          {backupState === 'sending' ? 'Sending backup...' : 'Send Excel Backup'}
        </Button>
      </div>
      {backupMessage && <p className={`backup-message ${backupState}`} role="status">{backupMessage}</p>}
    </div><div className="settings-grid">{[{icon:<Building2/>,title:'Business & properties',text:'Manage hotels, business units, addresses, and operating settings.'},{icon:<Users/>,title:'Users & permissions',text:'Manage user accounts, roles, and property access.'},{icon:<Wallet/>,title:'Finance configuration',text:'Set currencies, expense categories, and approval thresholds.'},{icon:<Bell/>,title:'Notifications',text:'Choose which alerts and reminders are sent to each role.'},{icon:<FileText/>,title:'Documents & policies',text:'Configure document categories and retention policies.'},{icon:<Settings/>,title:'System preferences',text:'Language, time zone, date format, and application preferences.'}].map((s,i)=><button className="settings-card" key={i} onClick={()=>{if(s.title==='Users & permissions')setSelectedSection('users');else alert('This settings module has not been connected yet.');}}><div className="settings-icon">{s.icon}</div><strong>{s.title}</strong><span>{s.text}</span><ArrowUpRight size={16}/></button>)}</div><div className="notice demo-notice"><AlertTriangle size={17}/><div><strong>Prototype security</strong><span>Demo mode does not implement real authentication or authorization. Do not enter real personal, payroll, or financial data.</span></div></div></>;
}

function UserManagement({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<AnyRow[]>([]);
  const [properties, setProperties] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [propertyIds, setPropertyIds] = useState<string[]>(['all']);
  const [editingUser, setEditingUser] = useState<AnyRow | null>(null);
  const [editPropertyIds, setEditPropertyIds] = useState<string[]>(['all']);

  async function loadUsers() {
    setLoading(true);
    try {
      const [userResult, propertyResult] = await Promise.all([
        api.users(),
        api.properties()
      ]);
      setUsers(userResult.data || []);
      setProperties(propertyResult.data || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load accounts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadUsers(); }, []);

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const data = {
      username: String(form.get('username') || '').trim().toLowerCase(),
      name: String(form.get('name') || '').trim(),
      jobTitle: String(form.get('jobTitle') || '').trim(),
      password: String(form.get('password') || ''),
      role: String(form.get('role') || 'Receptionist'),
      propertyIds: propertyIds.includes('all') ? ['all'] : propertyIds
    };

    setBusy(true);
    setError('');
    setNotice('');

    try {
      await api.createUser(data);
      formElement.reset();
      setPropertyIds(['all']);
      setNotice('Account created successfully.');
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account.');
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(user: AnyRow) {
    const password = window.prompt(
      `Enter a new password for ${user.username}. Use at least 8 characters:`
    );
    if (password === null) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setNotice('');
    try {
      await api.resetUserPassword(user.id, password);
      setNotice(`Password updated for ${user.username}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reset password.');
    }
  }

  async function deleteAccount(user: AnyRow) {
    if (!window.confirm(`Delete the account "${user.username}"? This cannot be undone.`)) return;

    setError('');
    setNotice('');
    try {
      await api.deleteUser(user.id);
      setNotice(`Account "${user.username}" deleted.`);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete account.');
    }
  }

  function startEditingUser(user: AnyRow) {
    setEditingUser(user);
    setEditPropertyIds(
      !user.propertyIds?.length || user.propertyIds.includes('all')
        ? ['all']
        : [...user.propertyIds]
    );
    setError('');
    setNotice('');
  }

  function toggleEditProperty(id: string, checked: boolean) {
    if (id === 'all') {
      setEditPropertyIds(checked ? ['all'] : []);
      return;
    }
    setEditPropertyIds(current => {
      const next = current.filter(value => value !== 'all');
      return checked
        ? [...new Set([...next, id])]
        : next.filter(value => value !== id);
    });
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !editingUser) return;

    const form = new FormData(event.currentTarget);
    const data = {
      name: String(form.get('name') || '').trim(),
      jobTitle: String(form.get('jobTitle') || '').trim(),
      role: String(form.get('role') || ''),
      propertyIds: editPropertyIds.includes('all') ? ['all'] : editPropertyIds
    };

    if (!data.propertyIds.length) {
      setError('Select All hotels or at least one hotel.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api.updateUser(editingUser.id, data);
      setNotice(`Profile updated for ${editingUser.username}.`);
      setEditingUser(null);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update profile.');
    } finally {
      setBusy(false);
    }
  }

  function toggleProperty(id: string, checked: boolean) {
    if (id === 'all') {
      setPropertyIds(checked ? ['all'] : []);
      return;
    }
    setPropertyIds(current => {
      const next = current.filter(value => value !== 'all');
      return checked ? [...next, id] : next.filter(value => value !== id);
    });
  }

  function propertyLabel(user: AnyRow) {
    if (!user.propertyIds?.length || user.propertyIds.includes('all')) return 'All hotels';
    return user.propertyIds
      .map((id: string) => properties.find(p => p.id === id)?.name || id)
      .join(', ');
  }

  return <>
    <PageHeader
      eyebrow="ADMINISTRATION"
      title="Users & permissions"
      description="Create staff accounts, assign roles, and manage account passwords."
      actions={<Button variant="secondary" onClick={onBack}>Back to settings</Button>}
    />

    {error && <div className="notice auth-error-panel" role="alert"><AlertTriangle size={17}/><div><strong>Action failed</strong><span>{error}</span></div></div>}
    {notice && <div className="notice auth-success-panel" role="status"><CheckCircle2 size={17}/><div><strong>Success</strong><span>{notice}</span></div></div>}

    <div className="user-admin-grid">
      <Panel title="Create staff account" subtitle="Usernames must be unique. Passwords must contain at least 8 characters.">
        <form className="user-create-form" onSubmit={createAccount}>
          <label>Full name<input name="name" required minLength={2} maxLength={100} placeholder="e.g. Nguyen Van An"/></label>
          <label>Job title<input name="jobTitle" maxLength={100} placeholder="e.g. Front Office Supervisor"/></label>
          <label>Username<input name="username" required minLength={3} maxLength={32} pattern="[A-Za-z0-9._-]+" autoComplete="off" placeholder="e.g. receptionist01"/></label>
          <label>Temporary password<input name="password" type="password" required minLength={8} maxLength={200} autoComplete="new-password" placeholder="At least 8 characters"/></label>
          <label>Role
            <select name="role" defaultValue="Receptionist">
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Finance">Finance</option>
            </select>
          </label>
          <fieldset className="user-property-fieldset">
            <legend>Assigned hotels</legend>
            <label className="user-property-option">
              <input type="checkbox" checked={propertyIds.includes('all')} onChange={e => toggleProperty('all', e.target.checked)}/>
              All hotels
            </label>
            {properties.map(p => <label className="user-property-option" key={p.id}>
              <input type="checkbox" checked={propertyIds.includes(p.id)} onChange={e => toggleProperty(p.id, e.target.checked)}/>
              {p.name}
            </label>)}
            <span className="field-help">Assignments are saved, but hotel-specific API restrictions are not yet enforced.</span>
          </fieldset>
          <Button type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
        </form>
      </Panel>

      <Panel title="Existing accounts" subtitle={`${users.length} account${users.length === 1 ? '' : 's'} configured`}
        action={<button className="text-button" onClick={() => void loadUsers()}><RefreshCw size={14}/> Refresh</button>}>
        {loading ? <div className="loading"><RefreshCw className="spin"/> Loading accounts…</div> :
          users.length === 0 ? <EmptyState title="No accounts found" text="Create an account to get started."/> :
          <div className="user-list">
            {users.map(user => <div className="user-row" key={user.id}>
              <div className="user-row-avatar">{String(user.name || user.username).slice(0, 2).toUpperCase()}</div>
              <div className="user-row-info">
                <strong>{user.name}</strong>
                <span>@{user.username}</span>
                {user.jobTitle && <span>{user.jobTitle}</span>}
                <span className="user-row-meta">{user.role} · {propertyLabel(user)}</span>
              </div>
              <div className="user-row-actions">
                <button className="button secondary small" onClick={() => startEditingUser(user)}>Edit profile</button>
                <button className="button secondary small" onClick={() => void resetPassword(user)}>Reset password</button>
                <button className="button danger small" onClick={() => void deleteAccount(user)}>Delete</button>
              </div>
            </div>)}
          </div>
        }
      </Panel>
    </div>
    {editingUser && <Modal title={`Edit profile — ${editingUser.username}`} onClose={() => {
      if (!busy) setEditingUser(null);
    }}>
      <form className="user-create-form profile-edit-form" onSubmit={saveProfile} style={{padding: 20}}>
        <label>Full name
          <input name="name" required minLength={2} maxLength={100} defaultValue={editingUser.name || ''}/>
        </label>
        <label>Job title / position
          <input name="jobTitle" maxLength={100} defaultValue={editingUser.jobTitle || ''} placeholder="e.g. Front Office Supervisor"/>
        </label>
        <label>System role
          <select name="role" defaultValue={editingUser.role || 'Receptionist'}>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Finance">Finance</option>
          </select>
        </label>
        <fieldset className="user-property-fieldset">
          <legend>Assigned hotels</legend>
          <label className="user-property-option">
            <input type="checkbox" checked={editPropertyIds.includes('all')} onChange={e => toggleEditProperty('all', e.target.checked)}/>
            All hotels
          </label>
          {properties.map(p => <label className="user-property-option" key={p.id}>
            <input type="checkbox" checked={editPropertyIds.includes(p.id)} onChange={e => toggleEditProperty(p.id, e.target.checked)}/>
            {p.name}
          </label>)}
          <span className="field-help">Hotel assignments are stored, but do not yet restrict API data access.</span>
        </fieldset>
        <div className="form-actions">
          <button type="button" className="button secondary" disabled={busy} onClick={() => setEditingUser(null)}>Cancel</button>
          <Button type="submit" disabled={busy}>{busy ? 'Saving profile…' : 'Save profile'}</Button>
        </div>
      </form>
    </Modal>}

    <div className="notice demo-notice"><AlertTriangle size={17}/><div>
      <strong>Access-control limitation</strong>
      <span>Login and account administration are active. Hotel assignments are currently stored for reference, but do not yet restrict which hotel data a signed-in staff member can access. Complete backend authorization before public production use.</span>
    </div></div>
  </>;
}

function ComingSoon({title,description,icon}:{title:string;description:string;icon:ReactNode}) {
  return <><PageHeader eyebrow="BUSINESS OPERATIONS" title={title} description={description}/><div className="coming-card"><div className="coming-icon">{icon}</div><h2>Module foundation is ready</h2><p>This section is included in the navigation and can be built next. Its production endpoints and workflows have not yet been implemented in the simulated API.</p><Button onClick={()=>alert('This module is on the implementation roadmap.')}>View implementation roadmap <ArrowUpRight size={15}/></Button></div></>;
}
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18}/></button></div>{children}</div></div>;
}
function ErrorState({error,retry}:{error:string;retry:()=>void}) { return <div className="error-state"><AlertTriangle size={24}/><h2>Could not load data</h2><p>{error}. Make sure the simulated API server is running.</p><Button onClick={retry}><RefreshCw size={15}/> Try again</Button></div>; }
export default App;
