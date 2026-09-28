// plugins/sort-strategy.js
export default (context, inject) => {
  const sortStrategy = {
    vietnameseSort(a, b, key) {
      const valA = a[key] || ''
      const valB = b[key] || ''
      return valA.localeCompare(valB, 'vi', { sensitivity: 'base' })
    },
  }

  inject('sortStrategy', sortStrategy)
}