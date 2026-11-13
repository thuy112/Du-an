<script>
import decisionTeacherJobFeeService from "~/services/decisionTeacherJobFeeService";
import uploadServices from "~/services/uploadServices";

export default {
    name: "DecisionTeacherJobFeeAddModal",
    props: {
        value: { type: Boolean, default: false },
    },
    data() {
        return {
            open: this.value,
            loading: false,
            activeTab: 0, // 0: Ra Đề, 1: Chấm Bài, 2: Trông Thi, 3: Đi Lại, 4: TTTN
            
            form: {
                name: "",
                timeInform: "", // Lưu ngày dạng YYYY-MM-DD
                fileInform: null, // Lưu file được chọn (.xlsx, .pdf)
                semesterId: null,
            },

            menuDate: false, // Biến ẩn/hiện popup chọn ngày

            // Phí mặc định và checkbox áp dụng cho từng tab
            defaultFees: {
                raDe: "",
                chamBai: "",
                trongThi: "",
                diLai: "",
                tttn: ""
            },
            applyDefaults: {
                raDe: false,
                chamBai: false,
                trongThi: false,
                diLai: false,
                tttn: false
            },

            tabNames: [
                { key: 'raDe', label: 'Ra Đề', defaultLabel: 'Phí ra đề mặc định', applyLabel: 'Áp dụng phí ra đề mặc định' },
                { key: 'chamBai', label: 'Chấm Bài', defaultLabel: 'Phí chấm bài mặc định', applyLabel: 'Áp dụng phí chấm bài mặc định' },
                { key: 'trongThi', label: 'Trông Thi', defaultLabel: 'Phí trông thi mặc định', applyLabel: 'Áp dụng phí trông thi mặc định' },
                { key: 'diLai', label: 'Đi Lại', defaultLabel: 'Phí đi lại mặc định', applyLabel: 'Áp dụng phí đi lại mặc định' },
                { key: 'tttn', label: 'TTTN', defaultLabel: 'Phí TTTN mặc định', applyLabel: 'Áp dụng phí TTTN mặc định' },
            ],

            semesterList: [], // Danh sách học kỳ từ /api/semester/list
            itemList: [],     // Danh sách học phần từ /api/term/list
            
            currentPage: 1,
            itemsPerPage: 20, // Mặc định 20 bản ghi/trang
        };
    },
    watch: {
        value(val) {
            this.open = val;
            if (val) {
                this.loadSemesters();
                this.loadTermsForTable();
            }
        },
        open(val) {
            this.$emit('input', val);
        }
    },
    computed: {
        currentTabConfig() {
            return this.tabNames[this.activeTab];
        },
        // Hiển thị ngày dạng DD/MM/YYYY ra ô input
        formattedDate() {
            if (!this.form.timeInform) return '';
            const parts = this.form.timeInform.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return this.form.timeInform;
        },
        totalPages() {
            return Math.ceil(this.itemList.length / this.itemsPerPage) || 1;
        },
        paginatedItemList() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.itemList.slice(start, end);
        }
    },
    methods: {
        closeDialog() {
            this.open = false;
        },
        async loadSemesters() {
            try {
                const res = await decisionTeacherJobFeeService.getSemesterList({ status: 'ACTIVE', channel: 'CMS' });
                const raw = res?.data !== undefined ? res.data : res;
                this.semesterList = Array.isArray(raw) ? raw : (raw?.data || raw?.content || []);
            } catch (e) {
                console.error("Lỗi tải học kỳ:", e);
                this.semesterList = [];
            }
        },
        async loadTermsForTable() {
            try {
                const res = await decisionTeacherJobFeeService.getTermList({ status: 'ACTIVE', channel: 'CMS' });
                const raw = res?.data !== undefined ? res.data : res;
                const list = Array.isArray(raw) ? raw : (raw?.data || raw?.content || []);
                
                this.itemList = list.map(item => ({
                    id: item.id,
                    name: item.name || item.title,
                    raDe: '',
                    chamBai: '',
                    trongThi: '',
                    diLai: '',
                    tttn: ''
                }));
                this.currentPage = 1;
            } catch (e) {
                console.error("Lỗi tải danh sách học phần:", e);
                this.itemList = [];
            }
        },
        onDefaultFeeChange() {
            const config = this.currentTabConfig;
            const val = this.defaultFees[config.key];
            if (this.applyDefaults[config.key]) {
                this.itemList.forEach(item => {
                    item[config.key] = val;
                });
            }
        },
        onToggleApplyDefault(val) {
            const config = this.currentTabConfig;
            if (val) {
                const valDefault = this.defaultFees[config.key];
                this.itemList.forEach(item => {
                    item[config.key] = valDefault;
                });
            }
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        formatTimeInformForApi(dateStr) {
            if (!dateStr) return null;
            const dateOnly = String(dateStr).split(/[ T]/)[0];
            return `${dateOnly}T00:00:00`;
        },
        async handleSave() {
        // Kiểm tra validation cơ bản trước khi gọi API
        if (!this.form.name || !this.form.timeInform || !this.form.semesterId) {
            if (typeof this.$showError === 'function') {
                this.$showError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
            }
            return;
        }

        this.loading = true;
        try {
            let fileInform = this.form.fileInform || "";
            if (fileInform instanceof File) {
                const formData = new FormData();
                formData.append("file", fileInform);
                const uploadRes = await uploadServices.upload(formData);

                if (uploadRes?.success !== true || !uploadRes.data?.url) {
                    if (uploadRes?.success === true) {
                        this.$showError("Tải file ban hành thất bại");
                    }
                    return;
                }

                fileInform = uploadRes.data.url;
            }

            const payload = {
                name: this.form.name,
                timeInform: this.formatTimeInformForApi(this.form.timeInform),
                fileInform,
                semesterId: this.form.semesterId,
                // Chuyển đổi danh sách chi tiết phí của từng học phần gửi lên đúng chuẩn backend
                details: this.itemList.map(item => ({
                    termId: item.id,
                    examPreparationFee: Number(item.raDe) || 0,
                    gradingFee: Number(item.chamBai) || 0,
                    proctoringFee: Number(item.trongThi) || 0,
                    travelExpenses: Number(item.diLai) || 0,
                    graduationInternFee: Number(item.tttn) || 0
                })),
                channel: "CMS"
            };

            const res = await decisionTeacherJobFeeService.createItem(payload, "CMS");

            if (res?.success !== true) {
                return;
            }

            const responseData = res.data;
            const responseCode = responseData?.error?.code ?? responseData?.code;
            if (responseCode !== undefined && Number(responseCode) !== 0 && Number(responseCode) !== 200) {
                this.$showError(responseData?.error?.message || responseData?.message || "Yêu cầu không hợp lệ");
                return;
            }

            if (typeof this.$showSuccess === 'function') {
                this.$showSuccess("Thêm mới thành công");
            }
            this.open = false;
            
            // Reload lại bảng danh sách ở trang chính
            if (this.$parent && typeof this.$parent.loadData === 'function') {
                this.$parent.loadData();
            }
        } catch (error) {
            console.error("Lỗi thêm mới:", error);
            const responseBody = error?.response?.data;
            const errorMsg = responseBody?.error?.message || responseBody?.message || error?.message || "Thêm mới thất bại";
            if (typeof this.$showError === 'function') {
                this.$showError(errorMsg);
            }
        } finally {
            this.loading = false;
        }
    }
    }
};
</script>

