<template>
  <v-dialog v-model="internalShow" max-width="560px" persistent>
    <v-card class="assign-modal-card">
      <div class="modal-header d-flex align-center justify-space-between px-5 py-3">
        <span class="text-h6 font-weight-bold white--text">Gán giảng viên</span>
        <v-btn icon dark small class="ma-0" aria-label="Đóng" :disabled="saving" @click="closeModal">
          <v-icon size="22">mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="pt-6 pb-4 px-6 bg-white black--text">
        <v-form ref="assignForm" v-model="valid">
          <v-autocomplete
            v-model="form.primaryTeacher"
            :items="teacherList"
            item-text="displayText"
            return-object
            label="Giảng viên chính (*)"
            outlined
            dense
            clearable
            :disabled="saving"
            :rules="[value => !!value || 'Vui lòng chọn giảng viên chính']"
            class="mb-3 custom-select-input"
            append-icon="mdi-menu-down"
          >
            <template v-slot:item="{ item }">
              <v-list-item-content class="py-1">
                <v-list-item-title class="font-weight-bold text-body-2">
                  {{ item.fullName }}<span v-if="item.email"> - {{ item.email }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  <span v-if="item.code">Mã GV: {{ item.code }}</span>
                  <span v-if="item.department"> - {{ item.department }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-autocomplete>

          <v-autocomplete
            v-model="form.assistantTeacher"
            :items="assistantOptions"
            item-text="displayText"
            return-object
            label="Trợ giảng (tùy chọn)"
            outlined
            dense
            clearable
            :disabled="saving"
            class="custom-select-input"
            append-icon="mdi-menu-down"
          >
            <template v-slot:item="{ item }">
              <v-list-item-content class="py-1">
                <v-list-item-title class="font-weight-bold text-body-2">
                  {{ item.fullName }}<span v-if="item.email"> - {{ item.email }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  <span v-if="item.code">Mã GV: {{ item.code }}</span>
                  <span v-if="item.department"> - {{ item.department }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-autocomplete>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end pb-4 px-6 pt-2 bg-white">
        <v-btn
          icon
          aria-label="Đóng"
          class="mr-2"
          :disabled="saving"
          @click="closeModal"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn
          color="#A62229"
          dark
          elevation="0"
          class="px-5 btn-save-red text-none font-weight-medium"
          :loading="saving"
          :disabled="saving"
          @click="handleSave"
        >
          Lưu <v-icon size="18" right class="ml-1">mdi-content-save-outline</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
const teacherList = [
  {
    id: 1,
    fullName: 'Phương Oanh',
    email: 'linhlananhh@gmail.com',
    code: 'GV_07',
    department: 'Khoa Giáo dục Quốc phòng',
    displayText: 'Phương Oanh - linhlananhh@gmail.com - GV_07 - Khoa Giáo dục Quốc phòng',
  },
  {
    id: 2,
    fullName: 'Đỗ Hồng Kiên',
    email: 'nguyenminhanhchieu@gmail.com',
    code: 'GV_08',
    department: 'Trung tâm Ký túc xá',
    displayText: 'Đỗ Hồng Kiên - nguyenminhanhchieu@gmail.com - GV_08 - Trung tâm Ký túc xá',
  },
  {
    id: 3,
    fullName: 'nguyễn văn test',
    email: 'test@gmail.com',
    code: 'GV_09',
    department: 'Phòng Phát triển dự án và đầu tư',
    displayText: 'nguyễn văn test - test@gmail.com - GV_09 - Phòng Phát triển dự án và đầu tư',
  },
  {
    id: 4,
    fullName: 'Trần Bảo Yến',
    email: 'yentran@huast.edu.vn',
    code: 'TTBY01',
    department: 'Khoa Công nghệ thông tin',
    displayText: 'Trần Bảo Yến - yentran@huast.edu.vn - TTBY01 - Khoa Công nghệ thông tin',
  },
]

export default {
  name: 'AssignTeacherModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    classItem: {
      type: Object,
      default: null,
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      valid: false,
      teacherList,
      form: {
        primaryTeacher: null,
        assistantTeacher: null,
      },
    }
  },
  computed: {
    internalShow: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
    assistantOptions() {
      return this.teacherList.filter((teacher) => teacher.id !== this.form.primaryTeacher?.id)
    },
  },
  watch: {
    value(isShown) {
      if (isShown) this.resetForm()
    },
  },
  methods: {
    resetForm() {
      this.form.primaryTeacher = null
      this.form.assistantTeacher = null
      this.$nextTick(() => {
        this.$refs.assignForm?.resetValidation()
      })
    },
    closeModal() {
      if (this.saving) return
      this.internalShow = false
    },
    handleSave() {
      if (this.$refs.assignForm.validate()) {
        this.$emit('assigned', {
          classId: this.classItem && this.classItem.id,
          primaryTeacher: this.form.primaryTeacher,
          assistantTeacher: this.form.assistantTeacher,
        })
      }
    },
  },
}
</script>

<style scoped>
.assign-modal-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.modal-header {
  background-color: #a62229 !important;
}

.btn-save-red {
  background-color: #a62229 !important;
  border-radius: 8px !important;
  height: 40px !important;
}

.custom-select-input >>> .v-input__slot {
  border-radius: 8px !important;
}
</style>
