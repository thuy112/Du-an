<script>
import approvalPermissionServices from "~/services/approvalPermissionServices";

export default {
    name: "UserApproval",
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
        selectedList: {
            id: null,
            canApproveCredit: false,
            canApproveTuition: false,
            canApproveStudent: false,
        },
    }),
    watch: {
        open(val) {
            if (val) {
                this.getSelectedList();
            }
        },
    },
    methods: {
        // Lấy danh sách quyền theo user
        async getSelectedList() {
            try {
                const res = await approvalPermissionServices.getPermissionByUser(
                    this.dataDetail.id
                );
                if (res.success && res.data) {
                    this.selectedList = {
                        id: res.data.id,
                        canApproveCredit: res.data.canApproveCredit === "ACTIVE",
                        canApproveTuition: res.data.canApproveTuition === "ACTIVE",
                        canApproveStudent: res.data.canApproveStudent === "ACTIVE",
                    };
                }
            } catch (e) {
                console.error(e);
            }
        },

        async handleSubmit() {
            try {
                this.isLoading = true;
                const payload = {
                    canApproveCredit: this.selectedList.canApproveCredit ? "ACTIVE" : "INACTIVE",
                    canApproveTuition: this.selectedList.canApproveTuition ? "ACTIVE" : "INACTIVE",
                    canApproveStudent: this.selectedList.canApproveStudent ? "ACTIVE" : "INACTIVE",
                    id: this.dataDetail.id,
                };

                const res = await approvalPermissionServices.update(payload);

                if (res.success) {
                    this.$emit("toggle");
                    this.$emit("success");
                    this.$showSuccess("Phân quyền duyệt đơn thành công");
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
    },
};
</script>

<template>
    <BaseModal
        :loading="isLoading"
        :open="open"
        max-width="1200"
        title="Phân quyền duyệt đơn"
        @toggle="$emit('toggle')"
        @OK="handleSubmit"
    >
        <v-form ref="form" lazy-validation @submit.prevent>
            <v-checkbox v-model="selectedList.canApproveCredit" label="Duyệt tín chỉ"></v-checkbox>
            <v-checkbox v-model="selectedList.canApproveTuition" label="Duyệt học phí"></v-checkbox>
            <v-checkbox
                v-model="selectedList.canApproveStudent"
                label="Duyệt sinh viên"
            ></v-checkbox>
        </v-form>
    </BaseModal>
</template>

<style scoped></style>
