<script>
import { reAssessmentTypeList, statusList } from "~/consts/list";
import paymentCategoryServices from "~/services/redefend/paymentCategoryServices";
import trainingMethodServices from "~/services/trainingMethodServices";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    code: "",
    trainingMethodId: null,
};

export default {
    name: "PaymentCategoryView",
    components: {},
    middleware: 'authenticated',
    data: () => ({
        headers: [
            { value: "stt", text: "STT", align: "center", sortable: false, width: "60px" },
            { value: "code", text: "Vai trò", sortable: false, width: "220px" },
            { value: "unitPrice", text: "Giá tiền", align: "left", sortable: true, width: "180px" },
            { value: "trainingMethod.name", text: "Hình thức đào tạo", sortable: false, width: "220px" },
            { value: "actions", text: "Chức năng", align: "center", sortable: false, width: "100px" },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        search: { ...INIT_SEARCH },
        totalPage: 0,
        totalRecord: 0,
        pageInput: 1,
        isLoading: false,
        statusList,
        trainingMethodList: [],
        reAssessmentTypeList,

        // Dữ liệu cho modal Thêm mới
        isAddModalOpen: false,
        isSubmitting: false,
        addForm: {
            code: null,
            unitPrice: '',
            trainingMethodId: null,
        },
    }),
    computed: {
        totalPages() {
            return this.totalPage > 0 ? this.totalPage : 1
        }
    },
    created() {
        this.getList();
        this.getTrainingMethod();
    },
    methods: {
        getCodeName(code) {
            return this.$getText(code, this.reAssessmentTypeList);
        },
        
        async getTrainingMethod() {
            try {
                const res = await trainingMethodServices.getAll({ status: "ACTIVE" });
                const raw = res?.data !== undefined ? res.data : res
                this.trainingMethodList = raw?.data || raw?.items || (Array.isArray(raw) ? raw : []);
            } catch (er) {
                console.log(er);
            }
        },

        openAdd() {
            this.addForm = {
                code: null,
                unitPrice: '',
                trainingMethodId: null,
            };
            this.isAddModalOpen = true;
        },

        closeAddModal() {
            this.isAddModalOpen = false;
        },

        async handleSaveAdd() {
            if (!this.addForm.code) {
                alert('Vui lòng chọn vai trò!');
                return;
            }
            if (this.addForm.unitPrice === '' || this.addForm.unitPrice === null) {
                alert('Vui lòng nhập giá tiền!');
                return;
            }
            if (!this.addForm.trainingMethodId) {
                alert('Vui lòng chọn hình thức đào tạo!');
                return;
            }

            try {
                this.isSubmitting = true;
                const payload = {
                    code: this.addForm.code,
                    unitPrice: Number(this.addForm.unitPrice.toString().replace(/,/g, '')),
                    trainingMethodId: this.addForm.trainingMethodId,
                    channel: 'CMS',
                    transid: '813822ae-73ad-4969-b2a2-d755026195b4'
                };

                const res = await paymentCategoryServices.add(payload);
                const responseWrapper = res?.data !== undefined ? res.data : res;
                const errorCode = responseWrapper?.error?.code ?? responseWrapper?.code;
                const hasBackendError = errorCode !== undefined && errorCode !== null && Number(errorCode) !== 0;

                if ((res?.success === true || !hasBackendError)) {
                    if (typeof this.$showSuccess === 'function') {
                        this.$showSuccess('Thêm mới thành công');
                    } else if (this.$toast) {
                        this.$toast.success('Thêm mới thành công');
                    } else {
                        alert('Thêm mới thành công');
                    }
                    this.isAddModalOpen = false;
                    await this.getList();
                }
            } catch (err) {
                console.error('Lỗi thêm mới cấu hình định mức:', err);
            } finally {
                this.isSubmitting = false;
            }
        },
        
        handleUpdate(item) {
            if (this.$refs.PaymentCategoryUpdate) {
                this.$refs.PaymentCategoryUpdate.open = true;
                this.$refs.PaymentCategoryUpdate.trainingMethodList = [...this.trainingMethodList];
                this.$refs.PaymentCategoryUpdate.getUpdate({ ...item });
            }
        },

        async getList() {
            try {
                this.isLoading = true;
                const params = {
                    ...this.pageInfo,
                    ...this.search,
                    channel: 'CMS',
                    transid: '762b72dc-82fe-4238-a82c-d874bc098324'
                };

                const res = await paymentCategoryServices.getList(params);
                const responseWrapper = res?.data !== undefined ? res.data : res;
                const pageData = responseWrapper?.data !== undefined ? responseWrapper.data : responseWrapper;

                if (res.success || pageData) {
                    this.list = pageData.data || pageData.items || (Array.isArray(pageData) ? pageData : []);
                    this.totalPage = pageData.totalPages || Math.ceil((pageData.totalRecords || pageData.total || this.list.length) / this.pageInfo.pageSize) || 0;
                    this.totalRecord = pageData.totalRecords || pageData.total || this.list.length;
                }
            } catch (e) {
                console.error(e);
                this.list = [];
                this.totalRecord = 0;
                this.totalPage = 0;
            } finally {
                this.isLoading = false;
            }
        },

        changePageSize(val) {
            this.pageInfo.pageSize = Number(val) || 50;
            this.pageInfo.pageIndex = 1;
            this.pageInput = 1;
            this.getList();
        },

        changePage(val) {
            if (val >= 1 && val <= this.totalPages) {
                this.pageInfo.pageIndex = val;
                this.pageInput = val;
                this.getList();
            }
        },

        goToPage() {
            let target = parseInt(this.pageInput, 10);
            if (isNaN(target) || target < 1) target = 1;
            if (target > this.totalPages) target = this.totalPages;
            this.pageInfo.pageIndex = target;
            this.pageInput = target;
            this.getList();
        },

        handleReset() {
            this.search = { ...INIT_SEARCH };
            this.pageInfo = { ...INIT_PAGE_INFO };
            this.pageInput = 1;
            this.getList();
        },

        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.pageInput = 1;
            this.getList();
        },
    },
};
</script>

