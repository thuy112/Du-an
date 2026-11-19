<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card class="rounded-lg overflow-hidden">
      <!-- HEADER -->
      <v-card-title
        class="text-subtitle-1 font-weight-bold white--text px-5 py-3 d-flex align-center justify-space-between"
        style="background-color: #a62229;"
      >
        <span>Đăng ký bảo vệ lại</span>
        <v-btn icon dark x-small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="py-4 px-5 black--text">
        <!-- BƯỚC 1: THÔNG TIN CÁ NHÂN -->
        <div class="mb-4">
          <div
            class="d-flex align-center font-weight-bold mb-2"
            :class="step === 1 ? 'red--text text--darken-3' : 'grey--text text--darken-2'"
            style="cursor: pointer;"
            @click="step = 1"
          >
            <v-avatar
              :color="step > 1 ? '#a62229' : '#a62229'"
              size="22"
              class="white--text mr-2 text-caption font-weight-bold"
            >
              <v-icon v-if="step > 1" size="14" color="white">mdi-check</v-icon>
              <span v-else>1</span>
            </v-avatar>
            <span>Thông tin cá nhân</span>
          </div>

          <!-- Nội dung bước 1 chỉ mở khi step === 1 (bấm Tiếp tục sẽ thu gọn lại) -->
          <div v-if="step === 1" class="pl-7">
            <div class="text-center red--text text--darken-2 font-weight-medium mb-2">
              Nhập Mã Số Sinh Viên
            </div>

            <v-autocomplete
              v-model="selectedStudent"
              :items="studentList"
              :loading="studentLoading"
              :search-input.sync="studentSearchQuery"
              item-text="displayLabel"
              item-value="id"
              label="Sinh viên"
              placeholder="Sinh viên"
              outlined
              dense
              clearable
              return-object
              hide-details
              no-data-text="Không có dữ liệu"
              @change="onSelectStudent"
            >
              <template #item="{ item }">
                <span>{{ item.code || item.studentCode }} - {{ item.fullName }}</span>
              </template>
            </v-autocomplete>

            <!-- Chi tiết thông tin sinh viên khi đã chọn -->
            <div v-if="studentDetail" class="mt-4">
              <div class="border-left-title font-weight-bold mb-3">
                Thông tin cá nhân
              </div>

              <v-row dense class="text-body-2">
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Họ tên:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.fullName }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Mã SV:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.code }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Giới tính:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.gender }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Ngày sinh:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.birthday }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Email trường:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.email }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Email cá nhân:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.personalEmail }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Số điện thoại:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.phone }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Khóa:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.course }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Lớp:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.className }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Ngành:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.majorName }}
                  </span>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <span class="grey--text text--darken-1">Loại hình đào tạo:</span>
                  <span class="red--text text--darken-2 font-weight-medium ml-1">
                    {{ studentDetail.trainingMethodName }}
                  </span>
                </v-col>
              </v-row>
            </div>

            <div class="d-flex justify-end mt-4">
              <v-btn
                color="#a62229"
                dark
                elevation="0"
                class="text-none px-4"
                :disabled="!studentDetail"
                @click="goToStep2"
              >
                Tiếp tục
              </v-btn>
            </div>
          </div>
        </div>

        <!-- BƯỚC 2: THÔNG TIN ĐĂNG KÝ -->
        <div>
          <div
            class="d-flex align-center font-weight-bold mb-2"
            :class="step === 2 ? 'red--text text--darken-3' : 'grey--text'"
          >
            <v-avatar
              :color="step === 2 ? '#a62229' : '#bdbdbd'"
              size="22"
              class="white--text mr-2 text-caption font-weight-bold"
            >
              2
            </v-avatar>
            <span>Thông tin đăng ký</span>
          </div>

          <div v-if="step === 2" class="pl-7">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="registrationForm.examId"
                  :items="examList"
                  item-text="name"
                  item-value="id"
                  label="Đợt bảo vệ lại"
                  outlined
                  dense
                  clearable
                  hide-details
                  @change="handleExamOrTermChange"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="registrationForm.termCode"
                  :items="termOptions"
                  item-text="label"
                  item-value="code"
                  label="Học phần"
                  outlined
                  dense
                  clearable
                  hide-details
                  @change="handleExamOrTermChange"
                ></v-select>
              </v-col>
            </v-row>

            <div class="text-subtitle-2 font-weight-bold mt-4 mb-2">
              Danh sách học phần ({{ registerSubjects.length }})
            </div>

            <v-data-table
              v-model="selectedSubjects"
              :headers="registerSubjectHeaders"
              :items="registerSubjects"
              :loading="loadingSubjects"
              show-select
              item-key="rowKey"
              hide-default-footer
              disable-pagination
              no-data-text="Không có dữ liệu"
              dense
              class="border rounded-sm"
            >
              <template #[`item.stt`]="{ index }">
                {{ index + 1 }}
              </template>
              <template #[`item.norm`]="{ item }">
                {{ formatMoney(item.norm) }}
              </template>
              <template #[`item.totalFee`]="{ item }">
                {{ formatMoney(item.totalFee) }}
              </template>
            </v-data-table>

            <div class="d-flex justify-end align-center mt-3 text-body-2 font-weight-bold">
              <span>Tổng tiền:</span>
              <span class="red--text text--darken-2 ml-1">
                {{ formatMoney(calculatedTotalFee) }} VND
              </span>
            </div>

            <div class="text-right text-caption red--text text--lighten-1 mt-1">
              Hệ thống chỉ hiển thị số tiền dự kiến. Học phí chính thức sẽ được thông báo cụ thể qua email của sinh viên.
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER -->
      <v-card-actions class="px-5 py-3 d-flex justify-end gap-2">
        <v-btn
          outlined
          color="grey darken-2"
          class="text-none px-4"
          @click="close"
        >
          Đóng X
        </v-btn>
        <v-btn
          color="#a62229"
          dark
          elevation="0"
          class="text-none px-4"
          :disabled="selectedSubjects.length === 0"
          :loading="submitting"
          @click="save"
        >
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import registerService from '@/services/redefend/registerService'