<template>
    <v-dialog v-model="open" max-width="950px" persistent>
        <v-card class="rounded-lg">
            <!-- TIÊU ĐỀ MODAL -->
            <v-card-title class="pa-4 white--text" style="background-color: #A62229; color: white;">
                <span class="text-h6 font-weight-bold">Thêm định mức thanh toán theo công việc cho GV</span>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-5" style="max-height: 75vh; overflow-y: auto;">
                <!-- Tên ban hành -->
                <v-text-field
                    v-model="form.name"
                    label="Tên ban hành (*)"
                    outlined
                    dense
                    class="mb-3"
                ></v-text-field>

                <!-- Ngày ban hành (Tích hợp v-menu kết hợp v-date-picker chọn ngày định dạng DD/MM/YYYY) -->
                <v-menu
                    v-model="menuDate"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            :value="formattedDate"
                            label="Ngày ban hành (*)"
                            readonly
                            outlined
                            dense
                            v-bind="attrs"
                            v-on="on"
                            class="mb-3"
                        ></v-text-field>
                    </template>
                    <v-date-picker
                        v-model="form.timeInform"
                        no-title
                        scrollable
                        color="#A62229"
                        @input="menuDate = false"
                    ></v-date-picker>
                </v-menu>

                <!-- Thông tin ban hành (Chọn file .xlsx, .pdf trực tiếp) -->
                <v-file-input
                    v-model="form.fileInform"
                    label="Thông tin ban hành"
                    outlined
                    dense
                    accept=".xlsx, .pdf"
                    prepend-icon=""
                    append-icon="mdi-file-upload-outline"
                    class="mb-3"
                    hide-details
                ></v-file-input>

                <!-- Học kỳ (Lấy từ /api/semester/list) -->
                <v-select
                    v-model="form.semesterId"
                    :items="semesterList"
                    item-text="name"
                    item-value="id"
                    label="Học kỳ (*)"
                    outlined
                    dense
                    class="mb-4"
                ></v-select>

                <!-- TAB CHUYỂN ĐỔI LOẠI PHÍ -->
                <div class="d-flex align-center mb-4 tabs-header border-bottom">
                    <v-btn
                        v-for="(tab, idx) in tabNames"
                        :key="tab.key"
                        text
                        class="text-none px-4 rounded-0 tab-item"
                        :class="{ 'active-tab': activeTab === idx }"
                        @click="activeTab = idx"
                    >
                        {{ tab.label }}
                    </v-btn>
                </div>

                <!-- KHU VỰC NHẬP PHÍ MẶC ĐỊNH -->
                <div class="mb-3 pa-3 grey lighten-4 rounded">
                    <v-text-field
                        v-model="defaultFees[currentTabConfig.key]"
                        :label="currentTabConfig.defaultLabel"
                        outlined
                        dense
                        suffix="VNĐ"
                        hide-details
                        class="mb-2 bg-white"
                        @input="onDefaultFeeChange"
                    ></v-text-field>

                    <v-checkbox
                        v-model="applyDefaults[currentTabConfig.key]"
                        :label="currentTabConfig.applyLabel"
                        dense
                        hide-details
                        class="mt-2"
                        color="#A62229"
                        @change="onToggleApplyDefault"
                    ></v-checkbox>
                </div>

                <!-- BẢNG DANH SÁCH HỌC PHẦN (Ô NHẬP TIỀN GẠCH NGANG DƯỚI) -->
                <v-card outlined class="rounded">
                    <v-simple-table dense>
                        <template v-slot:default>
                            <thead>
                                <tr class="grey lighten-4">
                                    <th class="text-center font-weight-bold" style="width: 60px;">STT</th>
                                    <th class="text-left font-weight-bold">Học phần</th>
                                    <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 0}">Phí ra đề</th>
                                    <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 1}">Phí chấm bài</th>
                                    <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 2}">Phí trông thi</th>
                                    <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 3}">Phí đi lại</th>
                                    <th class="text-right font-weight-bold" style="width: 130px;" :class="{'red--text': activeTab === 4}">Phí TTTN</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in paginatedItemList" :key="item.id">
                                    <td class="text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                    <td>{{ item.name }}</td>
                                    <!-- Phí ra đề -->
                                    <td>
                                        <div class="d-flex align-center justify-end" style="gap: 4px;">
                                            <input type="text" v-model="item.raDe" class="custom-underline-input" />
                                            <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                        </div>
                                    </td>
                                    <!-- Phí chấm bài -->
                                    <td>
                                        <div class="d-flex align-center justify-end" style="gap: 4px;">
                                            <input type="text" v-model="item.chamBai" class="custom-underline-input" />
                                            <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                        </div>
                                    </td>
                                    <!-- Phí trông thi -->
                                    <td>
                                        <div class="d-flex align-center justify-end" style="gap: 4px;">
                                            <input type="text" v-model="item.trongThi" class="custom-underline-input" />
                                            <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                        </div>
                                    </td>
                                    <!-- Phí đi lại -->
                                    <td>
                                        <div class="d-flex align-center justify-end" style="gap: 4px;">
                                            <input type="text" v-model="item.diLai" class="custom-underline-input" />
                                            <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                        </div>
                                    </td>
                                    <!-- Phí TTTN -->
                                    <td>
                                        <div class="d-flex align-center justify-end" style="gap: 4px;">
                                            <input type="text" v-model="item.tttn" class="custom-underline-input" />
                                            <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card>

                <!-- THANH PHÂN TRANG CỐ ĐỊNH 20 BẢN GHI/TRANG -->
                <div class="d-flex align-center justify-space-between mt-3 flex-wrap">
                    <div class="d-flex align-center" style="gap: 8px;">
                        <span>Bản ghi</span>
                        <v-select
                            v-model="itemsPerPage"
                            :items="[20, 50, 100]"
                            dense
                            outlined
                            hide-details
                            style="width: 80px;"
                        />
                        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
                    </div>
                    
                    <div class="d-flex align-center" style="gap: 4px;">
                        <v-btn icon small outlined :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
                            <v-icon>mdi-chevron-left</v-icon>
                        </v-btn>
                        <template v-for="p in totalPages">
                            <v-btn
                                v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
                                :key="p"
                                small
                                depressed
                                :color="p === currentPage ? '#A62229' : 'grey lighten-3'"
                                :dark="p === currentPage"
                                @click="changePage(p)"
                            >
                                {{ p }}
                            </v-btn>
                            <span v-else-if="p === currentPage - 2 || p === currentPage + 2" :key="'dot-' + p">...</span>
                        </template>
                        <v-btn icon small outlined :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
                            <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                    </div>
                </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-3">
                <v-spacer></v-spacer>
                <v-btn text color="grey darken-1" class="text-none px-4" @click="closeDialog" :disabled="loading">
                    Đóng <v-icon right small>mdi-close</v-icon>
                </v-btn>
                <v-btn color="#A62229" dark class="text-none px-5" elevation="0" @click="handleSave" :loading="loading">
                    Lưu <v-icon right small>mdi-content-save</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.tabs-header {
    border-bottom: 2px solid #e0e0e0;
}
.tab-item {
    font-weight: 500;
    color: #666;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
}
.active-tab {
    color: #A62229 !important;
    border-bottom: 2px solid #A62229 !important;
    background-color: #f9f9f9;
}
.custom-underline-input {
    width: 75px;
    border: none;
    border-bottom: 1px solid #757575;
    background: transparent;
    text-align: right;
    font-size: 13px;
    outline: none;
    padding: 2px 0;
    color: #333;
}
.custom-underline-input:focus {
    border-bottom: 1px solid #A62229;
}
</style>