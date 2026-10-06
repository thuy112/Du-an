<template>
    <div class="dinh-muc-phi-page pa-4">
        <!-- HEADER VÀ TOOLBAR -->
        <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
            <div class="text-subtitle-1 black--text">
                Danh sách quy định định mức phí (<span class="text-red-bold">{{ filteredList.length }}</span>)
            </div>

            <!-- CỤM LỌC VÀ NÚT BẤM -->
            <div class="d-flex align-center gap-2 flex-wrap">
                <v-select
                    v-model="filters.classType"
                    :items="classTypeList"
                    label="Loại lớp"
                    outlined
                    dense
                    hide-details
                    clearable
                    class="filter-select"
                    style="width: 160px;"
                ></v-select>

                <v-select
                    v-model="filters.trainingType"
                    :items="trainingTypeList"
                    label="Hình thức đào tạo"
                    outlined
                    dense
                    hide-details
                    clearable
                    class="filter-select"
                    style="width: 180px;"
                ></v-select>

                <!-- NÚT LÀM MỚI -->
                <button class="icon-border-btn" title="Làm mới" @click="resetFilters">
                    <v-icon color="#a2212b" size="24">mdi-refresh</v-icon>
                </button>

                <!-- NÚT TÌM KIẾM -->
                <v-btn color="#a2212b" dark elevation="0" class="btn-square" title="Tìm kiếm" @click="handleSearch">
                    <v-icon size="24">mdi-magnify</v-icon>
                </v-btn>

                <!-- NÚT THÊM MỚI (BẤM MỞ DIALOG) -->
                <v-btn color="#a2212b" dark elevation="0" class="btn-square" title="Thêm mới" @click="openAddModal">
                    <v-icon size="24">mdi-plus</v-icon>
                </v-btn>
            </div>
        </div>

        <!-- BẢNG DỮ LIỆU -->
        <div class="border-table overflow-x-auto">
            <table class="custom-data-table">
                <thead>
                    <tr class="bg-gray-head">
                        <th class="text-caption font-weight-bold" style="width: 80px;">STT</th>
                        <th class="text-caption font-weight-bold">Loại lớp</th>
                        <th class="text-caption font-weight-bold">Hình thức đào tạo</th>
                        <th class="text-caption font-weight-bold">Giá tiền</th>
                        <th class="text-caption font-weight-bold text-center" style="width: 120px;">Chức năng</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="5" class="text-center py-6 text-caption text-grey-color">
                            Đang tải dữ liệu...
                        </td>
                    </tr>
                    <tr v-else-if="displayList.length === 0">
                        <td colspan="5" class="text-center py-6 text-caption text-grey-color">
                            Không có dữ liệu
                        </td>
                    </tr>

                    <tr v-for="(item, index) in displayList" :key="item.id || index">
                        <td class="text-caption">{{ (page - 1) * pageSize + index + 1 }}</td>
                        <td class="text-caption">{{ item.classType }}</td>
                        <td class="text-caption">{{ item.trainingType }}</td>
                        <td class="text-caption">{{ formatCurrency(item.price) }}</td>
                        <td class="text-caption text-center">
                            <v-btn icon x-small title="Chỉnh sửa" @click="editItem(item)">
                                <v-icon size="24" color="#E5A800">mdi-pencil</v-icon>
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- CỤM PHÂN TRANG -->
        <div class="d-flex align-center justify-end mt-4 gap-2">
            <v-text-field
                v-model="pageSize"
                label="Bản ghi"
                outlined
                dense
                readonly
                hide-details
                class="custom-pagination-select"
                append-icon="mdi-menu-down"
            ></v-text-field>

            <v-text-field
                v-model="pageInput"
                label="Trang"
                outlined
                dense
                hide-details
                class="custom-pagination-input"
                @keyup.enter="handleGo"
            ></v-text-field>

            <v-btn color="#a2212b" dark elevation="0" class="custom-go-btn" @click="handleGo">
                Đi
            </v-btn>

            <div class="d-flex align-center gap-1">
                <button class="custom-nav-btn" :disabled="page <= 1" @click="prevPage">
                    <v-icon small color="#666">mdi-chevron-left</v-icon>
                </button>
                <button class="page-num-btn active">
                    {{ page }}
                </button>
                <button class="custom-nav-btn" :disabled="page >= totalPages" @click="nextPage">
                    <v-icon small color="#666">mdi-chevron-right</v-icon>
                </button>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- MODAL DIALOG: THÊM MỚI ĐỊNH MỨC GIẢNG VIÊN  -->
        <!-- ========================================== -->
        <v-dialog v-model="dialogVisible" max-width="560px" persistent>
            <div class="custom-dialog-card">
                <!-- HEADER DIALOG (ĐỎ BÁCH KHOA) -->
                <div class="dialog-header d-flex align-center justify-space-between px-4 py-3">
                    <span class="white--text text-subtitle-1 font-weight-medium">
                        {{ isEdit ? 'Cập nhật định mức giảng viên' : 'Thêm mới định mức giảng viên' }}
                    </span>
                    <v-btn icon dark x-small @click="closeDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>

                <!-- BODY DIALOG -->
                <div class="dialog-body pa-5 bg-white">
                    <v-form ref="form" v-model="isFormValid">
                        <v-row dense>
                            <!-- LOẠI LỚP (*) -->
                            <v-col cols="6">
                                <v-select
                                    v-model="formModel.classType"
                                    :items="classTypeList"
                                    label="Loại lớp (*)"
                                    outlined
                                    dense
                                    hide-details="auto"
                                    :disabled="isEdit"
                                    :rules="[v => !!v || 'Vui lòng chọn loại lớp']"
                                    class="dialog-input"
                                ></v-select>
                            </v-col>

                            <!-- GIÁ TIỀN (VNĐ) + FORMAT DẤU PHẨY CỨ 3 SỐ -->
                            <v-col cols="6">
                                <v-text-field
                                    v-model="formattedPrice"
                                    label="Giá tiền *"
                                    outlined
                                    dense
                                    hide-details="auto"
                                    class="dialog-input"
                                    :rules="[v => !!v || 'Vui lòng nhập giá tiền']"
                                    @input="onPriceInput"
                                >
                                    <template #append>
                                        <span class="v-text-suffix">VNĐ</span>
                                    </template>
                                </v-text-field>
                            </v-col>

                            <!-- HÌNH THỨC ĐÀO TẠO (*) -->
                            <v-col cols="12" class="mt-3">
                                <v-select
                                    v-model="formModel.trainingType"
                                    :items="trainingTypeList"
                                    label="Hình thức đào tạo (*)"
                                    outlined
                                    dense
                                    hide-details="auto"
                                    :disabled="isEdit"
                                    :rules="[v => !!v || 'Vui lòng chọn hình thức đào tạo']"
                                    class="dialog-input"
                                ></v-select>
                            </v-col>
                        </v-row>
                    </v-form>

                    <!-- FOOTER BUTTONS -->
                    <div class="d-flex align-center justify-end mt-6 gap-3">
                        <v-btn
                            outlined
                            elevation="0"
                            class="text-capitalize rounded-sm px-4 btn-close"
                            @click="closeDialog"
                        >
                            Đóng <v-icon small class="ml-1">mdi-close</v-icon>
                        </v-btn>

                        <v-btn
                            color="#a2212b"
                            dark
                            elevation="0"
                            class="text-capitalize rounded-sm px-4"
                            :loading="submitting"
                            @click="saveData"
                        >
                            Lưu <v-icon small class="ml-1">mdi-content-save</v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
        </v-dialog>

        <div class="save-toast-container" aria-live="polite" aria-atomic="false">
            <transition-group name="save-toast-list" tag="div" class="save-toast-stack">
                <div
                    v-for="toast in saveToasts"
                    :key="toast.id"
                    class="save-toast"
                    :class="{ 'save-toast-error': toast.isError }"
                    role="status"
                >
                    <div class="save-toast-content">
                        <v-icon dark small>{{ toast.isError ? 'mdi-alert-circle' : 'mdi-check-circle' }}</v-icon>
                        <span>{{ toast.message }}</span>
                        <v-btn icon x-small dark aria-label="Đóng thông báo" @click="removeSaveToast(toast.id)">
                            <v-icon small>mdi-close</v-icon>
                        </v-btn>
                    </div>
                    <div class="save-toast-progress-track">
                        <div
                            class="save-toast-progress"
                            :style="{ animationDuration: toast.duration + 'ms' }"
                            @animationend="removeSaveToast(toast.id)"
                        ></div>
                    </div>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script>
