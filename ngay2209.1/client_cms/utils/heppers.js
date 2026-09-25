import Cookies from 'js-cookie'

// Đảm bảo TOKEN_KEY trùng khớp với tên token mà phía Backend/Middleware yêu cầu
const TOKEN_KEY = 'auth_token' 

export const getToken = () => Cookies.get(TOKEN_KEY)
export const setToken = (token) => Cookies.set(TOKEN_KEY, token, { expires: 7 })

// Bổ sung export hàm removeCookies để không bị lỗi build
export const removeCookies = (key = TOKEN_KEY) => Cookies.remove(key)