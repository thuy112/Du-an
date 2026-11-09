<script>
import decisionTeacherJobFeeService from "~/services/decisionTeacherJobFeeService";

export default {
    name: "DecisionTeacherJobFeeUpdateModal",
    props: {
        value: { type: Boolean, default: false },
        itemData: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            open: this.value,
            loading: false,
            saving: false,
            form: {
                id: null,
                name: '',
                timeInform: '',
                fileInform: '',
                semesterId: '',
            },
            semesterList: [],
            itemList: [],
            currentPage: 1,
            itemsPerPage: 20,

            // Quản lý tab đổi phí mặc định nhanh
            activeTab: 'raDe',
            defaultFees: {
                raDe: '',
                chamBai: '',
                trongThi: '',
                diLai: '',
                tttn: ''
            },
            applyDefaultFlags: {
                raDe: false,
                chamBai: false,
                trongThi: false,
                diLai: false,
                tttn: false
            }
        };
    },
    watch: {
        value(val) {
            this.open = val;
            if (val && this.itemData && this.itemData.id) {
                this.populateData();
            }
        },
        open(val) {
            this.$emit('input', val);
        },
        itemData(val) {
            if (val && val.id && this.open) {
                this.populateData();
            }
        }
    },
    computed: {
        totalPages() {
            if (!this.itemList.length) return 1;
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
        async populateData() {
            this.form.id = this.itemData.id;
            this.form.name = this.itemData.name || '';
            this.form.timeInform = this.itemData.timeInform || '';
            this.form.fileInform = this.itemData.fileInform || '';
            this.form.semesterId = this.itemData.semester?.id || '';

            // Tải danh sách học kỳ
            await this.loadSemesters();

            // Map danh sách định mức phí cũ để chỉnh sửa
            const rawFees = this.itemData.estimationTeacherFees || [];
            this.itemList = rawFees.map(item => ({
                id: item.term?.id || item.id,
                name: item.term?.name || '-',
                raDe: item.examPreparationFee ?? 0,
                chamBai: item.gradingFee ?? 0,
                trongThi: item.proctoringFee ?? 0,
                diLai: item.travelExpenses ?? 0,
                tttn: item.graduationInternFee ?? 0
            }));
            this.currentPage = 1;
        },
        async loadSemesters() {
            try {
                // Gọi trực tiếp đúng endpoint danh sách học kỳ với query params
                const res = await decisionTeacherJobFeeService.getSemesters ? 
                    await decisionTeacherJobFeeService.getSemesters() : 
                    await this.$axios.get('/api/semester/list', {
                        params: { status: 'ACTIVE', channel: 'CMS' }
                    });

                const raw = res?.data !== undefined ? res.data : res;
                this.semesterList = raw?.data || raw || [];
            } catch (e) {
                console.error("Lỗi tải học kỳ:", e);
            }
        },
        applyDefaultFee(type) {
            const val = Number(this.defaultFees[type]) || 0;
            if (this.applyDefaultFlags[type]) {
                this.itemList.forEach(item => {
                    item[type] = val;
                });
            }
        },
        onDefaultFeeInput(type) {
            if (this.applyDefaultFlags[type]) {
                this.applyDefaultFee(type);
            }
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        async handleUpdate() {
            if (!this.form.name || !this.form.semesterId) {
                if (typeof this.$showError === 'function') {
                    this.$showError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
                }
                return;
            }

            this.saving = true;
            try {
                const payload = {
                    id: this.form.id,
                    name: this.form.name,
                    timeInform: this.form.timeInform.includes('T') ? this.form.timeInform : `${this.form.timeInform}T00:00:00`,
                    fileInform: this.form.fileInform || "",
                    semesterId: this.form.semesterId,
                    details: this.itemList.map(item => ({
                        termId: item.id,
                        raDe: Number(item.raDe) || 0,
                        chamBai: Number(item.chamBai) || 0,
                        trongThi: Number(item.trongThi) || 0,
                        diLai: Number(item.diLai) || 0,
                        tttn: Number(item.tttn) || 0
                    })),
                    channel: "CMS"
                };

                const res = await decisionTeacherJobFeeService.updateItem(payload, "CMS");
                
                if (res && res.code !== undefined && res.code !== 0) {
                    if (typeof this.$showError === 'function') {
                        this.$showError(res.message || 'Cập nhật thất bại');
                    }
                    return;
                }

                if (typeof this.$showSuccess === 'function') {
                    this.$showSuccess("Cập nhật thành công");
                }
                this.open = false;

                if (this.$parent && typeof this.$parent.loadData === 'function') {
                    this.$parent.loadData();
                }
            } catch (error) {
                console.error("Lỗi cập nhật:", error);
                if (typeof this.$showError === 'function') {
                    this.$showError("Cập nhật thất bại");
                }
            } finally {
                this.saving = false;
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
                <span class="text-h6 font-weight-bold">Cập nhật định mức thanh toán theo công việc cho GV</span>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-5" style="max-height: 75vh; overflow-y: auto;">
                <div v-if="loading" class="text-center py-6">
                    <v-progress-circular indeterminate color="#A62229"></v-progress-circular>
                </div>

                <template v-else>
                    <!-- THÔNG TIN CHUNG -->
                    <v-text-field
                        v-model="form.name"
                        label="Tên ban hành định mức (*)"
                        outlined
                        dense
                        class="mb-3"
                    ></v-text-field>

                    <v-select
                        v-model="form.semesterId"
                        :items="semesterList"
                        item-text="name"
                        item-value="id"
                        label="Học kỳ (*)"
                        outlined
                        dense
                        class="mb-3"
                    ></v-select>

                    <v-text-field
                        v-model="form.timeInform"
                        label="Ngày ban hành (*)"
                        outlined
                        dense
                        class="mb-3"
                    ></v-text-field>

                    <v-text-field
                        v-model="form.fileInform"
                        label="Thông tin ban hành (File)"
                        outlined
                        dense
                        class="mb-3"
                    ></v-text-field>

                    <!-- THANH TAB CHỌN LOẠI PHÍ & ÁP DỤNG HÀNG LOẠT -->
                    <div class="d-flex mb-2" style="border-bottom: 1px solid #ccc;">
                        <v-btn text small :class="activeTab === 'raDe' ? 'red--text text--darken-3 font-weight-bold' : ''" @click="activeTab = 'raDe'">Ra Đề</v-btn>
                        <v-btn text small :class="activeTab === 'chamBai' ? 'red--text text--darken-3 font-weight-bold' : ''" @click="activeTab = 'chamBai'">Chấm Bài</v-btn>
                        <v-btn text small :class="activeTab === 'trongThi' ? 'red--text text--darken-3 font-weight-bold' : ''" @click="activeTab = 'trongThi'">Trông Thi</v-btn>
                        <v-btn text small :class="activeTab === 'diLai' ? 'red--text text--darken-3 font-weight-bold' : ''" @click="activeTab = 'diLai'">Đi Lại</v-btn>
                        <v-btn text small :class="activeTab === 'tttn' ? 'red--text text--darken-3 font-weight-bold' : ''" @click="activeTab = 'tttn'">TTTN</v-btn>
                    </div>

                    <!-- TAB 1: RA ĐỀ -->
                    <div v-if="activeTab === 'raDe'" class="mb-4">
                        <v-text-field
                            v-model="defaultFees.raDe"
                            label="Phí mặc định"
                            outlined
                            dense
                            suffix="VNĐ"
                            @input="onDefaultFeeInput('raDe')"
                            class="mb-1"
                        ></v-text-field>
                        <v-checkbox
                            v-model="applyDefaultFlags.raDe"
                            label="Áp dụng phí ra đề mặc định"
                            dense
                            hide-details
                            @change="applyDefaultFee('raDe')"
                        ></v-checkbox>
                    </div>

                    <!-- TAB 2: CHẤM BÀI -->
                    <div v-if="activeTab === 'chamBai'" class="mb-4">
                        <v-text-field
                            v-model="defaultFees.chamBai"
                            label="Phí mặc định"
                            outlined
                            dense
                            suffix="VNĐ"
                            @input="onDefaultFeeInput('chamBai')"
                            class="mb-1"
                        ></v-text-field>
                        <v-checkbox
                            v-model="applyDefaultFlags.chamBai"
                            label="Áp dụng phí chấm bài mặc định"
                            dense
                            hide-details
                            @change="applyDefaultFee('chamBai')"
                        ></v-checkbox>
                    </div>

                    <!-- TAB 3: TRÔNG THI -->
                    <div v-if="activeTab === 'trongThi'" class="mb-4">
                        <v-text-field
                            v-model="defaultFees.trongThi"
                            label="Phí mặc định"
                            outlined
                            dense
                            suffix="VNĐ"
                            @input="onDefaultFeeInput('trongThi')"
                            class="mb-1"
                        ></v-text-field>
                        <v-checkbox
                            v-model="applyDefaultFlags.trongThi"
                            label="Áp dụng phí trông thi mặc định"
                            dense
                            hide-details
                            @change="applyDefaultFee('trongThi')"
                        ></v-checkbox>
                    </div>

                    <!-- TAB 4: ĐI LẠI -->
                    <div v-if="activeTab === 'diLai'" class="mb-4">
                        <v-text-field
                            v-model="defaultFees.diLai"
                            label="Phí mặc định"
                            outlined
                            dense
                            suffix="VNĐ"
                            @input="onDefaultFeeInput('diLai')"
                            class="mb-1"
                        ></v-text-field>
                        <v-checkbox
                            v-model="applyDefaultFlags.diLai"
                            label="Áp dụng phí đi lại mặc định"
                            dense
                            hide-details
                            @change="applyDefaultFee('diLai')"
                        ></v-checkbox>
                    </div>

                    <!-- TAB 5: TTTN -->
                    <div v-if="activeTab === 'tttn'" class="mb-4">
                        <v-text-field
                            v-model="defaultFees.tttn"
                            label="Phí mặc định"
                            outlined
                            dense
                            suffix="VNĐ"
                            @input="onDefaultFeeInput('tttn')"
                            class="mb-1"
                        ></v-text-field>
                        <v-checkbox
                            v-model="applyDefaultFlags.tttn"
                            label="Áp dụng phí TTTN mặc định"
                            dense
                            hide-details
                            @change="applyDefaultFee('tttn')"
                        ></v-checkbox>
                    </div>

                    <!-- DANH SÁCH ĐỊNH MỨC -->
                    <div class="text-subtitle-1 font-weight-bold mb-2 red--text text--darken-3">
                        Danh sách định mức (<span>{{ itemList.length }}</span>)
                    </div>

                    <v-card outlined class="rounded">
                        <v-simple-table dense>
                            <template v-slot:default>
                                <thead>
                                    <tr class="grey lighten-4">
                                        <th class="text-center font-weight-bold" style="width: 60px;">STT</th>
                                        <th class="text-left font-weight-bold">Học phần</th>
                                        <th class="text-center font-weight-bold" style="width: 100px;">Phí ra đề</th>
                                        <th class="text-center font-weight-bold" style="width: 100px;">Phí chấm bài</th>
                                        <th class="text-center font-weight-bold" style="width: 100px;">Phí trông thi</th>
                                        <th class="text-center font-weight-bold" style="width: 100px;">Phí đi lại</th>
                                        <th class="text-center font-weight-bold" style="width: 100px;">Phí TTTN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in paginatedItemList" :key="item.id || index">
                                        <td class="text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                        <td>{{ item.name }}</td>
                                        <td class="text-center"><v-text-field v-model.number="item.raDe" dense outlined hide-details class="my-1" /></td>
                                        <td class="text-center"><v-text-field v-model.number="item.chamBai" dense outlined hide-details class="my-1" /></td>
                                        <td class="text-center"><v-text-field v-model.number="item.trongThi" dense outlined hide-details class="my-1" /></td>
                                        <td class="text-center"><v-text-field v-model.number="item.diLai" dense outlined hide-details class="my-1" /></td>
                                        <td class="text-center"><v-text-field v-model.number="item.tttn" dense outlined hide-details class="my-1" /></td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-card>

                    <!-- PHÂN TRANG -->
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
                            </template>
                            <v-btn icon small outlined :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>
                        </div>
                    </div>
                </template>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-3">
                <v-spacer></v-spacer>
                <v-btn text class="text-none px-4" @click="closeDialog">Đóng</v-btn>
                <v-btn color="#A62229" dark class="text-none px-5" elevation="0" :loading="saving" @click="handleUpdate">
                    Lưu <v-icon right small>mdi-content-save</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>