<template>
  <div class="table-container d-flex flex-column pa-4">

    <!-- 1. CỐ ĐỊNH: TIÊU ĐỀ & THANH TÌM KIẾM Ở TRÊN -->
    <div class="fixed-top-section flex-shrink-0">
      <div class="text-h6 font-weight-bold mb-3">
        Danh sách sinh viên được đăng ký ({{ totalItems }})
      </div>

      <div class="top-header-bar d-flex align-center gap-2 mb-3 w-100">
        <v-text-field
          v-model="searchQuery"
          placeholder="Tìm kiếm"
          dense
          outlined
          hide-details
          class="flex-grow-1"
          @keyup.enter="handleSearch"
        ></v-text-field>

        <v-select
          v-model="filterKyHoc"
          :items="kyHocList"
          placeholder="Kỳ học"
          dense
          outlined
          hide-details
          clearable
          class="flex-grow-1"
        ></v-select>

        <v-select
          v-model="filterKyDangKy"
          :items="kyDangKyList"
          placeholder="Kỳ đăng ký thi"
          dense
          outlined
          hide-details
          clearable
          class="flex-grow-1"
        ></v-select>

        <v-select
          v-model="filterHocPhan"
          :items="hocPhanList"
          placeholder="Học phần"
          dense
          outlined
          hide-details
          clearable
          class="flex-grow-1"
        ></v-select>

        <v-select
          v-model="filterStatus"
          :items="statusList"
          placeholder="Trạng thái"
          dense
          outlined
          hide-details
          clearable
          class="flex-grow-1"
        ></v-select>

        <!-- ICON REFRESH -->
        <v-btn icon color="red darken-3" class="flex-shrink-0" @click="handleRefreshIconClick">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>

        <!-- ICON TÌM KIẾM -->
        <v-btn color="#a2212b" dark elevation="0" class="rounded min-w-0 px-3 flex-shrink-0" @click="handleSearch">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <!-- NÚT THÊM (+) -->
        <v-btn color="#a2212b" dark elevation="0" class="rounded min-w-0 px-3 flex-shrink-0" @click="handleAddClick">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 2. KHUNG DANH SÁCH LƯỚT LÊN XUỐNG KHI NHIỀU BẢN GHI (FIXED HEADER BẢNG) -->
    <div class="table-scroll-content flex-grow-1 overflow-y-auto">
      <v-data-table
        :headers="headers"
        :items="paginatedStudents"
        hide-default-footer
        disable-pagination
        fixed-header
        height="100%"
        class="elevation-0 bg-transparent custom-table"
      >
        <!-- Custom cột STT -->
        <template v-slot:[`item.stt`]="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <!-- Custom cột Thông tin sinh viên -->
        <template v-slot:[`item.sinhVien`]="{ item }">
          <div class="font-weight-bold">{{ item.hoTen }}</div>
          <div class="caption text--secondary">
            Mã số sinh viên: <span class="red--text text--darken-2 font-weight-bold">{{ item.mssv }}</span>
          </div>
          <div class="caption text--secondary">
            Lớp: <span class="red--text text--darken-2 font-weight-bold">{{ item.lop }}</span>
          </div>
        </template>

        <!-- Custom cột Trạng thái -->
        <template v-slot:[`item.trangThai`]="{ item }">
          <v-chip
            small
            :color="item.trangThai === 'Đã đăng ký' ? 'success' : 'grey'"
            text-color="white"
            class="font-weight-medium"
          >
            {{ item.trangThai }}
          </v-chip>
        </template>

        <!-- Custom cột Chức năng -->
        <template v-slot:[`item.chucNang`]="{ item }">
          <v-btn icon small color="red" @click="deleteItem(item)">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </div>

    <!-- 3. CỐ ĐỊNH: FOOTER (XUẤT NHẬP EXCEL & PHÂN TRANG CỐ ĐỊNH 50 BẢN GHI) -->
    <div class="bottom-fixed-bar d-flex align-center justify-space-between flex-wrap gap-2 pt-3 bg-white border-top mt-2 flex-shrink-0">
      <!-- CỤM NÚT XUẤT NHẬP CỐ ĐỊNH -->
      <div class="d-flex align-center gap-2">
        <v-btn
          color="#2e7d32"
          dark
          elevation="0"
          class="text-capitalize rounded px-3 font-weight-bold"
          small
          @click="exportReport"
        >
          <v-icon left small>mdi-file-excel</v-icon> XUẤT FILE BÁO CÁO
        </v-btn>

        <v-btn
          color="#2e7d32"
          dark
          elevation="0"
          class="text-capitalize rounded px-3 font-weight-bold"
          small
          @click="importFile"
        >
          <v-icon left small>mdi-file-excel</v-icon> NHẬP FILE ĐĂNG KÝ
        </v-btn>
      </div>

      <!-- CỤM PHÂN TRANG -->
      <div class="d-flex align-center gap-2">
        <span class="caption text--secondary font-weight-medium mr-1">
            {{ itemsPerPage }} bản ghi/trang
        </span>

        <v-text-field
            v-model.number="pageInput"
            label="Trang"
            dense
            outlined
            hide-details
            class="pagination-input text-center"
            style="width: 60px"
            @keyup.enter="goToPage"
        ></v-text-field>

        <v-btn 
            color="#a2212b" 
            dark 
            small 
            class="text-capitalize px-3 rounded-sm elevation-0" 
            style="height: 36px;" 
            @click="goToPage"
        >
            Đi
        </v-btn>

        <!-- Nút Lùi trang -->
        <v-btn icon small :disabled="page <= 1" @click="changePage(page - 1)">
            <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <!-- Các nút trang tự động sinh theo dữ liệu (1, 2, 3...) -->
        <v-btn
            v-for="p in visiblePages"
            :key="p"
            small
            :color="page === p ? '#a2212b' : ''"
            :dark="page === p"
            :outlined="page !== p"
            class="min-w-0 pa-0 rounded-sm elevation-0"
            style="width: 28px; height: 28px"
            @click="changePage(p)"
        >
            {{ p }}
        </v-btn>

        <!-- Nút Tiến trang -->
        <v-btn icon small :disabled="page >= totalPages" @click="changePage(page + 1)">
            <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuanLySinhVienDangKy',
  data() {
  return {
    page: 1,
    pageInput: 1,
    itemsPerPage: 50,
    // Phải chắc chắn khai báo đầy đủ object filters bên dưới
    filters: { 
      search: '', 
      gender: null, 
      teacherType: null, 
      status: null, 
      department: null 
    },
      searchQuery: '',
      filterKyHoc: null,
      filterKyDangKy: null,
      filterHocPhan: null,
      filterStatus: null,

      kyHocList: ['Học kỳ II (2024-2025)', 'Kỳ 20231'],
      kyDangKyList: ['TL20232', 'TL20231'],
      hocPhanList: ['EE2010', 'JAVA', 'EE1024', 'EE4220'],
      statusList: ['Đã đăng ký', 'Chưa đăng ký'],

      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '60px' },
        { text: 'Thông tin sinh viên', value: 'sinhVien', width: '220px' },
        { text: 'Lớp thi', value: 'lopThi' },
        { text: 'Tên kỳ đăng ký thi lại', value: 'kyDangKy' },
        { text: 'Học kỳ', value: 'hocKy' },
        { text: 'Mã học phần', value: 'maHocPhan' },
        { text: 'Tên học phần', value: 'tenHocPhan' },
        { text: 'Trạng thái', value: 'trangThai' },
        { text: 'Chức năng', value: 'chucNang', sortable: false, align: 'center' },
      ],

      // Danh sách sinh viên mẫu
      studentsList: [
        { id: 1, hoTen: 'Đỗ Hồng Kiên', mssv: 'PH218834', lop: 'Lớp 39', lopThi: '734863', kyDangKy: 'TL20232', hocKy: 'Học kỳ II (2024-2025)', maHocPhan: 'EE2010', tenHocPhan: 'Kỹ thuật điện', trangThai: 'Đã đăng ký' },
        { id: 2, hoTen: 'Nguyễn Văn A', mssv: '1293478923P', lop: 'Lớp 39', lopThi: '734863', kyDangKy: 'TL20232', hocKy: 'Học kỳ II (2024-2025)', maHocPhan: 'EE2010', tenHocPhan: 'Kỹ thuật điện', trangThai: 'Đã đăng ký' },
        { id: 3, hoTen: 'Đỗ Hồng Kiên', mssv: 'PH218834', lop: 'Lớp 39', lopThi: 'FE', kyDangKy: 'TL20232', hocKy: 'Học kỳ II (2025-2026)', maHocPhan: 'JAVA', tenHocPhan: 'Lập trình Java', trangThai: 'Đã đăng ký' },
        { id: 4, hoTen: 'Vũ Thị Kim Chi', mssv: '20230305P', lop: 'Khóa 68 – Kỹ thuật Điều khiển và Tự động hóa - Vừa làm vừa học', lopThi: '161518', kyDangKy: 'TL20231', hocKy: 'Kỳ 20231', maHocPhan: 'EE1024', tenHocPhan: 'Nhập môn ngành Điện', trangThai: 'Đã đăng ký' },
        { id: 5, hoTen: 'DEV', mssv: 'DEV', lop: 'Công nghệ phần mềm', lopThi: '734234', kyDangKy: 'TL20231', hocKy: 'Học kỳ II (2025-2026)', maHocPhan: 'JAVA', tenHocPhan: 'Lập trình Java', trangThai: 'Chưa đăng ký' },
        { id: 6, hoTen: 'Lâm Vinh Doanh', mssv: '20230832P', lop: 'LT-CĐTN-KTVL01-K68', lopThi: 'HỘI ĐỒNG BẢO VỆ 6', kyDangKy: 'TL20232', hocKy: 'Học kỳ II (2024-2025)', maHocPhan: 'EE4220', tenHocPhan: 'Điều khiển logic và PLC', trangThai: 'Chưa đăng ký' },
        { id: 7, hoTen: 'Lâm Vinh Doanh', mssv: '20230832P', lop: 'LT-CĐTN-KTVL01-K68', lopThi: '161742', kyDangKy: 'TL20231', hocKy: 'Kỳ 20231', maHocPhan: 'EE2010', tenHocPhan: 'Kỹ thuật điện', trangThai: 'Chưa đăng ký' },
        { id: 1, hoTen: 'Đỗ Hồng Kiên', mssv: 'PH218834', lop: 'Lớp 39', lopThi: '734863', kyDangKy: 'TL20232', hocKy: 'Học kỳ II (2024-2025)', maHocPhan: 'EE2010', tenHocPhan: 'Kỹ thuật điện', trangThai: 'Đã đăng ký' },
        { id: 2, hoTen: 'Nguyễn Văn A', mssv: '1293478923P', lop: 'Lớp 39', lopThi: '734863', kyDangKy: 'TL20232', hocKy: 'Học kỳ II (2024-2025)', maHocPhan: 'EE2010', tenHocPhan: 'Kỹ thuật điện', trangThai: 'Đã đăng ký' },
        { id: 3, hoTen: 'Đỗ Hồng Kiên', mssv: 'PH218834', lop: 'Lớp 39', lopThi: 'FE', kyDangKy: 'TL20232', hocKy: 'Học kỳ II (2025-2026)', maHocPhan: 'JAVA', tenHocPhan: 'Lập trình Java', trangThai: 'Đã đăng ký' },
        { id: 4, hoTen: 'Vũ Thị Kim Chi', mssv: '20230305P', lop: 'Khóa 68 – Kỹ thuật Điều khiển và Tự động hóa - Vừa làm vừa học', lopThi: '161518', kyDangKy: 'TL20231', hocKy: 'Kỳ 20231', maHocPhan: 'EE1024', tenHocPhan: 'Nhập môn ngành Điện', trangThai: 'Đã đăng ký' },
        { id: 5, hoTen: 'DEV', mssv: 'DEV', lop: 'Công nghệ phần mềm', lopThi: '734234', kyDangKy: 'TL20231', hocKy: 'Học kỳ II (2025-2026)', maHocPhan: 'JAVA', tenHocPhan: 'Lập trình Java', trangThai: 'Chưa đăng ký' },
        { id: 6, hoTen: 'Lâm Vinh Doanh', mssv: '20230832P', lop: 'LT-CĐTN-KTVL01-K68', lopThi: 'HỘI ĐỒNG BẢO VỆ 6', kyDangKy: 'TL20232', hocKy: 'Học kỳ II (2024-2025)', maHocPhan: 'EE4220', tenHocPhan: 'Điều khiển logic và PLC', trangThai: 'Chưa đăng ký' },
        { id: 7, hoTen: 'Lâm Vinh Doanh', mssv: '20230832P', lop: 'LT-CĐTN-KTVL01-K68', lopThi: '161742', kyDangKy: 'TL20231', hocKy: 'Kỳ 20231', maHocPhan: 'EE2010', tenHocPhan: 'Kỹ thuật điện', trangThai: 'Chưa đăng ký' },
      
    ],
    }
  },

