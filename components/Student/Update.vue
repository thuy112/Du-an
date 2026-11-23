<template>
  <base-modal
    :open="open"
    max-width="800"
    title="Cập nhật thông tin sinh viên"
    @OK="handleUpdate"
    @toggle="open = !open"
  >
    <v-form ref="form" lazy-validation @submit.prevent>
      <v-row class="mt-3" dense>
        <v-col cols="12">
          <base-title title="Thông tin cá nhân" />
        </v-col>

        <v-col cols="12" md="6">
          <base-text-field
            v-model="params.code"
            label="Mã số sinh viên"
            required
            @input="sanitizeCode"
          ></base-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <base-text-field
            v-model="params.fullName"
            label="Họ tên sinh viên"
            required
          ></base-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <base-text-field
            v-model="params.email"
            :rules="emailRules"
            label="Email trường"
            required
          ></base-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <base-text-field
            v-model="params.emailOther"
            :rules="optionalEmailRules"
            label="Email cá nhân"
          ></base-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <base-text-field
            v-model="params.citizen"
            label="CCCD"
            type="text"
            :rules="citizenRules"
            @input="sanitizeCitizen"
          ></base-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <base-date-picker
            v-model="params.birthday"
            :rules="birthdayRules"
            label="Ngày sinh"
            year-picker
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-select
            v-model="params.gender"
            :items="genderList"
            item-text="text"
            item-value="value"
            label="Giới tính"
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-text-field v-model="params.phone" label="SĐT"></base-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <base-select
            v-model="params.status"
            required
            :items="studentStatusList"
            item-text="text"
            item-value="value"
            label="Trạng thái"
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-text-field v-model="params.ethnicity" label="Dân tộc"></base-text-field>
        </v-col>
        <v-col cols="12">
          <base-text-field v-model="params.birthplace" label="Nơi sinh"></base-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <base-text-area
            v-model="params.address"
            label="Địa chỉ liên hệ"
          ></base-text-area>
        </v-col>
        <v-col cols="12" md="6">
          <base-text-area v-model="params.homeTown" label="Trú quán"></base-text-area>
        </v-col>

        <v-col cols="12">
          <base-title title="Thông tin đào tạo" />
        </v-col>

        <v-col cols="12" md="6">
          <base-select
            v-model="params.trainingUnitId"
            :items="trainingList"
            item-text="name"
            item-value="id"
            :no-data-text="'Không có dữ liệu '"
            required
            label="Địa điểm đào tạo"
            @change="onChangeTrainingUnit($event)"
          />
        </v-col>

        <v-col cols="12" md="6">
          <base-select
            v-model="params.majorId"
            :items="majorList"
            item-text="name"
            :no-data-text="
              !params.trainingUnitId
                ? 'Vui lòng chọn địa điểm đào tạo'
                : 'Không có dữ liệu ngành'
            "
            item-value="id"
            required
            label="Ngành"
            @change="onChangeMajor($event)"
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-select
            v-model="params.courseId"
            :items="courseList"
            item-text="name"
            item-value="id"
            :no-data-text="
              !params.majorId
                ? 'Vui lòng chọn ngành học'
                : 'Không có dữ liệu khóa học'
            "
            required
            label="Khóa học"
            @change="onChangeCourse($event)"
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-select
            v-model="params.classId"
            :items="classList"
            :no-data-text="
              !params.courseId
                ? 'Vui lòng chọn khóa học'
                : 'Không có dữ liệu lớp sinh viên'
            "
            required
            item-text="name"
            item-value="id"
            label="Lớp sinh viên"
            @change="onChangeClass($event)"
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-select
            v-model="params.trainingTypeId"
            :items="trainingTypeList"
            item-text="name"
            item-value="id"
            disabled
            label="Loại hình đào tạo"
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-select
            v-model="params.trainingMethodId"
            :items="trainingMethodList"
            item-text="name"
            item-value="id"
            disabled
            label="Hình thức đào tạo"
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-select
            v-model="params.degreeType"
            required
            :items="degreeList"
            item-text="text"
            item-value="value"
            label="Bằng cấp"
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-date-picker
            v-model="params.startOfTraining"
            label="Thời gian bắt đầu"
            month-picker
          />
        </v-col>
        <v-col cols="12" md="6">
          <base-date-picker
            v-model="params.expiryDate"
            :rules="expiryDateRules"
            label="Thời gian kết thúc"
            month-picker
          />
        </v-col>
      </v-row>
    </v-form>
  </base-modal>
</template>

<script>
import moment from 'moment'
import { genderList, studentStatusList, degreeList } from '~/consts/list'
import studentServices from '~/services/studentServices'
import BaseModal from '~/components/Base/Modal.vue'
import BaseTitle from '~/components/Base/Title.vue'
import BaseTextArea from '~/components/Base/TextArea.vue'
import majorServices from '~/services/majorServices'
import classServices from '~/services/classServices'
import trainingUnitServices from '~/services/trainingUnitServices'
import courseServices from '~/services/courseServices'
import trainingMethodServices from '~/services/trainingMethodServices'
import trainingTypeServices from '~/services/trainingTypeServices'

