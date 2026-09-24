import Cookies from 'js-cookie'

/**
 * Xóa toàn bộ token và cookie xác thực người dùng
 */
export function removeCookies() {
    Cookies.remove('token')
    Cookies.remove('user')
    Cookies.remove('auth._token.local')
}

/**
 * Lấy token từ Cookie
 */
export function getToken() {
    return Cookies.get('token')
}

/**
 * Lưu token vào Cookie (Hạn 7 ngày)
 */
export function setToken(token) {
    Cookies.set('token', token, { expires: 7 })
}