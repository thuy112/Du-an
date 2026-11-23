<script>
import RequiredLabel from "~/components/Base/RequiredLabel.vue";
import { statusList, termStatusList } from "~/consts/list";
import { isRequired } from "~/utils/rules";
import educationProgramService from "~/services/educationProgramService";
import termService from "~/services/termService";
import BaseTextField from "~/components/Base/TextField.vue";
import ChangeableStatus from "~/components/Base/ChangeableStatus.vue";

const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 50,
};

export default {
    name: "Action",
    components: { ChangeableStatus, BaseTextField, RequiredLabel },
    props: {
        dataItem: {
            type: Object,
            default: () => ({}),
        },
        open: {
            type: Boolean,
            required: true,
        },
        isUpdate: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        pageInput: 1,
        search: "",
        isLoading: false,
        statusList,
        name: null,
        code: null,
        status: "ACTIVE",
        termTypeList: [],
        termTypes: [],
        headers: [
            { text: "Tên học phần", value: "name", sortable: false },
            { text: "Mã học phần", value: "code", sortable: false },
            { text: "Số tín chỉ học phí", value: "creditHours", sortable: false },
            { text: "Số tín chỉ học tập", value: "creditTraining", sortable: false },
            { text: "Trạng thái học phần", value: "termStatus", sortable: false },
            { text: "Học kỳ thứ", value: "semesterMajor", sortable: false },
            { text: "Khối kiến thức", value: "knowledgeUnit", sortable: false },
        ],
        termList: [],
        filteredList: [],
        selectedTerms: [],
        pageInfo: {
            ...INIT_PAGE_INFO,
        },
        openImport: false,
        totalPage: 0,
        totalRecord: 0,
    }),
    computed: {
        paginatedItems() {
            const start = (this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize;
            const end = start + this.pageInfo.pageSize;
            return this.filteredList.slice(start, end);
        },
        visiblePageList() {
            const total = this.totalPage || 1;
            const current = this.pageInfo.pageIndex || 1;

            if (total <= 8) {
                return Array.from({ length: total }, (_, i) => i + 1);
            }
            if (current <= 4) {
                return [1, 2, 3, 4, 5, "...", total - 3, total - 2, total - 1, total];
            }
            if (current >= total - 3) {
                return [1, 2, "...", total - 4, total - 3, total - 2, total - 1, total];
            }
            return [1, "...", current - 1, current, current + 1, "...", total];
        },
    },
    watch: {
        async open(val) {
            if (!val) {
                Object.assign(this.$data, this.$options.data());
                this.$refs.form && this.$refs.form.reset();
            } else {
                await this.getTerms();
                if (this.isUpdate && this.dataItem && this.dataItem.id) {
                    await this.getDetail(this.dataItem);
                }
                this.$nextTick(() => {
                    this.$refs.form && this.$refs.form.resetValidation();
                });
            }
        },
        search: {
            handler() {
                this.filterItems();
            },
            immediate: true,
        },
    },
    methods: {
        isRequired,
        handleChangeStatus(event, item) {
            console.log(event);
            console.log(item);
        },
        termStatusList() {
            return termStatusList;
        },
        async getDetail(item) {
            try {
                const res = await educationProgramService.getDetail(item.id);
                if (res && res.success) {
                    const detail = res.data || {};
                    this.selectedTerms = (detail.terms || []).map((t) => ({
                        termStatus: t.termStatus ? t.termStatus : "MANDATORY",
                        semesterMajor: t?.semesterMajor,
                        knowledgeUnit: t?.knowledgeUnit,
                        id: t?.termHistory?.termId || t?.termId || t?.id,
                        name: t?.termHistory?.name || t?.name,
                        code: t?.termHistory?.code || t?.code,
                        creditHours: t?.termHistory?.creditHours ?? t?.creditHours,
                        creditTraining: t?.termHistory?.creditTraining ?? t?.creditTraining,
                    }));
                    this.termList = this.termList.map((t) => {
                        const foundItem = this.selectedTerms.find((data) => data.id === t.id);
                        if (foundItem) return foundItem;
                        return { ...t, semesterMajor: null };
                    });
                    if (this.$arrayByArray) {
                        this.termList = this.$arrayByArray(this.termList, this.selectedTerms, "id");
                    }
                    this.filterItems();
                    this.name = detail.name ?? item.name ?? null;
                    this.code = detail.code ?? item.code ?? null;
                    this.status = detail.status ?? item.status ?? "ACTIVE";
                }
            } catch (e) {
                console.error(e);
            }
        },
        handleSubmit() {
            if (this.isUpdate) this.handleUpdate();
            else this.handleAdd();
        },
        filterItems() {
            if (!this.search) {
                this.filteredList = [...this.termList];
            } else {
                const searchLower = this.search.toLowerCase();
                this.filteredList = this.termList.filter(
                    (item) =>
                        item.name?.toLowerCase().includes(searchLower) ||
                        item.code?.toLowerCase().includes(searchLower)
                );
            }
            this.totalRecord = this.filteredList.length;
            this.totalPage = Math.ceil(this.totalRecord / this.pageInfo.pageSize) || 1;
            this.pageInfo.pageIndex = 1;
            this.pageInput = 1;
        },
        async getTerms() {
            try {
                const res = await termService.getAll({ status: "ACTIVE" });
                if (res && res.success) {
                    const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    this.termList = rawList.map((item) => ({
                        id: item.id,
                        name: item.name,
                        code: item.code,
                        creditHours: item?.creditHours,
                        creditTraining: item?.creditTraining,
                        termStatus: "MANDATORY",
                    }));
                    this.filterItems();
                }
            } catch (e) {
                console.error(e);
            }
        },
        async handleAdd() {
            const valid = this.$refs.form ? this.$refs.form.validate() : true;
            if (!valid) return;
            try {
                this.isLoading = true;
                const data = {
                    name: this.name,
                    code: this.code,
                    status: this.status,
                    terms: this.selectedTerms.map((item) => ({
                        semesterMajor: item?.semesterMajor,
                        knowledgeUnit: item?.knowledgeUnit,
                        termId: item.id,
                        termStatus: item?.termStatus,
                    })),
                };
                const res = await educationProgramService.add(data);
                if (res && res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Thêm nhóm chương trình thành công");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        async handleUpdate() {
            const valid = this.$refs.form ? this.$refs.form.validate() : true;
            if (!valid) return;
            try {
                this.isLoading = true;
                const data = {
                    id: this.dataItem.id,
                    name: this.name,
                    code: this.code,
                    status: this.status,
                    terms: this.selectedTerms.map((item) => ({
                        semesterMajor: item.semesterMajor,
                        knowledgeUnit: item?.knowledgeUnit,
                        termId: item.id,
                        termStatus: item?.termStatus,
                    })),
                };
                const res = await educationProgramService.update(data);
                if (res && res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Cập nhật chương trình thành công");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        changePageSize(val) {
            this.pageInfo.pageIndex = 1;
            this.pageInput = 1;
            this.pageInfo.pageSize = val;
            this.filterItems();
        },
        changePage(val) {
            const maxPage = this.totalPage || 1;
            if (val >= 1 && val <= maxPage) {
                this.pageInfo.pageIndex = val;
                this.pageInput = val;
            }
        },
        goToPage() {
            const maxPage = this.totalPage || 1;
            let target = parseInt(this.pageInput, 10);
            if (isNaN(target) || target < 1) target = 1;
            if (target > maxPage) target = maxPage;
            this.changePage(target);
        },
    },
};
</script>

<template>
    <BaseModal
        :loading="isLoading"
        :open="open"
        :title="isUpdate ? 'Cập nhật chương trình' : 'Thêm mới chương trình'"
        max-width="1111"
        @OK="handleSubmit"
        @toggle="$emit('toggle')"
    >
        <v-form ref="form" lazy-validation @submit.prevent="handleSubmit">
            <v-row class="ma-0 mt-3" dense>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model.trim="code"
                        :rules="[isRequired('Vui lòng nhập Mã chương trình')]"
                        clear-icon="mdi-close-circle"
                        clearable
                        color="primary"
                        dense
                        outlined
                    >
                        <template #label>
                            <RequiredLabel name="Mã chương trình" />
                        </template>
                    </v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                    <base-text-field
                        v-model="name"
                        :rules="[isRequired('Vui lòng nhập Tên chương trình')]"
                        label="Tên chương trình"
                        required
                        clearable
                        color="primary"
                    >
                        <template #label>
                            <RequiredLabel name="Tên chương trình" />
                        </template>
                    </base-text-field>
                </v-col>

                <v-col cols="12" md="6">
                    <v-select
                        v-model.trim="status"
                        :items="statusList"
                        :rules="[isRequired('Vui lòng chọn Trạng thái')]"
                        clear-icon="mdi-close-circle"
                        clearable
                        color="primary"
                        dense
                        no-data-text="Không có dữ liệu"
                        outlined
                    >
                        <template #label>
                            <RequiredLabel name="Trạng thái" />
                        </template>
                    </v-select>
                </v-col>

                <v-col class="d-flex align-center justify-space-between" cols="12">
                    <div class="black--text font-weight-medium">
                        Danh sách học phần
                        <span class="primary--text">({{ selectedTerms.length }}/{{ termList.length }})</span>
                    </div>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        clearable
                        hide-details
                        label="Tìm kiếm"
                        single-line
                        style="max-width: 300px"
                    ></v-text-field>
                </v-col>

                <v-col cols="12">
                    <v-data-table
                        v-model="selectedTerms"
                        :headers="headers"
                        :items-per-page="pageInfo.pageSize"
                        :items="paginatedItems"
                        :search="search"
                        item-key="id"
                        no-data-text="Vui lòng chọn học kỳ"
                        checkbox-color="primary"
                        fixed-header
                        hide-default-footer
                        show-select
                    >
                        <template #[`item.semesterMajor`]="{ item }">
                            <v-text-field v-model="item.semesterMajor" type="number" />
                        </template>
                        <template #[`item.knowledgeUnit`]="{ item }">
                            <v-text-field v-model="item.knowledgeUnit" type="text" />
                        </template>
                        <template #[`item.termStatus`]="{ item }">
                            <div class="d-flex align-center">
                                <ChangeableStatus
                                    no-need-confirm
                                    :status="item.termStatus"
                                    :status-list="termStatusList()"
                                    @changeStatus="item.termStatus = $event.value"
                                />
                            </div>
                        </template>
                    </v-data-table>

                    <div class="d-flex flex-column align-end mt-3 modal-pagination-wrapper">
                        <div class="d-flex align-center mb-2" style="gap: 8px">
                            <v-select
                                v-model="pageInfo.pageSize"
                                :items="[10, 20, 50, 100]"
                                label="Bản ghi"
                                outlined
                                dense
                                hide-details
                                style="width: 105px"
                                @change="changePageSize"
                            ></v-select>

                            <v-text-field
                                v-model.number="pageInput"
                                label="Trang"
                                outlined
                                dense
                                hide-details
                                type="number"
                                style="width: 72px"
                                @keyup.enter="goToPage"
                            ></v-text-field>

                            <v-btn
                                color="primary"
                                dark
                                depressed
                                class="text-none px-4 font-weight-medium rounded-sm"
                                height="36"
                                @click="goToPage"
                            >
                                Đi
                            </v-btn>
                        </div>

                        <div class="d-flex align-center" style="gap: 6px">
                            <v-btn
                                icon
                                outlined
                                color="grey lighten-1"
                                class="rounded-sm"
                                width="34"
                                height="34"
                                :disabled="pageInfo.pageIndex <= 1"
                                @click="changePage(pageInfo.pageIndex - 1)"
                            >
                                <v-icon small color="grey darken-1">mdi-chevron-left</v-icon>
                            </v-btn>

                            <template v-for="(p, idx) in visiblePageList">
                                <span
                                    v-if="p === '...'"
                                    :key="'dots-' + idx"
                                    class="px-1 grey--text text--darken-1"
                                    style="font-size: 13px"
                                >
                                    ...
                                </span>
                                <v-btn
                                    v-else
                                    :key="'page-' + p"
                                    depressed
                                    min-width="34"
                                    width="34"
                                    height="34"
                                    class="rounded-sm pa-0 font-weight-medium"
                                    :color="p === pageInfo.pageIndex ? 'primary' : 'grey lighten-3'"
                                    :dark="p === pageInfo.pageIndex"
                                    @click="changePage(p)"
                                >
                                    <span :class="p === pageInfo.pageIndex ? 'white--text' : 'grey--text text--darken-3'">
                                        {{ p }}
                                    </span>
                                </v-btn>
                            </template>

                            <v-btn
                                icon
                                outlined
                                color="grey lighten-1"
                                class="rounded-sm"
                                width="34"
                                height="34"
                                :disabled="pageInfo.pageIndex >= (totalPage || 1)"
                                @click="changePage(pageInfo.pageIndex + 1)"
                            >
                                <v-icon small color="grey darken-1">mdi-chevron-right</v-icon>
                            </v-btn>
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>