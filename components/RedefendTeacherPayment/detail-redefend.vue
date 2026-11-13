<template>
    <BaseModal
        :loading="isLoading"
        :open="isOpen"
        max-width="1400"
        title="Chi tiết thông tin thanh toán giảng viên"
        off-btn
        @toggle="isOpen = !isOpen"
    >
        <v-row dense class="ma-0 mt-3">
            <v-col cols="12">
                <v-col cols="12">
                    <v-data-table
                        :headers="headers"
                        :items="dataItem"
                        :page.sync="pageInfo.pageIndex"
                        :items-per-page="pageInfo.pageSize"
                        checkbox-color="primary"
                        fixed-header
                        hide-default-footer
                        item-key="name"
                        @page-count="totalPage = $event"
                    >
                        <template #[`item.stt`]="{ index }">
                            {{ (pageInfo.pageIndex - 1) * pageInfo.pageSize + index + 1 }}
                        </template>
                        <template #[`item.code`]="{ item }">
                            {{ item.code }} - {{ item.fullName }}
                        </template>

                        <template #[`item.SUPPORT`]="{ item }">
                            <div class="d-flex align-center justify-center mt-2" style="gap: 16px">
                                <DataEntryNumberInput
                                    v-model="item.SUPPORT.quantity"
                                    width="100px"
                                    label="Số lượng"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                                <DataEntryNumberInput
                                    v-model="item.SUPPORT.credit"
                                    width="100px"
                                    label="Tín chỉ"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                                <DataEntryNumberInput
                                    v-model="item.SUPPORT.subTotal"
                                    width="100px"
                                    label="Thành tiền"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                            </div>
                        </template>

                        <template #[`item.REBUTTAL`]="{ item }">
                            <div class="d-flex align-center justify-center mt-2">
                                <DataEntryNumberInput
                                    v-model="item.REBUTTAL.quantity"
                                    width="100px"
                                    label="Số lượng"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                                <DataEntryNumberInput
                                    v-model="item.REBUTTAL.subTotal"
                                    width="100px"
                                    label="Thành tiền"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                            </div>
                        </template>

                        <template #[`item.JOIN`]="{ item }">
                            <div class="d-flex align-center justify-center mt-2">
                                <DataEntryNumberInput
                                    v-model="item.JOIN.quantity"
                                    width="100px"
                                    label="Số lượng"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                                <DataEntryNumberInput
                                    v-model="item.JOIN.subTotal"
                                    width="100px"
                                    label="Thành tiền"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                            </div>
                        </template>

                        <template #[`item.RESIDENCE`]="{ item }">
                            <div class="d-flex align-center justify-center mt-2">
                                <DataEntryNumberInput
                                    v-model="item.RESIDENCE.quantity"
                                    width="100px"
                                    label="Số lượng"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                                <DataEntryNumberInput
                                    v-model="item.RESIDENCE.subTotal"
                                    width="100px"
                                    label="Thành tiền"
                                    :outlined="false"
                                    hide-details
                                    readonly
                                />
                            </div>
                        </template>
                    </v-data-table>
                </v-col>
                <v-col cols="12">
                    <BasePagination
                        off-forward
                        :page="pageInfo.pageIndex"
                        :page-count="totalPage"
                        :page-size="pageInfo.pageSize"
                        @changePage="changePage"
                        @changePageSize="changePageSize"
                    />
                </v-col>
            </v-col>
        </v-row>
    </BaseModal>
</template>

<script>
import { genderList, sendTypeList, statusList } from "~/consts/list";
import BaseModal from "~/components/Base/Modal.vue";
import BasePagination from "~/components/Base/Pagination.vue";
import DataEntryNumberInput from "~/components/Base/DataEntryNumber.vue";

export default {
    name: "RedefendTeacherPaymentDetail",
    components: { BasePagination, BaseModal, DataEntryNumberInput },
    props: {
        dataItem: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            isOpen: false,
            isLoading: false,
            statusList,
            totalPage: 0,
            pageInfo: {
                pageIndex: 1,
                pageSize: 20,
            },
            headers: [
                { value: "stt", text: "STT", sortable: false },
                { value: "code", text: "MGV - Tên giảng viên", sortable: false },
                { value: "SUPPORT", text: "Hướng dẫn DATN", sortable: false },
                { value: "REBUTTAL", text: "Phản biện DATN", sortable: false },
                { value: "JOIN", text: "Tham gia HĐ chấm TN", sortable: false },
                { value: "RESIDENCE", text: "Lưu trú", sortable: false },
            ],
            sendTypeList,
        };
    },
    watch: {
        isOpen(newVal) {
            if (!newVal) {
                Object.assign(this.$data, this.$options.data());
            }
        },
    },

    methods: {
        changePageSize(val) {
            this.pageInfo.pageIndex = 1;
            this.pageInfo.pageSize = val;
        },
        changePage(val) {
            this.pageInfo.pageIndex = val;
        },
        genderList() {
            return genderList;
        },

        getFileNameFromURL(url) {
            const parts = url.split("?o=");
            return parts[parts.length - 1];
        },
    },
};
</script>

