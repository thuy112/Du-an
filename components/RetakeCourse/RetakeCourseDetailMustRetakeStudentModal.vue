<template>
  <v-dialog v-model="dialog" max-width="850px" persistent scrollable>
    <v-card class="rounded-lg overflow-hidden">
      <!-- HEADER: Thanh tiêu đề đỏ Bách Khoa trên cùng -->
      <v-card-title class="bg-red-bk white--text px-5 py-3 d-flex justify-space-between align-center" style="background-color: #A62229 !important;">
        <span class="text-h6 font-weight-bold white--text">Chi tiết sinh viên phải học lại</span>
        <v-btn icon dark small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- CONTENT -->
      <v-card-text class="pa-5 bg-grey-lighten-4" style="max-height: 75vh; overflow-y: auto;">
        
        <!-- 1. THÔNG TIN SINH VIÊN -->
        <v-card class="pa-4 mb-4 rounded-lg elevation-1 bg-white">
          <div class="text-subtitle-1 font-weight-bold text-red-bk mb-3" style="color: #A62229;">Thông tin sinh viên</div>
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="text-body-2 mb-2">
                Họ và tên sinh viên: <span class="font-weight-bold text-red-bk" style="color: #A62229;">{{ studentInfo.fullName || studentData?.fullName || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Mã số sinh viên: <span class="font-weight-bold text-red-bk" style="color: #A62229;">{{ studentInfo.code || studentData?.studentCode || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Ngày sinh: <span class="font-weight-medium">{{ studentInfo.dob || studentInfo.birthDate || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Giới tính: <span class="font-weight-medium">{{ genderText }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Email: <span class="font-weight-medium text-blue">{{ studentInfo.email || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Số điện thoại: <span class="font-weight-medium">{{ studentInfo.phone || studentInfo.phoneNumber || '-' }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-body-2 mb-2">
                Địa chỉ: <span class="font-weight-medium">{{ studentInfo.address || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Quê quán: <span class="font-weight-medium">{{ studentInfo.hometown || studentInfo.nativeLand || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Lớp: <span class="font-weight-medium text-red-bk" style="color: #A62229;">{{ studentInfo.classes?.name || studentData?.className || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Ngành: <span class="font-weight-medium text-red-bk" style="color: #A62229;">{{ majorName }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Khóa: <span class="font-weight-medium text-red-bk" style="color: #A62229;">{{ courseName }}</span>
              </div>
              <div class="text-body-2">
                Hình thức đào tạo: <span class="font-weight-medium">{{ trainingTypeName }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- 2. THÔNG TIN HỌC LẠI -->
        <v-card class="pa-4 mb-4 rounded-lg elevation-1 bg-white">
          <div class="text-subtitle-1 font-weight-bold text-red-bk mb-3" style="color: #A62229;">Thông tin học lại</div>
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="text-body-2 mb-2">
                Đợt học lại: <span class="font-weight-bold text-red-bk" style="color: #A62229;">{{ retakeSessionInfo.code || studentData?.sessionCode || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Mã học phần: <span class="font-weight-bold text-red-bk" style="color: #A62229;">{{ termInfo.code || studentData?.subjectCode || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Số tín chỉ: <span class="font-weight-bold">{{ termInfo.credit || termInfo.credits || '-' }}</span>
              </div>
              <div class="text-body-2 d-flex align-center">
                <span class="mr-2">Trạng thái:</span>
                <span :class="['status-badge text-nowrap', isRegistered ? 'bg-green' : 'bg-grey']">
                  {{ isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký' }}
                </span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-body-2 mb-2">
                Học kỳ: <span class="font-weight-bold text-red-bk" style="color: #A62229;">{{ semesterInfo.code || studentData?.termCode || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Tên học phần: <span class="font-weight-bold text-red-bk" style="color: #A62229;">{{ termInfo.name || studentData?.subjectName || '-' }}</span>
              </div>
              <div class="text-body-2 mb-2">
                Thời lượng: <span class="font-weight-bold">{{ termInfo.duration || '-' }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- 3. THÔNG TIN ĐIỂM -->
        <v-card class="pa-4 mb-4 rounded-lg elevation-1 bg-white">
          <div class="text-subtitle-1 font-weight-bold text-red-bk mb-3" style="color: #A62229;">Thông tin điểm</div>
          <v-row dense>
            <v-col cols="12" md="3">
              <div class="text-body-2 mb-2">Điểm giữa kỳ: <span class="font-weight-bold">{{ studentData?.midScore ?? scoreInfo.midterm ?? '-' }}</span></div>
              <div class="text-body-2">Điểm cộng: <span class="font-weight-bold">{{ studentData?.plusScore ?? scoreInfo.bonus ?? '-' }}</span></div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-body-2 mb-2">Điểm thực hành thí nghiệm: <span class="font-weight-bold">{{ studentData?.practiceScore ?? scoreInfo.practice ?? '-' }}</span></div>
              <div class="text-body-2">Điểm chữ: <span class="font-weight-bold">{{ studentData?.letterScore ?? scoreInfo.letterScore ?? '-' }}</span></div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-body-2 mb-2">Điểm quá trình: <span class="font-weight-bold">{{ studentData?.processScore ?? scoreInfo.process ?? '-' }}</span></div>
              <div class="text-body-2">Học lại / Thi lại: <span class="font-weight-bold text-red-bk" style="color: #A62229;">{{ studentData?.retakeType || scoreInfo.retakeType || 'Học lại' }}</span></div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-body-2 mb-2">Điểm cuối kỳ: <span class="font-weight-bold">{{ studentData?.score ?? studentData?.failedScore ?? scoreInfo.final ?? '-' }}</span></div>
              <div class="text-body-2">Hệ số: <span class="font-weight-bold">{{ studentData?.coefficient ?? scoreInfo.coefficient ?? '-' }}</span></div>
            </v-col>
          </v-row>
        </v-card>

        <!-- 4. THÔNG TIN GIẢNG VIÊN -->
        <v-card class="pa-4 mb-4 rounded-lg elevation-1 bg-white">
          <div class="text-subtitle-1 font-weight-bold text-red-bk mb-3" style="color: #A62229;">Thông tin giảng viên</div>
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="text-body-2 mb-2">Họ và tên giảng viên: <span class="font-weight-medium">{{ lecturerInfo.fullName || lecturerInfo.name || '-' }}</span></div>
              <div class="text-body-2 mb-2">Email: <span class="font-weight-medium text-blue">{{ lecturerInfo.email || '-' }}</span></div>
              <div class="text-body-2">Trạng thái giảng viên: <span class="font-weight-medium">{{ lecturerInfo.status || '-' }}</span></div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-body-2 mb-2">Mã giảng viên: <span class="font-weight-medium">{{ lecturerInfo.code || '-' }}</span></div>
              <div class="text-body-2">Số điện thoại: <span class="font-weight-medium">{{ lecturerInfo.phone || lecturerInfo.phoneNumber || '-' }}</span></div>
            </v-col>
          </v-row>
        </v-card>

        <!-- 5. THÔNG TIN KHÁC -->
        <v-card class="pa-4 rounded-lg elevation-1 bg-white">
          <div class="text-subtitle-1 font-weight-bold text-red-bk mb-3" style="color: #A62229;">Thông tin khác</div>
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="text-body-2 mb-2">Mã phòng thi: <span class="font-weight-medium">{{ studentData?.roomCode || otherInfo.roomCode || '-' }}</span></div>
              <div class="text-body-2">Ghi chú: <span class="font-weight-medium">{{ studentData?.note || otherInfo.note || '-' }}</span></div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-body-2">Loại lớp: <span class="font-weight-medium">{{ studentData?.classType || otherInfo.classType || '-' }}</span></div>
            </v-col>
          </v-row>
        </v-card>

      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER -->
      <v-card-actions class="pa-3 px-5 d-flex justify-end bg-white">
        <v-btn dark small elevation="0" color="#A62229" class="text-none px-4" @click="close" style="background-color: #A62229 !important;">
          Đóng <v-icon right small>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RetakeCourseDetailMustRetakeStudentModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    studentData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    dialog: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
    isRegistered() {
      const status = this.studentData?.status
      return status === 'REGISTERED' || status === 'REGISTER' || this.studentData?.isRegistered
    },
    studentInfo() {
      return this.studentData?.student || {}
    },
    courseName() {
      const course = this.studentInfo?.course
      if (typeof course === 'object' && course !== null) {
        return course.name || course.code || '-'
      }
      return course || '-'
    },
    genderText() {
      const g = this.studentInfo?.gender
      if (g === 'OTHER' || g === 'Nữ') return 'Nữ'
      if (g === 'MALE' || g === 'Nam') return 'Nam'
      return g || '-'
    },
    majorName() {
      const major = this.studentInfo?.major
      if (typeof major === 'object' && major !== null) {
        return major.name || major.code || '-'
      }
      return major || '-'
    },
    trainingTypeName() {
      const type = this.studentInfo?.trainingType
      if (typeof type === 'object' && type !== null) {
        return type.name || type.code || '-'
      }
      return type || '-'
    },
    retakeSessionInfo() {
      return this.studentData?.retakeSession || {}
    },
    semesterInfo() {
      return this.studentData?.semester || {}
    },
    termInfo() {
      return this.studentData?.term || {}
    },
    scoreInfo() {
      return this.studentData?.scoreDetail || {}
    },
    lecturerInfo() {
      return this.studentData?.lecturer || {}
    },
    otherInfo() {
      return this.studentData?.other || {}
    },
  },
  methods: {
    close() {
      this.dialog = false
    },
  },
}
</script>