<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="list"
            :items-per-page="pageInfo.pageSize"
            :loading="isLoading"
            checkbox-color="primary"
            fixed-header
            hide-default-footer
            item-key="id"
            loading-text="Đang tải dữ liệu..."
            max-height="calc(100vh - 300px)"
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <v-row class="mb-3 align-center">
                    <v-col class="fs-17 fw-500" cols="12" md="auto">
                        Cấu hình định mức thanh toán giảng viên <span class="primary--text">({{ totalRecord }})</span>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="12" md="auto" class="d-flex align-center gap-8">
                        <base-select
                            v-model="search.code"
                            hide-details
                            clearable
                            item-text="text"
                            item-value="value"
                            :items="reAssessmentTypeList"
                            label="Vai trò"
                            style="width: 200px;"
                        ></base-select>

                        <base-select
                            v-model="search.trainingMethodId"
                            hide-details
                            clearable
                            :items="trainingMethodList"
                            item-text="name"
                            item-value="id"
                            label="Hình thức đào tạo"
                            style="width: 200px;"
                        ></base-select>

                        <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                                <v-icon
                                    color="primary"
                                    v-bind="attrs"
                                    @click="handleReset"
                                    v-on="on"
                                    class="cursor-pointer"
                                >mdi-refresh</v-icon>
                            </template>
                            <span>Reset bộ lọc</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                                <v-btn
                                    color="primary"
                                    elevation="0"
                                    v-bind="attrs"
                                    @click="handleSearch"
                                    v-on="on"
                                >
                                    <v-icon>mdi-magnify</v-icon>
                                </v-btn>
                            </template>
                            <span>Tìm kiếm</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                                <v-btn
                                    color="primary"
                                    elevation="0"
                                    v-bind="attrs"
                                    @click="openAdd"
                                    v-on="on"
                                >
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn>
                            </template>
                            <span>Thêm mới</span>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </template>

            <template #[`item.stt`]="{ index }">
                <span>{{ (pageInfo.pageIndex - 1) * pageInfo.pageSize + index + 1 }}</span>
            </template>

            <template #[`item.unitPrice`]="{ item }">
                {{ Number(item.unitPrice || 0).toLocaleString('en-US') }}đ
            </template>

            <template #[`item.code`]="{ item }">
                {{ getCodeName(item.code) }}
            </template>

            <template #[`item.trainingMethod.name`]="{ item }">
                {{ item.trainingMethod?.name || '---' }}
            </template>

            <template #[`item.actions`]="{ item }">
                <div class="d-flex justify-center">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                color="warning"
                                dark
                                v-bind="attrs"
                                @click="handleUpdate(item)"
                                v-on="on"
                            >
                                mdi-pencil
                            </v-icon>
                        </template>
                        <span>Sửa</span>
                    </v-tooltip>
                </div>
            </template>
        </v-data-table>

        <!-- Phân trang -->
        <div class="d-flex justify-end align-center mt-4">
            <div class="d-flex align-center">
                <span class="text-caption mr-2">Bản ghi</span>
                <v-select
                    v-model="pageInfo.pageSize"
                    :items="[10, 20, 50, 100]"
                    dense
                    outlined
                    hide-details
                    class="mr-4"
                    style="width: 80px;"
                    @change="changePageSize"
                ></v-select>
                <span class="text-caption mr-2">Trang</span>
                <v-text-field
                    v-model="pageInput"
                    dense
                    outlined
                    hide-details
                    class="mr-2 text-center"
                    style="width: 60px;"
                    @keyup.enter="goToPage"
                ></v-text-field>
                <v-btn color="primary" class="mr-4" height="40" @click="goToPage">Đi</v-btn>
                <v-btn
                    icon
                    outlined
                    class="mr-1"
                    :disabled="pageInfo.pageIndex <= 1"
                    @click="changePage(pageInfo.pageIndex - 1)"
                >
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn
                    color="primary"
                    class="mr-1"
                    min-width="36"
                    height="36"
                >
                    {{ pageInfo.pageIndex }}
                </v-btn>
                <v-btn
                    icon
                    outlined
                    :disabled="pageInfo.pageIndex >= totalPages"
                    @click="changePage(pageInfo.pageIndex + 1)"
                >
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </div>
        </div>

        <!-- MODAL THÊM MỚI -->
        <v-dialog v-model="isAddModalOpen" max-width="600px" persistent>
            <v-card>
                <v-card-title class="headline error-color white--text py-3 px-4 d-flex align-center justify-space-between" style="background-color: #a62229; color: white; flex-wrap: nowrap;">
                    <span class="text-truncate mr-2">Thêm mới cấu hình định mức thanh toán giảng viên</span>
                    <v-btn icon dark class="flex-shrink-0" @click="closeAddModal">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                
                <v-card-text class="pa-4 pt-6">
                    <v-row dense>
                        <v-col cols="12" class="mb-3">
                            <v-select
                                v-model="addForm.code"
                                :items="reAssessmentTypeList"
                                item-text="text"
                                item-value="value"
                                label="Vai trò (*)"
                                outlined
                                dense
                                hide-details
                            ></v-select>
                        </v-col>

                        <v-col cols="12" class="mb-3">
                            <v-text-field
                                v-model="addForm.unitPrice"
                                label="Giá tiền *"
                                outlined
                                dense
                                hide-details
                                suffix="VNĐ"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-select
                                v-model="addForm.trainingMethodId"
                                :items="trainingMethodList"
                                item-text="name"
                                item-value="id"
                                label="Hình thức đào tạo (*)"
                                outlined
                                dense
                                hide-details
                            ></v-select>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions class="pa-3 justify-end">
                    <v-btn text class="px-4" @click="closeAddModal">
                        Đóng <v-icon right small>mdi-close</v-icon>
                    </v-btn>
                    <v-btn 
                        color="error" 
                        class="px-4 white--text" 
                        style="background-color: #a62229;"
                        :loading="isSubmitting"
                        @click="handleSaveAdd"
                    >
                        Lưu <v-icon right small>mdi-content-save</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <payment-category-update ref="PaymentCategoryUpdate" @reload="getList" />
    </div>
</template>

<style scoped>
:deep(.v-data-table__wrapper) {
    max-height: calc(100vh - 250px);
}
.cursor-pointer {
    cursor: pointer;
}
.gap-8 {
    gap: 8px;
}
</style>