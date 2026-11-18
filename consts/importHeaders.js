export const studentHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "clazzString", text: "Lớp", sortable: false, width: 200 },
    { value: "code", text: "Mã số", sortable: false, width: 120 },
    { value: "fullName", text: "Họ và tên", sortable: false, width: 120 },
    { value: "birthdayString", text: "Ngày sinh", sortable: false },
    { value: "gender", text: "Giới tính", sortable: false },
    { value: "birthplace", text: "Nơi sinh", sortable: false, width: 120 },
    { value: "address", text: "Địa chỉ liên hệ", sortable: false, width: 200 },
    { value: "phone", text: "Số điện thoại", sortable: false, width: 120 },
    { value: "email", text: "Email trường", sortable: false },
    { value: "degreeType", text: "Bằng đã TN", sortable: false },
    { value: "graduatedMajor", text: "Ngành đã TN", sortable: false },
    { value: "degreeGrantingSchool", text: "Trường cấp bằng", sortable: false },
    { value: "profileAddress", text: "Địa chỉ XN hồ sơ", sortable: false },
    { value: "equalNumber", text: "Số hiệu bằng", sortable: false },
    { value: "numberInTheBook", text: "Số vào sổ", sortable: false },
    { value: "dateOfIssue", text: "Ngày cấp", sortable: false },
    { value: "objectEnrollment", text: "Đối tượng TS", sortable: false },
    { value: "majorString", text: "Tên ngành học", sortable: false },
    { value: "dhbkAndDvlk", text: "ĐHBK/ĐVLK", sortable: false },
    { value: "trainingMethod", text: "Hình thức ĐT", sortable: false },
    { value: "supplementaryArea", text: "Diện bổ túc", sortable: false },
    { value: "exemptionArea", text: "Diện miễn giảm", sortable: false },
    { value: "province", text: "Tỉnh, TP", sortable: false },
    { value: "district", text: "Q, Huyện", sortable: false },
    { value: "ward", text: "Ph, Xã", sortable: false },
    { value: "religion", text: "Tôn giáo", sortable: false, width: 120 },
    { value: "nationality", text: "Quốc tịch", sortable: false, width: 120 },
    { value: "ethnicity", text: "Dân tộc", sortable: false },
    { value: "dv", text: "ĐV", sortable: false },
    { value: "registeredAddressString", text: "ĐC đăng ký", sortable: false },
    { value: "citizenString", text: "CMND/ID", sortable: false },
    { value: "noteString", text: "Ghi chú", sortable: false },
    { value: "officersString", text: "CB nhập HS", sortable: false },
    { value: "enrollmentPeriodString", text: "Đợt tuyển sinh", sortable: false },
    { value: "courseString", text: "Khoá học", sortable: false },
    { value: "invoiceForUnit", text: "Xuất hoá đơn cho đơn vị", sortable: false, width: 150 },
    { value: "invoiceNameTo", text: "Tên đơn vị nhận hoá đơn", sortable: false },
    { value: "invoiceCode", text: "MST đơn vị", sortable: false, width: 120 },
    { value: "invoiceAddress", text: "Địa chỉ đơn vị", sortable: false, width: 120 },
    { value: "startOfTraining", text: "Ngày/tháng bắt đầu học", sortable: false, width: 120 },
    { value: "expiryDate", text: "Ngày/tháng kết thúc học ", sortable: false, width: 120 },
];