import feeTecherServices from '~/services/feeTecherServices'

export default {
    name: 'DinhMucPhiPage',
    layout: 'default',
    ssr: false,
    data() {
        return {
            loading: false,
            submitting: false,

            // Filter data
            filters: {
                classType: null,
                trainingType: null
            },
            classTypeList: ['Đồ án môn học', 'Lớp ghép', 'Lớp mở'],
            trainingTypeList: ['Chính quy', 'Vừa làm vừa học', 'Ngắn hạn'],

            // Dữ liệu mẫu chuẩn ảnh
            rawList: [
                { id: 1, classType: 'Đồ án môn học', trainingType: 'Chính quy', price: 300000 },
                { id: 2, classType: 'Đồ án môn học', trainingType: 'Vừa làm vừa học', price: 300000 },
                { id: 3, classType: 'Đồ án môn học', trainingType: 'Ngắn hạn', price: 300000 },
                { id: 4, classType: 'Lớp ghép', trainingType: 'Chính quy', price: 210000 },
                { id: 5, classType: 'Lớp ghép', trainingType: 'Vừa làm vừa học', price: 210000 },
                { id: 6, classType: 'Lớp ghép', trainingType: 'Ngắn hạn', price: 210000 },
                { id: 7, classType: 'Lớp mở', trainingType: 'Chính quy', price: 70000 },
                { id: 8, classType: 'Lớp mở', trainingType: 'Vừa làm vừa học', price: 60000 },
                { id: 9, classType: 'Lớp mở', trainingType: 'Ngắn hạn', price: 50000 }
            ],
            filteredList: [],

            // Phân trang
            page: 1,
            pageSize: 50,
            pageInput: '1',

            // Dialog Modal State
            dialogVisible: false,
            isEdit: false,
            isFormValid: true,
            saveToasts: [],
            saveToastCounter: 0,
            formattedPrice: '',
            formModel: {
                id: null,
                classType: null,
                trainingType: null,
                price: null
            }
        }
    },
    computed: {
        totalPages() {
            const pages = Math.ceil(this.filteredList.length / this.pageSize)
            return pages > 0 ? pages : 1
        },
        displayList() {
            const start = (this.page - 1) * this.pageSize
            const end = start + this.pageSize
            return this.filteredList.slice(start, end)
        }
    },
    beforeDestroy() {
        this.saveToasts.forEach(toast => clearTimeout(toast.timer))
    },
    mounted() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            this.loading = true
            try {
                const res = await feeTecherServices.getList(this.filters)
                if (res && res.data) {
                    this.rawList = Array.isArray(res.data) ? res.data : (res.data.items || this.rawList)
                }
            } catch (error) {
                // Giữ dữ liệu tĩnh khi gặp lỗi API
            } finally {
                this.loading = false
                this.applyFilter()
            }
        },

        // XỬ LÝ NHẬP GIÁ TIỀN: TỰ ĐỘNG THÊM DẤU PHẨY CỨ 3 SỐ
        onPriceInput(val) {
            if (!val) {
                this.formModel.price = null
                this.formattedPrice = ''
                return
            }
            // Lọc chỉ lấy chữ số
            const cleanNumber = String(val).replace(/\D/g, '')
            if (cleanNumber) {
                this.formModel.price = parseInt(cleanNumber, 10)
                // Định dạng dấu phẩy cứ mỗi 3 chữ số
                this.formattedPrice = this.formModel.price.toLocaleString('en-US')
            } else {
                this.formModel.price = null
                this.formattedPrice = ''
            }
        },

        openAddModal() {
            this.isEdit = false
            this.formModel = {
                id: null,
                classType: null,
                trainingType: null,
                price: null
            }
            this.formattedPrice = ''
            this.dialogVisible = true
            this.$nextTick(() => {
                if (this.$refs.form) this.$refs.form.resetValidation()
            })
        },

        closeDialog() {
            this.dialogVisible = false
        },

        saveData() {
            if (this.$refs.form && !this.$refs.form.validate()) return

            this.submitting = true
            try {
                if (this.isEdit) {
                    const item = this.rawList.find(entry => entry.id === this.formModel.id)
                    if (!item) {
                        throw new Error(`Không tìm thấy định mức cần cập nhật: ${this.formModel.id}`)
                    }
                    item.price = this.formModel.price
                } else {
                    const newItem = {
                        id: Date.now(),
                        classType: this.formModel.classType,
                        trainingType: this.formModel.trainingType,
                        price: this.formModel.price
                    }
                    this.rawList.unshift(newItem)
                }
                this.applyFilter()
                this.closeDialog()
                this.showSaveToast(
                    this.isEdit
                        ? 'Cập nhật thành công'
                        : 'Thêm mới định mức thành công'
                )
            } catch (error) {
                this.showSaveToast('Lưu định mức thất bại', true)
            } finally {
                this.submitting = false
            }
        },

        showSaveToast(message, isError = false) {
            const toast = {
                id: ++this.saveToastCounter,
                message,
                isError,
                duration: 4000,
                timer: null
            }
            this.saveToasts.unshift(toast)
            toast.timer = setTimeout(() => {
                this.removeSaveToast(toast.id)
            }, toast.duration)
        },

        removeSaveToast(id) {
            const toast = this.saveToasts.find(item => item.id === id)
            if (toast) clearTimeout(toast.timer)
            this.saveToasts = this.saveToasts.filter(item => item.id !== id)
        },

        applyFilter() {
            this.filteredList = this.rawList.filter((item) => {
                const matchClass = !this.filters.classType || item.classType === this.filters.classType
                const matchTraining = !this.filters.trainingType || item.trainingType === this.filters.trainingType
                return matchClass && matchTraining
            })
        },

        handleSearch() {
            this.page = 1
            this.pageInput = '1'
            this.applyFilter()
        },

        handleGo() {
            this.applyFilter()
            const p = parseInt(this.pageInput, 10)
            if (p >= 1 && p <= this.totalPages) {
                this.page = p
            } else {
                this.page = 1
                this.pageInput = '1'
            }
        },

        resetFilters() {
            this.filters.classType = null
            this.filters.trainingType = null
            this.page = 1
            this.pageInput = '1'
            this.filteredList = [...this.rawList]
        },

        formatCurrency(val) {
            if (val === null || val === undefined) return '0đ'
            return `${val.toLocaleString('vi-VN')}đ`
        },

        editItem(item) {
            this.isEdit = true
            this.formModel = { ...item }
            this.formattedPrice = item.price ? item.price.toLocaleString('en-US') : ''
            this.dialogVisible = true
            this.$nextTick(() => {
                if (this.$refs.form) this.$refs.form.resetValidation()
            })
        },

        prevPage() {
            if (this.page > 1) {
                this.page--
                this.pageInput = String(this.page)
            }
        },

        nextPage() {
            if (this.page < this.totalPages) {
                this.page++
                this.pageInput = String(this.page)
            }
        }
    }
}
</script>

