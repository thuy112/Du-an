<template>
  <v-dialog v-model="dialog" max-width="650px" persistent scrollable @click:outside="closeDialog">
    <v-card class="rounded-lg">
      <!-- Tiêu đề Modal -->
      <v-card-title class="headline px-6 py-4 d-flex align-center justify-space-between" style="background-color: #A62229; color: white;">
        <span class="text-h6 font-weight-bold">Thêm mới đợt bảo vệ lại</span>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Nội dung Form -->
      <v-card-text class="pa-6 modal-body-scroll">
        <v-form ref="form" v-model="valid" lazy-validation>
          <!-- Tên đợt -->
          <div class="mb-4">
            <v-text-field
              v-model="form.name"
              placeholder="Tên đợt (*)"
              outlined
              dense
              hide-details="auto"
              :rules="[v => !!v || 'Tên đợt không được để trống']"
              class="custom-input"
            ></v-text-field>
          </div>

          <!-- Mã đợt -->
          <div class="mb-4">
            <v-text-field
              v-model="form.code"
              placeholder="Mã đợt (*)"
              outlined
              dense
              hide-details="auto"
              :rules="[v => !!v || 'Mã đợt không được để trống']"
              class="custom-input"
            ></v-text-field>
          </div>

          <!-- Học kỳ (Đúng vị trí thứ 3, gọi API /api/semester/list) -->
          <div class="mb-4">
            <v-select
              v-model="form.semesterId"
              :items="semesterOptions"
              item-text="text"
              item-value="value"
              placeholder="Học kỳ (*)"
              outlined
              dense
              hide-details="auto"
              :loading="loadingSemesters"
              :rules="[v => !!v || 'Học kỳ không được để trống']"
              class="custom-input"
            ></v-select>
          </div>

          <!-- Trạng thái -->
          <div class="mb-4">
            <v-select
              v-model="form.status"
              :items="statusList"
              item-text="text"
              item-value="value"
              placeholder="Trạng thái (*)"
              outlined
              dense
              hide-details="auto"
              :rules="[v => !!v || 'Trạng thái không được để trống']"
              class="custom-input"
            ></v-select>
          </div>

          <!-- Thời gian bắt đầu -->
          <div class="mb-4">
            <v-menu
              v-model="menuStartDate"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="formatDisplayDate(form.fromTime)"
                  placeholder="Thời gian bắt đầu"
                  readonly
                  outlined
                  dense
                  hide-details
                  clearable
                  class="custom-input"
                  v-bind="attrs"
                  v-on="on"
                  @click:clear="form.fromTime = ''"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="form.fromTime"
                :max="form.toTime || undefined"
                color="#A62229"
                locale="vi"
                no-title
                scrollable
                @input="menuStartDate = false"
              ></v-date-picker>
            </v-menu>
          </div>

          <!-- Thời gian kết thúc -->
          <div class="mb-2">
            <v-menu
              v-model="menuEndDate"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="formatDisplayDate(form.toTime)"
                  placeholder="Thời gian kết thúc"
                  readonly
                  outlined
                  dense
                  hide-details
                  clearable
                  class="custom-input"
                  v-bind="attrs"
                  v-on="on"
                  @click:clear="form.toTime = ''"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="form.toTime"
                :min="form.fromTime || undefined"
                color="#A62229"
                locale="vi"
                no-title
                scrollable
                @input="menuEndDate = false"
              ></v-date-picker>
            </v-menu>
          </div>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Nút hành động Footer -->
      <v-card-actions class="px-6 py-4 d-flex justify-end" style="gap: 8px;">
        <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeDialog" :disabled="loading">
          Đóng <v-icon right small>mdi-close</v-icon>
        </v-btn>
        <v-btn color="#A62229" dark class="text-none px-5" @click="handleSave" :loading="loading">
          Lưu <v-icon right small>mdi-content-save</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import redefenseExamService from '~/services/redefenseExamService'

export default {
  name: 'AddRedefenseModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: this.value,
      valid: false,
      loading: false,
      loadingSemesters: false,
      
      menuStartDate: false,
      menuEndDate: false,

      form: {
        name: '',
        code: '',
        semesterId: '',
        status: 'ACTIVE',
        fromTime: '',
        toTime: '',
      },
      semesterOptions: [],
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],
    }
  },
  watch: {
    async value(val) {
      this.dialog = val
      if (val) {
        this.resetForm()
        await this.fetchSemesters()
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
  },
  methods: {
    async fetchSemesters() {
      this.loadingSemesters = true
      try {
        const res = await redefenseExamService.getSemesters()
        const rootData = res.data !== undefined ? res.data : res
        const list = Array.isArray(rootData) ? rootData : (rootData.data || rootData.content || rootData.items || [])
        
        this.semesterOptions = list.map(item => ({
          text: item.name || item.code,
          value: item.id
        }))
      } catch (error) {
        console.error('Lỗi tải danh mục học kỳ:', error)
      } finally {
        this.loadingSemesters = false
      }
    },

    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      const date = dateStr.split(/[ T]/)[0]
      if (date.includes('/')) return date
      const [year, month, day] = date.split('-')
      return year && month && day ? `${day}/${month}/${year}` : dateStr
    },

    formatApiDateTime(dateStr, isEndOfDay = false) {
      if (!dateStr) return null
      const dateOnly = dateStr.split(/[ T]/)[0]
      const [year, month, day] = dateOnly.split('-')
      if (!year || !month || !day) return null
      return `${year}-${month}-${day} ${isEndOfDay ? '23:59:59' : '00:00:00'}`
    },

    resetForm() {
      this.form = {
        name: '',
        code: '',
        semesterId: '',
        status: 'ACTIVE',
        fromTime: '',
        toTime: '',
      }
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },

    closeDialog() {
      this.dialog = false
    },

    async handleAdd() {
            if (this.isLoading) return;
            
            // Tạm thời bỏ qua validate của v-form để kiểm tra xem có gọi được API không
            // if (this.$refs.form && !this.$refs.form.validate()) return;

            this.isLoading = true;
            try {
                const payload = {
                    name: this.body.name,
                    code: this.body.code,
                    status: this.body.status,
                    fromTime: this.body.fromTime,
                    toTime: this.body.toTime,
                    semester: {
                        id: this.body.semesterId
                    },
                    channel: 'CMS'
                };

                console.log("Payload chuẩn bị gửi:", payload);

                const res = await redefenseExamService.add(payload);
                console.log("Kết quả trả về:", res);

                if (res && (res.success || res.code === 0)) {
                    this.open = false;
                    this.$showSuccess("Thêm mới thành công");
                    this.$parent.getList();
                }
            } catch (er) {
                console.log("Lỗi catch:", er);
            } finally {
                this.isLoading = false;
            }
        },
  },
}
</script>

<style scoped>
.modal-body-scroll {
  max-height: 70vh;
  overflow-y: auto;
}
.custom-input >>> .v-input__slot {
  border-radius: 6px !important;
  min-height: 42px !important;
}
</style>