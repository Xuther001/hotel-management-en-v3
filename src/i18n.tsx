import { useEffect, useState } from 'react';
import { api } from './api';

type Language = 'en' | 'vi';
const translations: Record<string, string> = {
  "Dashboard": "Tổng quan",
  "Business overview": "Tổng quan doanh nghiệp",
  "WORKSPACE": "KHÔNG GIAN LÀM VIỆC",
  "OPERATIONS": "VẬN HÀNH",
  "MANAGEMENT": "QUẢN LÝ",
  "Hospitality Group": "Tập đoàn Khách sạn",
  "BUSINESS MANAGEMENT": "QUẢN LÝ DOANH NGHIỆP",
  "HOTEL MANAGEMENT": "QUẢN LÝ KHÁCH SẠN",
  "All hotels": "Tất cả khách sạn",
  "Reservations": "Đặt phòng",
  "Reservation Calendar": "Lịch đặt phòng",
  "Room management": "Quản lý phòng",
  "View room availability, update operational status, and maintain room notes.": "Xem tình trạng phòng, cập nhật trạng thái vận hành và ghi chú phòng.",
  "HOTEL OPERATIONS": "VẬN HÀNH KHÁCH SẠN",
  "PROPERTY OPERATIONS": "VẬN HÀNH CƠ SỞ",
  "Refresh": "Làm mới",
  "Please wait…": "Vui lòng đợi…",
  "View rooms ›": "Xem phòng ›",
  "No note added.": "Chưa có ghi chú.",
  "Add note": "Thêm ghi chú",
  "Edit note": "Sửa ghi chú",
  "Human resources": "Nhân sự",
  "Finance & expenses": "Tài chính & chi phí",
  "Guest billing register": "Sổ công nợ khách",
  "Monthly installment breakdown": "Chi tiết thanh toán theo tháng",
  "Payment history": "Lịch sử thanh toán",
  "Expenses": "Chi phí",
  "Inventory": "Kho hàng",
  "Maintenance": "Bảo trì",
  "Reports & analytics": "Báo cáo & phân tích",
  "Settings": "Cài đặt",
  "Welcome back": "Chào mừng trở lại",
  "Sign in to access your hotel management workspace.": "Đăng nhập để truy cập hệ thống quản lý khách sạn.",
  "Username": "Tên đăng nhập",
  "Password": "Mật khẩu",
  "Sign in": "Đăng nhập",
  "Signing in…": "Đang đăng nhập…",
  "Authorized staff only": "Chỉ dành cho nhân viên được cấp quyền",
  "Sign out": "Đăng xuất",
  "Search": "Tìm kiếm",
  "Notifications": "Thông báo",
  "New reservation": "Đặt phòng mới",
  "Create reservation": "Tạo đặt phòng",
  "Edit reservation": "Sửa đặt phòng",
  "Save changes": "Lưu thay đổi",
  "Cancel": "Hủy",
  "Delete": "Xóa",
  "Guest full name": "Họ và tên khách",
  "Full name": "Họ và tên",
  "Hotel": "Khách sạn",
  "Room number": "Số phòng",
  "Check-in": "Ngày nhận phòng",
  "Check-out": "Ngày trả phòng",
  "Department": "Phòng ban",
  "Job title": "Chức danh",
  "Property": "Cơ sở",
  "Occupied": "Đang có khách",
  "Vacant": "Phòng trống",
  "Clean": "Sạch",
  "Dirty": "Chưa dọn",
  "Confirmed": "Đã xác nhận",
  "Arriving today": "Đến hôm nay",
  "Checked in": "Đã nhận phòng",
  "Checked out": "Đã trả phòng",
  "Cancelled": "Đã hủy",
  "No-show": "Không đến",
  "Enable Notifications": "Bật thông báo",
  "Notifications Enabled": "Đã bật thông báo",
  "Add employee": "Thêm nhân viên",
  "Save employee": "Lưu nhân viên",
  "Front Office": "Lễ tân",
  "Housekeeping": "Buồng phòng",
  "Management": "Quản lý",
  "Finance": "Tài chính",
  "Receptionist": "Nhân viên lễ tân",
  "Housekeeper": "Nhân viên buồng phòng",
  "Hotel Manager": "Quản lý khách sạn",
  "Accountant": "Kế toán",
  "Revenue": "Doanh thu",
  "Occupancy": "Công suất phòng",
  "Print report": "In báo cáo",
  "Overview": "Tổng quan",
  "OVERVIEW": "TỔNG QUAN",
  "ADMINISTRATION": "QUẢN TRỊ",
  "Configure how your business management system is organized.": "Cấu hình cách tổ chức hệ thống quản lý doanh nghiệp.",
  "Choose the language used throughout the app.": "Chọn ngôn ngữ sử dụng trong toàn bộ ứng dụng.",
  "Email Excel data backup": "Sao lưu dữ liệu Excel qua email",
  "Send a formatted Excel workbook containing all properties and stored records to xuther86@gmail.com.": "Gửi tệp Excel được định dạng, chứa tất cả cơ sở và dữ liệu đã lưu, đến xuther86@gmail.com.",
  "Includes properties, reservations, rooms, employees, expenses, tasks, and activity logs.": "Bao gồm cơ sở, đặt phòng, phòng, nhân viên, chi phí, công việc và nhật ký hoạt động.",
  "Download All Data": "Tải xuống toàn bộ dữ liệu",
  "Download Reservations Data": "Tải xuống dữ liệu đặt phòng",
  "Sending backup...": "Đang gửi bản sao lưu...",
  "Send Excel Backup": "Gửi bản sao lưu Excel",
  "Business & properties": "Doanh nghiệp và cơ sở",
  "Manage hotels, business units, addresses, and operating settings.": "Quản lý khách sạn, đơn vị kinh doanh, địa chỉ và cài đặt vận hành.",
  "Users & permissions": "Người dùng và quyền hạn",
  "Manage user accounts, roles, and property access.": "Quản lý tài khoản người dùng, vai trò và quyền truy cập cơ sở.",
  "Finance configuration": "Cấu hình tài chính",
  "Set currencies, expense categories, and approval thresholds.": "Thiết lập tiền tệ, danh mục chi phí và hạn mức phê duyệt.",
  "Choose which alerts and reminders are sent to each role.": "Chọn cảnh báo và lời nhắc được gửi đến từng vai trò.",
  "Documents & policies": "Tài liệu và chính sách",
  "Configure document categories and retention policies.": "Cấu hình danh mục tài liệu và chính sách lưu trữ.",
  "System preferences": "Tùy chọn hệ thống",
  "Language, time zone, date format, and application preferences.": "Ngôn ngữ, múi giờ, định dạng ngày tháng và các tùy chọn ứng dụng.",
  "Prototype security": "Bảo mật bản mẫu",
  "Demo mode does not implement real authentication or authorization. Do not enter real personal, payroll, or financial data.": "Chế độ dùng thử chưa triển khai xác thực và phân quyền thực tế. Không nhập dữ liệu cá nhân, tiền lương hoặc tài chính thật.",
  "This settings module has not been connected yet.": "Chức năng cài đặt này chưa được kết nối.",
  "Workspace": "Không gian làm việc",
  "Admin": "Quản trị viên",
  "rooms": "phòng",
  "rooms ": "phòng ",
  "Floor": "Tầng",
  "Search room number or type…": "Tìm số phòng hoặc loại phòng…",
  "No rooms currently have this status.": "Hiện không có phòng nào ở trạng thái này.",
  "Room": "Phòng",
  "Internal management system · Local API data": "Hệ thống quản lý nội bộ · Dữ liệu API cục bộ",
  "See guest arrivals and departures by date and room across your selected hotels.": "Theo dõi khách nhận phòng và trả phòng theo ngày, phòng và khách sạn đã chọn.",
  "Each entry shows the room number and guest name.": "Mỗi mục hiển thị số phòng và tên khách.",
  "Today": "Hôm nay",
  "Previous": "Trước",
  "Next": "Tiếp",
  "Check-ins": "Lượt nhận phòng",
  "Check-outs": "Lượt trả phòng",
  "Arrivals & departures": "Khách nhận phòng và trả phòng",
  "View Details": "Xem chi tiết",
  "Use the hotel selector at the top to filter the calendar.": "Sử dụng bộ chọn khách sạn ở phía trên để lọc lịch.",
  "Loading reservations…": "Đang tải đặt phòng…",
  "Guest name unavailable": "Không có tên khách",
  "Unknown hotel": "Khách sạn không xác định",
  "In": "Nhận phòng",
  "Out": "Trả phòng",
  "FRONT DESK": "LỄ TÂN",
  "Mon": "Thứ 2",
  "Tue": "Thứ 3",
  "Wed": "Thứ 4",
  "Thu": "Thứ 5",
  "Fri": "Thứ 6",
  "Sat": "Thứ 7",
  "Sun": "Chủ nhật",
  "active reservations": "đặt phòng đang hoạt động",
  "check-ins today": "lượt nhận phòng hôm nay",
  "check-outs today": "lượt trả phòng hôm nay",

};

