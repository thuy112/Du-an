<script>
export default {
    name: "RequiredLabel",
    props: {
        name: {
            type: String,
            required: true,
        },
    },
}
</script>

<template>
    <div>{{ name }} <span class="red--text">(*)</span></div>
</template>

<style scoped></style>
