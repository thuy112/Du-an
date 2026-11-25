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
                <v-form ref="form" lazy-validation @submit.prevent>
                    <!-- Tên ban hành -->
                    <v-text-field
                        v-model="form.name"
                        label="Tên ban hành (*)"
                        outlined
                        dense
                        class="mb-2"
                        :rules="[v => !!(v && String(v).trim()) || 'Vui lòng nhập đủ thông tin']"
                    ></v-text-field>

                    <!-- Ngày ban hành -->
                    <div class="mb-2">
                        <base-date-picker
                            v-model="form.timeInform"
                            label="Ngày ban hành"
                            required
                        />
                        <div v-if="submitted && !form.timeInform" class="field-error-text">
                            Vui lòng nhập đủ thông tin
                        </div>
                    </div>

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
                        :rules="[v => (v !== null && v !== undefined && v !== '') || 'Vui lòng nhập đủ thông tin']"
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
                                                <input
                                                    type="text"
                                                    v-model="item.raDe"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isJobFeeMissing(item, 'raDe') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                        <!-- Phí chấm bài -->
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.chamBai"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isJobFeeMissing(item, 'chamBai') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                        <!-- Phí trông thi -->
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.trongThi"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isJobFeeMissing(item, 'trongThi') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                        <!-- Phí đi lại -->
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.diLai"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isJobFeeMissing(item, 'diLai') }"
                                                />
                                                <span class="grey--text text--darken-2" style="font-size: 13px;">VNĐ</span>
                                            </div>
                                        </td>
                                        <!-- Phí TTTN -->
                                        <td>
                                            <div class="d-flex align-center justify-end" style="gap: 4px;">
                                                <input
                                                    type="text"
                                                    v-model="item.tttn"
                                                    class="custom-underline-input"
                                                    :class="{ 'custom-underline-input--error': submitted && isJobFeeMissing(item, 'tttn') }"
                                                />
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
                </v-form>
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

<script>
import decisionTeacherJobFeeService from "~/services/decisionTeacherJobFeeService";
import uploadServices from "~/services/uploadServices";
import BaseDatePicker from "~/components/Base/DatePicker.vue";

const FEE_KEYS = ['raDe', 'chamBai', 'trongThi', 'diLai', 'tttn'];

export default {
    name: "DecisionTeacherJobFeeAddModal",
    components: {
        BaseDatePicker,
    },
    props: {
        value: { type: Boolean, default: false },
    },
    data() {
        return {
            open: this.value,
            loading: false,
            submitted: false,
            activeTab: 0, // 0: Ra Đề, 1: Chấm Bài, 2: Trông Thi, 3: Đi Lại, 4: TTTN

            form: {
                name: "",
                timeInform: "",
                fileInform: null, // Lưu file được chọn (.xlsx, .pdf)
                semesterId: null,
            },

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
                this.submitted = false;
                this.loadSemesters();
                this.loadTermsForTable();
            }
        },
        open(val) {
            this.$emit('input', val);
            if (!val) {
                this.submitted = false;
                if (this.$refs.form) {
                    this.$refs.form.resetValidation();
                }
            }
        }
    },
    computed: {
        currentTabConfig() {
            return this.tabNames[this.activeTab];
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
        isJobFeeMissing(item, key) {
            const val = item?.[key];
            return val === null || val === undefined || String(val).trim() === '';
        },
        hasMissingJobFees() {
            return this.itemList.some(item => FEE_KEYS.some(key => this.isJobFeeMissing(item, key)));
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
        async handleSave() {
            this.submitted = true;
            const isFormValid = this.$refs.form ? this.$refs.form.validate() : true;
            const missingRequired = !this.form.name || !String(this.form.name).trim() || !this.form.timeInform || !this.form.semesterId;
            const missingFees = this.hasMissingJobFees();

            if (!isFormValid || missingRequired || missingFees) {
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
                        return;
                    }

                    fileInform = uploadRes.data.url;
                }

                const payload = {
                    name: this.form.name,
                    timeInform: this.form.timeInform,
                    fileInform,
                    semesterId: this.form.semesterId,
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
                    return;
                }

                if (typeof this.$showSuccess === 'function') {
                    this.$showSuccess("Thêm mới thành công");
                }
                this.open = false;

                if (this.$parent && typeof this.$parent.loadData === 'function') {
                    this.$parent.loadData();
                }
            } catch (error) {
                console.error("Lỗi thêm mới:", error);
            } finally {
                this.loading = false;
            }
        },
    }
};
</script>

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
.field-error-text {
    color: #e53935;
    font-size: 12px;
    margin-top: 4px;
    padding-left: 12px;
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
.custom-underline-input--error {
    border-bottom: 1.5px solid #e53935 !important;
}
</style>