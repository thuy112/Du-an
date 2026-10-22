export const statusList = [
    { value: "ACTIVE", text: "Kích hoạt", color: "primary" },
    { value: "INACTIVE", text: "Chưa kích hoạt", color: "grey" },
];
export const statusTeacherList = [
    { value: "ACTIVE", text: "Hoạt động", color: "primary" },
    { value: "INACTIVE", text: "Nghỉ hưu", color: "grey" },
];
export const sendMailPaymentTeacherList = [
    { value: "INACTIVE", text: "Chưa gửi", color: "warning" },
    { value: "ACTIVE", text: "Đã gửi", color: "green" },
];
export const exportedSummaryList = [
    { value: 0, text: "Chưa xuất", color: "warning" },
    { value: 1, text: "Đã xuất", color: "green" },
];
export const studentStatusList = [
    { value: "STUDYING", text: "Đang học tập", color: "primary" },
    { value: "DROP_OUT_OF_SCHOOL", text: "Đã nghỉ học", color: "grey" },
    { value: "LEAVE_OF_ABSENCE", text: "Bảo lưu", color: "warning" },
];

export const genderList = [
    { value: "MALE", text: "Nam", color: "primary" },
    { value: "FEMALE", text: "Nữ", color: "info" },
    { value: "OTHER", text: "Khác", color: "grey" },
];
export const termStatusList = [
    { value: "EXEMPTED", text: "Miễn giảm", color: "info" },
    { value: "MANDATORY", text: "Phải học", color: "primary" },
];
export const subjectSendMailList = [
    { value: "SV", text: "Sinh viên", color: "blue" },
    { value: "CBQL", text: "Cán bộ quản lý", color: "green" },
    { value: "GV", text: "Giảng viên", color: "teal" },
];

export const sendMailStatusList = [
    { value: "NOT_SENT", text: "Chưa gửi", color: "warning" },
    { value: "SENT", text: "Đã gửi", color: "green" },
    { value: "SENDABLE", text: "Gửi được", color: "blue" },
];

export const listFinalStatus = [
    { value: "LISTED", text: "Đã lập danh sách", color: "green" },
    { value: "NOT_LISTED", text: "Chưa lập danh sách", color: "warning" },
];

export const payStatusList = [
    { value: "NOT_PAID", text: "Chưa trả học phí", color: "warning" },
    { value: "PAID", text: "Đã trả học phí", color: "green" },
];

export const paymentSendStatusList = [
    { value: "SENT", text: "Đã gửi", color: "green" },
    { value: "EXTENDED", text: "Gia hạn", color: "warning" },
    { value: "NOT_SENT", text: "Chưa gửi", color: "grey" },
];
export const allowRegisterList = [
    { value: "NOT_ALLOWED", text: "Không được phép đăng ký", color: "warning" },
    { value: "ALLOWED", text: "Được phép đăng ký", color: "green" },
];
export const sendTypeList = [
    { value: "RETAKE_COURSES", text: "Học lại", color: "blue" },
    { value: "RETAKE_EXAM", text: "Thi lại", color: "green" },
    { value: "REASSESSMENT", text: "Bảo vệ lại", color: "teal" },
    { value: "SHARED_DIRECTORY", text: "Danh mục hệ thống", color: "orange" },
];
export const scoreResultList = [
    { value: "RETAKE", text: "Thi lại", color: "blue" },
    { value: "PASS", text: "Qua môn", color: "green" },
];
export const actionSendTypeList = [
    { value: "SCHEDULE", text: "Lịch thi", color: "blue" },
    { value: "CONFIRM", text: "Xác nhận đăng ký", color: "light-green" },
    { value: "PAY_SUCCESS", text: "Thanh toán thành công", color: "green" },
    { value: "REJECT", text: "Từ chối", color: "error" },
    { value: "REMIND_PAY", text: "Nhắc đóng học phí", color: "warning" },
    { value: "RESULT", text: "Kết quả thi", color: "teal" },
    { value: "OTP", text: "Gửi mã OTP", color: "cyan" },
];

