export const elitsTheme = {
  colors: {
    dark: [
      '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66',
      '#373A40', '#2C2E33', '#25262B', '#1A1B1E',
      '#141517', '#101113'
    ],
    blue: [
      '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc',
      '#4dabf7', '#339af0', '#228be6', '#1c7ed6',
      '#1971c2', '#1864ab'
    ],
  },
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  components: {
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
  defaultRadius: 'md',
  primaryColor: 'blue',
  primaryShade: 6,
}
