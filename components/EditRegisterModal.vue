<template>
  <v-dialog v-model="isOpen" max-width="850px" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="headline text-white px-6 py-3" style="background-color: #a62229;">
        <span>Sửa đăng ký bảo vệ lại</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- ALERT BÁO LỖI ĐỊNH MỨC PHÍ (MÀU VÀNG GIỐNG ẢNH 2) -->
      <v-alert
        v-if="errorMessage"
        type="warning"
        dismissible
        class="ma-4 text-body-2"
        color="amber darken-2"
        dark
        @dismissed="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-card-text class="py-4 px-6" style="max-height: 75vh; overflow-y: auto;">
        <!-- 1. THÔNG TIN CÁ NHÂN -->
        <div class="mb-4">
          <div class="d-flex align-center font-weight-bold red--text text--darken-3 mb-2">
            <div style="width: 4px; height: 16px; background-color: #a62229;" class="mr-2 rounded"></div>
            <span class="text-subtitle-1">Thông tin cá nhân</span>
          </div>
          <div class="pl-3">
            <v-row dense class="text-body-2">
              <v-col cols="12" sm="6">Họ tên: <b class="red--text text--darken-3">{{ studentInfo.fullName || '-' }}</b></v-col>
              <v-col cols="12" sm="6">Mã SV: <b class="red--text text--darken-3">{{ studentInfo.studentCode || studentInfo.code || '-' }}</b></v-col>
              <v-col cols="12" sm="6">Giới tính: <span class="red--text text--darken-3">{{ formatGender(studentInfo.gender) }}</span></v-col>
              <v-col cols="12" sm="6">Email trường: <span class="red--text text--darken-3">{{ studentInfo.email || '-' }}</span></v-col>
              <v-col cols="12" sm="6">Khóa: <span class="red--text text--darken-3">{{ getCourseName(studentInfo.course) }}</span></v-col>
              <v-col cols="12" sm="6">Lớp: <span class="red--text text--darken-3">{{ studentInfo.clazz ? studentInfo.clazz.name : (studentInfo.className || '-') }}</span></v-col>
              <v-col cols="12" sm="6">Ngành: <span class="red--text text--darken-3">{{ studentInfo.major ? studentInfo.major.name : (studentInfo.majorName || '-') }}</span></v-col>
              <v-col cols="12" sm="6">Hình thức đào tạo: <span class="red--text text--darken-3">{{ studentInfo.clazz ? studentInfo.clazz.trainingMethodName : (studentInfo.trainingMethodName || 'Vừa làm vừa học') }}</span></v-col>
            </v-row>
          </div>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- 2. ĐỢT BẢO VỆ -->
        <div class="mb-4">
          <div class="d-flex align-center font-weight-bold red--text text--darken-3 mb-2">
            <div style="width: 4px; height: 16px; background-color: #a62229;" class="mr-2 rounded"></div>
            <span class="text-subtitle-1">Đợt bảo vệ: {{ getExamName(studentInfo) }}</span>
          </div>

          <div class="text-caption grey--text text--darken-1 mb-2">
            Danh sách học phần ({{ subjectList.length }})
          </div>

          <!-- BẢNG HỌC PHẦN -->
          <v-data-table
            :headers="headers"
            :items="subjectList"
            :loading="loading"
            hide-default-footer
            dense
            no-data-text="Không có dữ liệu"
            class="elevation-0 border"
          >
            <template #[`item.index`]="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
            <template #[`item.subjectCode`]="{ item }">
              <span>{{ item.code || item.termCode || item.subjectCode || '-' }}</span>
            </template>
            <template #[`item.subjectName`]="{ item }">
              <span>{{ item.name || item.termName || item.subjectName || '-' }}</span>
            </template>
            <template #[`item.credits`]="{ item }">
              <span>{{ item.creditHours || item.credits || 0 }}</span>
            </template>
            <template #[`item.amount`]="{ item }">
              <span>{{ formatMoney(item.totalFee || item.fee || 0) }}đ</span>
            </template>
          </v-data-table>

          <div class="text-right font-weight-bold mt-3">
            Tổng tiền: <span class="red--text">{{ formatMoney(totalFeeCalculated) }} VNĐ</span>
          </div>

          <div class="text-caption red--text text--lighten-1 italic text-center mt-2">
            Hệ thống chỉ hiển thị số tiền dự kiến. Học phí chính thức sẽ được thông báo cụ thể qua email của sinh viên.
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-6 py-3">
        <v-spacer></v-spacer>
        <v-btn text color="grey darken-1" @click="close">
          Đóng <v-icon right small>mdi-close</v-icon>
        </v-btn>
        <v-btn color="#a62229" dark elevation="0" :loading="saving" @click="save">
          Lưu <v-icon right small>mdi-content-save</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import registerService from '~/services/redefend/registerService'