type Tracked = { original: string; last: string };
const trackedText = new WeakMap<Node, Tracked>();
const trackedAttrs = new WeakMap<Element, Map<string, Tracked>>();

let activeLanguage: Language = 'en';
let pageObserver: MutationObserver | null = null;
let pageUpdate: (() => void) | null = null;
let accountLanguage: Language | null = null;
let languageListeners = new Set<(language: Language) => void>();

function readLocalLanguage(): Language {
  try {
    return localStorage.getItem('hotel_language') === 'vi' ? 'vi' : 'en';
  } catch {
    return 'en';
  }
}

export function setLanguagePreference(language: Language) {
  accountLanguage = language;
  activeLanguage = language;
  try { localStorage.setItem('hotel_language', language); } catch {}
  languageListeners.forEach(listener => listener(language));
  pageUpdate?.();
}

export async function initializeAccountLanguage(savedLanguage?: string) {
  let localLanguage: Language | null = null;

  try {
    const stored = localStorage.getItem('hotel_language');
    if (stored === 'en' || stored === 'vi') {
      localLanguage = stored;
    }
  } catch {}

  const accountLanguage: Language | null =
    savedLanguage === 'en' || savedLanguage === 'vi'
      ? savedLanguage
      : null;

  // Preserve the browser's explicit choice across refreshes.
  const language: Language = localLanguage ?? accountLanguage ?? 'en';

  setLanguagePreference(language);

  // Keep the account preference synchronized with the chosen language.
  if (accountLanguage !== language) {
    try {
      await api.updateLanguage(language);
    } catch (error) {
      console.error('Could not synchronize account language preference:', error);
    }
  }
}
export function clearAccountLanguage() {
  accountLanguage = null;
}

