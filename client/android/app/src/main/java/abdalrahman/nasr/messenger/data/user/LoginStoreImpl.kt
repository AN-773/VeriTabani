package abdalrahman.nasr.messenger.data.user

import android.content.Context
import kotlinx.serialization.json.Json

private const val User_Pref = "upref"
private const val user_info_key = "ui"
private const val user_cookie_key = "uc"

class LoginStoreImpl(val context: Context) : ILoginStore {

    override fun saveUser(user: User) {
        val editor = context.getSharedPreferences(User_Pref, Context.MODE_PRIVATE).edit()
        editor.putString(user_info_key, Json.encodeToString(User.serializer(), user))
        editor.putString(user_cookie_key, user.cookie)
        editor.apply()
    }

    override fun getUser(): User? {
        val pref = context.getSharedPreferences(User_Pref, Context.MODE_PRIVATE)
        val userData = pref.getString(user_info_key, null) ?: return null
        val user = Json.decodeFromString(User.serializer(), userData)
        val cookie = pref.getString(user_cookie_key, null) ?: return null
        user.cookie = cookie
        return user
    }

    override fun emptyStore() = context.getSharedPreferences(User_Pref, Context.MODE_PRIVATE).edit().clear().apply()
}