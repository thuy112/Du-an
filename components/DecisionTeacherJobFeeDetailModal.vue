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

            <v-card-text class="pa-5 detail-body">
                <!-- THÔNG TIN CHUNG (CỐ ĐỊNH KHI CUỘN BẢNG) -->
                <div class="mb-3">
                    <v-row dense class="mb-1">
                        <v-col cols="12" sm="6" md="6">
                            <span class="grey--text text--darken-1">Tên ban hành định mức: </span>
                            <span class="font-weight-bold black--text">{{ detailData.name || '-' }}</span>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <span class="grey--text text--darken-1">Kỳ học: </span>
                            <span class="font-weight-bold red--text text--darken-3">{{ formattedSemester }}</span>
                        </v-col>
                    </v-row>

                    <div v-if="detailData.fileInform" class="mb-2">
                        <div class="grey--text text--darken-1 mb-1">File ban hành:</div>
                        <div class="file-box">
                            <span class="d-flex align-center text-truncate" style="gap: 8px;">
                                <v-icon color="#A62229" small>mdi-file</v-icon>
                                <span class="text-truncate">{{ getFileNameFromURL(detailData.fileInform) }}</span>
                            </span>
                            <a
                                :href="detailData.fileInform"
                                target="_blank"
                                rel="noopener"
                                class="text-decoration-none ml-2"
                                title="Tải file"
                            >
                                <v-icon small color="grey darken-2">mdi-download</v-icon>
                            </a>
                        </div>
                    </div>

                    <v-row dense>
                        <v-col cols="12" sm="6" md="6">
                            <span class="grey--text text--darken-1">Ngày ban hành: </span>
                            <span class="font-weight-medium black--text">{{ formatDate(detailData.timeInform || detailData.createdAt) }}</span>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <span class="grey--text text--darken-1 mr-1">Trạng thái: </span>
                            <v-chip
                                small
                                dark
                                :color="detailData.status === 'ACTIVE' ? '#A62229' : 'grey'"
                                class="px-3 font-weight-medium"
                            >
                                {{ detailData.status === 'ACTIVE' ? 'Kích hoạt' : 'Chưa kích hoạt' }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </div>

                <v-divider class="my-3"></v-divider>

                <!-- DANH SÁCH ĐỊNH MỨC -->
                <div class="font-weight-bold mb-2" style="font-size: 16px;">
                    <span class="black--text">Danh sách định mức </span>
                    <span class="red--text text--darken-2">({{ normalizedDetails.length }})</span>
                </div>

                <div class="detail-table-scroll">
                    <v-simple-table dense fixed-header>
                        <template v-slot:default>
                            <thead>
                                <tr class="grey lighten-4">
                                    <th class="text-center font-weight-bold" style="width: 60px;">STT</th>
                                    <th class="text-left font-weight-bold">Học phần</th>
                                    <th class="text-right font-weight-bold" style="width: 110px;">Phí ra đề</th>
                                    <th class="text-right font-weight-bold" style="width: 120px;">Phí chấm bài</th>
                                    <th class="text-right font-weight-bold" style="width: 115px;">Phí trông thi</th>
                                    <th class="text-right font-weight-bold" style="width: 110px;">Phí đi lại</th>
                                    <th class="text-right font-weight-bold" style="width: 110px;">Phí TTTN</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in paginatedDetails" :key="item.id || index">
                                    <td class="text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                    <td>{{ item.name }}</td>
                                    <td class="text-right">{{ formatMoney(item.raDe) }}</td>
                                    <td class="text-right">{{ formatMoney(item.chamBai) }}</td>
                                    <td class="text-right">{{ formatMoney(item.trongThi) }}</td>
                                    <td class="text-right">{{ formatMoney(item.diLai) }}</td>
                                    <td class="text-right">{{ formatMoney(item.tttn) }}</td>
                                </tr>
                                <tr v-if="!paginatedDetails.length">
                                    <td colspan="7" class="text-center grey--text py-4">Không có dữ liệu</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </div>

                <!-- PHÂN TRANG -->
                <div class="d-flex align-center justify-end mt-3" style="gap: 10px;">
                    <v-select
                        v-model="itemsPerPage"
                        :items="[20, 50, 100]"
                        label="Bản ghi"
                        outlined
                        dense
                        hide-details
                        class="pagination-box-select"
                        @change="onPageSizeChange"
                    />

                    <v-text-field
                        :value="currentPage"
                        label="Trang"
                        outlined
                        dense
                        hide-details
                        class="pagination-box-input"
                        @change="onPageInputChange"
                    />

                    <v-btn
                        depressed
                        class="pagination-arrow-btn"
                        :disabled="currentPage <= 1"
                        @click="changePage(currentPage - 1)"
                    >
                        <v-icon color="grey darken-1">mdi-chevron-left</v-icon>
                    </v-btn>

                    <v-btn
                        depressed
                        class="pagination-arrow-btn"
                        :disabled="currentPage >= totalPages"
                        @click="changePage(currentPage + 1)"
                    >
                        <v-icon color="grey darken-1">mdi-chevron-right</v-icon>
                    </v-btn>
                </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-3">
                <v-spacer></v-spacer>
                <v-btn outlined color="grey darken-1" class="text-none px-4" @click="closeDialog">
                    Đóng <v-icon right small>mdi-close</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

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
            if (val) {
                this.currentPage = 1;
            }
        },
        open(val) {
            this.$emit('input', val);
        },
        itemData() {
            this.currentPage = 1;
        }
    },
    computed: {
        detailData() {
            return this.itemData || {};
        },
        formattedSemester() {
            const sem = this.detailData.semester;
            if (sem && typeof sem === 'object') {
                if (sem.name && sem.code) return `${sem.name} - ${sem.code}`;
                return sem.name || sem.code || '-';
            }
            return this.detailData.semesterName || sem || '-';
        },
        normalizedDetails() {
            const list =
                this.detailData.estimationTeacherFees ||
                this.detailData.details ||
                [];
            if (!Array.isArray(list)) return [];
            return list.map(item => ({
                id: item.id || item.term?.id,
                name: item.term?.name || item.termName || item.name || '-',
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
        formatMoney(val) {
            const num = Number(val ?? 0);
            const safeNum = Number.isNaN(num) ? 0 : num;
            if (typeof this.$money === 'function') {
                return `${this.$money(safeNum)}đ`;
            }
            return `${safeNum.toLocaleString('vi-VN')}đ`;
        },
        getFileNameFromURL(url) {
            if (!url) return '';
            if (url.includes('?o=')) {
                const parts = url.split('?o=');
                return parts[parts.length - 1];
            }
            const cleanUrl = String(url).split('?')[0];
            const segments = cleanUrl.split('/');
            return segments[segments.length - 1] || cleanUrl;
        },
        onPageSizeChange() {
            this.currentPage = 1;
        },
        onPageInputChange(val) {
            const parsed = parseInt(val, 10);
            if (Number.isNaN(parsed)) {
                this.$forceUpdate();
                return;
            }
            const clamped = Math.min(Math.max(parsed, 1), this.totalPages);
            this.changePage(clamped);
            this.$forceUpdate();
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        }
    }
};
</script>

<style scoped>
.detail-body {
    max-height: 75vh;
    overflow-y: auto;
}
.file-box {
    height: 36px;
    background-color: #ecebe9;
    border-radius: 4px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
}
.detail-table-scroll {
    max-height: 340px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}
.pagination-box-select {
    width: 32px;
    max-width: 92px;
}
.pagination-box-input {
    width: 32px;
    max-width: 64px;
}
.pagination-box-input >>> input {
    text-align: left;
}
.pagination-arrow-btn {
    min-width: 32px !important;
    width: 32px;
    height: 32px !important;
    padding: 0 !important;
    border-radius: 6px !important;
    background-color: #f5f5f5 !important;
}
</style>