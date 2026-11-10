<template>
  <v-dialog v-model="dialog" max-width="850px" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="headline text-white px-6 py-4" style="background-color: #a62229;">
        <span>Thông tin đăng ký bảo vệ lại</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="py-4 px-6" style="max-height: 75vh; overflow-y: auto;">
        <!-- 1. THÔNG TIN CÁ NHÂN -->
        <div class="mb-4">
          <div class="d-flex align-center font-weight-bold red--text text--darken-3 mb-2">
            <div style="width: 4px; height: 16px; background-color: #a62229;" class="mr-2 rounded"></div>
            <span class="text-subtitle-1">Thông tin cá nhân</span>
          </div>
          <div class="pl-3">
            <v-row dense>
              <v-col cols="12" sm="6">Họ tên: <b>{{ detailData.fullName || '-' }}</b></v-col>
              <v-col cols="12" sm="6">Mã SV: <b>{{ detailData.studentCode || '-' }}</b></v-col>
              <v-col cols="12" sm="6">Giới tính: {{ formatGender(detailData.gender) }}</v-col>
              <v-col cols="12" sm="6">Email trường: {{ detailData.email || '-' }}</v-col>
              <v-col cols="12" sm="6">Khóa: {{ detailData.course ? detailData.course.name : '-' }}</v-col>
              <v-col cols="12" sm="6">Lớp: {{ detailData.clazz ? detailData.clazz.name : '-' }}</v-col>
              <v-col cols="12" sm="6">Ngành: {{ detailData.major ? detailData.major.name : '-' }}</v-col>
              <v-col cols="12" sm="6">Hình thức đào tạo: {{ detailData.clazz ? detailData.clazz.trainingMethodName : '-' }}</v-col>
            </v-row>
          </div>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- 2. THÔNG TIN ĐĂNG KÝ -->
        <div class="mb-4">
          <div class="d-flex align-center font-weight-bold red--text text--darken-3 mb-2">
            <div style="width: 4px; height: 16px; background-color: #a62229;" class="mr-2 rounded"></div>
            <span class="text-subtitle-1">Thông tin đăng ký</span>
          </div>
          <div class="pl-3">
            <v-row dense>
              <v-col cols="12" sm="6">Đợt bảo vệ: <b>{{ getExamName(detailData) }}</b></v-col>
              <v-col cols="12" sm="6">Thời gian đăng ký: {{ detailData.createTime || '-' }}</v-col>
              
              <v-col cols="12" sm="4" class="d-flex align-center gap-2 mt-2">
                <span>Trạng thái:</span>
                <BaseStatusItem :status="detailData.registerStudentStatus || 'CONFIRMED'" :status-list="registerStudentStatusList" />
              </v-col>
              <v-col cols="12" sm="4" class="d-flex align-center gap-2 mt-2">
                <span>Trạng thái trả học phí:</span>
                <BaseStatusItem :status="detailData.feePaidStatus" :status-list="payStatusList" />
              </v-col>
              <v-col cols="12" sm="4" class="d-flex align-center gap-2 mt-2">
                <span>Trạng thái gửi email:</span>
                <BaseStatusItem :status="detailData.sendMailStatus" :status-list="sendMailStatusList" />
              </v-col>
            </v-row>
          </div>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- 3. THÔNG TIN DUYỆT ĐƠN -->
        <div class="mb-4">
          <div class="d-flex align-center font-weight-bold red--text text--darken-3 mb-2">
            <div style="width: 4px; height: 16px; background-color: #a62229;" class="mr-2 rounded"></div>
            <span class="text-subtitle-1">Thông tin duyệt đơn</span>
          </div>
          <div class="pl-3">
            <v-row dense>
              <!-- Duyệt tín chỉ -->
              <v-col cols="12" md="4" class="mb-2">
                <div>Người duyệt: {{ detailData.creditApprovedFullName || detailData.creditApprover || 'Admin' }}</div>
                <div>Email người duyệt: {{ detailData.creditApprovedEmail || detailData.creditApproverEmail || 'admin@gmail.com' }}</div>
                <div class="d-flex align-center mt-1">
                  <span class="mr-2">Duyệt tín chỉ:</span>
                  <BaseStatusItem :status="detailData.creditManagement || 'CONFIRMED'" :status-list="browsingInfoList" />
                </div>
              </v-col>

              <!-- Duyệt học phí -->
              <v-col cols="12" md="4" class="mb-2">
                <div>Người duyệt: {{ detailData.tuitionApprovedFullName || detailData.feeApprover || 'Admin' }}</div>
                <div>Email người duyệt: {{ detailData.tuitionApprovedEmail || detailData.feeApproverEmail || 'admin@gmail.com' }}</div>
                <div class="d-flex align-center mt-1">
                  <span class="mr-2">Duyệt học phí:</span>
                  <BaseStatusItem :status="detailData.tuitionFeeManagement || 'CONFIRMED'" :status-list="browsingInfoList" />
                </div>
              </v-col>

              <!-- Duyệt sinh viên -->
              <v-col cols="12" md="4" class="mb-2">
                <div>Người duyệt: {{ detailData.studentApprovedFullName || detailData.studentApprover || 'Admin' }}</div>
                <div>Email người duyệt: {{ detailData.studentApprovedEmail || detailData.studentApproverEmail || 'admin@gmail.com' }}</div>
                <div class="d-flex align-center mt-1">
                  <span class="mr-2">Duyệt sinh viên:</span>
                  <BaseStatusItem :status="detailData.studentManagement || 'CONFIRMED'" :status-list="browsingInfoList" />
                </div>
              </v-col>
            </v-row>
          </div>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- 4. DANH SÁCH HỌC PHẦN ĐĂNG KÝ -->
        <div>
          <div class="font-weight-bold red--text text--darken-3 mb-2">
            Danh sách học phần đăng ký ({{ subjects.length }})
          </div>
          <v-data-table
            :headers="subjectHeaders"
            :items="subjects"
            hide-default-footer
            dense
            class="elevation-1"
          >
            <template #[`item.code`]="{ item }">
              {{ item.term ? item.term.code : (item.code || '-') }}
            </template>
            <template #[`item.name`]="{ item }">
              {{ item.term ? item.term.name : (item.name || '-') }}
            </template>
            <template #[`item.norm`]="{ item }">
              {{ item.feeDecision || '200000' }}
            </template>
            <template #[`item.credits`]="{ item }">
              {{ item.term ? item.term.creditHours : (item.credits || '10') }}
            </template>
            <template #[`item.totalFee`]="{ item }">
              {{ formatMoney(item.fee || detailData.totalFee || 2000000) }}
            </template>
          </v-data-table>

          <div class="text-right font-weight-bold mt-3">
            Tổng tiền: <span class="red--text">{{ formatMoney(detailData.totalFee || 2000000) }} VND</span>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-6 py-3">
        <v-spacer></v-spacer>
        <v-btn color="#a62229" dark depressed @click="close">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { 
  payStatusList, 
  sendMailStatusList, 
  browsingInfoList, 
  registerStudentStatusList 
} from '~/consts/list'

