<script>
import { getRetakeClassTypeText } from "~/utils/heppers.js";

export default {
    name: "BaseStatusItem",
    props: {
        status: {
            type: [Number, String],
            required: true,
        },
        statusList: {
            type: Array,
            required: true,
        },
        useCustomText: {
            type: Boolean,
            default: false,
        },
        additionalData: {
            type: [String, Number],
            default: null,
        },
        isCourseNormal: {
            type: Boolean,
            default: null,
        },
    },
    methods: {
        getStatusColor(status) {
            const statusObj = this.statusList.find((s) => s.value === status);
            return statusObj ? statusObj.color : "info";
        },
        getStatusText(status) {
            if (this.useCustomText && status) {
                if (
                    this.statusList.some(
                        (s) =>
                            s.value === status &&
                            ["NORMAL_CLASS", "COMBINE_CLASS", "PROJECT_BASED_CLASS"].includes(
                                status
                            )
                    )
                ) {
                    return getRetakeClassTypeText(status, this.additionalData, this.isCourseNormal);
                }
            }

            // Default behavior
            const statusObj = this.statusList.find((s) => s.value === status);
            return statusObj ? statusObj.text : "";
        },
    },
};
</script>

<template>
    <v-chip class="ma-0 white--text" :color="getStatusColor(status)" small>
        {{ getStatusText(status) }}
    </v-chip>
</template>

<style scoped lang="scss"></style>
