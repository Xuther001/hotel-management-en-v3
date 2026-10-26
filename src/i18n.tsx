import { useEffect, useState } from 'react';
import { api } from './api';

type Language = 'en' | 'vi';
const translations: Record<string, string> = {
  "Dashboard": "Tổng quan",
  "PEOPLE & CULTURE": "NHÂN SỰ",
  "People & Culture": "Nhân sự",
  "Administrator": "Quản trị viên",
  "Employee directory and staffing overview.": "Danh sách nhân viên và tổng quan nhân sự.",
  "Total employees": "Tổng số nhân viên",
  "On shift": "Đang làm việc",
  "Departments": "Phòng ban",
  "Monthly base salaries": "Tổng lương cơ bản hàng tháng",
  "Employee directory": "Danh sách nhân viên",
  "Demo records; salary data is shown for prototyping only": "Dữ liệu minh họa; thông tin lương chỉ phục vụ thử nghiệm giao diện.",
  "EMPLOYEE": "NHÂN VIÊN",
  "ROLE / DEPARTMENT": "CHỨC VỤ / PHÒNG BAN",
  "PROPERTY": "KHÁCH SẠN",
  "MONTHLY BASE": "LƯƠNG CƠ BẢN / THÁNG",
  "A live overview based on your saved hotel records.": "Tổng quan trực tiếp dựa trên dữ liệu khách sạn đã lưu.",
  "Completed stay revenue": "Doanh thu từ kỳ lưu trú đã hoàn tất",
  "completed checkouts this month": "Lượt trả phòng hoàn tất trong tháng này",
  "Operating profit": "Lợi nhuận hoạt động",
  "unavailable · reconcile expenses": "Chưa có dữ liệu · cần đối soát chi phí",
  "Room occupancy": "Công suất phòng",
  "occupied rooms / available rooms": "Phòng có khách / phòng khả dụng",
  "Active employees": "Nhân viên đang hoạt động",
  "active staff records": "Hồ sơ nhân viên đang hoạt động",
  "Revenue performance": "Hiệu quả doanh thu",
  "Completed stay amounts by checkout month · VND millions": "Doanh thu kỳ lưu trú đã hoàn tất theo tháng trả phòng · triệu đồng",
  "View report": "Xem báo cáo",
  "Hotel performance": "Hiệu quả khách sạn",
  "Current occupancy": "Công suất phòng hiện tại",
  "Details": "Chi tiết",
  "Combined monthly revenue": "Tổng doanh thu tháng của các khách sạn",
  "Room popularity": "Mức độ sử dụng phòng",
  "Actual occupied nights by room · check-out date is exclusive": "Số đêm có khách thực tế theo phòng · không tính ngày trả phòng",
  "Period": "Khoảng thời gian",
  "Last 30 days": "30 ngày qua",
  "Last 90 days": "90 ngày qua",
  "All available history": "Toàn bộ dữ liệu lịch sử",
  "Loading room history…": "Đang tải lịch sử sử dụng phòng…",
  "No rooms in this selection": "Không có phòng trong lựa chọn này",
  "Choose a hotel with rooms to view popularity.": "Chọn khách sạn có phòng để xem mức độ sử dụng.",
  "Total occupied room-nights": "Tổng số đêm-phòng có khách",
  "Most popular rooms": "Các phòng được sử dụng nhiều nhất",
  "Most popular room": "Phòng được sử dụng nhiều nhất",
  "Least popular rooms": "Các phòng được sử dụng ít nhất",
  "Least popular room": "Phòng được sử dụng ít nhất",
  "No stays recorded": "Chưa ghi nhận lưu trú",
  "Reservation activity": "Hoạt động đặt phòng",
  "Recent and upcoming bookings": "Đặt phòng gần đây và sắp tới",
  "All reservations": "Tất cả đặt phòng",
  "Needs attention": "Cần chú ý",
  "Tasks that may need action": "Công việc có thể cần xử lý",
  "Loading dashboard…": "Đang tải tổng quan…",
  "Occupied nights": "Đêm có khách",
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
  "Manage guest bookings, stay dates, and booking status.": "Quản lý đặt phòng, ngày lưu trú và trạng thái đặt phòng.",
  "Search guest, booking ID, source…": "Tìm khách, mã đặt phòng, nguồn đặt phòng…",
  "bookings": "đặt phòng",
  "Active Reservations": "Đặt phòng đang hoạt động",
  "Inactive Reservations": "Đặt phòng không hoạt động",
  "Active reservations": "Đặt phòng đang hoạt động",
  "Inactive reservations": "Đặt phòng không hoạt động",
  "Confirmed bookings, arrivals, and current stays": "Đặt phòng đã xác nhận, khách đến và khách đang lưu trú",
  "Archived by year — checked-out stays use checkout year; cancelled and no-show bookings use check-in year": "Lưu trữ theo năm — khách đã trả phòng được nhóm theo năm trả phòng; đặt phòng đã hủy hoặc không đến được nhóm theo năm nhận phòng",
  "BOOKING / GUEST": "MÃ ĐẶT PHÒNG / KHÁCH",
  "HOTEL": "KHÁCH SẠN",
  "ROOM": "PHÒNG",
  "STAY": "THỜI GIAN LƯU TRÚ",
  "LENGTH OF STAY": "THỜI LƯỢNG LƯU TRÚ",
  "STATUS": "TRẠNG THÁI",
  "ACTIONS": "THAO TÁC",
  "Edit": "Sửa",
  "No reservations found": "Không tìm thấy đặt phòng",
  "Try changing your search or add a reservation.": "Hãy thay đổi nội dung tìm kiếm hoặc thêm đặt phòng.",
  "Enter guest name": "Nhập tên khách",
  "Select an available room": "Chọn phòng còn trống",
  "No rooms available for these dates.": "Không có phòng trống trong khoảng ngày này.",
  "Guest(s)": "Số lượng khách",
  "Booking source": "Nguồn đặt phòng",
  "Reservation note": "Ghi chú đặt phòng",
  "Optional note for this reservation only": "Ghi chú tùy chọn chỉ dành cho đặt phòng này",
  "reservation": "đặt phòng",
  "reservations": "đặt phòng",
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
