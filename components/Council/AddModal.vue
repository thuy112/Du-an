<template>
  <v-dialog :value="open" max-width="700px" persistent @input="$emit('update:open', $event)">
    <v-card class="rounded-lg">
      <v-card-title class="white--text py-3 px-4 d-flex justify-space-between align-center primary">
        <span class="text-h6 font-weight-bold">Thêm mới hội đồng</span>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="pa-4" style="max-height: 75vh; overflow-y: auto;">
        <v-text-field
          v-model="form.examClass"
          label="Hội đồng bảo vệ (*)"
          outlined
          dense
          class="mb-3"
          placeholder="Nhập tên hội đồng"
        ></v-text-field>

        <v-select
          v-model="form.trainingMethodId"
          :items="trainingMethodList"
          item-text="name"
          item-value="id"
          label="Hình thức đào tạo (*)"
          outlined
          dense
          class="mb-3"
          placeholder="Chọn hình thức đào tạo"
        ></v-select>

        <v-select
          v-model="form.examId"
          :items="examList"
          item-text="name"
          item-value="id"
          label="Đợt bảo vệ (*)"
          outlined
          dense
          class="mb-3"
          placeholder="Chọn đợt bảo vệ"
          @change="onExamChange"
        ></v-select>

        <v-select
          v-model="form.termId"
          :items="termList"
          item-text="name"
          item-value="id"
          label="Học phần (*)"
          outlined
          dense
          class="mb-3"
          placeholder="Chọn học phần"
          @change="onTermChange"
        ></v-select>

        <v-autocomplete
          v-model="form.studentIds"
          :items="studentList"
          item-text="fullName"
          item-value="id"
          label="Sinh viên (*)"
          placeholder="Chọn sinh viên"
          outlined
          dense
          multiple
          chips
          small-chips
          class="mb-3"
        >
          <template v-slot:item="{ item }">
            <span>{{ item.fullName || item.name }} ({{ item.code || item.studentCode }})</span>
          </template>
        </v-autocomplete>

        <base-date-field
          label="Thời gian bắt đầu (*)"
          :data="form"
          field="fromTime"
          :time="true"
          required
          class="mb-3"
          @update-field="onDateFieldUpdate"
          @input="val => $set(form, 'fromTime', val)"
        ></base-date-field>

        <base-date-field
          label="Thời gian kết thúc (*)"
          :data="form"
          field="toTime"
          :time="true"
          required
          class="mb-0"
          @update-field="onDateFieldUpdate"
          @input="val => $set(form, 'toTime', val)"
        ></base-date-field>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-4 py-3 justify-end" style="gap: 8px;">
        <v-btn text class="text-none" @click="closeModal">Đóng</v-btn>
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

const INIT_ADD_FORM = {
  examClass: "",
  trainingMethodId: null,
  examId: null,
  termId: null,
  studentIds: [],
  fromTime: null,
  toTime: null,
}

export default {
  name: "CouncilAddModal",
  components: { BaseDateField },
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      submitting: false,
      form: { ...INIT_ADD_FORM },
      trainingMethodList: [],
      examList: [],
      termList: [],
      studentList: [],
    }
  },
  watch: {
    open(val) {
      if (val) {
        this.resetAndLoad()
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
    async resetAndLoad() {
      this.form = { ...INIT_ADD_FORM, studentIds: [] }
      this.termList = []
      this.studentList = []
      try {
        const [resTm, resExam] = await Promise.all([
          examSessionService.getTrainingMethodList({ status: "ACTIVE", channel: "CMS" }),
          examSessionService.getExamList({ status: "ACTIVE", channel: "CMS" }),
        ])
        const rawTm = resTm?.data !== undefined ? resTm.data : resTm
        const rawExam = resExam?.data !== undefined ? resExam.data : resExam
        this.trainingMethodList = Array.isArray(rawTm) ? rawTm : (rawTm?.data || [])
        this.examList = Array.isArray(rawExam) ? rawExam : (rawExam?.data || [])
      } catch (e) {
        console.error("Lỗi tải danh mục thêm mới:", e)
      }
    },
    async onExamChange(examId) {
      this.form.termId = null
      this.form.studentIds = []
      this.termList = []
      this.studentList = []
      if (!examId) return
      const res = await examSessionService.getTermListByExam({ status: "ACTIVE", examId, channel: "CMS" })
      const raw = res?.data !== undefined ? res.data : res
      this.termList = Array.isArray(raw) ? raw : (raw?.data || [])
    },
    async onTermChange() {
      this.form.studentIds = []
      this.studentList = []
      if (!this.form.termId || !this.form.examId) return
      const res = await examSessionService.getRegisterListByTermAndExam({
        status: "ACTIVE",
        termId: this.form.termId,
        examId: this.form.examId,
        trainingMethodId: this.form.trainingMethodId || 202,
        channel: "CMS",
      })
      const raw = res?.data !== undefined ? res.data : res
      this.studentList = Array.isArray(raw) ? raw : (raw?.data || raw?.content || [])
    },
    async handleSubmit() {
      if (!this.form.examClass || !this.form.examId || !this.form.termId || !this.form.studentIds.length) {
        if (typeof this.$showError === "function") {
          this.$showError("Vui lòng nhập đầy đủ thông tin bắt buộc")
        }
        return
      }
      this.submitting = true
      try {
        const payload = {
          ...this.form,
          examClass: String(this.form.examClass || "").toUpperCase(),
          channel: "CMS",
        }
        const res = await examSessionService.createItem(payload, "CMS")
        const resData = res?.data !== undefined ? res.data : res
        if (resData && (resData.code === 400 || (resData.error && resData.error.code !== 0))) {
          if (typeof this.$showError === "function") {
            this.$showError((resData.error && resData.error.message) || resData.message || "Thêm mới hội đồng thất bại")
          }
          return
        }
        if (typeof this.$showSuccess === "function") {
          this.$showSuccess("Thêm mới hội đồng thành công")
        }
        this.$emit("success")
        this.closeModal()
      } catch (e) {
        console.error("Lỗi thêm mới hội đồng:", e)
        if (typeof this.$showError === "function") {
          this.$showError("Thêm mới hội đồng thất bại")
        }
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>