<style scoped lang="scss">
.text-red-bold {
    color: #a2212b !important;
    font-weight: bold;
}

.bg-gray-head {
    background-color: #F5F5F5;
}

.border-table {
    border: 0;
    border-radius: 0;
}

.custom-data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #E0E0E0;
        color: #000000;
    }

    td {
        padding: 12px 16px;
        border-bottom: 1px solid #EEEEEE;
        color: #333333;
    }
}

.filter-select ::v-deep .v-input__slot {
    min-height: 36px !important;
    font-size: 13px !important;
}

.icon-border-btn {
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.btn-square {
    height: 36px !important;
    min-width: 36px !important;
    padding: 0 10px !important;
    border-radius: 4px;
}

/* DIALOG STYLE CHUẨN ẢNH */
.custom-dialog-card {
    border-radius: 6px;
    overflow: hidden;
    background: #ffffff;
}

.dialog-header {
    background-color: #a2212b;
}

.dialog-input {
    font-size: 13px !important;

    ::v-deep .v-input__slot {
        min-height: 40px !important;
    }
}

.v-text-suffix {
    font-size: 13px;
    color: #666;
    font-weight: 500;
}

.btn-close {
    border-color: #ccc !important;
    color: #333 !important;
}

/* PHÂN TRANG STYLE */
.custom-pagination-select,
.custom-pagination-input {
    font-size: 13px !important;

    ::v-deep .v-input__control {
        min-height: 32px !important;
        height: 32px !important;
    }

    ::v-deep .v-input__slot {
        min-height: 32px !important;
        height: 32px !important;
        padding: 0 8px !important;
        border-radius: 4px !important;
    }

    ::v-deep .v-label {
        top: 6px !important;
        font-size: 12px !important;
        background-color: #ffffff !important;
        padding: 0 4px !important;
        left: 4px !important;
    }
}

.custom-pagination-select {
    width: 92px !important;
    max-width: 92px !important;

    ::v-deep .v-input__append-inner {
        margin-top: 4px !important;
    }
}

.custom-pagination-input {
    width: 64px !important;
    max-width: 64px !important;

    ::v-deep input {
        text-align: center;
        font-size: 13px;
        padding: 0 !important;
    }
}

.custom-go-btn {
    height: 32px !important;
    min-width: 50px !important;
    border-radius: 4px !important;
    font-size: 13px !important;
    text-transform: none;
}

.custom-nav-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.page-num-btn {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: bold;

    &.active {
        background-color: #a2212b;
        color: #FFFFFF;
    }
}

.text-grey-color {
    color: #9E9E9E;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.save-toast-container {
    position: fixed;
    top: 70px;
    right: 24px;
    z-index: 9999;
    width: 320px;
    pointer-events: none;
}

.save-toast-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.save-toast {
    overflow: hidden;
    border-radius: 6px;
    background-color: #4CAF50;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    color: #ffffff;
    animation: save-toast-enter 0.3s ease-out;
    pointer-events: auto;

    &.save-toast-error {
        background-color: #F44336;
    }

    .save-toast-list-enter-active,
    .save-toast-list-leave-active,
    .save-toast-list-move {
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .save-toast-list-enter {
        opacity: 0;
        transform: translateY(-15px) scale(0.96);
    }

    .save-toast-list-leave-to {
        opacity: 0;
        transform: translateX(40px);
    }
}

.save-toast-content {
    display: flex;
    min-height: 44px;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-size: 14px;
    font-weight: 500;

    span {
        flex: 1 1 auto;
    }
}

.save-toast-progress-track {
    width: 100%;
    height: 4px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.3);
}

.save-toast-progress {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    animation: save-toast-countdown 4s linear forwards;
}

@keyframes save-toast-countdown {
    from { width: 100%; }
    to { width: 0%; }
}

@keyframes save-toast-enter {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>