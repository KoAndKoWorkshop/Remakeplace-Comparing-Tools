import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'kokoDark',
    themes: {
      kokoDark: {
        dark: true,
        colors: {
          background: '#0f1117',
          surface: '#171c27',
          primary: '#7cb6ff',
          secondary: '#8edfa4',
          info: '#7cb6ff',
          warning: '#f4c57a',
          error: '#ff6b87',
          success: '#8edfa4'
        }
      }
    }
  }
})