export default {
  name: 'RegisterModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: this.value,
      step: 1,
      studentList: [],
      studentLoading: false,
      studentSearchQuery: '',
      selectedStudent: null,
      studentDetail: null,
      examList: [],
      termList: [],
      registerSubjects: [],
      selectedSubjects: [],
      loadingSubjects: false,
      submitting: false,
      searchDebounceTimer: null,
      registrationForm: {
        examId: null,
        semesterId: null,
        termCode: null,
      },
      registerSubjectHeaders: [
        { text: 'STT', value: 'stt', sortable: false, width: '60px' },
        { text: 'Mã học phần', value: 'code', sortable: false },
        { text: 'Tên học phần', value: 'name', sortable: false },
        { text: 'Định mức', value: 'norm', sortable: false, align: 'right' },
        { text: 'Số tín chỉ học phí', value: 'credits', sortable: false, align: 'right' },
        { text: 'Thành tiền', value: 'totalFee', sortable: false, align: 'right' },
      ],
    }
  },
  computed: {
    termOptions() {
      return (this.termList || []).map((t) => {
        const code = t.code || t.termCode || ''
        const name = t.name || t.termName || ''
        return {
          ...t,
          code,
          label: code && name ? `${code} - ${name}` : name || code,
        }
      })
    },
    calculatedTotalFee() {
      return this.selectedSubjects.reduce(
        (sum, item) => sum + (Number(item.totalFee) || 0),
        0
      )
    },
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.initData()
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
    studentSearchQuery(val) {
      if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = setTimeout(() => {
        this.fetchCanRegisterStudents(val || '')
      }, 300)
    },
  },
  beforeDestroy() {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer)
  },
  methods: {
    initData() {
      this.step = 1
      this.studentSearchQuery = ''
      this.selectedStudent = null
      this.studentDetail = null
      this.examList = []
      this.termList = []
      this.registrationForm = { examId: null, semesterId: null, termCode: null }
      this.registerSubjects = []
      this.selectedSubjects = []
      this.fetchCanRegisterStudents('')
    },
    close() {
      this.dialog = false
    },
    formatMoney(val) {
      if (val === null || val === undefined || val === '') return 0
      const num = Number(val)
      if (isNaN(num)) return val
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    formatGender(gender) {
      if (gender === 'MALE' || gender === 'Nam') return 'Nam'
      if (gender === 'FEMALE' || gender === 'Nữ') return 'Nữ'
      return 'Khác'
    },
    normalizeStudentDetail(rawDetail, fallback = {}) {
      const d = rawDetail?.data?.data || rawDetail?.data || rawDetail || {}
      const validApiObj =
        d &&
        typeof d === 'object' &&
        !Array.isArray(d) &&
        (d.fullName || d.code || d.studentCode || d.email)
      const src = validApiObj ? { ...fallback, ...d } : { ...fallback }

      return {
        ...src,
        id: src.studentId || src.id || fallback.studentId || fallback.id || null,
        code: src.code || src.studentCode || '',
        fullName: src.fullName || src.name || '',
        gender: this.formatGender(src.gender),
        birthday: src.birthday ? String(src.birthday).split(' ')[0] : '',
        email: src.email || src.schoolEmail || '',
        personalEmail: src.personalEmail || '',
        phone: src.phone || '',
        course: src.course?.name || src.courseName || src.course || '',
        className: src.clazz?.name || src.class?.name || src.className || '',
        majorName: src.major?.name || src.majorName || '',
        trainingMethodName:
          src.trainingMethod?.name ||
          src.trainingType?.name ||
          src.trainingMethodName ||
          '',
        majorId: src.major?.id || src.majorId || null,
        trainingMethodId:
          src.trainingMethod?.id ||
          src.trainingType?.id ||
          src.trainingMethodId ||
          src.feeTrainingMethodsId ||
          null,
        semesterId: src.semesterId || src.semester?.id || null,
      }
    },
    extractExamsFromResponse(rawDetail) {
      const d = rawDetail?.data?.data ?? rawDetail?.data ?? rawDetail
      if (!d) return []

      // Trường hợp trả về trực tiếp danh sách đợt
      if (Array.isArray(d)) {
        return d.map((item) => item?.exam || item?.redefenseExam || item)
      }

      if (typeof d === 'object') {
        const arr =
          d.exams ||
          d.examList ||
          d.redefenseExams ||
          d.items ||
          d.data ||
          null
        if (Array.isArray(arr)) {
          return arr.map((item) => item?.exam || item?.redefenseExam || item)
        }

        // Trường hợp trả về 1 đợt lồng bên trong (exam / redefenseExam)
        const singleExam = d.exam || d.redefenseExam || null
        if (singleExam && singleExam.id) {
          return [singleExam]
        }

        // Trường hợp bản thân object có examId / examName
        if (d.examId || d.redefenseExamId) {
          return [
            {
              ...d,
              id: d.examId || d.redefenseExamId,
              name: d.examName || d.redefenseExamName || d.name || '',
            },
          ]
        }
      }

      return []
    },
    async fetchCanRegisterStudents(search = '') {
      this.studentLoading = true
      try {
        const res = await registerService.getCanRegisterStudents({
          pageIndex: 1,
          pageSize: 10,
          search: search || undefined,
          channel: 'CMS',
        })
        const payload = res?.data || res || {}
        const rawList =
          payload.items ||
          payload.data ||
          (Array.isArray(payload) ? payload : [])

        this.studentList = rawList.map((item) => {
          const code = item.code || item.studentCode || ''
          const fullName = item.fullName || item.name || ''
          return {
            ...item,
            id: item.studentId || item.id,
            code,
            fullName,
            displayLabel: code ? `${code} - ${fullName}` : fullName,
          }
        })
      } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error)
      } finally {
        this.studentLoading = false
      }
    },
    onSelectStudent(student) {
      if (!student) {
        this.studentDetail = null
        return
      }
      this.studentDetail = this.normalizeStudentDetail(student, student)
    },
    async goToStep2() {
      if (!this.studentDetail) return
      this.step = 2

      const studentId = this.studentDetail.id
      try {
        const requests = [
          registerService.getTermList({ status: 'ACTIVE', channel: 'CMS' }),
        ]
        if (studentId) {
          requests.unshift(registerService.getStudentDetail(studentId, 'CMS'))
        }

        const results = await Promise.allSettled(requests)
        const detailRes = studentId ? results[0] : null
        const termRes = studentId ? results[1] : results[0]

        if (detailRes && detailRes.status === 'fulfilled') {
          const val = detailRes.value
          if (val && val.success !== false) {
            this.studentDetail = this.normalizeStudentDetail(val, this.studentDetail)

            // Lấy danh sách đợt bảo vệ của sinh viên từ get-by-student nếu có, nhưng không tự chọn sẵn
            const examsFromStudent = this.extractExamsFromResponse(val)
            if (examsFromStudent.length > 0) {
              this.examList = examsFromStudent
            } else {
              await this.fetchExamsForModal()
            }
          }
        }

        if (termRes && termRes.status === 'fulfilled') {
          const termPayload = termRes.value?.data || termRes.value || []
          this.termList = Array.isArray(termPayload)
            ? termPayload
            : termPayload?.items || termPayload?.data || []
        }
      } catch (error) {
        console.error('Lỗi khi chuyển sang bước 2:', error)
      }
    },

    async fetchExamsForModal() {
      try {
        const res = await registerService.getExams({
          status: 'ACTIVE',
          channel: 'CMS',
        })
        const payload = res?.data || res || []
        this.examList = Array.isArray(payload)
          ? payload
          : payload?.items || payload?.data || []
      } catch (error) {
        console.error('Lỗi tải đợt bảo vệ:', error)
      }
    },
    async handleExamOrTermChange() {
      // Luôn reset danh sách đang chọn để người dùng tự bấm tích
      this.selectedSubjects = []

      const selectedExam = this.examList.find(
        (e) => e.id === this.registrationForm.examId
      )
      const semesterId =
        selectedExam?.semester?.id ||
        selectedExam?.semesterId ||
        this.studentDetail?.semesterId ||
        null
      this.registrationForm.semesterId = semesterId

      if (
        !this.registrationForm.examId ||
        !this.registrationForm.termCode ||
        !this.studentDetail
      ) {
        this.registerSubjects = []
        return
      }

      this.loadingSubjects = true
      try {
        const requests = [
          registerService.listForRegister({
            code: this.studentDetail.code,
            examId: this.registrationForm.examId,
            termCode: this.registrationForm.termCode,
            channel: 'CMS',
          }),
        ]

        const majorId =
          this.studentDetail.majorId || this.studentDetail.major?.id || null
        const trainingMethodId =
          this.studentDetail.trainingMethodId ||
          this.studentDetail.feeTrainingMethodsId ||
          this.studentDetail.trainingMethod?.id ||
          null

        if (majorId && semesterId) {
          const feeParams = {
            majorId,
            semesterId,
            channel: 'CMS',
          }
          if (trainingMethodId) {
            feeParams.trainingMethodId = trainingMethodId
          }
          requests.push(registerService.estimateFee(feeParams))
        }

        const [listRes, feeRes] = await Promise.allSettled(requests)

        let normPrice = 0
        if (feeRes && feeRes.status === 'fulfilled') {
          const feeRaw =
            feeRes.value?.data?.data ?? feeRes.value?.data ?? feeRes.value
          if (typeof feeRaw === 'number') {
            normPrice = feeRaw
          } else if (feeRaw && typeof feeRaw === 'object') {
            const feeValue = Number(feeRaw.fee) || 0
            const creditHourFee = Number(feeRaw.feeCreditHour) || 0
            const defendFee = Number(feeRaw.feeDefend) || 0
            normPrice =
              feeValue ||
              Number(
                feeRaw.norm ??
                  feeRaw.unitPrice ??
                  feeRaw.price ??
                  feeRaw.amount ??
                  feeRaw.creditFee ??
                  0
              ) ||
              (creditHourFee + defendFee)
          }
        }

        let rawSubjects = []
        if (listRes.status === 'fulfilled') {
          const listRaw =
            listRes.value?.data?.data ?? listRes.value?.data ?? listRes.value
          if (Array.isArray(listRaw)) {
            rawSubjects = listRaw
          } else if (listRaw && Array.isArray(listRaw.items)) {
            rawSubjects = listRaw.items
          } else if (
            listRaw &&
            typeof listRaw === 'object' &&
            (listRaw.code || listRaw.name || listRaw.creditHours !== undefined)
          ) {
            rawSubjects = [listRaw]
          }
        }

        if (rawSubjects.length === 0) {
          const matchedTerm = this.termOptions.find(
            (t) => t.code === this.registrationForm.termCode
          )
          if (matchedTerm) {
            rawSubjects = [matchedTerm]
          }
        }

        this.registerSubjects = rawSubjects.map((item, idx) => {
          const code =
            item.code || item.termCode || this.registrationForm.termCode
          const name = item.name || item.termName || ''
          const credits =
            Number(
              item.creditHours ??
                item.credits ??
                item.creditTraining ??
                item.credit ??
                0
            ) || 0
          const norm =
            normPrice ||
            Number(item.norm ?? item.unitPrice ?? item.fee ?? 0) ||
            0
          const totalFee =
            item.totalFee !== undefined && item.totalFee !== null
              ? Number(item.totalFee) || 0
              : norm * credits

          return {
            ...item,
            rowKey: item.id || `${code}-${idx}`,
            code,
            name,
            norm,
            credits,
            totalFee,
          }
        })

        // Không tự động tích chọn, giữ rỗng để người dùng tự bấm tích
        this.selectedSubjects = []
      } catch (error) {
        console.error('Lỗi tải dữ liệu học phần và định mức phí:', error)
        this.registerSubjects = []
      } finally {
        this.loadingSubjects = false
      }
    },
    async save() {
      if (this.selectedSubjects.length === 0 || !this.studentDetail || this.submitting) return
      this.submitting = true
      try {
        const termCodes = this.selectedSubjects.map((i) => i.code || i.termCode)
        const termIds = this.selectedSubjects
          .map((i) => i.termId || i.id)
          .filter(Boolean)

        const data = {
          studentId: this.studentDetail.id,
          studentCode: this.studentDetail.code,
          examId: this.registrationForm.examId,
          semesterId: this.registrationForm.semesterId,
          termCode: this.registrationForm.termCode,
          termCodes,
          termIds,
          totalFee: this.calculatedTotalFee,
          channel: 'CMS',
        }

        const res = await registerService.createRegistration(data, 'CMS')

        // Nếu API trả về success === false hoặc error.code khác 0 thì coi như lỗi -> giữ nguyên modal
        const errCode = res?.error?.code ?? res?.data?.error?.code
        if (res?.success === false || (errCode !== undefined && errCode !== 0 && errCode !== null)) {
          console.error('Lưu đăng ký không thành công:', res)
          return
        }

        this.$emit('success')
        this.close()
      } catch (error) {
        // Có lỗi (ví dụ 400 / 500 / network error): giữ nguyên modal mở
        console.error('Lỗi lưu đăng ký:', error)
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<style scoped>
.border-left-title {
  border-left: 3px solid #a62229;
  padding-left: 8px;
  color: #111111;
  font-size: 15px;
}
</style>