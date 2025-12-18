import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const COUNT_FILE = path.join(DATA_DIR, "user-count.json")

interface UserCountData {
	count: number
	lastUpdated: string
}

/**
 * Ensures the data directory exists
 */
async function ensureDataDir() {
	try {
		await fs.access(DATA_DIR)
	} catch {
		await fs.mkdir(DATA_DIR, { recursive: true })
	}
}

/**
 * Reads the user count from the file
 */
export async function getUserCount(): Promise<number> {
	try {
		await ensureDataDir()
		const fileContent = await fs.readFile(COUNT_FILE, "utf-8")
		const data: UserCountData = JSON.parse(fileContent)
		return data.count || 0
	} catch (error) {
		// File doesn't exist or is invalid, return 0
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return 0
		}
		console.error("[user-count] Error reading user count:", error)
		return 0
	}
}

/**
 * Saves the user count to the file
 */
export async function saveUserCount(count: number): Promise<void> {
	try {
		await ensureDataDir()
		const data: UserCountData = {
			count,
			lastUpdated: new Date().toISOString(),
		}
		await fs.writeFile(COUNT_FILE, JSON.stringify(data, null, 2), "utf-8")
	} catch (error) {
		console.error("[user-count] Error saving user count:", error)
		// Don't throw - we don't want to break the email sending if file write fails
	}
}

/**
 * Increments the user count and saves it
 */
export async function incrementUserCount(): Promise<number> {
	const currentCount = await getUserCount()
	const newCount = currentCount + 1
	await saveUserCount(newCount)
	return newCount
}