const extractList = (res) => {
  const raw = res?.data !== undefined ? res.data : res
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.objects)) return raw.objects
  return []
}

const extractObject = (res) => {
  const raw = res?.data !== undefined ? res.data : res
  if (raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    return raw.data
  }
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : null
}

export default {
  name: 'StudentUpdate',
  components: { BaseModal, BaseTextArea, BaseTitle },
  data() {
    return {
      open: false,
      isHydrating: false,
      params: {
        ethnicity: '',
        address: '',
        birthday: '',
        homeTown: '',
        birthplace: '',
        classId: null,
        code: '',
        courseId: null,
        email: '',
        emailOther: '',
        fullName: '',
        gender: '',
        id: null,
        majorId: null,
        phone: '',
        status: 'STUDYING',
        trainingMethodId: null,
        trainingUnitId: null,
        startOfTraining: '',
        expiryDate: '',
        yearsOfTraining: '',
        degreeType: null,
        citizen: null,
        trainingTypeId: null,
      },
      degreeList,
      genderList,
      studentStatusList,
      majorList: [],
      courseList: [],
      trainingMethodList: [],
      trainingTypeList: [],
      classList: [],
      trainingList: [],
      citizenRules: [
        (v) => !v || /^\d{12}$/.test(String(v)) || 'CCCD phải gồm đúng 12 chữ số',
      ],
    }
  },
  computed: {
    emailRules() {
      return typeof this.$checkMail === 'function' ? [this.$checkMail] : []
    },
    optionalEmailRules() {
      if (typeof this.$checkMail !== 'function') return []
      return [(v) => !v || this.$checkMail(v)]
    },
    birthdayRules() {
      return typeof this.$birthday === 'function' ? [this.$birthday] : []
    },
    expiryDateRules() {
      if (typeof this.$isAfterMonth !== 'function') return []
      return [(e) => this.$isAfterMonth(e, this.params.startOfTraining)]
    },
  },
  watch: {
    open(newVal) {
      if (!newVal) {
        const defaultData = this.$options.data.call(this)
        Object.assign(this.$data, defaultData)
        this.$nextTick(() => {
          this.$refs.form?.resetValidation?.()
        })
      }
    },
    'params.trainingUnitId'(newValue) {
      if (this.isHydrating) return
      if (!newValue) {
        this.params.majorId = null
        this.majorList = []
        this.params.courseId = null
        this.courseList = []
        this.params.classId = null
        this.classList = []
      } else {
        this.getMajor(newValue)
      }
    },
    'params.majorId'(newValue) {
      if (this.isHydrating) return
      if (!newValue) {
        this.params.courseId = null
        this.courseList = []
        this.params.classId = null
        this.classList = []
      } else {
        this.getCourseList(newValue)
      }
    },
    'params.courseId'(newValue) {
      if (this.isHydrating) return
      if (!newValue) {
        this.params.classId = null
        this.classList = []
      } else {
        this.getClass(newValue)
      }
    },
  },
  methods: {
    onChangeClass(newValue) {
      const classItem = this.classList?.find((item) => item.id === newValue)
      if (classItem) {
        if (classItem.trainingMethodId) {
          this.params.trainingMethodId = classItem.trainingMethodId
        }
        if (classItem.trainingTypeId) {
          this.params.trainingTypeId = classItem.trainingTypeId
        }
      }
    },
    onChangeTrainingUnit(newValue) {
      this.params.majorId = null
      this.majorList = []
      this.params.courseId = null
      this.courseList = []
      this.params.classId = null
      this.classList = []

      if (newValue) {
        this.getMajor(newValue)
      }
    },
    onChangeMajor(newValue) {
      this.params.courseId = null
      this.courseList = []
      this.params.classId = null
      this.classList = []

      if (newValue) {
        this.getCourseList(newValue)
      }
    },
    onChangeCourse(newValue) {
      this.params.classId = null
      this.classList = []

      if (newValue) {
        this.getClass(newValue)
      }
    },
    sanitizeCode(value) {
      const sanitized = (value ?? '')
        .toString()
        .normalize('NFD')
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/\s+/g, '')
      this.params.code = sanitized
    },
    sanitizeCitizen(value) {
      this.params.citizen = (value ?? '').toString().replace(/\D/g, '').slice(0, 12)
    },
    async getTrainingTypeList() {
      try {
        const res = await trainingTypeServices.getAll()
        if (res?.success !== false) {
          this.trainingTypeList = extractList(res)
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getTrainingMethod() {
      try {
        const res = await trainingMethodServices.getAll()
        if (res?.success !== false) {
          this.trainingMethodList = extractList(res)
        }
      } catch (er) {
        console.log(er)
      }
    },
    async getCourseList(majorId) {
      try {
        const res = await courseServices.getAll({ majorId })
        if (res) {
          this.courseList = extractList(res)
        }
      } catch (er) {
        console.error(er)
      }
    },
    async getClass(value) {
      try {
        const res = await classServices.getList({
          pageSize: 100,
          pageIndex: 1,
          status: 'ACTIVE',
          courseId: value,
        })
        if (res?.success !== false) {
          this.classList = extractList(res)
        }
      } catch (er) {
        console.log(er)
      }
    },
    async getMajor(trainingUnitId) {
      try {
        const res = await majorServices.getAll({
          status: 'ACTIVE',
          pageIndex: 1,
          pageSize: 100,
          trainingUnitId,
        })
        if (res?.success !== false) {
          this.majorList = extractList(res)
        }
      } catch (er) {
        console.log(er)
      }
    },
    async getTrainingUnit() {
      try {
        const res = await trainingUnitServices.getList({
          status: 'ACTIVE',
          pageSize: 100,
          pageIndex: 1,
        })
        if (res?.success !== false) {
          this.trainingList = extractList(res)
        }
      } catch (er) {
        console.log(er)
      }
    },
    async handleUpdate() {
      if (!this.$refs.form?.validate?.()) return
      try {
        const formattedParams = {
          ...this.params,
          startOfTraining: this.params.startOfTraining
            ? moment(this.params.startOfTraining, 'MM/YYYY').format('01/MM/YYYY')
            : null,
          expiryDate: this.params.expiryDate
            ? moment(this.params.expiryDate, 'MM/YYYY').format('01/MM/YYYY')
            : null,
        }
        const res = await studentServices.update(formattedParams)
        if (res?.success || res?.status === 200 || res?.success === undefined) {
          this.open = false
          if (typeof this.$showSuccess === 'function') {
            this.$showSuccess('Cập nhật thông tin sinh viên thành công')
          }
          this.$emit('updated')
          this.$emit('success')
        }
      } catch (er) {
        console.log(er)
      }
    },
    async getUpdate(item) {
      this.isHydrating = true
      try {
        let source = item?.rawItem ? { ...item.rawItem, ...item } : { ...item }

        if (source?.id && typeof studentServices.getDetail === 'function') {
          try {
            const detailRes = await studentServices.getDetail(source.id)
            const detailObj = extractObject(detailRes)
            if (detailObj) {
              source = { ...source, ...detailObj }
            }
          } catch (e) {
            console.error('Lỗi lấy chi tiết sinh viên khi sửa:', e)
          }
        }

        await Promise.all([
          this.getTrainingMethod(),
          this.getTrainingUnit(),
          this.getTrainingTypeList(),
        ])

        const activeClass = source.classes || source.class || {}
        const trainingUnitId = source.trainingUnit?.id || source.trainingUnitId || null
        const majorId = source.major?.id || source.majorId || null
        const courseId = source.course?.id || source.courseId || null
        const classId = activeClass?.id || source.classId || null
        const trainingTypeId = source.trainingType?.id || source.trainingTypeId || null
        const trainingMethodId =
          source.trainingMethod?.id ||
          source.trainingMethodId ||
          activeClass?.trainingMethodId ||
          null

        if (trainingUnitId) {
          await this.getMajor(trainingUnitId)
        }
        if (majorId) {
          await this.getCourseList(majorId)
        }
        if (courseId) {
          await this.getClass(courseId)
        }

        this.params = {
          ethnicity: source.ethnicity || '',
          address: source.address || '',
          citizen: source.citizen || null,
          id: source.id,
          birthday: source.birthday || '',
          birthplace: source.birthplace || '',
          homeTown: source.homeTown || '',
          code: source.code || '',
          email: source.email || '',
          emailOther: source.emailOther || '',
          fullName: source.fullName || '',
          gender: source.gender || '',
          phone: source.phone || '',
          status: source.status || 'STUDYING',
          degreeType: source.degreeType || null,
          majorId,
          courseId,
          classId,
          trainingTypeId,
          trainingMethodId,
          trainingUnitId,
          startOfTraining: source.startOfTraining
            ? moment(source.startOfTraining, ['DD/MM/YYYY', 'MM/YYYY'], true).isValid()
              ? moment(source.startOfTraining, ['DD/MM/YYYY', 'MM/YYYY']).format('MM/YYYY')
              : source.startOfTraining
            : null,
          expiryDate: source.expiryDate
            ? moment(source.expiryDate, ['DD/MM/YYYY', 'MM/YYYY'], true).isValid()
              ? moment(source.expiryDate, ['DD/MM/YYYY', 'MM/YYYY']).format('MM/YYYY')
              : source.expiryDate
            : null,
          yearsOfTraining: '',
        }

        this.open = true
      } finally {
        this.$nextTick(() => {
          this.isHydrating = false
        })
      }
    },
  },
}
</script>