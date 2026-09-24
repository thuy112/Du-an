import Cookies from 'js-cookie'

export default function ({ route, redirect }) {
  // Lấy token từ Cookie hoặc localStorage
  const token =
    Cookies.get('token') ||
    (process.client ? localStorage.getItem('token') : null)

  // Danh sách các route không yêu cầu đăng nhập
  const publicRoutes = ['/dang-nhap', '/quen-mat-khau']

  // Nếu chưa đăng nhập mà truy cập trang yêu cầu xác thực
  if (!token && !publicRoutes.includes(route.path)) {
    return redirect('/dang-nhap')
  }

  // Nếu đã đăng nhập mà truy cập trang đăng nhập
  if (token && route.path === '/dang-nhap') {
    return redirect('/')
  }
}