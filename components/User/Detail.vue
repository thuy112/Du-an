<script>
import { statusList } from "~/consts/list";

export default {
    name: "UserDetail",
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
    methods: {},
};
</script>

<template>
    <BaseModal
        title="Chi tiết người dùng"
        :open="open"
        :loading="isLoading"
        max-width="700"
        off-btn
        @toggle="$emit('toggle')"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-row class="ma-0 mt-3">
                <v-col cols="12" class="d-flex align-center justify-center mb-3">
                    <v-avatar class="pointer" size="220">
                        <v-img
                            :src="dataDetail.avatar || '/images/avatar_default.png'"
                            aspect-ratio="1"
                            height="220"
                            width="220"
                            cover
                            @error="dataDetail.avatar = '/images/avatar_default.png'"
                        ></v-img>
                    </v-avatar>
                </v-col>
                <v-col cols="12" md="6">
                    <BaseDetailItem title="Họ tên" :value="dataDetail.fullName" />
                </v-col>
                <v-col cols="12" md="6">
                    <BaseDetailItem title="Số điện thoại" :value="dataDetail.phone" />
                </v-col>
                <v-col cols="12" md="6">
                    <BaseDetailItem title="Email" :value="dataDetail.email" />
                </v-col>
                <v-col cols="12" md="6">
                    <BaseDetailItem title="Chức vụ" :value="dataDetail.position" />
                </v-col>
                <v-col cols="12" md="6">
                    <BaseDetailItem title="Trạng thái" :value="dataDetail.status">
                        <template #value>
                            <BaseStatusItem :status-list="statusList" :status="dataDetail.status" />
                        </template>
                    </BaseDetailItem>
                </v-col>
                <v-col cols="12">
                    <BaseDetailItem
                        title="Nhóm người dùng"
                        :value="dataDetail.groups?.map((i) => i.groupName).join()"
                    />
                </v-col>
            </v-row>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>
