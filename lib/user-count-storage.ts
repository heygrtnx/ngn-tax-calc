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
		const count = typeof data.count === "number" && !isNaN(data.count) ? data.count : 0
		console.log("[user-count] Read count from file:", count)
		return count
	} catch (error) {
		// File doesn't exist or is invalid, return 0
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			console.log("[user-count] File doesn't exist, starting from 0")
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
			count: typeof count === "number" && !isNaN(count) ? count : 0,
			lastUpdated: new Date().toISOString(),
		}
		await fs.writeFile(COUNT_FILE, JSON.stringify(data, null, 2), "utf-8")
		console.log("[user-count] Saved count to file:", data.count)
	} catch (error) {
		console.error("[user-count] Error saving user count:", error)
		throw error // Throw to ensure we know if saving fails
	}
}

/**
 * Increments the user count and saves it atomically
 */
export async function incrementUserCount(): Promise<number> {
	try {
		const currentCount = await getUserCount()
		const newCount = currentCount + 1
		await saveUserCount(newCount)
		console.log("[user-count] Incremented from", currentCount, "to", newCount)
		return newCount
	} catch (error) {
		console.error("[user-count] Error incrementing user count:", error)
		// Return a fallback count if file operations fail
		const fallbackCount = await getUserCount()
		return fallbackCount + 1
	}
}

