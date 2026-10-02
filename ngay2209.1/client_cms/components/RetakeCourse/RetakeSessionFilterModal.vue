<template>
  <div>
    <v-btn
      icon
      small
      class="btn-icon-red ma-0"
      aria-label="Lọc nâng cao"
      @click="dialog = true"
    >
      <v-icon size="22" color="#9e1c24">mdi-filter-variant-plus</v-icon>
    </v-btn>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="bg-red-theme white--text py-3 px-4 d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">Bộ lọc nâng cao</span>
          <v-btn icon dark small class="ma-0" aria-label="Đóng" @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-5 pb-3 px-6 bg-white">
          <div class="d-flex align-center mb-4">
            <v-switch
              v-model="isWeekMode"
              color="#9e1c24"
              hide-details
              dense
              class="ma-0 pa-0 week-switch"
            ></v-switch>
            <span class="text-body-2 font-weight-medium text-gray-700 ml-2">
              Nhập theo tuần
            </span>
          </div>

          <div v-if="!isWeekMode" class="d-flex date-range-fields">
            <v-menu
              v-model="menuFromDate"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="fromDateFormatted"
                  label="Từ ngày"
                  outlined
                  dense
                  hide-details
                  readonly
                  class="custom-dialog-input"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="fromDate"
                locale="vi"
                color="#9e1c24"
                @input="menuFromDate = false"
              ></v-date-picker>
            </v-menu>

            <v-menu
              v-model="menuToDate"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="toDateFormatted"
                  label="Đến ngày"
                  outlined
                  dense
                  hide-details
                  readonly
                  class="custom-dialog-input"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="toDate"
                locale="vi"
                color="#9e1c24"
                @input="menuToDate = false"
              ></v-date-picker>
            </v-menu>
          </div>

          <div v-else class="d-flex date-range-fields">
            <v-menu v-model="menuFromWeek" :close-on-content-click="false" offset-y min-width="350px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="fromWeekText"
                  label="Từ tuần"
                  placeholder="Chọn tuần bắt đầu"
                  outlined
                  dense
                  hide-details
                  readonly
                  class="custom-dialog-input"
                  v-bind="attrs"
                  v-on="on"
                >
                  <template v-slot:append>
                    <v-icon small color="#666">mdi-calendar-month-outline</v-icon>
                  </template>
                </v-text-field>
              </template>

              <v-card class="pa-2 week-picker-card">
                <div class="d-flex align-center justify-space-between mb-2 px-2">
                  <v-btn icon x-small aria-label="Tháng trước" @click="changeMonth(-1)">
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  <span class="font-weight-bold text-caption">{{ visibleMonthLabel }}</span>
                  <v-btn icon x-small aria-label="Tháng sau" @click="changeMonth(1)">
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </div>

                <table class="week-table">
                  <thead>
                    <tr>
                      <th>Tuần</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>CN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="week in weekList"
                      :key="week.monday"
                      :class="{ 'selected-row': selectedWeekFrom === week.monday }"
                      tabindex="0"
                      @click="selectFromWeek(week)"
                      @keydown.enter="selectFromWeek(week)"
                    >
                      <td class="font-weight-bold">{{ week.weekNum }}</td>
                      <td>{{ week.d1 }}</td><td>{{ week.d2 }}</td><td>{{ week.d3 }}</td><td>{{ week.d4 }}</td>
                      <td>{{ week.d5 }}</td><td>{{ week.d6 }}</td><td>{{ week.d7 }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="d-flex justify-space-between pt-2 border-t mt-2">
                  <v-btn text x-small color="gray" @click="clearFromWeek">Xoá</v-btn>
                  <v-btn text x-small color="#9e1c24" @click="selectCurrentWeekFrom">Tuần này</v-btn>
                </div>
              </v-card>
            </v-menu>

            <v-menu v-model="menuToWeek" :close-on-content-click="false" offset-y min-width="350px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="toWeekText"
                  label="Đến tuần"
                  placeholder="Chọn tuần kết thúc"
                  outlined
                  dense
                  hide-details
                  readonly
                  class="custom-dialog-input"
                  v-bind="attrs"
                  v-on="on"
                >
                  <template v-slot:append>
                    <v-icon small color="#666">mdi-calendar-month-outline</v-icon>
                  </template>
                </v-text-field>
              </template>

              <v-card class="pa-2 week-picker-card">
                <div class="d-flex align-center justify-space-between mb-2 px-2">
                  <v-btn icon x-small aria-label="Tháng trước" @click="changeMonth(-1)">
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  <span class="font-weight-bold text-caption">{{ visibleMonthLabel }}</span>
                  <v-btn icon x-small aria-label="Tháng sau" @click="changeMonth(1)">
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </div>

                <table class="week-table">
                  <thead>
                    <tr>
                      <th>Tuần</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>CN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="week in weekList"
                      :key="week.monday"
                      :class="{ 'selected-row': selectedWeekTo === week.monday }"
                      tabindex="0"
                      @click="selectToWeek(week)"
                      @keydown.enter="selectToWeek(week)"
                    >
                      <td class="font-weight-bold">{{ week.weekNum }}</td>
                      <td>{{ week.d1 }}</td><td>{{ week.d2 }}</td><td>{{ week.d3 }}</td><td>{{ week.d4 }}</td>
                      <td>{{ week.d5 }}</td><td>{{ week.d6 }}</td><td>{{ week.d7 }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="d-flex justify-space-between pt-2 border-t mt-2">
                  <v-btn text x-small color="gray" @click="clearToWeek">Xoá</v-btn>
                  <v-btn text x-small color="#9e1c24" @click="selectCurrentWeekTo">Tuần này</v-btn>
                </div>
              </v-card>
            </v-menu>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end pb-4 px-6 pt-2 bg-white">
          <v-btn text class="text-capitalize font-weight-medium text-gray-600 mr-2" @click="dialog = false">
            Đóng <v-icon small right>mdi-close</v-icon>
          </v-btn>
          <v-btn
            color="#9e1c24"
            dark
            elevation="0"
            class="px-5 btn-search-dialog text-none font-weight-medium"
            @click="handleApplyFilter"
          >
            Tìm kiếm <v-icon small right>mdi-magnify</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'RetakeSessionFilterModal',
  data() {
    const now = new Date()
    return {
      dialog: false,
      isWeekMode: false,
      fromDate: null,
      toDate: null,
      menuFromDate: false,
      menuToDate: false,
      fromWeekText: '',
      toWeekText: '',
      fromWeekDate: null,
      toWeekDate: null,
      menuFromWeek: false,
      menuToWeek: false,
      selectedWeekFrom: null,
      selectedWeekTo: null,
      visibleMonth: this.toMonthValue(now),
    }
  },
  computed: {
    fromDateFormatted() {
      return this.formatDate(this.fromDate)
    },
    toDateFormatted() {
      return this.formatDate(this.toDate)
    },
    visibleMonthLabel() {
      const [year, month] = this.visibleMonth.split('-').map(Number)
      return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' })
        .format(new Date(year, month - 1, 1))
    },
    weekList() {
      const [year, month] = this.visibleMonth.split('-').map(Number)
      const firstDay = new Date(year, month - 1, 1)
      const start = new Date(firstDay)
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
      const lastDay = new Date(year, month, 0)
      const end = new Date(lastDay)
      end.setDate(end.getDate() + (7 - ((end.getDay() + 6) % 7)) % 7)
      const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
      const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
      const numberOfWeeks = Math.floor((endUtc - startUtc) / (7 * 86400000)) + 1

      return Array.from({ length: numberOfWeeks }, (_, index) => {
        const monday = new Date(start)
        monday.setDate(monday.getDate() + index * 7)
        const dates = Array.from({ length: 7 }, (_, index) => {
          const date = new Date(monday)
          date.setDate(date.getDate() + index)
          return date
        })
        const week = this.getISOWeek(monday)
        return {
          monday: this.toISODate(dates[0]),
          sunday: this.toISODate(dates[6]),
          weekNum: week.number,
          weekYear: week.year,
          d1: dates[0].getDate(),
          d2: dates[1].getDate(),
          d3: dates[2].getDate(),
          d4: dates[3].getDate(),
          d5: dates[4].getDate(),
          d6: dates[5].getDate(),
          d7: dates[6].getDate(),
        }
      })
    },
  },
  methods: {
    toMonthValue(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    },
    toISODate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatDate(date) {
      if (!date) return ''
      const [year, month, day] = date.split('-')
      return `${day}/${month}/${year}`
    },
    getISOWeek(date) {
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const day = utcDate.getUTCDay() || 7
      utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day)
      const weekYear = utcDate.getUTCFullYear()
      const yearStart = new Date(Date.UTC(weekYear, 0, 1))
      const weekNumber = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7)
      return { number: weekNumber, year: weekYear }
    },
    changeMonth(offset) {
      const [year, month] = this.visibleMonth.split('-').map(Number)
      this.visibleMonth = this.toMonthValue(new Date(year, month - 1 + offset, 1))
    },
    setWeek(week, isStart) {
      const weekText = `Tuần ${week.weekNum}, ${week.weekYear}`
      if (isStart) {
        this.selectedWeekFrom = week.monday
        this.fromWeekDate = week.monday
        this.fromWeekText = weekText
        this.menuFromWeek = false
      } else {
        this.selectedWeekTo = week.monday
        this.toWeekDate = week.sunday
        this.toWeekText = weekText
        this.menuToWeek = false
      }
    },
    selectFromWeek(week) {
      this.setWeek(week, true)
    },
    selectToWeek(week) {
      this.setWeek(week, false)
    },
    selectCurrentWeek(isStart) {
      const today = new Date()
      this.visibleMonth = this.toMonthValue(today)
      const monday = new Date(today)
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
      const week = this.weekList.find(item => item.monday === this.toISODate(monday))
      if (week) this.setWeek(week, isStart)
    },
    selectCurrentWeekFrom() {
      this.selectCurrentWeek(true)
    },
    selectCurrentWeekTo() {
      this.selectCurrentWeek(false)
    },
    clearFromWeek() {
      this.selectedWeekFrom = null
      this.fromWeekDate = null
      this.fromWeekText = ''
    },
    clearToWeek() {
      this.selectedWeekTo = null
      this.toWeekDate = null
      this.toWeekText = ''
    },
    resetFilters() {
      this.isWeekMode = false
      this.fromDate = null
      this.toDate = null
      this.fromWeekDate = null
      this.toWeekDate = null
      this.fromWeekText = ''
      this.toWeekText = ''
      this.selectedWeekFrom = null
      this.selectedWeekTo = null
      this.menuFromDate = false
      this.menuToDate = false
      this.menuFromWeek = false
      this.menuToWeek = false
    },
    handleApplyFilter() {
      const from = this.isWeekMode ? this.fromWeekDate : this.fromDate
      const to = this.isWeekMode ? this.toWeekDate : this.toDate
      this.$emit('apply-filter', {
        isWeekMode: this.isWeekMode,
        fromDate: this.formatDate(from),
        toDate: this.formatDate(to),
        fromWeek: this.isWeekMode ? this.fromWeekText : '',
        toWeek: this.isWeekMode ? this.toWeekText : '',
      })
      this.dialog = false
    },
  },
}
</script>

