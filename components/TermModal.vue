<template>
  <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
    <v-card class="rounded-lg">
      <!-- Tiêu đề Modal -->
      <v-card-title class="pa-4 text-white" style="background-color: #A62229; color: white;">
        <span class="text-h6 font-weight-bold">Cập nhật học phần</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5 modal-body-scroll">
        <div v-if="loadingDetail" class="d-flex justify-center align-center py-5">
          <v-progress-circular indeterminate color="#A62229"></v-progress-circular>
        </div>

        <v-form v-else ref="form" v-model="valid" lazy-validation>
          <!-- Tên học phần -->
          <v-text-field
            v-model="form.name"
            label="Tên học phần (*)"
            outlined
            dense
            :rules="[v => !!v || 'Tên học phần không được để trống']"
            class="mb-3"
          ></v-text-field>

          <!-- Mã học phần -->
          <v-text-field
            v-model="form.code"
            label="Mã học phần (*)"
            outlined
            dense
            :rules="[v => !!v || 'Mã học phần không được để trống']"
            class="mb-3"
          ></v-text-field>

          <!-- Số tín chỉ học phí -->
          <v-text-field
            v-model.number="form.creditTraining"
            label="Số tín chỉ học phí (*)"
            type="number"
            outlined
            dense
            class="mb-3"
          ></v-text-field>

          <!-- Thời lượng -->
          <v-text-field
            v-model="form.workload"
            label="Thời lượng"
            outlined
            dense
            class="mb-3"
          ></v-text-field>

          <!-- Số tín chỉ học tập -->
          <v-text-field
            v-model.number="form.creditHours"
            label="Số tín chỉ học tập"
            type="number"
            outlined
            dense
            class="mb-3"
          ></v-text-field>

          <!-- Trạng thái -->
          <v-select
            v-model="form.status"
            :items="statusList"
            item-text="text"
            item-value="value"
            label="Trạng thái (*)"
            outlined
            dense
            class="mb-3"
          ></v-select>

          <!-- Khoa/Trường -->
          <v-text-field
            v-model="form.address"
            label="Khoa/Trường"
            outlined
            dense
            class="mb-4"
          ></v-text-field>

          <!-- TIÊU ĐỀ BẢNG CHƯƠNG TRÌNH ĐÀO TẠO -->
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="text-subtitle-1 font-weight-bold">
              Danh sách chương trình đào tạo (<span class="text-red-bold">{{ form.selectedPrograms.length }}/{{ totalPrograms }}</span>)
            </div>
            <v-text-field
              v-model="programSearch"
              placeholder="Tìm kiếm"
              outlined
              dense
              hide-details
              clearable
              style="max-width: 250px;"
              @keyup.enter="handleProgramSearch"
            ></v-text-field>
          </div>

          <!-- BẢNG DỮ LIỆU -->
          <div class="program-table-container mb-3">
            <v-data-table
              v-model="form.selectedPrograms"
              :headers="programHeaders"
              :items="programList"
              :loading="loadingPrograms"
              :items-per-page="programItemsPerPage"
              item-key="id"
              show-select
              hide-default-footer
              class="elevation-1"
              dense
            >
              <!-- Trạng thái chương trình -->
              <template #[`item.programStatus`]="{ item }">
                <div class="d-flex justify-center">
                  <v-select
                    v-model="item.programStatus"
                    :items="programStatusList"
                    item-text="text"
                    item-value="value"
                    dense
                    hide-details
                    solo
                    flat
                    class="custom-status-select"
                    :class="item.programStatus === 'ACTIVE' ? 'bg-phai-hoc' : 'bg-mien-giam'"
                  ></v-select>
                </div>
              </template>

              <!-- Học kỳ thứ -->
              <template #[`item.semester`]="{ item }">
                <input
                  v-model="item.semester"
                  type="text"
                  class="line-underline-input text-center"
                />
              </template>

              <!-- Khối kiến thức -->
              <template #[`item.knowledgeBlock`]="{ item }">
                <input
                  v-model="item.knowledgeBlock"
                  type="text"
                  class="line-underline-input text-center"
                />
              </template>
            </v-data-table>
          </div>

          <!-- THANH PHÂN TRANG CHUẨN GIỐNG TRANG CHÍNH -->
          <div class="pagination-bottom-container pt-2 d-flex align-center justify-space-between flex-wrap gap-3">
            <div class="d-flex align-center"></div>

            <div class="d-flex align-center custom-pagination-group" style="gap: 8px;">
              <v-select
                v-model="programItemsPerPage"
                :items="[10, 20, 50, 100]"
                label="Bản ghi"
                outlined
                dense
                hide-details
                class="per-page-select"
                style="width: 90px;"
                @change="handleProgramItemsPerPageChange"
              ></v-select>

              <div class="d-flex align-center" style="gap: 4px;">
                <v-text-field
                  v-model.number="programPageInput"
                  label="Trang"
                  outlined
                  dense
                  hide-details
                  type="number"
                  style="width: 70px;"
                  @keyup.enter="goToProgramPage"
                ></v-text-field>
                <v-btn color="#A2212B" dark depressed class="text-none px-3" height="36" @click="goToProgramPage">
                  Đi
                </v-btn>
              </div>

              <v-btn icon outlined small color="grey" :disabled="programCurrentPage <= 1" @click="changeProgramPage(programCurrentPage - 1)">
                <v-icon small>mdi-chevron-left</v-icon>
              </v-btn>

              <div class="d-flex align-center" style="gap: 4px;">
                <template v-for="p in programTotalPages">
                  <v-btn
                    v-if="p === 1 || p === programTotalPages || (p >= programCurrentPage - 1 && p <= programCurrentPage + 1)"
                    :key="p"
                    :color="p === programCurrentPage ? '#A2212B' : 'grey lighten-2'"
                    :dark="p === programCurrentPage"
                    depressed
                    min-width="32"
                    height="32"
                    small
                    @click="changeProgramPage(p)"
                  >
                    {{ p }}
                  </v-btn>
                  <span v-else-if="p === programCurrentPage - 2 || p === programCurrentPage + 2" :key="'dot-' + p">...</span>
                </template>
              </div>

              <v-btn icon outlined small color="grey" :disabled="programCurrentPage >= programTotalPages" @click="changeProgramPage(programCurrentPage + 1)">
                <v-icon small>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Footer Modal -->
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
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
import termService from '~/services/termService'

