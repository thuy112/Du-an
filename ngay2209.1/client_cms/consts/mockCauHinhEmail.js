export const MOCK_MAIL_CONFIGS = [
  {
    id: 290,
    name: "Thông báo sinh viên đăng ký học lại trước thời hạn",
    content: "Trung tâm Đào tạo liên tục - ĐẠI HỌC BÁCH KHOA HÀ NỘI xin thông báo:\n\nCăn cứ vào kết quả học tập, Sinh viên [TEN_SV] (MSSV: [MA_SV]) cần thực hiện đăng ký học lại môn học: [TEN_MON_HOC].\n- Đợt học lại: [DOT_HOC_LAI]\n- Thời hạn đăng ký cuối cùng: Trước ngày [HAN_CHOT]\n\nTrân trọng!",
    status: "ACTIVE",
    type: "RETAKE_COURSES",
    sendType: "SV",
    actionSendType: "REMIND_REGISTER"
  },
  {
    id: 270,
    name: "Thông báo thanh toán tiền giảng dạy lớp học lại",
    content: "Trung tâm Đào tạo liên tục - ĐẠI HỌC BÁCH KHOA HÀ NỘI xin thông báo thanh toán cho Giảng viên.",
    status: "ACTIVE",
    type: "RETAKE_COURSES",
    sendType: "GV",
    actionSendType: "PAY_SUCCESS"
  },
  {
    id: 90,
    name: "Thông báo đăng ký bảo vệ lại thành công",
    content: "Đơn đăng ký bảo vệ lại đã được xác nhận.",
    status: "ACTIVE",
    type: "REASSESSMENT",
    sendType: "SV",
    actionSendType: "CONFIRM"
  },
  {
    id: 50,
    name: "Thông báo gửi mã OTP dành cho sinh viên",
    content: "Mã OTP xác nhận đăng ký bảo vệ lại của bạn là: [OTP]",
    status: "ACTIVE",
    type: "REASSESSMENT",
    sendType: "SV",
    actionSendType: "OTP"
  },
  {
    id: 35,
    name: "Nhắc đóng học phí học lại",
    content: "Yêu cầu sinh viên nhanh chóng đóng phí học lại trước thời hạn [THOI_HAN_HOC_PHI].",
    status: "ACTIVE",
    type: "RETAKE_COURSES",
    sendType: "SV",
    actionSendType: "REMIND_PAY"
  }
];