<script>
export default {
    name: "DecisionTeacherJobFeeDetailModal",
    props: {
        value: { type: Boolean, default: false },
        itemData: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            open: this.value,
            currentPage: 1,
            itemsPerPage: 20,
        };
    },
    watch: {
        value(val) {
            this.open = val;
        },
        open(val) {
            this.$emit('input', val);
        }
    },
    computed: {
        detailData() {
            return this.itemData || {};
        },
        normalizedDetails() {
            // Lấy trực tiếp mảng estimationTeacherFees có sẵn trong object dòng dữ liệu
            const list = this.detailData.estimationTeacherFees || [];
            return list.map(item => ({
                id: item.id || item.term?.id,
                name: item.term?.name || '-',
                raDe: item.examPreparationFee ?? 0,
                chamBai: item.gradingFee ?? 0,
                trongThi: item.proctoringFee ?? 0,
                diLai: item.travelExpenses ?? 0,
                tttn: item.graduationInternFee ?? 0
            }));
        },
        totalPages() {
            if (!this.normalizedDetails.length) return 1;
            return Math.ceil(this.normalizedDetails.length / this.itemsPerPage) || 1;
        },
        paginatedDetails() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.normalizedDetails.slice(start, end);
        }
    },
    methods: {
        closeDialog() {
            this.open = false;
        },
        formatDate(dateStr) {
            return dateStr || '-';
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
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
                <span class="text-h6 font-weight-bold">Chi tiết quyết định học phí</span>
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
                    <div class="mb-4">
                        <div class="d-flex flex-wrap mb-2" style="gap: 24px;">
                            <div>
                                <span class="grey--text text--darken-1">Tên ban hành định mức: </span>
                                <span class="font-weight-bold black--text">{{ detailData.name || '-' }}</span>
                            </div>
                            <div>
                                <span class="grey--text text--darken-1">Kỳ học: </span>
                                <span class="font-weight-medium red--text text--darken-3">{{ detailData.semesterName || detailData.semester?.name || '-' }}</span>
                            </div>
                        </div>

                        <div class="d-flex align-center mb-2" style="gap: 8px;">
                            <span class="grey--text text--darken-1">File ban hành:</span>
                            <v-btn
                                v-if="detailData.fileInform"
                                icon
                                small
                                :href="detailData.fileInform"
                                target="_blank"
                                color="#A62229"
                                title="Tải file"
                            >
                                <v-icon>mdi-file-download-outline</v-icon>
                            </v-btn>
                            <a v-if="detailData.fileInform" :href="detailData.fileInform" target="_blank" class="text-decoration-none red--text text--darken-3 text-truncate" style="max-width: 500px;">
                                {{ detailData.fileInform.split('/').pop() }}
                            </a>
                            <span v-else class="grey--text">Không có file</span>
                        </div>

                        <div class="d-flex flex-wrap mb-2" style="gap: 24px;">
                            <div>
                                <span class="grey--text text--darken-1">Ngày ban hành: </span>
                                <span class="font-weight-medium">{{ formatDate(detailData.timeInform || detailData.createdAt) }}</span>
                            </div>
                            <div>
                                <span class="grey--text text--darken-1">Trạng thái: </span>
                                <v-chip small dark :color="detailData.status === 'ACTIVE' ? '#A62229' : 'grey'" class="px-3 ml-1">
                                    {{ detailData.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
                                </v-chip>
                            </div>
                        </div>
                    </div>

                    <v-divider class="mb-4"></v-divider>

                    <!-- DANH SÁCH ĐỊNH MỨC -->
                    <div class="text-subtitle-1 font-weight-bold mb-2 red--text text--darken-3">
                        Danh sách định mức (<span>{{ detailData.details ? detailData.details.length : 0 }}</span>)
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
                                    <tr v-for="(item, index) in paginatedDetails" :key="item.id || index">
                                        <td class="text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                        <td>{{ item.termName || item.name || '-' }}</td>
                                        <td class="text-center">{{ item.raDe || 0 }}đ</td>
                                        <td class="text-center">{{ item.chamBai || 0 }}đ</td>
                                        <td class="text-center">{{ item.trongThi || 0 }}đ</td>
                                        <td class="text-center">{{ item.diLai || 0 }}đ</td>
                                        <td class="text-center">{{ item.tttn || 0 }}đ</td>
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
                                <span v-else-if="p === currentPage - 2 || p === currentPage + 2" :key="'dot-' + p">...</span>
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
                <v-btn color="#A62229" dark class="text-none px-5" elevation="0" @click="closeDialog">
                    Đóng <v-icon right small>mdi-close</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>