export const teacherHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "officerCode", text: "Mã đối tượng", sortable: false, width: 120 },
    { value: "fullName", text: "Tên đối tượng", sortable: false, width: 120 },
    { value: "code", text: "Mã giảng viên", sortable: false },
    { value: "workUnitString", text: "Mã đơn vị ", sortable: false, width: 120 },
    {
        value: "workUnit.name",
        text: "Tên đơn vị ",
        sortable: false,
        width: 120,
    },
    { value: "workUnit.address", text: "Khoa/ Trường", sortable: false },
    { value: "bankNumber", text: "Số tài khoản", sortable: false },
    { value: "taxCode", text: "Mã số thuế", sortable: false },
    { value: "genderString", text: "Giới tính", sortable: false },

    { value: "email", text: "Email", sortable: false },
    { value: "phone", text: "Số điện thoại", sortable: false },
    {
        value: "statusString",
        text: "Trạng thái",
        align: "center",
        sortable: false,
    },
    { value: "bankName", text: "Tên ngân hàng", sortable: false, width: 120 },
];
export const termHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "code", text: "Mã học phần", sortable: false },
    { value: "name", text: "Tên học phần", sortable: false },
    { value: "workload", text: "Thời lượng", sortable: false },
    {
        value: "creditHours",
        text: "Tín chỉ học phí",
        align: "center",
        sortable: false,
    },
    { value: "creditTraining", text: "Tín chỉ học tập", sortable: false, width: 150 },
    { value: "address", text: "Khoa/ Trường", sortable: false, width: 150 },
];
export const registerStudentHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "orderCode", text: "Số hóa đơn", sortable: false },
    { value: "studentCode", text: "Mã số sinh viên", sortable: false, width: 150 },
    { value: "studentName", text: "Họ tên sinh viên", sortable: false, width: 150 },
    { value: "totalFee", text: "Số tiền đã thu", sortable: false, width: 150 },
    { value: "dateImport", text: "Ngày import", sortable: false, width: 150 },
    { value: "datePaid", text: "Ngày thanh toán", sortable: false, width: 150 },
    { value: "examCode", text: "Kỳ thanh toán", sortable: false, width: 150 },
    { value: "phone", text: "SĐT", sortable: false, width: 150 },
    { value: "nameClazz", text: "Địa chỉ", sortable: false, width: 150 },
    {
        value: "trainingMethodCode",
        text: "Tên khoản thu",
        sortable: false,
        width: 150,
    },
];

export const registerStudentRetakeHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "fullName", text: "Họ tên sinh viên", sortable: false, width: 150 },
    { value: "studentCode", text: "Mã số sinh viên", sortable: false, width: 150 },
    { value: "major", text: "Mã ngành", sortable: false, width: 120 },
    { value: "course", text: "Mã khóa học", sortable: false, width: 120 },
    { value: "trainingMethod", text: "Hình thức đào tạo", sortable: false, width: 150 },
    { value: "courseCode", text: "Mã học phần", sortable: false, width: 120 },
    { value: "courseName", text: "Tên học phần", sortable: false, width: 200 },
    { value: "amountDue", text: "Số tiền phải thu", sortable: false, width: 120 },
    { value: "amountPaid", text: "Số tiền đã thu", sortable: false, width: 120 },
    { value: "remainingAmount", text: "Số tiền còn lại", sortable: false, width: 120 },
    { value: "semester", text: "Học kỳ", sortable: false, width: 120 },
    { value: "paymentDateTime", text: "Ngày thanh toán", sortable: false, width: 150 },
    { value: "exam", text: "Mã kỳ thi", sortable: false, width: 100 },
];

export const examSessionHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "examClass", text: "Lớp thi", sortable: false },
    { value: "classroom", text: "Phòng thi", sortable: false, width: 150 },
    {
        value: "quantitySeatString",
        text: "Số lượng SV/Phòng",
        sortable: false,
        width: 150,
    },
    {
        value: "examString",
        text: "Mã kỳ thi lại",
        sortable: false,
        width: 150,
    },
    { value: "termString", text: "Mã học phần", sortable: false, width: 150 },
    { value: "fromTimeString", text: "Giờ bắt đầu", sortable: false, width: 150 },
    { value: "toTimeString", text: "Giờ kết thúc", sortable: false, width: 150 },
];
export const educationProgramHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "code", text: "Mã học phần", sortable: false, width: 150 },
    { value: "name", text: "Tên học phần", sortable: false, width: 150 },
    { value: "workload", text: "Thời lượng", sortable: false, width: 150 },
    { value: "semesterMajor", text: "Kỳ học thứ", sortable: false, width: 150 },
    { value: "statusString", text: "Trạng thái", sortable: false, width: 150 },
    { value: "creditTrainingString", text: "Tín chỉ học tập", sortable: false, width: 150 },
    { value: "creditHoursString", text: "Tín chỉ học phí", sortable: false, width: 150 },
    { value: "knowledgeUnit", text: "Khối kiến thức", sortable: false, width: 150 },
];
export const coursesHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "name", text: "Tên khóa học", sortable: false, width: 150 },
    { value: "code", text: "Mã khóa học", sortable: false },
    { value: "revenueName", text: "Tên khoản thu", sortable: false },
    { value: "revenueCode", text: "Mã khoản thu", sortable: false },
    { value: "fromTime", text: "Từ ngày", sortable: false, width: 150 },
    { value: "toTime", text: "Đến ngày", sortable: false, width: 150 },
];
export const classHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "code", text: "Mã lớp sinh viên", sortable: false },
    { value: "name", text: "Tên lớp sinh viên", sortable: false, width: 150 },
    { value: "courseCode", text: "Mã khoá học", sortable: false },
    { value: "majorName", text: "Mã ngành", sortable: false }, // majorCode
    { value: "trainingUnitName", text: "Địa điểm đào tạo", sortable: false }, // trainingUnitCode
    { value: "trainingMethodName", text: "Hình thức đào tạo", sortable: false }, // trainingMethodCode
    { value: "trainingTypeName", text: "Loại hình đào tạo", sortable: false },
    { value: "admissionTime", text: "Đợt tuyển sinh", sortable: false },
];

