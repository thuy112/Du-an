<script>
import { isEmail, isPhone, isRequired } from "~/utils/rules";
import classServices from "~/services/classServices";
import userServices from "~/services/userServices";

export default {
    name: "UserAssign",
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        dataDetail: {
            type: Object,
            required: true,
        },
    },

    data: () => ({
        isLoading: false,
        headers: [
            { value: "stt", text: "STT", sortable: false },
            { value: "code", text: "Mã lớp" },
            { value: "name", text: "Tên Lớp" },
            {
                value: "trainingMethodName",
                text: "Hình thức đào tạo",
                sortable: false,
            },
            { value: "trainingUnitName", text: "Địa điểm đào tạo", sortable: false },
            { value: "majorName", text: "Ngành", sortable: false },
            { value: "courseName", text: "Khoá", sortable: false },
        ],
        selectedList: [],
        list: [],
        search: "",
    }),
    computed: {
        isDisable() {
            return this.selectedList.length === 0;
        },
        totalSelected() {
            return this.selectedList.length;
        },
        totalList() {
            return this.list.length;
        },
    },
    watch: {
        open(val) {
            if (val) {
                this.selectedList = [];
                this.handleReset();
                this.getSelectedList();
            }
        },
    },
    methods: {
        isPhone,
        isEmail,
        async handleSubmit() {
            const valid = this.$refs.form.validate();
            if (!valid) return;
            try {
                this.isLoading = true;
                const data = {
                    accountId: this.dataDetail.id,
                    classesIds: this.selectedList.map((i) => i.id),
                };
                const res = await userServices.assignClass(data);
                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Gán lớp sinh viên thành công");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        isRequired,
        async getClassList() {
            try {
                const res = await classServices.getListAll({
                    search: this.search,
                    page: 1,
                    limit: 1000,
                });
                if (res.success) {
                    this.list = res.data;
                }
            } catch (e) {
                console.error(e);
            }
        },

        handleReset() {
            this.search = "";
            this.getClassList();
        },
        async getSelectedList() {
            try {
                const res = await userServices.getListClassByUser(this.dataDetail.id);
                if (res.success) {
                    this.selectedList = res.data;
                }
            } catch (e) {
                console.error(e);
            }
        },
    },
};
</script>

<template>
    <BaseModal
        :loading="isLoading"
        :open="open"
        max-width="1200"
        title="Gán lớp sinh viên cho Cán Bộ Quản Lý"
        :disabled-btn="isDisable"
        @OK="handleSubmit"
        @toggle="$emit('toggle')"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-data-table
                v-model="selectedList"
                item-key="id"
                checkbox-color="primary"
                show-select
                :items="list"
                :headers="headers"
                no-data-text="Không có dữ liệu"
                no-results-text="Không có dữ liệu"
                disable-pagination
                disable-sort
                style="max-height: calc(100vh - 400px); overflow-y: auto"
                hide-default-footer
            >
                <template #top>
                    <v-row class="ma-0 mb-3 pt-2">
                        <v-col class="fs-17 fw-500" cols="12" md="auto">
                            Danh sách lớp sinh viên
                            <span class="primary--text">({{ totalSelected }}/{{ totalList }})</span>
                        </v-col>

                        <v-row dense justify="end" class="ma-0">
                            <v-col cols="12" md="auto">
                                <base-text-field
                                    v-model="search"
                                    hide-details
                                    label="Tên/Mã lớp sinh viên"
                                    width="200px"
                                ></base-text-field>
                            </v-col>

                            <v-col class="d-flex align-center gap-8" cols="auto">
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
                                            @click="getClassList"
                                            v-on="on"
                                        >
                                            <v-icon>mdi-magnify</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Tìm kiếm</span>
                                </v-tooltip>
                            </v-col>
                        </v-row>
                    </v-row>
                </template>
                <template #[`item.stt`]="{ index }"> {{ index + 1 }}</template>
            </v-data-table>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>