function translated(original: string, language: Language): string {
  const value = original.trim();
  if (!value) return original;
  let result = value;
  if (language === 'vi') {
    result = translations[value] || value;
  } else {
    result = Object.entries(translations).find(([, vi]) => vi === value)?.[0] || value;
  }
  return original.replace(value, result);
}

export function useLanguage(): Language {
  const [language, setLanguage] = useState<Language>(() => accountLanguage || readLocalLanguage());

  useEffect(() => {
    const listener = (next: Language) => setLanguage(next);
    languageListeners.add(listener);
    return () => { languageListeners.delete(listener); };
  }, []);

  return language;
}

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>(() => accountLanguage || readLocalLanguage());

  useEffect(() => {
    const listener = (next: Language) => setLanguage(next);
    languageListeners.add(listener);
    return () => { languageListeners.delete(listener); };
  }, []);

  useEffect(() => {
    activeLanguage = language;
    try { localStorage.setItem('hotel_language', language); } catch {}
    document.documentElement.lang = language;

    const update = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;

      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,textarea,[contenteditable="true"]')) continue;

        const current = node.nodeValue || '';
        let record = trackedText.get(node);

        if (!record || current !== record.last) {
          record = { original: current, last: current };
          trackedText.set(node, record);
        }

        const next = translated(record.original, activeLanguage);
        if (next !== current) node.nodeValue = next;
        record.last = next;
      }

      document.querySelectorAll<HTMLElement>('[placeholder],[title],[aria-label]').forEach(el => {
        let records = trackedAttrs.get(el);
        if (!records) {
          records = new Map();
          trackedAttrs.set(el, records);
        }

        for (const attr of ['placeholder', 'title', 'aria-label']) {
          const current = el.getAttribute(attr);
          if (current === null) continue;

          let record = records.get(attr);
          if (!record || current !== record.last) {
            record = { original: current, last: current };
            records.set(attr, record);
          }

          const next = translated(record.original, activeLanguage);
          if (next !== current) el.setAttribute(attr, next);
          record.last = next;
        }
      });
    };

    pageUpdate = update;
    update();

    if (!pageObserver) {
      pageObserver = new MutationObserver(() => pageUpdate?.());
      pageObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['placeholder', 'title', 'aria-label']
      });
    }
  }, [language]);

  return <div className="language-toggle" role="group" aria-label="Language">
    <button
      type="button"
      className={language === 'vi' ? 'language-option active' : 'language-option'}
      aria-pressed={language === 'vi'}
      onClick={() => {
        setLanguagePreference('vi');
        if (localStorage.getItem('hotel_auth_token')) {
          void api.updateLanguage('vi').catch(error =>
            console.error('Could not save language preference:', error)
          );
        }
      }}
    >Tiếng Việt</button>
    <button
      type="button"
      className={language === 'en' ? 'language-option active' : 'language-option'}
      aria-pressed={language === 'en'}
      onClick={() => {
        setLanguagePreference('en');
        if (localStorage.getItem('hotel_auth_token')) {
          void api.updateLanguage('en').catch(error =>
            console.error('Could not save language preference:', error)
          );
        }
      }}
    >English</button>
  </div>;
}