export const majorHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "code", text: "Mã ngành", sortable: false },
    { value: "name", text: "Tên ngành", sortable: false, width: 150 },
    { value: "educationProgramCode", text: "Mã chương trình đào tạo", sortable: false, width: 150 },
];
export const examResultHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "code", text: "Mã phòng thi", sortable: false },
    { value: "studentCode", text: "Mã số sinh viên", sortable: false, width: 150 },
    { value: "fullName", text: "Họ và tên", sortable: false, width: 150 },
    { value: "studentClass", text: "Lớp sinh viên", sortable: false, width: 150 },
    { value: "score", text: "Điểm", sortable: false, width: 150 },
    { value: "notes", text: "Ghi chú", sortable: false, width: 150 },
];
export const examResultHeaders2 = [
    { value: "stt", text: "STT", sortable: false },
    { value: "fullName", text: "Họ và tên sinh viên", sortable: false },
    { value: "studentCode", text: "Số hiệu sinh viên", sortable: false },
    { value: "score", text: "Điểm TKTN", sortable: false, width: 150 },
    { value: "notes", text: "Ghi chú", sortable: false, width: 150 },
];

export const decisionFeeHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "specialistCode", text: "Mã khoa", sortable: false },

    { value: "majorCode", text: "Mã ngành", sortable: false },
    { value: "feeStr", text: "Phí thi lại", sortable: false, width: 150 },
];

export const decisionFeeHeaders2 = [
    { value: "stt", text: "STT", sortable: false },
    { value: "trainingMethodName", text: "Hình thức đào tạo", sortable: false },
    { value: "majorCode", text: "Mã ngành", sortable: false },
    { value: "fee", text: "Mức tín chỉ học phí", sortable: false, width: 150 },
];

export const authorizeRegistrationHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "semesterCode", text: "Mã học kỳ", sortable: false, width: 150 },
    { value: "examRoom", text: "Mã lớp", sortable: false, width: 150 },
    { value: "termCode", text: "Mã học phần", sortable: false, width: 150 },
    // { value: "termName", text: "Tên học phần", sortable: false, width: 150 },

    { value: "studentCode", text: "Mã số sinh viên", sortable: false, width: 150 },
    { value: "studentName", text: "Họ tên sinh viên", sortable: false, width: 150 },
    { value: "gender", text: "Giới tính", sortable: false, width: 150 },
    { value: "birthdayStr", text: "Ngày sinh", sortable: false, width: 150 },
    { value: "email", text: "Email", sortable: false, width: 150 },
    { value: "classesName", text: "Tên lớp", sortable: false, width: 150 },
    { value: "note", text: "Ghi chú", sortable: false, width: 150 },
    { value: "examClass", text: "Mã lớp thi", sortable: false, width: 150 },
    { value: "sectionType", text: "Loại lớp", sortable: false, width: 150 },
];