export const registerStatusList = [
    { value: "AWAITING_CONFIRMATION", text: "Chờ xác nhận", color: "warning" },
    { value: "CONFIRMED", text: "Đã xác nhận", color: "green", textCf: "Xác nhận" },
    { value: "REJECTED", text: "Từ chối", color: "error" },
];
// Trạng thái duyệt đơn hiển thị cho sinh viên (gồm cả FINALIZED - đơn đã chốt)
export const registerStudentStatusList = [
    { value: "AWAITING_CONFIRMATION", text: "Chờ xác nhận", color: "warning" },
    { value: "CONFIRMED", text: "Đã xác nhận", color: "green" },
    { value: "REJECTED", text: "Từ chối", color: "error" },
    { value: "FINALIZED", text: "Đã duyệt lớp", color: "green" },
];
export const listForBankStatus = [
    { value: "NO", text: "Chưa lập danh sách ", color: "warning" },
    { value: "YES", text: "Đã lập danh sách", color: "green" },
];
export const examStatusList = [
    { value: "NOT_FINALIZED", text: "Chưa duyệt danh sách", color: "warning" },
    { value: "FINALIZED", text: "Đã duyệt danh sách", color: "green" },
    { value: "NON_FINALIZED", text: "Chưa duyệt danh sách", color: "warning", type: "PRIVATE" },
];

export const scoreStatusList = [
    { value: "NO_SCOREBOARD", text: "Chưa có điểm", color: "warning", type: "PRIVATE" },
    { value: "SCOREBOARD_AVAILABLE", text: "Đã có điểm", color: "blue", type: "PRIVATE" },
    {
        value: "SCOREBOARD_AVAILABLE_NOT_FINALIZED",
        text: "Chưa duyệt",
        color: "lime",
        type: "PRIVATE",
    },
    { value: "ANNOUNCED", text: "Đã công bố", color: "green", type: "PUBLIC" },
    { value: "UNANNOUNCED", text: "Chưa công bố", color: "warning", type: "PUBLIC" },
];

export const closeStatusList = [
    { value: "NOT_CLOSED", text: "Chưa duyệt", color: "warning" },
    { value: "CLOSED", text: "Đã duyệt", color: "green" },
];

export const examSessionStatus = [
    { value: "NOT_FINALIZE_EXAM_CLASS", text: "Chưa duyệt lớp thi", color: "warning" },
    { value: "FINALIZE_EXAM_CLASS", text: "Đã duyệt lớp thi", color: "green" },
    { value: "SEND_EMAIL", text: "Gửi email", color: "error" },
    { value: "NO_SCOREBOARD", text: "Chưa có bảng điểm", color: "error" },
    { value: "SCOREBOARD_AVAILABLE", text: "Đã có bảng điểm", color: "error" },
    { value: "FINALIZE_SCORE", text: "Chốt điểm", color: "error" },
    { value: "PUBLISH_SCORE", text: "Công bố điểm", color: "error" },
];

export const allowRegisterStatusList = [
    { value: "NOT_REGISTERED", text: "Chưa đăng ký", color: "grey" },
    { value: "REGISTERED", text: "Đã đăng ký", color: "green" },
];
export const retakeCourseStatus = [
    { value: "COMBINE_CLASS", text: "Lớp ghép", color: "grey" },
    { value: "NEW_CLASS", text: "Lớp mở", color: "green" },
    { value: "PROJECT_BASED_CLASS", text: "Đồ án môn học", color: "red" },
];
export const retakeCourseSubClassTypes = [
    { value: "OUTLINE", text: "Đại cương", color: "green" },
    { value: "SPECIALIZED", text: "Chuyên ngành", color: "primary" },
];
export const pageSizeList = [10, 20, 50, 100, 200, 500, 1000];
export const classPeriodList = [
    { value: 1, text: "Tiết 1", time: "6:45 - 7:30" },
    { value: 2, text: "Tiết 2", time: "7:30 – 8:15" },
    { value: 3, text: "Tiết 3", time: "8:25 – 9:10" },
    { value: 4, text: "Tiết 4", time: "9:20 – 10:05" },
    { value: 5, text: "Tiết 5", time: "10:15 – 11:00" },
    { value: 6, text: "Tiết 6", time: " 11:00 – 11:45" },
    { value: 7, text: "Tiết 7", time: "12:30 – 13:15" },
    { value: 8, text: "Tiết 8", time: "13:15 – 14:00" },
    { value: 9, text: "Tiết 9", time: "14:10 – 14:55" },
    { value: 10, text: "Tiết 10", time: "15:05 – 15:50" },
    { value: 11, text: "Tiết 11", time: "16:00 – 16:45" },
    { value: 12, text: "Tiết 12", time: "16:45 – 17:30" },
    { value: 13, text: "Tiết 13", time: " 17:45 – 18:30" },
    { value: 14, text: "Tiết 14", time: "18:30 – 19:15" },
];

