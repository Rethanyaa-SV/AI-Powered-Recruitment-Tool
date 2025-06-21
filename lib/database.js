import clientPromise from "./mongodb"

let client
let db
let users
let jobs
let applications

async function init() {
  if (db) return
  try {
    client = await clientPromise
    db = client.db("ai_recruitment")
    users = db.collection("users")
    jobs = db.collection("jobs")
    applications = db.collection("applications")
  } catch (error) {
    throw new Error("Failed to establish connection to database")
  }
}
;(async () => {
  await init()
})()

export { users, jobs, applications }
