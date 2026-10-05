<template>
  <v-dialog v-model="internalValue" width="800px" scrollable>
    <v-card class="rounded-lg overflow-hidden d-flex flex-column">
      <!-- HEADER DIALOG -->
      <v-card-title class="bg-red-bk white--text pa-3 d-flex justify-space-between align-center flex-shrink-0">
        <span class="text-subtitle-1 font-weight-bold">Chi tiết sinh viên phải học lại</span>
        <v-btn icon dark small class="ma-0" @click="closeModal">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- BODY DIALOG -->
      <v-card-text class="pa-5 black--text overflow-y-auto style-scrollbar">
        <div v-if="studentData">
          <!-- SECTION 1: THÔNG TIN SINH VIÊN -->
          <div class="mb-5">
            <h3 class="text-subtitle-1 font-weight-bold text-red-bold mb-3">Thông tin sinh viên</h3>
            <v-row dense class="text-caption">
              <v-col cols="6" class="py-1">Họ và tên sinh viên: <span class="font-weight-bold text-red-bold">{{ studentData.fullName || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Mã số sinh viên: <span class="font-weight-bold text-red-bold">{{ studentData.studentCode || '—' }}</span></v-col>

              <v-col cols="6" class="py-1">Ngày sinh: <span>{{ studentData.dob || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Giới tính: <span class="font-weight-bold text-red-bold">{{ studentData.gender || 'Nữ' }}</span></v-col>

              <v-col cols="6" class="py-1">Email: <span class="text-red-bold">{{ studentData.email || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Số điện thoại: <span>{{ studentData.phone || '—' }}</span></v-col>

              <v-col cols="6" class="py-1">Địa chỉ: <span>{{ studentData.address || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Quê quán: <span>{{ studentData.hometown || '—' }}</span></v-col>

              <v-col cols="6" class="py-1">Lớp: <span class="font-weight-bold text-red-bold">{{ studentData.className || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Ngành: <span class="font-weight-bold text-red-bold">{{ studentData.majorName || 'Công nghệ thông tin' }}</span></v-col>

              <v-col cols="6" class="py-1">Khóa: <span class="font-weight-bold text-red-bold">{{ studentData.academicYear || 'Khóa 66' }}</span></v-col>
              <v-col cols="6" class="py-1">Hình thức đào tạo: <span>{{ studentData.trainingType || 'Vừa làm vừa học' }}</span></v-col>
            </v-row>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- SECTION 2: THÔNG TIN HỌC LẠI -->
          <div class="mb-5">
            <h3 class="text-subtitle-1 font-weight-bold text-red-bold mb-3">Thông tin học lại</h3>
            <v-row dense class="text-caption">
              <v-col cols="6" class="py-1">Đợt học lại: <span class="font-weight-bold text-red-bold">{{ studentData.sessionId || '20261-A-5' }}</span></v-col>
              <v-col cols="6" class="py-1">Học kỳ: <span class="font-weight-bold text-red-bold">{{ studentData.termId || '20261' }}</span></v-col>

              <v-col cols="6" class="py-1">Mã học phần: <span class="font-weight-bold text-red-bold">{{ studentData.subjectCode || 'IT3100' }}</span></v-col>
              <v-col cols="6" class="py-1">Tên học phần: <span class="font-weight-bold text-red-bold">{{ studentData.subjectName || 'Lập trình hướng đối tượng' }}</span></v-col>

              <v-col cols="6" class="py-1">Số tín chỉ: <span class="font-weight-bold">{{ studentData.credits || 2 }}</span></v-col>
              <v-col cols="6" class="py-1">Thời lượng: <span>{{ studentData.duration || '0.7' }}</span></v-col>

              <!-- TRẠNG THÁI KHỚP VỚI BẢNG BÊN NGOÀI -->
              <v-col cols="12" class="py-1 d-flex align-center">
                Trạng thái:
                <v-chip
                  class="ml-2 px-3"
                  x-small
                  :color="studentData.status === 'Đã đăng ký' ? '#4CAF50' : '#9E9E9E'"
                  dark
                >
                  {{ studentData.status || 'Chưa đăng ký' }}
                </v-chip>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- SECTION 3: THÔNG TIN ĐIỂM -->
          <div class="mb-5">
            <h3 class="text-subtitle-1 font-weight-bold text-red-bold mb-3">Thông tin điểm</h3>
            <v-row dense class="text-caption">
              <v-col cols="6" class="py-1">Điểm giữa kỳ: <span>{{ studentData.midtermScore || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Điểm thực hành thí nghiệm: <span>{{ studentData.practiceScore || '—' }}</span></v-col>

              <v-col cols="6" class="py-1">Điểm quá trình: <span>{{ studentData.processScore || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Điểm cuối kỳ: <span>{{ studentData.finalScore || '—' }}</span></v-col>

              <v-col cols="6" class="py-1">Điểm cộng: <span>{{ studentData.bonusScore || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Điểm chữ: <span>{{ studentData.charScore || '—' }}</span></v-col>

              <v-col cols="6" class="py-1">Học lại / Thi lại: <span>{{ studentData.type || 'Học lại' }}</span></v-col>
              <v-col cols="6" class="py-1">Hệ số: <span>{{ studentData.weight || '—' }}</span></v-col>
            </v-row>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- SECTION 4: THÔNG TIN GIẢNG VIÊN -->
          <div class="mb-5">
            <h3 class="text-subtitle-1 font-weight-bold text-red-bold mb-3">Thông tin giảng viên</h3>
            <v-row dense class="text-caption">
              <v-col cols="6" class="py-1">Họ và tên giảng viên: <span>{{ studentData.teacherName || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Mã giảng viên: <span>{{ studentData.teacherCode || '—' }}</span></v-col>

              <v-col cols="6" class="py-1">Email: <span>{{ studentData.teacherEmail || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Số điện thoại: <span>{{ studentData.teacherPhone || '—' }}</span></v-col>

              <v-col cols="12" class="py-1">Trạng thái giảng viên: <span>{{ studentData.teacherStatus || '—' }}</span></v-col>
            </v-row>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- SECTION 5: THÔNG TIN KHÁC -->
          <div>
            <h3 class="text-subtitle-1 font-weight-bold text-red-bold mb-3">Thông tin khác</h3>
            <v-row dense class="text-caption">
              <v-col cols="6" class="py-1">Mã phòng thi: <span>{{ studentData.examRoomCode || '—' }}</span></v-col>
              <v-col cols="6" class="py-1">Loại lớp: <span>{{ studentData.classType || '—' }}</span></v-col>
              <v-col cols="12" class="py-1">Ghi chú: <span>{{ studentData.note || 'Demo 5 SV moi SV 1 don 07/09/2026' }}</span></v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER -->
      <v-card-actions class="pa-3 d-flex justify-end bg-white flex-shrink-0">
        <v-btn outlined small color="#333333" class="text-none px-4 border-btn-grey" @click="closeModal">
          Đóng <v-icon right x-small class="ml-1">mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DetailMustRetakeStudentModal',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    studentData: {
      type: Object,
      default: null
    }
  },
  computed: {
    internalValue: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    }
  },
  methods: {
    closeModal() {
      this.internalValue = false
    }
  }
}
</script>

<style scoped>
.bg-red-bk { background-color: #A62229 !important; }
.text-red-bold { color: #A62229 !important; }

.border-btn-grey {
  border: 1px solid #BDBDBD !important;
}

.style-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.style-scrollbar::-webkit-scrollbar-thumb {
  background: #C1C1C1;
  border-radius: 4px;
}
</style>