export const lecturerStatusList = [
    { value: "FULL_TIME", text: "Đương chức", color: "warning" },
    { value: "VISITING", text: "Mời giảng", color: "green" },
];

export const graduationTaskList = [
    { value: "SUPPORT", text: "Hướng dẫn DATN", color: "blue" },
    { value: "JOIN", text: "Tham gia HĐ chấm TN", color: "green" },
    { value: "REBUTTAL", text: "Phản biện DATN", color: "red" },
    { value: "RESIDENCE", text: "Lưu trú", color: "orange" },
];

export const ActionList = [
    { value: "CREATE", text: "Thêm mới", color: "green" },
    { value: "UPDATE", text: "Cập nhật", color: "orange" },
    { value: "DELETE", text: "Xóa", color: "red" },
    { value: "CHANGE_STATUS", text: "Cập nhật trạng thái", color: "yellow" },
    { value: "IMPORT_FILE", text: "Nhập file excel", color: "blue" },
    { value: "EXPORT_FILE", text: "Xuất file excel", color: "blue" },
    { value: "SEND_EMAIL", text: "Gửi email", color: "purple" },
    { value: "LOGIN", text: "Đăng nhập", color: "green" },
    { value: "LOGOUT", text: "Đăng xuất", color: "green" },
    { value: "RESET_PASSWORD", text: "Đặt lại mật khẩu", color: "orange" },
    { value: "FORGET_PASSWORD", text: "Quên mật khẩu", color: "orange" },
];

export const statusListPayment = [
    { value: "PENDING", text: "Chưa thanh toán", color: "primary" },
    { value: "COMPLETED", text: "Đã thanh toán", color: "grey" },
    { value: "CANCELLED", text: "Đã hủy", color: "grey" },
];

export const defenseStatusList = [
    { value: "DEFENDED", text: "Đã bảo vệ", color: "primary" },
    { value: "PENDING", text: "Chưa bảo vệ", color: "grey" },
];

export const feeStatusList = [
    { value: "PAID", text: "Đã đóng phí", color: "primary" },
    { value: "NOT_PAID", text: "Chưa đóng phí", color: "grey" },
];

export const degreeList = [
    { value: "BACHELOR", text: "Cử nhân", color: "primary" },
    { value: "ENGINEER", text: "Kỹ sư", color: "grey" },
];

export const browsingInfoList = [
    { value: "REFUSED", text: "Từ chối", color: "error" },
    { value: "WAIT_CONFIRM", text: "Chờ duyệt", color: "warning" },
    { value: "CONFIRMED", text: "Đã duyệt", color: "success" },
];

export const reAssessmentTypeList = [
    { value: "SUPPORT", text: "Hướng dẫn DATN", color: "success" },
    { value: "JOIN", text: "Tham gia chấm DATN", color: "success" },
    { value: "REBUTTAL", text: "Phản biện DATN", color: "success" },
    { value: "RESIDENCE", text: "Lưu trú", color: "orange" },
];

export const paymentTeacherStatusList = [
    { value: "WAIT_PAID", text: "Chờ thanh toán", color: "warning" },
    { value: "COMPLETE_PAID", text: "Đã thanh toán", color: "success" },
    { value: "CANCELED_PAID", text: "Hủy thanh toán", color: "error" },
];

export const retakeCourseStatusList = [
    { value: "COMBINE_CLASS", text: "Lớp ghép", color: "grey" },
    { value: "NEW_CLASS", text: "Lớp mở", color: "green" },
    { value: "PROJECT_BASED_CLASS", text: "Đồ án môn học", color: "red" },
];

export const reatakeScoreStatusList = [
    {
        value: "NOT_CLOSED",
        text: "Chưa duyệt",
        color: "warning",
    },
    {
        value: "CLOSED",
        text: "Đã duyệt",
        color: "green",
    },
];

export const typeTeacherOptionList = [
    { value: "TEACHER", text: "Giảng viên", color: "green" },
    { value: "TEACHER_ASSISTANT", text: "Trợ giảng", color: "blue" },
];

export const examEducationOptionList = [
    { value: "ONLINE", text: "Trực tuyến", color: "green" },
    { value: "OFFLINE", text: "Trực tiếp", color: "blue" },
];

export const sendTypeSearch = [
    { value: "RETAKE_COURSES", text: "Học lại", color: "blue" },
    { value: "RETAKE_EXAM", text: "Thi lại", color: "green" },
    { value: "REASSESSMENT", text: "Bảo vệ lại", color: "teal" },
];