export const paymentTeacherHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "teacherName", text: "Tên giảng viên", sortable: false },
    { value: "teacherCode", text: "Mã giảng viên", sortable: false },
    { value: "examSessionCode", text: "Hội đồng", sortable: false },
    { value: "termCode", text: "Học phần", sortable: false },
    { value: "countStudentSupportString", text: "Số SV", sortable: false },
    { value: "creditSupportString", text: "Số TC", sortable: false },
    { value: "totalMoneySupportString", text: "Thành tiền", sortable: false },
    { value: "countStudentRebuttalString", text: "Số SV", sortable: false },
    { value: "totalMoneyRebuttalString", text: "Thành tiền", sortable: false },
    { value: "countStudentJoinString", text: "Số SV", sortable: false },
    { value: "totalMoneyJoinString", text: "Thành tiền", sortable: false },
    { value: "totalAmountString", text: "Tổng số tiền thanh toán", sortable: false },
];

export const redefendAuthorizeRegistrationHeaders = [
    { value: "stt", text: "STT", sortable: false, width: 50 },
    { value: "exam.code", text: "Mã đợt bảo vệ", sortable: false, width: 150 },
    { value: "semester.code", text: "Mã học kỳ", sortable: false, width: 150 },
    { value: "examRoom", text: "Mã lớp", sortable: false, width: 150 },
    { value: "student.code", text: "MSSV", sortable: false, width: 150 },
    { value: "student.fullName", text: "Họ và tên SV", sortable: false, width: 150 },
];

export const redefendExamSessionHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "examClass", text: "Hội đồng bảo vệ", sortable: false },
    {
        value: "examString",
        text: "Đợt bảo vệ lại",
        sortable: false,
    },
    { value: "term.code", text: "Mã môn học", sortable: false },
    { value: "fromTimeString", text: "Giờ bắt đầu", sortable: false },
    { value: "toTimeString", text: "Giờ kết thúc", sortable: false },
    { value: "teacher.code", text: "Mã giảng viên", sortable: false },
    { value: "teacher.fullName", text: "Tên giảng viên", sortable: false },
];

export const redefendregisterStudentHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "studentName", text: "Họ và tên", sortable: false },
    { value: "studentCode", text: "Số hiệu SV", sortable: false, width: 150 },
    { value: "majorString", text: "Ngành học", sortable: false, width: 150 },
    { value: "courseString", text: "Khóa", sortable: false, width: 150 },
    { value: "trainingMethodString", text: "Hình thức đào tạo", sortable: false, width: 150 },
    { value: "termCodeString", text: "Mã học phần", sortable: false, width: 150 },
    { value: "termNameString", text: "Tên học phần", sortable: false, width: 150 },
    { value: "feeNeedCollectStr", text: "Số tiền cần thu", sortable: false, width: 150 },
    { value: "feePaidStr", text: "Số tiền đã thu", sortable: false, width: 150 },
    {
        value: "feeRemainStr",
        text: "Số tiền còn phải thu",
        sortable: false,
        width: 150,
    },
    { value: "semesterString", text: "Học kỳ", sortable: false, width: 150 },
    { value: "datePaidStr", text: "Ngày giờ thanh toán", sortable: false, width: 150 },
    { value: "examName", text: "Đợt bảo vệ", sortable: false, width: 150 },
];

export const redefenseGuideTeacherHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "examSession.examClass", text: "Hội đồng", sortable: false, width: 150 },
    {
        value: "examSession.exam.name",
        text: "Đợt bảo vệ",
        sortable: false,
        width: 150,
    },
    {
        value: "examSession.term.name",
        text: "Học phần",
        sortable: false,
        width: 150,
    },
    {
        value: "student.code",
        text: "MSSV",
        sortable: false,
        width: 150,
    },
    {
        value: "student.fullName",
        text: "Họ và tên",
        sortable: false,
        width: 150,
    },
    {
        value: "student.trainingMethod.name",
        text: "Hình thức đào tạo",
        sortable: false,
        width: 150,
    },
    {
        value: "student.course.name",
        text: "Khóa",
        sortable: false,
        width: 150,
    },
    {
        value: "student.major.name",
        text: "Ngành",
        sortable: false,
        width: 150,
    },
    // {
    //     value: "status",
    //     text: "Trạng thái",
    //     sortable: false,
    //     width: 150,
    // },
    {
        value: "teacher.code",
        text: "Mã GV",
        sortable: false,
        width: 150,
    },
    {
        value: "teacher.fullName",
        text: "GVHD",
        sortable: false,
        width: 150,
    },
    {
        value: "teacher.phone",
        text: "Số điện thoại GV",
        sortable: false,
        width: 150,
    },
];

