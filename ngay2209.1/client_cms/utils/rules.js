export const rules = {
  required: (v) => !!v || 'Thông tin bắt buộc',
  email: (v) => !v || /.+@.+\..+/.test(v) || 'Email không hợp lệ',
  phone: (v) => !v || /^0\d{9}$/.test(String(v).replace(/\s+/g, '')) || 'Số điện thoại không hợp lệ',
  maxLength: (max) => (v) => !v || v.length <= max || `Không được vượt quá ${max} ký tự`,
}