<script>
import DetailItem from "~/components/Base/DetailItem.vue";
import { genderList } from "~/consts/list";

export default {
    name: "Info",
    components: {
        DetailItem,
    },
    props: {
        student: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            genderList,
        };
    },
};
</script>

<template>
    <v-row dense>
        <v-col v-if="student?.fullName" cols="12" lg="6">
            <DetailItem title="Họ tên" :value="student?.fullName" />
        </v-col>
        <v-col v-if="student?.code" cols="12" lg="6">
            <DetailItem title="Mã SV" :value="student?.code" />
        </v-col>
        <v-col v-if="student?.birthday" cols="12" lg="6">
            <DetailItem title="Ngày sinh" :value="$formatDate(student?.birthday)" />
        </v-col>
        <v-col v-if="student?.gender" cols="12" lg="6">
            <DetailItem title="Giới tính" :value="$getText(student?.gender, genderList)" />
        </v-col>
        <v-col v-if="student?.email" cols="12">
            <DetailItem title="Email trường" :value="student.email" />
        </v-col>
        <v-col v-if="student?.emailOther" cols="12">
            <DetailItem title="Email cá nhân" :value="student.emailOther" />
        </v-col>
        <v-col v-if="student?.phone" cols="12" lg="6">
            <DetailItem title="Số điện thoại" :value="student.phone" />
        </v-col>
        <v-col v-if="student?.station" cols="12">
            <DetailItem title="Trạm" :value="student.station" />
        </v-col>
        <v-col v-if="student?.course" cols="12" lg="6">
            <DetailItem title="Khóa" :value="student.course.name" />
        </v-col>
        <v-col v-if="student?.classes" cols="12" lg="6">
            <DetailItem title="Lớp" :value="student.classes.name" />
        </v-col>
        <v-col v-if="student?.clazz" cols="12" lg="6">
            <DetailItem title="Lớp" :value="student.clazz.name" />
        </v-col>
        <v-col v-if="student?.major" cols="12" lg="6">
            <DetailItem title="Ngành" :value="student.major.name" />
        </v-col>
        <v-col v-if="student?.clazz?.trainingMethodName" cols="12" lg="6">
            <DetailItem title="Hình thức đào tạo" :value="student.clazz.trainingMethodName" />
        </v-col>
        <v-col v-if="student?.trainingMethod" cols="12" lg="6">
            <DetailItem title="Loại hình đào tạo" :value="student.trainingMethod.name" />
        </v-col>
    </v-row>
</template>

<style scoped lang="scss">
.border-left {
    border-left: 4px var(--primary) solid;
    padding: 2px 8px;
    color: black;
    font-weight: 600;
    font-size: 20px;
}
</style>