export default {
  name: 'TermModal',
  props: {
    value: { type: Boolean, default: false },
    editId: { type: [Number, String], default: null },
  },
  data() {
    return {
      dialog: this.value,
      valid: false,
      loading: false,
      loadingDetail: false,
      loadingPrograms: false,
      
      programSearch: '',
      programList: [],
      totalPrograms: 0,
      programCurrentPage: 1,
      programPageInput: 1,
      programItemsPerPage: 50, // Mặc định 50 bản ghi giống trang chính
      programTotalPages: 1,

      form: {
        name: '',
        code: '',
        creditTraining: 0,
        creditHours: 0,
        workload: '',
        status: 'ACTIVE',
        address: '',
        selectedPrograms: [],
      },
      statusList: [
        { text: 'Kích hoạt', value: 'ACTIVE' },
        { text: 'Chưa kích hoạt', value: 'INACTIVE' },
      ],
      programStatusList: [
        { text: 'Phải học', value: 'ACTIVE' },
        { text: 'Miễn giảm', value: 'EXEMPT' },
      ],
      programHeaders: [
        { text: 'Mã chương trình', value: 'code', align: 'left', sortable: false },
        { text: 'Tên chương trình', value: 'name', align: 'left', sortable: false },
        { text: 'Trạng thái chương trình', value: 'programStatus', align: 'center', width: '160px', sortable: false },
        { text: 'Học kỳ thứ', value: 'semester', align: 'center', width: '100px', sortable: false },
        { text: 'Khối kiến thức', value: 'knowledgeBlock', align: 'center', width: '120px', sortable: false },
      ],
    }
  },
  watch: {
    value(val) {
      this.dialog = val
      if (val) {
        this.programCurrentPage = 1
        this.programPageInput = 1
        this.fetchEducationPrograms()
        if (this.editId) {
          this.fetchDetail(this.editId)
        }
      }
    },
    dialog(val) {
      this.$emit('input', val)
    },
  },
  methods: {
    closeDialog() {
      this.dialog = false
    },
    async fetchEducationPrograms() {
      this.loadingPrograms = true
      try {
        const params = {
          pageIndex: this.programCurrentPage,
          pageSize: this.programItemsPerPage,
          limit: this.programItemsPerPage,
          status: 'ACTIVE',
          channel: 'CMS',
        }
        if (this.programSearch) {
          params.search = this.programSearch
        }

        const res = await termService.getEducationProgramList(params)
        const data = res.data !== undefined ? res.data : res
        let items = Array.isArray(data) ? data : (data.data || data.content || data.items || [])
        
        // Lấy tổng số bản ghi từ response hoặc độ dài mảng gốc
        const rawTotal = data.totalElements ?? data.totalRecords ?? data.total ?? (res.totalElements || res.totalRecords || res.total)
        this.totalPrograms = rawTotal !== undefined ? Number(rawTotal) : items.length
        this.programTotalPages = Math.ceil(this.totalPrograms / this.programItemsPerPage) || 1

        // Nếu API trả về toàn bộ danh sách một lần mà không phân trang theo server, ta thực hiện phân trang (slice) chuẩn xác theo trang hiện tại
        if (items.length > this.programItemsPerPage && (!data.totalElements && !data.totalRecords)) {
          const start = (this.programCurrentPage - 1) * this.programItemsPerPage
          const end = start + this.programItemsPerPage
          items = items.slice(start, end)
        }

        this.programList = items.map(item => ({
          ...item,
          programStatus: item.programStatus || 'ACTIVE',
          semester: item.semester || '',
          knowledgeBlock: item.knowledgeBlock || ''
        }))
      } catch (error) {
        console.error('Lỗi tải danh sách chương trình đào tạo:', error)
      } finally {
        this.loadingPrograms = false
      }
    },
    changeProgramPage(page) {
      if (page < 1 || page > this.programTotalPages) return
      this.programCurrentPage = page
      this.programPageInput = page
      this.fetchEducationPrograms()
    },
    handleProgramItemsPerPageChange(size) {
      this.programItemsPerPage = size
      this.programCurrentPage = 1 // Reset về trang 1 khi đổi số lượng bản ghi mỗi trang
      this.programPageInput = 1
      this.fetchEducationPrograms()
    },
    goToProgramPage() {
      const page = parseInt(this.programPageInput)
      if (page >= 1 && page <= this.programTotalPages) {
        this.changeProgramPage(page)
      } else {
        this.programPageInput = this.programCurrentPage
      }
    },
    handleProgramSearch() {
      this.programCurrentPage = 1
      this.programPageInput = 1
      this.fetchEducationPrograms()
    },
    async fetchDetail(id) {
      this.loadingDetail = true
      try {
        const res = await termService.getDetail(id)
        const data = res.data !== undefined ? res.data : res
        if (data) {
          this.form = {
            name: data.name || '',
            code: data.code || '',
            creditTraining: data.creditTraining ?? 0,
            creditHours: data.creditHours ?? 0,
            workload: data.workload || '',
            status: data.status || 'ACTIVE',
            address: data.address || '',
            selectedPrograms: data.selectedPrograms || [],
          }
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết học phần:', error)
      } finally {
        this.loadingDetail = false
      }
    },
    async handleSave() {
      if (!this.$refs.form.validate()) return

      this.loading = true
      try {
        const payload = {
          ...this.form,
          channel: 'CMS',
        }

        const res = await termService.update(this.editId, payload)
        const responseData = res.data !== undefined ? res.data : res

        if (responseData && responseData.code !== undefined && responseData.code !== 0) {
          this.loading = false
          return
        }

        this.$emit('success', 'Cập nhật thành công')
        this.closeDialog()
      } catch (error) {
        console.error('Lỗi khi cập nhật học phần:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.modal-body-scroll {
  max-height: 75vh;
  overflow-y: auto;
}
.text-red-bold {
  color: #A62229 !important;
}

.program-table-container {
  max-height: 380px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.program-table-container >>> th {
  position: sticky !important;
  top: 0;
  z-index: 2;
  background-color: #f5f5f5 !important;
}

.line-underline-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #c0c0c0;
  outline: none;
  padding: 4px 2px;
  background: transparent;
  transition: border-color 0.2s ease;
}
.line-underline-input:focus {
  border-bottom: 1.5px solid #A62229;
}

.custom-status-select {
  border-radius: 16px !important;
  min-width: 125px !important;
  height: 32px !important;
}

.custom-status-select >>> .v-input__control {
  min-height: 32px !important;
  height: 32px !important;
}

.custom-status-select >>> .v-input__slot {
  min-height: 32px !important;
  height: 32px !important;
  padding: 0 10px !important;
  border-radius: 16px !important;
}

.custom-status-select >>> .v-select__selection {
  color: #ffffff !important;
  font-weight: 600;
  font-size: 13px;
  margin: 0 !important;
}

.custom-status-select >>> .v-icon {
  color: #ffffff !important;
  font-size: 18px;
}

.bg-phai-hoc >>> .v-input__slot {
  background-color: #A62229 !important;
}

.bg-mien-giam >>> .v-input__slot {
  background-color: #1565C0 !important;
}
</style>