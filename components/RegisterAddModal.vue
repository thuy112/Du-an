<template>
  <v-dialog :value="open" max-width="1000px" persistent @input="(val) => !val && closeModal()">
    <v-card class="rounded-lg overflow-hidden">
      <!-- TIÊU ĐỀ MODAL -->
      <div
        class="px-6 py-4 text-white font-weight-bold d-flex justify-space-between align-items-center"
        style="background-color: #A62229; font-size: 18px;"
      >
        <span>Đăng ký thi lại</span>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </div>

      <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto;">
        <v-stepper v-model="step" elevation="0" vertical class="pa-0">
          <!-- BƯỚC 1: THÔNG TIN CÁ NHÂN -->
          <v-stepper-step :complete="step > 1" step="1" color="#A62229">
            <div class="d-flex align-center justify-space-between w-100">
              <span>Thông tin cá nhân</span>
            </div>
          </v-stepper-step>

          <v-stepper-content step="1">
            <v-row class="ma-0" dense>
              <v-col cols="12" md="8" offset="0" offset-md="2">
                <div class="text-center font-weight-medium mb-2" style="color: #A62229;">
                  Nhập Mã Số Sinh Viên
                </div>
                <v-autocomplete
                  v-model="form.student"
                  :items="studentList"
                  :loading="loadingStudents"
                  :search-input.sync="search"
                  item-text="fullName"
                  item-value="id"
                  return-object
                  label="Sinh viên"
                  no-data-text="Không có dữ liệu"
                  no-filter
                  clearable
                  outlined
                  dense
                  hide-details
                  @update:search-input="handleDebounce"
                >
                  <template #item="{ item }">
                    <span>{{ item.code }} - {{ item.fullName }}</span>
                  </template>
                  <template #append-item>
                    <div v-intersect="endIntersect" class="pa-2 text-center caption grey--text">
                      <span v-if="loadingMoreStudents"></span>
                    </div>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col v-if="form.student" cols="12" class="mt-4">
                <div class="border-left mb-3">Thông tin cá nhân</div>
                <div class="pa-4 rounded bg-grey-lighten-4 border">
                  <div class="d-flex flex-column text-body-2" style="gap: 6px;">
                    <div><strong>Họ tên:</strong> {{ form.student.fullName || '---' }}</div>
                    <div><strong>Mã SV:</strong> {{ form.student.code || '---' }}</div>
                    <div><strong>Ngày sinh:</strong> {{ form.student.birthday || '---' }}</div>
                    <div><strong>Giới tính:</strong> {{ formatGender(form.student.gender) }}</div>
                    <div><strong>Email trường:</strong> {{ form.student.email || '---' }}</div>
                    <div><strong>Khóa:</strong> {{ parseObjectValue(form.student.course) }}</div>
                    <div>
                      <strong>Lớp:</strong>
                      {{ form.student.className || form.student.classes?.name || '---' }}
                    </div>
                    <div>
                      <strong>Ngành:</strong>
                      {{ parseObjectValue(form.student.major || form.student.majorName) }}
                    </div>
                    <div>
                      <strong>Loại hình đào tạo:</strong>
                      {{
                        form.student.trainingMethodName ||
                          parseObjectValue(form.student.degreeType || form.student.trainingType)
                      }}
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" class="mt-3">
                <div class="d-flex justify-end">
                  <v-btn
                    color="#A2212B"
                    dark
                    depressed
                    class="text-none px-6"
                    height="36"
                    :disabled="!form.student"
                    @click="step = 2"
                  >
                    Tiếp tục
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-stepper-content>

          <!-- BƯỚC 2: THÔNG TIN ĐĂNG KÝ -->
          <v-stepper-step :complete="step > 2" step="2" color="#A62229">
            Thông tin đăng ký
          </v-stepper-step>

          <v-stepper-content step="2">
            <v-row class="ma-0" dense>
              <v-col cols="12" md="8" offset="0" offset-md="2">
                <div class="text-center font-weight-medium mb-2" style="color: #A62229;">
                  Nhập kỳ thi lại
                </div>
                <v-autocomplete
                  v-model="form.exam"
                  :items="examList"
                  :loading="loadingExams"
                  item-text="name"
                  item-value="id"
                  return-object
                  label="Kỳ thi lại"
                  no-data-text="Không có dữ liệu"
                  clearable
                  outlined
                  dense
                  hide-details
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" class="mt-4">
                <div class="font-weight-bold mb-2">
                  Danh sách học phần (<span style="color: #A2212B;">{{ list.length }}</span>)
                </div>

                <v-data-table
                  v-model="selectedList"
                  :headers="headers"
                  :items="list"
                  :loading="loadingTerms"
                  item-key="id"
                  checkbox-color="primary"
                  show-select
                  hide-default-footer
                  disable-pagination
                  class="elevation-1 rounded border"
                  no-data-text="Không có dữ liệu"
                >
                  <template #[`item.stt`]="{ index }">
                    <span>{{ index + 1 }}</span>
                  </template>
                  <template #[`item.money`]="{ item }">
                    <span>{{ formatMoney(calcTermMoney(item)) }}</span>
                  </template>
                </v-data-table>

                <div class="d-flex justify-end align-center mt-3 font-weight-bold text-subtitle-1">
                  <span>Tổng tiền:</span>
                  <span class="ml-2" style="color: #A2212B;">
                    {{ formatMoney(totalMoney) }} VNĐ
                  </span>
                </div>
              </v-col>
            </v-row>
          </v-stepper-content>
        </v-stepper>
      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER ACTIONS -->
      <v-card-actions class="pa-4 justify-end" style="gap: 8px;">
        <v-btn text class="text-none px-4" @click="closeModal">Đóng</v-btn>
        <v-btn
          :color="canSave ? '#A2212B' : '#e0e0e0'"
          :dark="canSave"
          depressed
          class="text-none px-6 save-btn"
          :class="{ 'save-btn--disabled': !canSave }"
          :loading="isLoading"
          :disabled="!canSave || isLoading"
          @click="submit"
        >
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import registerService from '~/services/registerService'

