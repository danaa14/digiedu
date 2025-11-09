import { Client, Account, Databases } from "appwrite"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Keep this as is for Appwrite Cloud
  .setProject("690f79fe002c3ebb00f7") // your project ID

export const account = new Account(client)
export const databases = new Databases(client)
export { client }
