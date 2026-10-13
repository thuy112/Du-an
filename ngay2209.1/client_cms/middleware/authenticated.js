import Cookies from 'js-cookie'

export default function ({ route, redirect }) {
  // Lấy token từ Cookie (cả auth_token lẫn token) hoặc LocalStorage
  const token =
    Cookies.get('auth_token') ||
    Cookies.get('token') ||
    (process.client
      ? localStorage.getItem('auth_token') || localStorage.getItem('user_info')
      : null)

  // Danh sách các route không yêu cầu đăng nhập
  const publicRoutes = ['/dang-nhap', '/quen-mat-khau']

  // Nếu chưa đăng nhập mà truy cập trang yêu cầu xác thực -> Đá về /dang-nhap
  if (!token && !publicRoutes.includes(route.path)) {
    return redirect('/dang-nhap')
  }

  // Nếu đã đăng nhập mà cố vào trang đăng nhập -> Đá về trang chủ /
  if (token && route.path === '/dang-nhap') {
    return redirect('/')
  }
}