<style scoped>
.bg-red-theme {
  background-color: #9e1c24 !important;
}

.btn-icon-red {
  width: 38px !important;
  height: 38px !important;
  border-radius: 4px;
}

/* Khung chứa input */
.custom-centered-input >>> .v-input__slot {
  min-height: 48px !important;
  border-radius: 8px !important;
  background-color: #ffffff !important;
  padding: 0 12px !important;
  display: flex !important;
  align-items: center !important;
}

/* Đảm bảo slot chứa input & label căn giữa theo chiều dọc */
.custom-centered-input >>> .v-text-field__slot {
  display: flex !important;
  align-items: center !important;
  position: relative !important;
  height: 100% !important;
}

/* Thẻ input */
.custom-centered-input >>> input {
  font-size: 15px !important;
  color: #333333 !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Căn giữa LABEL khi ở trạng thái bình thường (chưa float) */
.custom-centered-input >>> .v-label {
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin: 0 !important;
  line-height: 1 !important;
  pointer-events: none;
}

/* Khi Label active / float nhảy lên trên viền */
.custom-centered-input >>> .v-label--active {
  top: 0 !important;
  transform: translateY(-50%) scale(0.75) !important;
  background-color: #ffffff !important; /* Che đường viền fieldset phía sau */
  padding: 0 4px !important;
}

/* Viền ngoài */
.custom-centered-input >>> fieldset {
  border-color: #8c8c8c !important;
  border-width: 1px !important;
}

.date-range-fields {
  gap: 12px;
}

.date-range-fields > * {
  flex: 1 1 0;
  min-width: 0;
}

.week-picker-card {
  width: min(350px, 90vw);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.week-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 12px;
}

.week-table th {
  padding: 4px;
  color: #666;
  font-weight: 600;
}

.week-table td {
  padding: 6px 4px;
  cursor: pointer;
}

.week-table tr:hover td {
  background-color: #f5f5f5;
}

.week-table tr.selected-row td {
  background-color: #9e1c24 !important;
  color: #ffffff !important;
}

.week-table tr:focus-visible td {
  outline: 2px solid #9e1c24;
}

.btn-search-dialog {
  background-color: #9e1c24 !important;
  border-radius: 4px !important;
  height: 36px !important;
}
</style>