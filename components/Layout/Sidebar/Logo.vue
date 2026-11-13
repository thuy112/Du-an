<script>
export default {
    name: "Logo",
};
</script>

<template>
    <div class="pointer" @click="$router.push('/')">
        <v-img src="/logo_bk.png" width="40" contain :aspect-ratio="787 / 1184" />
    </div>
</template>

<style scoped></style>
