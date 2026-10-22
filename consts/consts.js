/*
 * COMMON CONSTS
 */
export const DAY_OF_MONTH = Array.from({ length: 31 }, (v, k) => k + 1);
export const HOUR_OF_DAY = Array.from({ length: 25 }, (v, k) => ({ hour: k, name: `${k} giờ` }));

export const CHANNEL = "CMS";

/*
 * Tích hợp CEDF (thu học phí):
 * true  = đã tích hợp CEDF -> ẩn các chức năng thu phí thủ công
 *         (checkbox chọn SV, nút gửi DS thu phí / gia hạn, nút xuất/nhập file KQ thu)
 * false = chưa tích hợp -> hiện lại các chức năng trên
 */
export const IS_CEDF_INTEGRATED = false;

/**
 * Danh mục đồng bộ từ CTT (cổng thông tin ĐTLT):
 * true  = dữ liệu do CTT đẩy sang -> ẩn chức năng Thêm / Sửa / Xóa / Nhập file Excel
 *         (loại hình ĐT, hình thức ĐT, ngành học, học phần, lớp hành chính,
 *          chương trình đào tạo, khoản thu, giảng viên, sinh viên)
 * false = quản lý thủ công trên CMS -> hiện lại các chức năng trên
 */
export const IS_CTT_SYNCED = true;