export const redefenseSessionTeacherHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "examSession.examClass", text: "Hội đồng", sortable: false, width: 150 },
    {
        value: "examSession.exam.name",
        text: "Đợt bảo vệ",
        sortable: false,
        width: 150,
    },
    {
        value: "examSession.term.name",
        text: "Học phần",
        sortable: false,
        width: 150,
    },
    {
        value: "student.code",
        text: "MSSV",
        sortable: false,
        width: 150,
    },
    {
        value: "student.fullName",
        text: "Họ và tên",
        sortable: false,
        width: 150,
    },
    {
        value: "student.trainingMethod.name",
        text: "Hình thức đào tạo",
        sortable: false,
        width: 150,
    },
    {
        value: "student.course.name",
        text: "Khóa",
        sortable: false,
        width: 150,
    },
    {
        value: "student.major.name",
        text: "Ngành",
        sortable: false,
        width: 150,
    },
    {
        value: "status",
        text: "Trạng thái",
        sortable: false,
        width: 150,
    },
    {
        value: "teacherJoin.code",
        text: "Mã GV",
        sortable: false,
        width: 150,
    },
    {
        value: "teacherJoin.fullName",
        text: "GV Tham gia HĐ chấm TN",
        sortable: false,
        width: 150,
    },
    {
        value: "teacherRebuttal.code",
        text: "Mã GV",
        sortable: false,
        width: 150,
    },
    {
        value: "teacherRebuttal.fullName",
        text: "GV Phản biện DATN",
        sortable: false,
        width: 150,
    },
    {
        value: "teacherResidence.code",
        text: "Mã GV",
        sortable: false,
        width: 150,
    },
    {
        value: "teacherResidence.fullName",
        text: "GV Lưu trú",
        sortable: false,
        width: 150,
    },
];

export const retakeCourseAuthListHeaders = [
    { value: "stt", text: "STT", sortable: false },
    { value: "examCode", text: "Mã đợt", sortable: false, width: 150 },
    { value: "semester", text: "Học kỳ", sortable: false, width: 150 },
    { value: "examRoom", text: "Mã lớp", sortable: false, width: 150 },
    { value: "termCode", text: "Mã học phần", sortable: false, width: 150 },
    { value: "termName", text: "Tên học phần", sortable: false, width: 150 },
    { value: "studentCode", text: "Mã số sinh viên", sortable: false, width: 150 },
    { value: "studentName", text: "Họ tên sinh viên", sortable: false, width: 150 },
    { value: "gender", text: "Giới tính", sortable: false, width: 150 },
    { value: "birthdayStr", text: "Ngày sinh", sortable: false, width: 150 },
    { value: "email", text: "Email", sortable: false, width: 150 },
    { value: "examClass", text: "Tên lớp", sortable: false, width: 150 },
    { value: "midScore", text: "Điểm GK", sortable: false, width: 150 },
    { value: "practicalSource", text: "Điểm TH/TN", sortable: false, width: 150 },
    { value: "attendanceScore", text: "Điểm QT", sortable: false, width: 150 },
    { value: "finalScore", text: "Điểm CK", sortable: false, width: 150 },
    { value: "rewardSource", text: "Điểm thưởng", sortable: false, width: 150 },
    { value: "note", text: "Ghi chú", sortable: false, width: 150 },
    { value: "teacherCode", text: "Mã giảng viên", sortable: false, width: 150 },
    { value: "teacherName", text: "Giáo viên giảng dạy", sortable: false, width: 150 },
    { value: "faculty", text: "Trường/ Khoa giảng dạy", sortable: false, width: 150 },
    { value: "sectionType", text: "Mã lớp thi", sortable: false, width: 150 },
    { value: "classType", text: "Loại lớp", sortable: false, width: 150 },
    { value: "weight", text: "Trọng số", sortable: false, width: 150 },
    { value: "finalScoreStr", text: "Điểm chữ", sortable: false, width: 150 },
    { value: "examType", text: "Thi lại/ Học lại", sortable: false, width: 150 },
];
