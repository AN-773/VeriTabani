package abdalrahman.nasr.messenger.data.user

import abdalrahman.nasr.messenger.*
import android.util.Log
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

object UserRepo {

    val mutex = Mutex()

    @Volatile
    var user: User? = null
        private set



    fun isLoggedIn() = user != null

    suspend fun login(email: String, password: String, loginStore: ILoginStore?) = withContext(Dispatchers.IO) {
        mutex.withLock {
            val response: HttpResponse = httpClient.post(Endpoints.USER_LOGIN_API) {
                contentType(ContentType.Application.Json)
                body = LoginInfo(email, password)
            }
            val data: String = response.receive()
            user = Json.decodeFromString(User.serializer(), data)
            user!!.cookie = response.headers["Set-Cookie"]
            loginStore?.saveUser(user!!)
        }
    }

    suspend fun logout() = withContext(Dispatchers.IO) {
        user ?: return@withContext
        mutex.withLock {
            httpClient.post<Any>(Endpoints.USER_LOGOUT_API){
                headers[HttpHeaders.Cookie] = user?.cookie ?: throw IllegalStateException("User not logged in")
                contentType(ContentType.Application.Json)
            }
            user = null
        }
    }

    suspend fun register(data: User, loginStore: ILoginStore?) = withContext(Dispatchers.IO) {
        if (user != null)
            return@withContext
        mutex.withLock {
            val res: HttpResponse = httpClient.post(Endpoints.USER_REGISTER_API) {
                contentType(ContentType.Application.Json)
                body = data
            }
            data.password = ""
            data.cookie = res.headers["Set-Cookie"]
            data.id = res.receive<String>().split(":")[1].split("}")[0].toLong()
            user = data
            loginStore?.saveUser(user!!)
        }
    }

    suspend fun search(query: String): List<User> = withContext(Dispatchers.IO) {
        val list: List<User> = httpClient.get(Endpoints.USER_SEARCH_API) {
            contentType(ContentType.Application.Json)
            body = QueryObj(query)
        }
        list
    }

    fun init(loginStore: ILoginStore) {
        user = loginStore.getUser()
    }

    @Serializable
    private data class QueryObj(val query: String)

}