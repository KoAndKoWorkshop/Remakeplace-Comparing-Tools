export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'))
        resolve(parsed)
      } catch (error) {
        reject(new Error('Invalid JSON file.'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}
