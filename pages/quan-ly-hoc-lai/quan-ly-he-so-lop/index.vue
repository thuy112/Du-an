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
            item-key="teacher_id"
            loading-text="Đang tải dữ liệu..."
            max-height="calc(100vh - 300px)"
            no-data-text="Không có dữ liệu"
        >
            <template #top>
                <v-row class="mb-3">
                    <v-col class="fs-17 fw-500" cols="12" md="auto">
                        Danh sách hệ số lớp
                        <span class="primary--text">( {{ totalRecord }} )</span>
                    </v-col>

                    <v-row dense justify="end">
                        <v-col cols="12" md="auto">
                            <base-text-field
                                v-model="search.search"
                                hide-details
                                label="Tìm kiếm"
                            ></base-text-field>
                        </v-col>
                        <v-col cols="12" md="auto">
                            <base-text-field
                                v-model="search.coefficient"
                                hide-details
                                label="Tìm theo hệ số"
                                type="number"
                                step="0.1"
                                min="0"
                            ></base-text-field>
                        </v-col>
                        <v-col class="d-flex align-center gap-8 toolbar-actions" cols="auto">
                            <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <v-icon
                                        color="primary"
                                        v-bind="attrs"
                                        @click="handleReset"
                                        v-on="on"
                                        >mdi-refresh
                                    </v-icon>
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
                </v-row>
            </template>
            <template #[`item.stt`]="{ index }">
                <span>{{ $getStt(index, pageInfo) }}</span>
            </template>
            <template #[`item.classType`]="{ item }">
                <span>{{
                    getRetakeClassTypeText(item?.classType, item?.courseType, item?.isCourseNormal)
                }}</span>
            </template>
            <template #[`item.studentCount`]="{ item }">
                <span>{{ item.minStudent }} - {{ item.maxStudent }}</span>
            </template>
            <template #[`item.actions`]="{ item }">
                <div>
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                color="warning"
                                dark
                                icon
                                v-bind="attrs"
                                @click="handleUpdate(item)"
                                v-on="on"
                            >
                                mdi-pencil
                            </v-icon>
                        </template>
                        <span>Sửa</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                color="red"
                                dark
                                v-bind="attrs"
                                @click="handleClick(item)"
                                v-on="on"
                            >
                                mdi-trash-can
                            </v-icon>
                        </template>
                        <span>Xóa</span>
                    </v-tooltip>
                </div>
            </template>
        </v-data-table>
        <BasePagination
            :page="pageInfo.pageIndex"
            :page-count="totalPage"
            :page-size="pageInfo.pageSize"
            @changePage="changePage"
            @changePageSize="changePageSize"
        />
        <CoefficientUpdate ref="CoefficientUpdate" @close="getList" />
        <CoefficientAdd ref="CoefficientAdd" @close="getList" />
        <base-confirm-modal
            :open="openDelete"
            @OK="handleDelete"
            @toggle="openDelete = !openDelete"
        >
            <template #content>
                <div>
                    Xác nhận xóa hệ số
                    <span class="primary--text font-weight-bold">{{
                        itemToDelete?.classType
                    }}</span>
                </div>
            </template>
        </base-confirm-modal>
    </div>
</template>

<script>
import coefficientServices from "~/services/coefficientServices";
import CoefficientAdd from "~/components/Coefficient/Add.vue";
import CoefficientUpdate from "~/components/Coefficient/Update.vue";
import { retakeCourseStatus } from "~/consts/list";
import { getRetakeClassTypeText } from "~/utils/heppers";
const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

const INIT_SEARCH = {
    search: "",
    coefficient: undefined,
};
export default {
    components: {
        CoefficientAdd,
        CoefficientUpdate,
    },
    data: () => ({
        retakeCourseStatus,
        headers: [
            {
                value: "stt",
                text: "STT",
                width: 50,
                sortable: false,
                align: "center",
                class: "text-center",
            },
            {
                value: "classType",
                text: "Loại lớp",
                width: 200,
                align: "center",
                class: "text-center",
            },
            {
                value: "coefficient",
                text: "Thu học phí SV",
                width: 200,
                align: "center",
                class: "text-center",
            },
            {
                value: "coefficientTeacher",
                text: "Thanh toán giảng dạy",
                width: 200,
                align: "center",
                class: "text-center",
            },
            {
                value: "studentCount",
                text: "Số lượng sinh viên",
                width: 200,
                align: "center",
                class: "text-center",
            },
            {
                value: "actions",
                text: "Chức năng",
                align: "center",
                sortable: false,
                width: 100,
                class: "text-center",
            },
        ],
        list: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        totalPage: 0,
        totalRecord: 0,
        isLoading: false,
        openDelete: false,
        search: { ...INIT_SEARCH },
        isOpenAdd: false,
        itemToDelete: null,
    }),
    computed: {},
    created() {
        this.getList();
    },
    methods: {
        getRetakeClassTypeText,
        handleClick(item) {
            this.itemToDelete = item;
            this.openDelete = true;
        },
        async handleDelete() {
            try {
                const res = await coefficientServices.delete(this.itemToDelete.id);
                if (res.success) {
                    this.$showSuccess("Xóa hệ số thành công");
                    await this.getList();
                }
            } catch (er) {
                console.log(er);
            }
            this.openDelete = false;
        },

        handleUpdate(item) {
            this.$refs.CoefficientUpdate.getUpdate({ ...item });
        },
        async getList() {
            try {
                this.isLoading = true;
                const res = await coefficientServices.getList({
                    ...this.pageInfo,
                    ...this.search,
                });
                if (res.success) {
                    this.list = res.data.data;
                    this.totalPage = res.data.totalPages;
                    this.totalRecord = res.data.totalRecords;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        changePageSize(val) {
            this.pageInfo.pageIndex = 1;
            this.pageInfo.pageSize = val;
            this.getList();
        },
        changePage(val) {
            this.pageInfo.pageIndex = val;
            this.getList();
        },
        handleReset() {
            this.search = { ...INIT_SEARCH };
            this.pageInfo = { ...INIT_PAGE_INFO };
            this.getList();
        },
        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.getList();
        },
        openAdd() {
            this.$refs.CoefficientAdd.open = true;
        },
    },
};
</script>

<style scoped>
.row--dense {
    margin: 15px;
}
.toolbar-actions {
    gap: 8px;
}
</style>
