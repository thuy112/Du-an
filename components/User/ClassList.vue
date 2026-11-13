<script>
import userServices from "~/services/userServices";
import { isEmail, isPhone, isRequired } from "~/utils/rules";

export default {
    name: "UserClassList",
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
                value: "major.educationProgram.name",
                text: "Chương trình đào tạo đào tạo",
                sortable: false,
            },
            { value: "major.trainingUnit.name", text: "Địa điểm đào tạo", sortable: false },
            { value: "major.name", text: "Ngành", sortable: false },
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

        totalList() {
            return this.list.length;
        },
    },
    watch: {
        open(val) {
            if (val) {
                this.handleReset();
                this.getClassList();
            }
        },
    },
    methods: {
        isPhone,
        isEmail,

        isRequired,
        async getClassList() {
            try {
                const res = await userServices.getListClassByUser(this.dataDetail.id);
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
        // async getSelectedList() {
        //     try {
        //         const res = await userServices.getListClassByUser(this.dataDetail.id);
        //         if (res.success) {
        //             this.selectedList = res.data;
        //         }
        //     } catch (e) {
        //         console.error(e);
        //     }
        // },
    },
};
</script>

<template>
    <BaseModal
        :loading="isLoading"
        :open="open"
        max-width="1200"
        title="Danh sách lớp sinh viên quản lý"
        :disabled-btn="isDisable"
        off-btn
        @toggle="$emit('toggle')"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-data-table
                item-key="id"
                checkbox-color="primary"
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
                            <span class="primary--text">({{ totalList }})</span>
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