const INIT_FORM = {
  student: null,
  exam: null,
}

const INIT_PAGE_INFO = {
  pageIndex: 1,
  pageSize: 10,
}

export default {
  name: 'RegisterAddModal',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoading: false,
      loadingStudents: false,
      loadingMoreStudents: false,
      loadingExams: false,
      loadingTerms: false,

      step: 1,
      search: null,
      idTimeout: null,

      studentList: [],
      examList: [],
      totalPage: 0,
      feeCreditHour: 0,
      pageInfo: {
        ...INIT_PAGE_INFO,
      },
      form: {
        ...INIT_FORM,
      },
      list: [],
      selectedList: [],
      headers: [
        { text: 'STT', align: 'start', sortable: false, value: 'stt' },
        { text: 'Mã học phần', align: 'start', sortable: false, value: 'code' },
        { text: 'Tên học phần', align: 'start', sortable: false, value: 'name' },
        { text: 'Số tín chỉ học phí', align: 'right', sortable: false, value: 'creditHours' },
        { text: 'Thành tiền', align: 'right', sortable: false, value: 'money' },
      ],
    }
  },
  computed: {
    canSave() {
      return Boolean(this.step === 2 && this.form.student && this.form.exam && this.selectedList.length > 0)
    },
    totalMoney() {
      return this.selectedList.reduce((acc, cur) => acc + this.calcTermMoney(cur), 0)
    },
  },
  watch: {
    open(val) {
      if (val) {
        this.resetModal()
        this.getStudent()
      }
    },
    step(val) {
      if (val === 2 && this.examList.length === 0) {
        this.getExam()
      }
    },
    'form.exam'(val) {
      this.selectedList = []
      if (val) {
        Promise.all([this.getFee(), this.getSubject()])
      } else {
        this.list = []
        this.feeCreditHour = 0
      }
    },
  },
  methods: {
    resetModal() {
      this.step = 1
      this.search = null
      this.studentList = []
      this.totalPage = 0
      this.feeCreditHour = 0
      this.pageInfo = { ...INIT_PAGE_INFO }
      this.form = { ...INIT_FORM }
      this.list = []
      this.selectedList = []
      if (this.idTimeout) {
        clearTimeout(this.idTimeout)
        this.idTimeout = null
      }
    },

    closeModal() {
      this.$emit('toggle')
    },

    formatGender(gender) {
      if (gender === 'MALE' || gender === 'NAM') return 'Nam'
      if (gender === 'FEMALE' || gender === 'NỮ') return 'Nữ'
      return 'Khác'
    },

    parseObjectValue(val) {
      if (!val) return '---'
      if (typeof val === 'object') {
        return val.name || val.code || val.title || '---'
      }
      return val
    },

    formatMoney(amount) {
      const num = Number(amount || 0)
      if (typeof this.$formatNumber === 'function') {
        return this.$formatNumber(num)
      }
      return num.toLocaleString('vi-VN')
    },

    calcTermMoney(term) {
      const credits = Number(term?.creditHours ?? term?.credit ?? 1)
      return Number(this.feeCreditHour || 0) * (Number.isNaN(credits) ? 1 : credits)
    },

    async getStudent() {
      if (this.loadingStudents || this.loadingMoreStudents) return
      const isLoadMore = this.pageInfo.pageIndex > 1
      if (isLoadMore) {
        this.loadingMoreStudents = true
      } else {
        this.loadingStudents = true
      }

      try {
        const res = await registerService.getCanRegisterStudents({
          ...this.pageInfo,
          search: this.search || '',
          channel: 'CMS',
        })
        const root = res?.data !== undefined ? res.data : res
        const data = root?.data !== undefined ? root.data : root
        const items = Array.isArray(data) ? data : data?.data || data?.content || []

        if (isLoadMore) {
          const existingIds = new Set(this.studentList.map((s) => s.id))
          const uniqueItems = items.filter((s) => !existingIds.has(s.id))
          this.studentList.push(...uniqueItems)
        } else {
          this.studentList = items
        }

        this.totalPage = Number(data?.totalPages || root?.totalPages || 1)
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
      } finally {
        this.loadingStudents = false
        this.loadingMoreStudents = false
      }
    },

    handleDebounce() {
      if (this.idTimeout) clearTimeout(this.idTimeout)
      this.idTimeout = setTimeout(() => {
        this.handleSearch()
      }, 600)
    },

    async handleSearch() {
      this.pageInfo.pageIndex = 1
      this.loadingStudents = true
      try {
        const res = await registerService.getCanRegisterStudents({
          ...this.pageInfo,
          search: this.search || '',
          channel: 'CMS',
        })
        const root = res?.data !== undefined ? res.data : res
        const data = root?.data !== undefined ? root.data : root
        const items = Array.isArray(data) ? data : data?.data || data?.content || []
        this.studentList = items
        this.totalPage = Number(data?.totalPages || root?.totalPages || 1)
      } catch (error) {
        console.error('Lỗi tìm kiếm sinh viên:', error)
      } finally {
        this.loadingStudents = false
      }
    },

    async getExam() {
      this.loadingExams = true
      try {
        const res = await registerService.getExams({
          status: 'ACTIVE',
          channel: 'CMS',
        })
        const root = res?.data !== undefined ? res.data : res
        const items = Array.isArray(root) ? root : root?.data || root?.content || []
        this.examList = items
      } catch (error) {
        console.error('Lỗi tải danh sách kỳ thi:', error)
      } finally {
        this.loadingExams = false
      }
    },

    async getFee() {
      const majorId =
        this.form.student?.major?.id ||
        this.form.student?.majorId ||
        this.form.student?.major
      const semesterId =
        this.form.exam?.semester?.id ||
        this.form.exam?.semesterId ||
        this.form.exam?.semester?.value ||
        null

      if (!majorId) return

      try {
        const params = {
          majorId,
          channel: 'CMS',
          ...(semesterId && { semesterId }),
        }
        const res = await registerService.getEstimationFee(params)
        const root = res?.data !== undefined ? res.data : res
        const data = root?.data !== undefined ? root.data : root

        const feeValue =
          typeof data === 'number'
            ? data
            : data?.fee ?? data?.price ?? data?.amount ?? data?.unitPrice ?? 0

        this.feeCreditHour = Number(feeValue) || 0
      } catch (error) {
        console.error('Lỗi lấy đơn giá tín chỉ:', error)
        this.feeCreditHour = 0
      }
    },

    async getSubject() {
      const studentCode =
        this.form.student?.code ||
        this.form.student?.studentCode ||
        this.form.student?.maSv
      const examId =
        typeof this.form.exam === 'object' ? this.form.exam?.id : this.form.exam

      if (!studentCode || !examId) return

      this.loadingTerms = true
      try {
        const res = await registerService.getTermsForRegister({
          code: studentCode,
          examId,
          channel: 'CMS',
        })
        const root = res?.data !== undefined ? res.data : res
        const data = root?.data !== undefined ? root.data : root
        const items = Array.isArray(data)
          ? data
          : data?.data || data?.content || data?.items || []

        this.list = items
      } catch (error) {
        console.error('Lỗi lấy danh sách học phần:', error)
        this.list = []
      } finally {
        this.loadingTerms = false
      }
    },

    async submit() {
      if (!this.canSave) return
      this.isLoading = true
      try {
        await registerService.createRegister(
          {
            birthday: this.form.student.birthday,
            clazzId: this.form.student.classes?.id || this.form.student.clazzId,
            code: this.form.student.code,
            examType: 'RETAKE_EXAM',
            courseId: this.form.student.course?.id || this.form.student.courseId,
            email: this.form.student.email,
            examId: this.form.exam.id,
            fullName: this.form.student.fullName,
            majorId: this.form.student.major?.id || this.form.student.majorId,
            phone: this.form.student.phone,
            termIds: this.selectedList.map((i) => i.id),
          },
          'CMS'
        )
        this.$emit('toggle')
        this.$emit('success')
      } catch (error) {
        console.error('Lỗi lưu đăng ký:', error)
      } finally {
        this.isLoading = false
      }
    },

    endIntersect(args) {
      const entry = Array.isArray(args) ? args[0] : args
      if (entry?.isIntersecting && !this.loadingStudents && !this.loadingMoreStudents) {
        if (this.pageInfo.pageIndex < this.totalPage) {
          this.pageInfo.pageIndex += 1
          this.getStudent()
        }
      }
    },
  },
}
</script>

<style scoped>
.border {
  border: 1px solid #e0e0e0 !important;
}

.border-left {
  border-left: 4px solid #A62229;
  padding: 2px 8px;
  color: #000000;
  font-weight: 600;
  font-size: 18px;
}

.save-btn--disabled {
  background-color: #e0e0e0 !important;
  color: #9e9e9e !important;
}
</style>