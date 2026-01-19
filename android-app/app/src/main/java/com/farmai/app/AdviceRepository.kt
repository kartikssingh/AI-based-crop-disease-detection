package com.farmai.app

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

class AdviceRepository(private val context: Context) {

    private val DB_NAME = "agronomy.db"
    private var database: SQLiteDatabase? = null

    init {
        // When the class starts, prepare the database
        copyDatabaseIfNeeded()
        openDatabase()
    }

    // 1. Android cannot read DBs directly from 'assets'.
    // We must copy it to the phone's internal storage first.
    private fun copyDatabaseIfNeeded() {
        val dbPath = context.getDatabasePath(DB_NAME)

        // If the DB doesn't exist on the phone yet, copy it
        if (!dbPath.exists()) {
            // Create the parent databases folder if missing
            dbPath.parentFile?.mkdirs()

            try {
                context.assets.open(DB_NAME).use { input ->
                    FileOutputStream(dbPath).use { output ->
                        input.copyTo(output)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    // 2. Open the connection
    private fun openDatabase() {
        val dbPath = context.getDatabasePath(DB_NAME).path
        database = SQLiteDatabase.openDatabase(dbPath, null, SQLiteDatabase.OPEN_READONLY)
    }

    // 3. The Main Function: Get Disease Info
    fun getAdvice(label: String, language: String): String {
        // Query the table 'disease_content'
        val query = "SELECT causes_json, cures_json, suggestions_json, tts_summary FROM disease_content WHERE disease_key = ? AND language_code = ?"
        val cursor = database?.rawQuery(query, arrayOf(label, language))

        var result = "{}" // Default to empty JSON if nothing found

        if (cursor != null) {
            if (cursor.moveToFirst()) {
                val causes = cursor.getString(0)
                val cures = cursor.getString(1)
                val suggestions = cursor.getString(2)
                val tts = cursor.getString(3)

                // Build the JSON object to send back to the Web App
                val json = JSONObject()
                json.put("disease_name", label)
                json.put("causes", causes) // These are already JSON strings
                json.put("cures", cures)
                json.put("suggestions", suggestions)
                json.put("tts_text", tts)

                result = json.toString()
            }
            cursor.close()
        }
        return result
    }
}