<script>
import { sendTypeList, statusList, subjectSendMailList, actionSendTypeList } from "~/consts/list";

export default {
    name: "MailConfigDetail",
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
        statusList,
    }),
    watch: {
        open(val) {},
    },
    methods: {
        sendTypeList() {
            return sendTypeList;
        },
        actionSendTypeList() {
            return actionSendTypeList;
        },
        subjectSendMailList() {
            return subjectSendMailList;
        },
    },
};
</script>

<template>
    <BaseModal
        title="Chi tiết cấu hình mail"
        :open="open"
        :loading="isLoading"
        max-width="800"
        off-btn
        @toggle="$emit('toggle')"
    >
        <v-form ref="form" @submit.prevent>
            <v-row class="ma-0 mt-3">
                <v-col cols="12">
                    <BaseDetailItem title="Tên" :value="dataDetail.name" />
                </v-col>
                <v-col cols="12" md="6">
                    <BaseDetailItem title="Đối tượng gửi mail">
                        <template #value>
                            <BaseStatusItem
                                :status-list="subjectSendMailList()"
                                :status="dataDetail.sendType"
                            />
                        </template>
                    </BaseDetailItem>
                </v-col>
                <v-col cols="12" md="6">
                    <BaseDetailItem title="Mục tiêu">
                        <template #value>
                            <BaseStatusItem
                                :status-list="sendTypeList()"
                                :status="dataDetail.type"
                            />
                        </template>
                    </BaseDetailItem>
                </v-col>

                <v-col cols="12" md="6">
                    <BaseDetailItem title="Hành động">
                        <template #value>
                            <BaseStatusItem
                                :status-list="actionSendTypeList()"
                                :status="dataDetail.actionSendType"
                            />
                        </template>
                    </BaseDetailItem>
                </v-col>

                <v-col cols="12" md="6">
                    <BaseDetailItem title="Trạng thái" :value="dataDetail.status">
                        <template #value>
                            <BaseStatusItem :status-list="statusList" :status="dataDetail.status" />
                        </template>
                    </BaseDetailItem>
                </v-col>

                <v-col cols="12">
                    <BaseDetailItem title="Nội dung" :value="dataDetail.content" is-break>
                        <template #value>
                            <div
                                class="content fw-400 black--text"
                                v-html="dataDetail.content"
                            ></div>
                        </template>
                    </BaseDetailItem>
                </v-col>
            </v-row>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>