export default {
  name: 'EditRegisterModal',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isOpen: this.value,
      loading: false,
      saving: false,
      errorMessage: '',
      subjectList: [],
      headers: [
        { text: 'STT', value: 'index', width: '50px', sortable: false },
        { text: 'Mã học phần', value: 'subjectCode', sortable: false },
        { text: 'Tên học phần', value: 'subjectName', sortable: false },
        { text: 'Số tín chỉ học phí', value: 'credits', sortable: false },
        { text: 'Thành tiền', value: 'amount', sortable: false }
      ]
    }
  },
  computed: {
    studentInfo() {
      return this.data || {}
    },
    totalFeeCalculated() {
      if (this.subjectList.length === 0) return this.studentInfo.totalFee || 0
      return this.subjectList.reduce((sum, item) => sum + (item.totalFee || item.fee || 0), 0)
    }
  },
  watch: {
    value(val) {
      this.isOpen = val
      if (val && this.data) {
        this.errorMessage = ''
        this.loadModalData()
      }
    },
    isOpen(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    async loadModalData() {
      this.loading = true
      this.errorMessage = ''
      
      const code = this.studentInfo.studentCode || this.studentInfo.code
      const examId = this.studentInfo.examId || (this.studentInfo.exam ? this.studentInfo.exam.id : null)
      const majorId = this.studentInfo.majorId || (this.studentInfo.major ? this.studentInfo.major.id : null)
      const semesterId = this.studentInfo.semesterId || (this.studentInfo.semester ? this.studentInfo.semester.id : null)

      try {
        // 1. Gọi song song cả 2 API: listForRegister và estimation
        const [resList, resEstimation] = await Promise.allSettled([
          registerService.getListForRegister({
            code,
            examId,
            channel: 'CMS'
          }),
          registerService.getEstimation({
            majorId,
            semesterId,
            channel: 'CMS'
          })
        ])

        // Xử lý dữ liệu danh sách học phần
        if (resList.status === 'fulfilled') {
          const listPayload = resList.value?.data || resList.value || []
          this.subjectList = Array.isArray(listPayload) ? listPayload : (listPayload.items || [])
        }

        // Xử lý phản hồi từ API estimation (bắt thông báo lỗi 400 nếu có)
        if (resEstimation.status === 'fulfilled') {
          const estData = resEstimation.value
          if (estData && (estData.code === 400 || estData.error || estData.message)) {
            this.errorMessage = estData.message || estData.error?.message || 'Chưa có định mức phí hoặc chưa kích hoạt định mức phí cho ngành học này'
          }
        } else if (resEstimation.status === 'rejected') {
          const errRes = resEstimation.reason?.response?.data
          this.errorMessage = errRes?.message || errRes?.error?.message || 'Chưa có định mức phí hoặc chưa kích hoạt định mức phí cho ngành học này'
        }

      } catch (error) {
        console.error('Lỗi khi tải dữ liệu sửa đăng ký:', error)
      } finally {
        this.loading = false
      }
    },

    getCourseName(course) {
      if (!course) return '-'
      if (typeof course === 'object') return course.name || course.code || '-'
      return course
    },

    getExamName(data) {
      if (data.exam && data.exam.name) return data.exam.name
      if (data.examName) return data.examName
      return 'Đợt 6 (demo)'
    },

    formatGender(gender) {
      if (!gender) return 'Khác'
      if (gender === 'OTHER' || gender === 'Khác') return 'Khác'
      if (gender === 'MALE' || gender === 'Nam') return 'Nam'
      if (gender === 'FEMALE' || gender === 'Nữ') return 'Nữ'
      return gender
    },

    formatMoney(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('vi-VN').format(val)
    },

    close() {
      this.isOpen = false
    },

    save() {
      this.saving = true
      try {
        // Thực hiện logic lưu dữ liệu cập nhật
        this.close()
        this.$emit('success')
      } catch (error) {
        console.error('Lỗi lưu đăng ký:', error)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>