computed: {
  // 1. Mảng dữ liệu đã qua bộ lọc
  filteredStudents() {
    return this.studentsList.filter((item) => {
      const matchSearch = !this.filters.search || 
        item.hoTen?.toLowerCase().includes(this.filters.search.toLowerCase());
      const matchGender = !this.filters.gender || item.gioiTinh === this.filters.gender;
      const matchTeacher = !this.filters.teacherType || item.loaiGiangVien === this.filters.teacherType;
      const matchStatus = !this.filters.status || item.trangThai === this.filters.status;
      const matchDept = !this.filters.department || item.khoaPhong === this.filters.department;

      return matchSearch && matchGender && matchTeacher && matchStatus && matchDept;
    });
  },

  // 2. Tổng số bản ghi thực tế
  totalItems() {
    return this.filteredStudents.length;
  },

  // 3. Tự động tính tổng số trang dựa trên itemsPerPage (Ví dụ: 120 bản ghi / 50 = 3 trang)
  totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage) || 1;
  },

  // 4. Lấy danh sách bản ghi hiển thị cho trang hiện tại
  paginatedStudents() {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredStudents.slice(start, end);
  },

  // 5. Tự động tính các nút trang hiển thị (1, 2, 3...)
  visiblePages() {
    const pages = [];
    const maxVisible = 5; // Hiển thị tối đa 5 nút trang
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  },
},

