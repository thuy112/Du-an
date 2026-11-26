<template>
  <v-dialog :value="open" max-width="700px" persistent @input="$emit('update:open', $event)">
    <v-card class="rounded-lg">
      <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center primary">
        <span class="text-h6 font-weight-bold">Cập nhật hội đồng</span>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto;">
        <v-form ref="form" lazy-validation @submit.prevent>
          <v-row dense>
            <v-col cols="12" class="mb-2">
              <v-text-field
                v-model="form.examClass"
                label="Hội đồng bảo vệ (*)"
                outlined
                dense
                hide-details="auto"
              ></v-text-field>
            </v-col>

            <v-col cols="12" class="mb-2">
              <v-select
                v-model="form.trainingMethodId"
                :items="trainingMethodList"
                item-text="name"
                item-value="id"
                label="Hình thức đào tạo (*)"
                outlined
                dense
                hide-details="auto"
              ></v-select>
            </v-col>

            <v-col cols="12" class="mb-2">
              <v-select
                v-model="form.examId"
                :items="examList"
                item-text="name"
                item-value="id"
                label="Đợt bảo vệ (*)"
                outlined
                dense
                hide-details="auto"
                @change="onExamChange"
              ></v-select>
            </v-col>

            <v-col cols="12" class="mb-2">
              <v-select
                v-model="form.termId"
                :items="termList"
                item-text="name"
                item-value="id"
                label="Học phần (*)"
                outlined
                dense
                hide-details="auto"
                @change="onTermChange"
              ></v-select>
            </v-col>

            <v-col cols="12" class="mb-2 student-required-field" :class="{ 'has-student-error': isStudentInvalid }">
              <v-autocomplete
                v-model="form.studentIds"
                :items="formattedStudentList"
                item-text="label"
                item-value="valueId"
                label="Sinh viên (*)"
                placeholder="Chọn sinh viên"
                :rules="studentRules"
                outlined
                dense
                multiple
                chips
                small-chips
                deletable-chips
                :error="isStudentInvalid"
                :error-messages="isStudentInvalid ? 'Vui lòng nhập đủ thông tin' : ''"
                @change="onStudentChange"
              >
                <template v-slot:item="{ item, attrs, on }">
                  <v-list-item v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-2 my-0">
                      <v-simple-checkbox
                        :value="attrs.inputValue"
                        color="primary"
                        @click.stop="on.click"
                      ></v-simple-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>{{ item.label }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" class="mb-2">
              <base-date-field
                label="Thời gian bắt đầu (*)"
                :data="form"
                field="fromTime"
                :time="true"
                required
                @update-field="onDateFieldUpdate"
                @input="val => $set(form, 'fromTime', val)"
              ></base-date-field>
            </v-col>

            <v-col cols="12" class="mb-2">
              <base-date-field
                label="Thời gian kết thúc (*)"
                :data="form"
                field="toTime"
                :time="true"
                required
                @update-field="onDateFieldUpdate"
                @input="val => $set(form, 'toTime', val)"
              ></base-date-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
        <v-btn outlined class="text-none" @click="closeModal">Đóng</v-btn>
        <v-btn color="primary" dark class="text-none px-5" elevation="0" :loading="submitting" @click="handleSubmit">
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import BaseDateField from "~/components/Base/DateField.vue"
import examSessionService from "~/services/redefend/examSessionService"

const INIT_EDIT_FORM = {
  id: null,
  examClass: "",
  trainingMethodId: null,
  examId: null,
  termId: null,
  studentIds: [],
  fromTime: null,
  toTime: null,
  examSessionStatus: "",
  examSessionScoreStatus: "",
}

export default {
  name: "CouncilUpdateModal",
  components: { BaseDateField },
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      submitting: false,
      form: { ...INIT_EDIT_FORM },
      trainingMethodList: [],
      examList: [],
      termList: [],
      studentList: [],
      studentError: true,
      studentRules: [
        (val) => (Array.isArray(val) && val.length > 0) || "Vui lòng nhập đủ thông tin",
      ],
    }
  },
  computed: {
    isStudentInvalid() {
      return this.studentError && (!Array.isArray(this.form.studentIds) || this.form.studentIds.length === 0)
    },
    formattedStudentList() {
      const list = Array.isArray(this.studentList) ? this.studentList : []
      return list.map((stu) => {
        const valueId = stu.studentId !== undefined && stu.studentId !== null ? stu.studentId : stu.id
        const name = stu.fullName || stu.name || ""
        const code = stu.code || stu.studentCode || ""
        const label = code ? `${name} - ${code}` : name
        return {
          ...stu,
          valueId,
          label,
        }
      })
    },
  },
  watch: {
    open(val) {
      if (val && this.item?.id) {
        this.loadDetail(this.item.id)
      } else if (!val && this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit("update:open", false)
    },
    onDateFieldUpdate({ field, value }) {
      this.$set(this.form, field, value)
    },
    onStudentChange(val) {
      this.studentError = !Array.isArray(val) || val.length === 0
      if (!this.studentError && this.$refs.form) {
        this.$refs.form.validate()
      }
    },
    async loadDetail(id) {
      this.studentError = true
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
      try {
        const resDetail = await examSessionService.getExamSessionDetail(id, "CMS")
        const data = resDetail?.data !== undefined ? resDetail.data : resDetail

        const sessionStatus = data?.examSessionStatus || this.item?.examSessionStatus || ""
        const scoreStatus = data?.examSessionScoreStatus || this.item?.examSessionScoreStatus || ""

        const rawStudents = Array.isArray(data?.studentTerms)
          ? data.studentTerms
          : (Array.isArray(data?.students) ? data.students : [])

        const allStudentIds = rawStudents
          .map((s) => s.registerStudentExam?.studentId ?? s.studentId ?? s.id)
          .filter((v) => v !== undefined && v !== null)

        const isScoreAvailable = scoreStatus === "SCOREBOARD_AVAILABLE"
        const initialStudentIds = isScoreAvailable ? [] : allStudentIds

        this.form = {
          id: data.id || id,
          examClass: data.examClass || "",
          trainingMethodId: data.trainingMethod?.id || null,
          examId: data.exam?.id || null,
          termId: data.term?.id || null,
          studentIds: initialStudentIds,
          fromTime: data.fromTime || null,
          toTime: data.toTime || null,
          examSessionStatus: sessionStatus,
          examSessionScoreStatus: scoreStatus,
        }

        const [resTm, resExam] = await Promise.all([
          examSessionService.getTrainingMethodList({ status: "ACTIVE", channel: "CMS" }),
          examSessionService.getExamList({ status: "ACTIVE", channel: "CMS" }),
        ])
        const rawTm = resTm?.data !== undefined ? resTm.data : resTm
        const rawExam = resExam?.data !== undefined ? resExam.data : resExam
        this.trainingMethodList = Array.isArray(rawTm) ? rawTm : (rawTm?.data || [])
        this.examList = Array.isArray(rawExam) ? rawExam : (rawExam?.data || [])

        if (this.form.examId) {
          const resTerm = await examSessionService.getTermListByExam({
            status: "ACTIVE",
            examId: this.form.examId,
            channel: "CMS",
          })
          const rawTerm = resTerm?.data !== undefined ? resTerm.data : resTerm
          this.termList = Array.isArray(rawTerm) ? rawTerm : (rawTerm?.data || [])
        }
        if (this.form.termId && this.form.examId) {
          await this.loadStudents()
        }

        const validValues = new Set(this.formattedStudentList.map((s) => s.valueId))
        this.form.studentIds = this.form.studentIds.filter((v) => validValues.has(v))
        this.studentError = this.form.studentIds.length === 0
      } catch (e) {
        console.error("Lỗi tải chi tiết cập nhật hội đồng:", e)
      }
    },
    async loadStudents() {
      if (!this.form.termId || !this.form.examId) {
        this.studentList = []
        return
      }
      const res = await examSessionService.getRegisterListByTermAndExam({
        status: "ACTIVE",
        termId: this.form.termId,
        examId: this.form.examId,
        examSessionId: this.form.id,
        trainingMethodId: this.form.trainingMethodId || 202,
        channel: "CMS",
      })
      const raw = res?.data !== undefined ? res.data : res
      this.studentList = Array.isArray(raw) ? raw : (raw?.data || raw?.content || [])
    },
    async onExamChange(examId) {
      this.form.termId = null
      this.form.studentIds = []
      this.studentError = true
      this.termList = []
      this.studentList = []
      if (examId) {
        const res = await examSessionService.getTermListByExam({ status: "ACTIVE", examId, channel: "CMS" })
        const raw = res?.data !== undefined ? res.data : res
        this.termList = Array.isArray(raw) ? raw : (raw?.data || [])
      }
    },
    async onTermChange() {
      this.form.studentIds = []
      this.studentError = true
      await this.loadStudents()
    },
    hasError(res) {
      if (!res) return true
      const raw = res?.data !== undefined ? res.data : res
      if (!raw) return false
      if (raw?.error && Number(raw.error.code) !== 0) return true
      if (raw?.code !== undefined && raw?.code !== null && Number(raw.code) !== 0 && Number(raw.code) !== 200) {
        return true
      }
      if (raw?.success === false) return true
      return false
    },
    getErrorMessage(res, fallback = "Hội đồng bảo vệ lại không thể sửa do đã chốt dữ liệu") {
      const raw = res?.data !== undefined ? res.data : res
      return raw?.error?.message || raw?.message || fallback
    },
    async handleSubmit() {
      const hasStudent = Array.isArray(this.form.studentIds) && this.form.studentIds.length > 0
      if (!hasStudent) {
        this.studentError = true
        if (this.$refs.form) {
          this.$refs.form.validate()
        }
        return
      }
      this.studentError = false
      this.submitting = true
      try {
        const params = {
          id: this.form.id || this.item?.id,
          examClass: String(this.form.examClass || "").toUpperCase(),
          trainingMethodId: this.form.trainingMethodId,
          examId: this.form.examId,
          termId: this.form.termId,
          studentIds: this.form.studentIds,
          fromTime: this.form.fromTime,
          toTime: this.form.toTime,
          channel: "CMS",
        }
        const res = await examSessionService.updateExamSession(params)

        if (this.hasError(res)) {
          const errMsg = this.getErrorMessage(res)
          if (typeof this.$showWarning === "function") {
            this.$showWarning(errMsg)
          } else if (typeof this.$showError === "function") {
            this.$showError(errMsg)
          }
          return
        }

        if (typeof this.$showSuccess === "function") {
          this.$showSuccess("Cập nhật thành công")
        }
        this.$emit("success")
        this.closeModal()
      } catch (e) {
        console.error("Lỗi cập nhật hội đồng:", e)
        const errData = e?.response?.data || e
        const errMsg = this.getErrorMessage(errData)
        if (typeof this.$showWarning === "function") {
          this.$showWarning(errMsg)
        } else if (typeof this.$showError === "function") {
          this.$showError(errMsg)
        }
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<style scoped>
.student-required-field.has-student-error :deep(.v-input__slot) {
  border-color: #ff5252 !important;
}

.student-required-field.has-student-error :deep(.v-label),
.student-required-field.has-student-error :deep(.v-messages__message),
.student-required-field.has-student-error :deep(.v-icon) {
  color: #ff5252 !important;
}
</style>