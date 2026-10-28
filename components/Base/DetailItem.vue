<script>
export default {
    name: "BaseDetailItem",
    props: {
        title: {
            type: String,
            required: true,
        },
        value: {
            type: [String, Number],
            required: false,
            default: () => "",
        },
        isBreak: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
};
</script>

<template>
    <div class="base-detail-item d-flex gap-4 flex-wrap" :class="isBreak ? 'flex-column' : 'align-center'">
        <div class="base-detail-item__title text-no-wrap">{{ title }}:</div>
        <div class="primary--text fw-600 flex-grow-1 base-detail-item__value">
            <slot name="value">
                {{ value }}
            </slot>
        </div>
    </div>
</template>

<style scoped>
.base-detail-item__value {
    word-break: break-word;
    overflow-wrap: break-word;
}
</style>