export default {
  name: 'DetailModal',
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
      dialog: this.value,
      detailData: {},
      subjects: [],
      payStatusList,
      sendMailStatusList,
      browsingInfoList,
      registerStudentStatusList,
      subjectHeaders: [
        { text: 'STT', value: 'index', width: '50px' },
        { text: 'Mã học phần', value: 'code' },
        { text: 'Tên học phần', value: 'name' },
        { text: 'Định mức', value: 'norm' },
        { text: 'Số tín chỉ học phí', value: 'credits' },
        { text: 'Thành tiền', value: 'totalFee' }
      ]
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val && this.data) {
        this.detailData = this.data
        const rawTerms = this.data.registerStudentTerms || this.data.subjects || []
        if (rawTerms.length > 0) {
          this.subjects = rawTerms.map((s, idx) => ({ ...s, index: idx + 1 }))
        } else {
          this.subjects = [{
            index: 1,
            code: this.data.subjectCode || 'JAVA',
            name: this.data.subjectName || 'Lập trình Java',
            feeDecision: 200000,
            credits: 10,
            fee: 2000000
          }]
        }
      }
    },
    dialog(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    close() {
      this.dialog = false
    },
    getExamName(data) {
      if (data.exam && data.exam.name) return data.exam.name
      if (data.registerStudentTerms && data.registerStudentTerms[0] && data.registerStudentTerms[0].exam) {
        return data.registerStudentTerms[0].exam.name
      }
      return 'Đợt 2'
    },
    formatGender(gender) {
      if (!gender) return '-'
      if (gender === 'OTHER' || gender === 'Khác') return 'Khác'
      if (gender === 'MALE' || gender === 'Nam') return 'Nam'
      if (gender === 'FEMALE' || gender === 'Nữ') return 'Nữ'
      return gender
    },
    formatMoney(val) {
      if (!val) return '0'
      return new Intl.NumberFormat('vi-VN').format(val)
    }
  }
}
</script>