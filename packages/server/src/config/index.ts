interface configType {
  jwt: {
    tokenSecret: string
    tokenExpire: number
  }
  fireBase: {
    apiKey?: string
    authDomain?: string
    databaseURL?: string
    projectId?: string
    storageBucket?: string
    messagingSenderId?: string
  }
}

const config: configType = {
  jwt: {
    tokenSecret: process.env.TOKEN_SECRET ?? 'secret',
    tokenExpire: Number(process.env.TOKEN_EXPIRE) ?? 60 * 60 * 24 * 7
  },
  fireBase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
  }
}

export default config