watch: {
  // Khi danh sách đã lọc thay đổi, nếu trang hiện tại lớn hơn tổng số trang thì tự lùi về trang hợp lệ
  totalPages(newTotalPages) {
    if (this.page > newTotalPages) {
      this.page = newTotalPages || 1;
      this.pageInput = this.page;
    }
  },
  
  // Tự động reset về trang 1 khi thay đổi điều kiện tìm kiếm/bộ lọc
  filters: {
    handler() {
      this.page = 1;
      this.pageInput = 1;
    },
    deep: true
  }
},

  methods: {
    handleRefreshIconClick() {
      this.searchQuery = '';
      this.filterKyHoc = null;
      this.filterKyDangKy = null;
      this.filterHocPhan = null;
      this.filterStatus = null;
      this.page = 1;
      this.pageInput = 1;
    },

    handleSearch() {
      this.page = 1;
      this.pageInput = 1;
    },

    handleAddClick() {
      console.log('Thêm mới sinh viên');
    },

    deleteItem(item) {
      console.log('Xóa:', item);
    },

    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage;
        this.pageInput = newPage;
      }
    },

    goToPage() {
      const p = parseInt(this.pageInput, 10);
      if (p && p >= 1 && p <= this.totalPages) {
        this.page = p;
      } else {
        this.pageInput = this.page;
      }
    },

    exportReport() {
      console.log('Xuất báo cáo');
    },

    importFile() {
      console.log('Nhập file đăng ký');
    }
  },
}
</script>

<style scoped>
/* Khung tổng thể vừa vặn màn hình */
.table-container {
  height: calc(100vh - 70px);
  background-color: #fff;
  overflow: hidden;
}

/* Cho phép vùng danh sách tự co giãn và lướt */
.table-scroll-content {
  min-height: 0;
  height: 100%;
}

.gap-2 {
  gap: 8px;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}

.min-w-0 {
  min-width: 0 !important;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

/* Cố định Header của Data Table (STT, Mã SV,...) luôn hiển thị trên cùng khi lướt */
::v-deep .v-data-table--fixed-header > .v-data-table__wrapper {
  height: 100%;
}

::v-deep .v-data-table--fixed-header th {
  background-color: #f8f9fa !important;
  z-index: 2 !important;
}
</style>