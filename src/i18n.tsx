import { useEffect, useState } from 'react';

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
  "Internal management system · Local API data": "Hệ thống quản lý nội bộ · Dữ liệu API cục bộ"
};

type Tracked = { original: string; last: string };
const trackedText = new WeakMap<Node, Tracked>();
const trackedAttrs = new WeakMap<Element, Map<string, Tracked>>();

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

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('hotel_language') === 'vi' ? 'vi' : 'en';
    } catch { return 'en'; }
  });

  useEffect(() => {
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
        const next = translated(record.original, language);
        if (next !== current) node.nodeValue = next;
        record.last = next;
      }

      document.querySelectorAll<HTMLElement>('[placeholder],[title],[aria-label]').forEach(el => {
        let records = trackedAttrs.get(el);
        if (!records) { records = new Map(); trackedAttrs.set(el, records); }
        for (const attr of ['placeholder', 'title', 'aria-label']) {
          const current = el.getAttribute(attr);
          if (current === null) continue;
          let record = records.get(attr);
          if (!record || current !== record.last) {
            record = { original: current, last: current };
            records.set(attr, record);
          }
          const next = translated(record.original, language);
          if (next !== current) el.setAttribute(attr, next);
          record.last = next;
        }
      });
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label']
    });
    return () => observer.disconnect();
  }, [language]);

  return <div className="language-toggle" role="group" aria-label="Language">
    <button
      type="button"
      className={language === 'vi' ? 'language-option active' : 'language-option'}
      aria-pressed={language === 'vi'}
      onClick={() => setLanguage('vi')}
    >Tiếng Việt</button>
    <button
      type="button"
      className={language === 'en' ? 'language-option active' : 'language-option'}
      aria-pressed={language === 'en'}
      onClick={() => setLanguage('en')}
    >English</button>
  </div>;
}
